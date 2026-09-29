import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { preguntaPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = preguntaPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const datos = parsed.data;

  const ok = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    if (!pregunta) return false;
    Object.assign(pregunta, datos);
    if (datos.estado === "CERRADA" && !pregunta.fechaCierre) pregunta.fechaCierre = ahora();
    if (datos.estado === "ABIERTA" || datos.estado === "BORRADOR") pregunta.fechaCierre = null;
    pregunta.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    const existe = db.preguntas.some((p) => p.id === id);
    if (!existe) return false;
    db.preguntas = db.preguntas.filter((p) => p.id !== id);
    db.preguntaProductos = db.preguntaProductos.filter((pp) => pp.preguntaId !== id);
    db.preguntaDocumentos = db.preguntaDocumentos.filter((pd) => pd.preguntaId !== id);
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
