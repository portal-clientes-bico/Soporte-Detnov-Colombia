import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { productoSchema } from "@/lib/schemas";
import { textoAEspecificaciones } from "@/lib/tipos";

export async function POST(request: Request) {
  const parsed = productoSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });
  }

  const { marcaId, especificacionesTexto, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    const marca = db.marcas.find((m) => m.id === marcaId);
    if (!marca) return { status: 404 as const, error: "Marca no encontrada" };

    if (db.productos.some((p) => p.marcaId === marcaId && p.referencia === datos.referencia)) {
      return { status: 409 as const, error: `El producto ${datos.referencia} ya existe en esta marca` };
    }

    const now = ahora();
    const id = nuevoId();
    db.productos.push({
      id,
      marcaId,
      ...datos,
      especificaciones: textoAEspecificaciones(especificacionesTexto ?? ""),
      createdAt: now,
      updatedAt: now,
    });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
