import { NextResponse } from "next/server";
import { mutarDb } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; productoId: string }> }) {
  const { id, productoId } = await params;
  await mutarDb((db) => {
    db.preguntaProductos = db.preguntaProductos.filter((pp) => !(pp.preguntaId === id && pp.productoId === productoId));
  });
  return NextResponse.json({ ok: true });
}
