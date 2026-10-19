import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { tareaSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = tareaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, productoId, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    if (productoId && !db.productos.some((p) => p.id === productoId && p.marcaId === marcaId)) {
      return { status: 400 as const, error: "El producto no pertenece a esta marca" };
    }
    const now = ahora();
    const id = nuevoId();
    db.tareas.push({ id, marcaId, ...datos, productoId, estado: "PENDIENTE", completadaEn: null, createdAt: now, updatedAt: now });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
