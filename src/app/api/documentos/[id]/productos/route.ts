import { NextResponse } from "next/server";
import { z } from "zod";
import { mutarDb } from "@/lib/db";

const bodySchema = z.object({ productoId: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const resultado = await mutarDb((db) => {
    const documento = db.documentos.find((d) => d.id === id);
    const producto = db.productos.find((p) => p.id === parsed.data.productoId);
    if (!documento) return { status: 404 as const, error: "Documento no encontrado" };
    if (!producto) return { status: 404 as const, error: "Producto no encontrado" };
    if (producto.marcaId !== documento.marcaId) return { status: 400 as const, error: "El producto pertenece a otra marca" };

    if (!db.documentoProductos.some((dp) => dp.documentoId === id && dp.productoId === parsed.data.productoId)) {
      db.documentoProductos.push({ documentoId: id, productoId: parsed.data.productoId });
    }
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}
