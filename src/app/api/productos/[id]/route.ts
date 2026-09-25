import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { productoPatchSchema } from "@/lib/schemas";
import { textoAEspecificaciones } from "@/lib/tipos";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = productoPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });
  }

  const { especificacionesTexto, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    const producto = db.productos.find((p) => p.id === id);
    if (!producto) return { status: 404 as const, error: "Producto no encontrado" };

    if (datos.referencia && datos.referencia !== producto.referencia) {
      if (db.productos.some((p) => p.marcaId === producto.marcaId && p.referencia === datos.referencia && p.id !== id)) {
        return { status: 409 as const, error: `La referencia ${datos.referencia} ya existe en esta marca` };
      }
    }

    Object.assign(producto, datos);
    if (especificacionesTexto !== undefined) producto.especificaciones = textoAEspecificaciones(especificacionesTexto);
    producto.updatedAt = ahora();
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ok = await mutarDb((db) => {
    const existe = db.productos.some((p) => p.id === id);
    if (!existe) return false;
    db.productos = db.productos.filter((p) => p.id !== id);
    db.compatibilidades = db.compatibilidades.filter((c) => c.productoId !== id && c.compatibleId !== id);
    db.documentoProductos = db.documentoProductos.filter((dp) => dp.productoId !== id);
    for (const h of db.hallazgos) {
      if (h.productoId === id) h.productoId = null;
    }
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
