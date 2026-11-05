import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { garantiaSchema } from "@/lib/schemas";
import { sesionActual } from "@/lib/sesion-actual";
import { prepararItems, siguienteNumeroGarantia } from "@/lib/garantias";

export async function POST(request: Request) {
  const parsed = garantiaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, items, ...datos } = parsed.data;
  const sesion = await sesionActual();

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    if (datos.asignadoAUsuarioId && !db.usuarios.some((u) => u.id === datos.asignadoAUsuarioId)) return { status: 400 as const, error: "El usuario asignado no existe" };
    const itemsListos = prepararItems(db, marcaId, items);
    if (typeof itemsListos === "string") return { status: 400 as const, error: itemsListos };
    const now = ahora();
    const id = nuevoId();
    const autor = sesion?.nombre ?? "—";
    db.garantias.push({
      id,
      marcaId,
      numero: siguienteNumeroGarantia(db, new Date(now)),
      ...datos,
      items: itemsListos,
      estado: "BORRADOR",
      enviadaEn: null,
      resueltaEn: null,
      cerradaEn: null,
      creadoPorUsuarioId: sesion && db.usuarios.some((u) => u.id === sesion.id) ? sesion.id : null,
      eventos: [{ id: nuevoId(), fecha: now, autor, tipo: "ESTADO", estadoAnterior: null, estadoNuevo: "BORRADOR", texto: "" }],
      createdAt: now,
      updatedAt: now,
    });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
