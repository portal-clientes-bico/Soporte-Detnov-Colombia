import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { fuentePatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = fuentePatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const ok = await mutarDb((db) => {
    const fuente = db.fuentes.find((f) => f.id === id);
    if (!fuente) return false;
    Object.assign(fuente, parsed.data);
    fuente.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    const existe = db.fuentes.some((f) => f.id === id);
    if (!existe) return false;
    db.fuentes = db.fuentes.filter((f) => f.id !== id);
    for (const d of db.documentos) {
      if (d.fuenteId === id) d.fuenteId = null;
    }
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
