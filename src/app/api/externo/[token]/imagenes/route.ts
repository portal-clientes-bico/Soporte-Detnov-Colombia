import { NextResponse } from "next/server";
import { leerDb } from "@/lib/db";
import { resolverPreguntaExterna } from "@/lib/enlace-externo";
import { subirImagenTexto } from "@/lib/imagenes-texto";

/** Imagen pegada en la respuesta desde el enlace externo. El token del enlace es la
 * autorizacion; solo mientras la pregunta siga abierta a respuestas. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const formData = await request.formData().catch(() => null);
  const preguntaId = formData?.get("preguntaId");
  const pregunta = resolverPreguntaExterna(await leerDb(), token, typeof preguntaId === "string" ? preguntaId : null)?.pregunta;
  if (!pregunta) return NextResponse.json({ error: "Link not valid / Enlace no valido" }, { status: 404 });
  if (pregunta.estado !== "ABIERTA") return NextResponse.json({ error: "Question closed / Pregunta cerrada" }, { status: 409 });
  return subirImagenTexto(formData);
}
