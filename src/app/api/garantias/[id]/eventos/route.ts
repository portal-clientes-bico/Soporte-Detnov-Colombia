import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { eventoGarantiaSchema } from "@/lib/schemas";
import { sesionActual } from "@/lib/sesion-actual";
import { cambiarEstadoGarantia } from "@/lib/garantias";

/** Bitacora del ticket: cambia el estado (con comentario opcional) o agrega un comentario. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = eventoGarantiaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { estado, texto } = parsed.data;
  const autor = (await sesionActual())?.nombre ?? "—";

  const resultado = await mutarDb((db) => {
    const g = db.garantias.find((x) => x.id === id);
    if (!g) return { status: 404 as const, error: "Garantía no encontrada" };
    const fecha = ahora();
    if (estado && estado !== g.estado) cambiarEstadoGarantia(g, estado, autor, texto, fecha);
    else if (texto) {
      g.eventos.push({ id: nuevoId(), fecha, autor, tipo: "COMENTARIO", estadoAnterior: null, estadoNuevo: null, texto });
      g.updatedAt = fecha;
    } else return { status: 400 as const, error: "La garantía ya está en ese estado" };
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}
