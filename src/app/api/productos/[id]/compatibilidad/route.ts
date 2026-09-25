import { NextResponse } from "next/server";
import { mutarDb, nuevoId } from "@/lib/db";
import { compatibilidadSchema } from "@/lib/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = compatibilidadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  if (parsed.data.compatibleId === id) {
    return NextResponse.json({ error: "Un producto no puede ser compatible consigo mismo" }, { status: 400 });
  }

  const resultado = await mutarDb((db) => {
    const origen = db.productos.find((p) => p.id === id);
    const destino = db.productos.find((p) => p.id === parsed.data.compatibleId);
    if (!origen) return { status: 404 as const, error: "Producto no encontrado" };
    if (!destino) return { status: 404 as const, error: "Producto compatible no encontrado" };
    if (origen.marcaId !== destino.marcaId) return { status: 400 as const, error: "Ambos productos deben ser de la misma marca" };

    const existente = db.compatibilidades.find((c) => c.productoId === id && c.compatibleId === parsed.data.compatibleId);
    if (existente) {
      existente.nota = parsed.data.nota;
    } else {
      db.compatibilidades.push({ id: nuevoId(), productoId: id, compatibleId: parsed.data.compatibleId, nota: parsed.data.nota });
    }
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}
