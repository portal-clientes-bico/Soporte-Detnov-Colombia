import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { preguntaSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = preguntaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, productos, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    const now = ahora();
    const id = nuevoId();
    db.preguntas.push({
      id,
      marcaId,
      ...datos,
      respondedor: datos.respondedor ?? null,
      respuesta: datos.respuesta ?? null,
      estado: "ABIERTA",
      fechaCierre: null,
      createdAt: now,
      updatedAt: now,
    });
    for (const productoId of productos ?? []) {
      if (db.productos.some((p) => p.id === productoId && p.marcaId === marcaId)) {
        db.preguntaProductos.push({ preguntaId: id, productoId });
      }
    }
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
