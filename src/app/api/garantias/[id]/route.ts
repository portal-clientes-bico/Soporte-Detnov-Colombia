import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { garantiaPatchSchema } from "@/lib/schemas";
import { prepararItems } from "@/lib/garantias";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = garantiaPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { items, ...datos } = parsed.data;
  const resultado = await mutarDb((db) => {
    const g = db.garantias.find((x) => x.id === id);
    if (!g) return { status: 404 as const, error: "Garantía no encontrada" };
    if (datos.asignadoAUsuarioId && !db.usuarios.some((u) => u.id === datos.asignadoAUsuarioId)) return { status: 400 as const, error: "El usuario asignado no existe" };
    if (items) {
      const itemsListos = prepararItems(db, g.marcaId, items);
      if (typeof itemsListos === "string") return { status: 400 as const, error: itemsListos };
      g.items = itemsListos;
    }
    Object.assign(g, datos);
    g.updatedAt = ahora();
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    if (!db.garantias.some((g) => g.id === id)) return false;
    db.garantias = db.garantias.filter((g) => g.id !== id);
    return true;
  });
  if (!ok) return NextResponse.json({ error: "Garantía no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
