import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { instructivoSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = instructivoSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, productoIds, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    const now = ahora();
    const id = nuevoId();
    db.instructivos.push({
      id,
      marcaId,
      ...datos,
      productoIds: productoIds.filter((pid) => db.productos.some((p) => p.id === pid && p.marcaId === marcaId)),
      // Siempre arranca sin publicar: se publica explicitamente desde el editor.
      estado: "EN_ELABORACION",
      publicadoEn: null,
      createdAt: now,
      updatedAt: now,
    });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
