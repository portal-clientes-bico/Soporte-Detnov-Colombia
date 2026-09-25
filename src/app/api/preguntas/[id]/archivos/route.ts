import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora, leerDb } from "@/lib/db";
import { preguntaArchivoCamposSchema } from "@/lib/schemas";
import { guardarArchivo, ArchivoValidationError } from "@/lib/storage";
import { extraerYGuardarSiCorresponde } from "@/lib/extraccion-texto";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const notas = formData.get("notas");
  const parsed = preguntaArchivoCamposSchema.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    notas: typeof notas === "string" && notas ? notas : undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const archivo = formData.get("file");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Selecciona un archivo" }, { status: 400 });
  }

  const db0 = await leerDb();
  const pregunta = db0.preguntas.find((p) => p.id === id);
  if (!pregunta) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  const marca = db0.marcas.find((m) => m.id === pregunta.marcaId);
  if (!marca) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  let guardado: { nombreArchivo: string; archivoPath: string };
  try {
    guardado = await guardarArchivo(marca.slug, archivo);
  } catch (error) {
    if (error instanceof ArchivoValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error subiendo archivo de pregunta:", error);
    return NextResponse.json({ error: "No se pudo subir el archivo. Intenta de nuevo." }, { status: 500 });
  }

  const documentoId = await mutarDb((db) => {
    const now = ahora();
    const nuevoDocId = nuevoId();
    db.documentos.push({
      id: nuevoDocId,
      marcaId: pregunta.marcaId,
      fuenteId: null,
      tipo: parsed.data.tipo,
      titulo: parsed.data.titulo,
      codigo: null,
      revision: null,
      fechaEmision: null,
      idioma: "ES",
      urlOrigen: null,
      archivoNombre: guardado.nombreArchivo,
      archivoPath: guardado.archivoPath,
      confianza: "CONFIRMADO",
      notas: parsed.data.notas ?? `Adjuntado desde la pregunta: ${pregunta.titulo}`,
      textoExtraidoEn: null,
      createdAt: now,
      updatedAt: now,
    });
    db.preguntaDocumentos.push({ preguntaId: id, documentoId: nuevoDocId });
    // El archivo tambien queda vinculado a los mismos productos de la pregunta,
    // para que aparezca en la ficha de cada referencia relacionada.
    const productoIds = db.preguntaProductos.filter((pp) => pp.preguntaId === id).map((pp) => pp.productoId);
    for (const productoId of productoIds) {
      db.documentoProductos.push({ documentoId: nuevoDocId, productoId });
    }
    return nuevoDocId;
  });

  // Extraccion de texto para el ChatBot: intento aparte, nunca hace fallar la subida.
  const extraidoEn = await extraerYGuardarSiCorresponde({ id: documentoId, confianza: "CONFIRMADO", archivoPath: guardado.archivoPath });
  if (extraidoEn) {
    await mutarDb((db) => {
      const doc = db.documentos.find((d) => d.id === documentoId);
      if (doc) doc.textoExtraidoEn = extraidoEn;
    });
  }

  return NextResponse.json({ ok: true, documentoId });
}
