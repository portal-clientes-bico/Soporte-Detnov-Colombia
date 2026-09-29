import { NextResponse } from "next/server";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { getMarcaPorSlug, getPreguntasDeMarca } from "@/lib/queries";
import { DOCUMENTO_TIPOS, ORGANIZACIONES, PREGUNTA_ESTADOS, PREGUNTA_ESTADO_VALUES, PREGUNTA_PRIORIDADES, PREGUNTA_PRIORIDAD_VALUES, slugify } from "@/lib/tipos";
import type { SoportePreguntaEstado, SoportePreguntaPrioridad } from "@/lib/db";

type Pregunta = Awaited<ReturnType<typeof getPreguntasDeMarca>>[number];

function formatFecha(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

/** Un bloque de parrafos con el detalle completo de una pregunta: metadata, el contenido
 * textual de la pregunta, la respuesta (si existe) y sus productos/documentos relacionados.
 * Este es el "en detalle" que pidio el usuario -- no un resumen de una linea. */
function bloquePregunta(p: Pregunta): Paragraph[] {
  const metadata = [
    `Preguntó ${p.autor}`,
    `Creada ${formatFecha(p.createdAt)}`,
    p.asignadoNombre ? `Asignado a ${p.asignadoNombre}` : "Sin asignar",
    p.organizacion ? ORGANIZACIONES[p.organizacion] : "Sin organización",
    p.fechaCierre ? `Cerrada ${formatFecha(p.fechaCierre)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const parrafos: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 60 }, children: [new TextRun(p.titulo)] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: metadata, italics: true, size: 18, color: "666666" })] }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: "Pregunta: ", bold: true }), new TextRun(p.contenido)],
    }),
  ];

  if (p.respuesta) {
    parrafos.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: `Respuesta de ${p.respondedor ?? "—"}: `, bold: true }), new TextRun(p.respuesta)],
      }),
    );
  } else {
    parrafos.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Sin respuesta todavia.", italics: true, color: "999999" })] }));
  }

  if (p.productos.length > 0) {
    const texto = p.productos.map((r) => r.referencia).join(", ");
    parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Productos relacionados: ", bold: true }), new TextRun(texto)] }));
  }

  if (p.archivos.length > 0) {
    const texto = p.archivos.map((d) => `${d.titulo} (${DOCUMENTO_TIPOS[d.tipo]})`).join("; ");
    parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Documentos relacionados: ", bold: true }), new TextRun(texto)] }));
  }

  return parrafos;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  const preguntas = await getPreguntasDeMarca(marca.id);

  const porEstado = new Map<SoportePreguntaEstado, Map<SoportePreguntaPrioridad, Pregunta[]>>();
  for (const p of preguntas) {
    if (!porEstado.has(p.estado)) porEstado.set(p.estado, new Map());
    const porPrioridad = porEstado.get(p.estado)!;
    if (!porPrioridad.has(p.prioridad)) porPrioridad.set(p.prioridad, []);
    porPrioridad.get(p.prioridad)!.push(p);
  }

  const cuerpo: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(`Reporte de preguntas — ${marca.nombre}`)],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: `Generado el ${formatFecha(new Date().toISOString())}  ·  ${preguntas.length} pregunta(s) en total`, italics: true, color: "666666" })],
    }),
  ];

  if (preguntas.length === 0) {
    cuerpo.push(new Paragraph({ children: [new TextRun("No hay preguntas registradas para esta marca.")] }));
  }

  for (const estado of PREGUNTA_ESTADO_VALUES) {
    const porPrioridad = porEstado.get(estado);
    if (!porPrioridad) continue;
    const totalEstado = [...porPrioridad.values()].reduce((sum, arr) => sum + arr.length, 0);

    cuerpo.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        border: { bottom: { color: "999999", space: 4, style: "single", size: 6 } },
        children: [new TextRun(`${PREGUNTA_ESTADOS[estado]} (${totalEstado})`)],
      }),
    );

    for (const prioridad of PREGUNTA_PRIORIDAD_VALUES) {
      const items = porPrioridad.get(prioridad);
      if (!items || items.length === 0) continue;

      cuerpo.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [new TextRun(`Prioridad ${PREGUNTA_PRIORIDADES[prioridad]} (${items.length})`)],
        }),
      );

      for (const p of items) cuerpo.push(...bloquePregunta(p));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: cuerpo }],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  const nombreArchivo = `reporte-preguntas-${slugify(marca.nombre)}-${new Date().toISOString().slice(0, 10)}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
    },
  });
}
