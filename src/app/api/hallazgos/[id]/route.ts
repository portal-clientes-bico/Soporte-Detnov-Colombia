import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { hallazgoPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = hallazgoPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { productoId, ...datos } = parsed.data;

  const ok = await mutarDb((db) => {
    const hallazgo = db.hallazgos.find((h) => h.id === id);
    if (!hallazgo) return false;
    Object.assign(hallazgo, datos);
    if (productoId !== undefined) hallazgo.productoId = productoId || null;
    hallazgo.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    const existe = db.hallazgos.some((h) => h.id === id);
    if (!existe) return false;
    db.hallazgos = db.hallazgos.filter((h) => h.id !== id);
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
