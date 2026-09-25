import { NextResponse } from "next/server";
import { mutarDb } from "@/lib/db";

/** Solo desvincula el archivo de la pregunta; el documento permanece en la biblioteca. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; documentoId: string }> }) {
  const { id, documentoId } = await params;
  await mutarDb((db) => {
    db.preguntaDocumentos = db.preguntaDocumentos.filter((pd) => !(pd.preguntaId === id && pd.documentoId === documentoId));
  });
  return NextResponse.json({ ok: true });
}
