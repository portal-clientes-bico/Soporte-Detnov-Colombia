import { NextResponse } from "next/server";
import { z } from "zod";
import { mutarDb } from "@/lib/db";

const bodySchema = z.object({ productoId: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const resultado = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    const producto = db.productos.find((p) => p.id === parsed.data.productoId);
    if (!pregunta) return { status: 404 as const, error: "Pregunta no encontrada" };
    if (!producto) return { status: 404 as const, error: "Producto no encontrado" };
    if (producto.marcaId !== pregunta.marcaId) return { status: 400 as const, error: "El producto pertenece a otra marca" };

    if (!db.preguntaProductos.some((pp) => pp.preguntaId === id && pp.productoId === parsed.data.productoId)) {
      db.preguntaProductos.push({ preguntaId: id, productoId: parsed.data.productoId });
    }
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}
