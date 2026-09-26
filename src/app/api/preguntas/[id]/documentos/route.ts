import { NextResponse } from "next/server";
import { z } from "zod";
import { mutarDb } from "@/lib/db";

const bodySchema = z.object({ documentoId: z.string().min(1) });

/**
 * Vincula un documento YA EXISTENTE en la biblioteca a esta pregunta (a diferencia de
 * /api/preguntas/[id]/archivos, que sube un archivo nuevo y lo crea de una vez). Desvincular
 * usa el mismo endpoint que ese otro flujo: DELETE /api/preguntas/[id]/archivos/[documentoId].
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const resultado = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    const documento = db.documentos.find((d) => d.id === parsed.data.documentoId);
    if (!pregunta) return { status: 404 as const, error: "Pregunta no encontrada" };
    if (!documento) return { status: 404 as const, error: "Documento no encontrado" };
    if (documento.marcaId !== pregunta.marcaId) return { status: 400 as const, error: "El documento pertenece a otra marca" };

    if (!db.preguntaDocumentos.some((pd) => pd.preguntaId === id && pd.documentoId === parsed.data.documentoId)) {
      db.preguntaDocumentos.push({ preguntaId: id, documentoId: parsed.data.documentoId });
    }
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}
