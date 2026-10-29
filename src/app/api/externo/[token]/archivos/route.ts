import { NextResponse } from "next/server";
import { z } from "zod";
import { leerDb } from "@/lib/db";
import { resolverPreguntaExterna } from "@/lib/enlace-externo";
import { adjuntarArchivoAPregunta, PreguntaNoEncontradaError } from "@/lib/preguntas-archivos";
import { ArchivoValidationError } from "@/lib/storage";

const schema = z.object({
  nombre: z.string().trim().min(2).max(120),
  titulo: z.string().trim().min(3).max(250),
});

/** Adjunto desde el enlace externo. Queda en confianza PENDIENTE: el equipo lo revisa antes de
 * que alimente al ChatBot. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid data / Datos invalidos" }, { status: 400 });

  const archivo = formData.get("file");
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    titulo: formData.get("titulo") || (archivo instanceof File ? archivo.name : ""),
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid data / Datos invalidos" }, { status: 400 });
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Select a file / Selecciona un archivo" }, { status: 400 });
  }

  const preguntaId = formData.get("preguntaId");
  const pregunta = resolverPreguntaExterna(await leerDb(), token, typeof preguntaId === "string" ? preguntaId : null)?.pregunta;
  if (!pregunta) return NextResponse.json({ error: "Link not valid / Enlace no valido" }, { status: 404 });
  if (pregunta.estado === "CERRADA") return NextResponse.json({ error: "Question closed / Pregunta cerrada" }, { status: 409 });

  try {
    const documentoId = await adjuntarArchivoAPregunta(pregunta.id, archivo, {
      tipo: "OTRO",
      titulo: parsed.data.titulo,
      notas: `Adjuntado por ${parsed.data.nombre} desde el enlace externo de la pregunta: ${pregunta.titulo}`,
      confianza: "PENDIENTE",
    });
    return NextResponse.json({ ok: true, documentoId });
  } catch (error) {
    if (error instanceof PreguntaNoEncontradaError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof ArchivoValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error subiendo archivo desde enlace externo:", error);
    return NextResponse.json({ error: "Upload failed / No se pudo subir el archivo" }, { status: 500 });
  }
}
