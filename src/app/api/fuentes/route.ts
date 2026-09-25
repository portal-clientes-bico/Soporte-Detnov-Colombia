import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { fuenteSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = fuenteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    if (db.fuentes.some((f) => f.marcaId === marcaId && f.nombre === datos.nombre)) {
      return { status: 409 as const, error: "Ya existe una fuente con ese nombre en esta marca" };
    }
    const now = ahora();
    const id = nuevoId();
    db.fuentes.push({ id, marcaId, ...datos, createdAt: now, updatedAt: now });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
