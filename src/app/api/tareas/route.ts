import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { tareaSchema } from "@/lib/schemas";
import { sesionActual } from "@/lib/sesion-actual";

export async function POST(request: Request) {
  const parsed = tareaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, productoId, asignadoAUsuarioId, ...datos } = parsed.data;
  // "Asignado por" es siempre quien esta conectado, nunca lo que mande el formulario.
  const sesion = await sesionActual();

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    if (productoId && !db.productos.some((p) => p.id === productoId && p.marcaId === marcaId)) {
      return { status: 400 as const, error: "El producto no pertenece a esta marca" };
    }
    if (asignadoAUsuarioId && !db.usuarios.some((u) => u.id === asignadoAUsuarioId)) {
      return { status: 400 as const, error: "El usuario asignado no existe" };
    }
    const asignadoPorUsuarioId = sesion && db.usuarios.some((u) => u.id === sesion.id) ? sesion.id : null;
    const now = ahora();
    const id = nuevoId();
    db.tareas.push({ id, marcaId, ...datos, productoId, asignadoPorUsuarioId, asignadoAUsuarioId, estado: "PENDIENTE", completadaEn: null, createdAt: now, updatedAt: now });
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
