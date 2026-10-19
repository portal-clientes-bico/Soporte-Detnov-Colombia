import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { tareaPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = tareaPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const datos = parsed.data;

  const resultado = await mutarDb((db) => {
    const tarea = db.tareas.find((t) => t.id === id);
    if (!tarea) return { status: 404 as const, error: "Tarea no encontrada" };
    if (datos.productoId && !db.productos.some((p) => p.id === datos.productoId && p.marcaId === tarea.marcaId)) {
      return { status: 400 as const, error: "El producto no pertenece a esta marca" };
    }
    if (datos.asignadoAUsuarioId && !db.usuarios.some((u) => u.id === datos.asignadoAUsuarioId)) {
      return { status: 400 as const, error: "El usuario asignado no existe" };
    }
    Object.assign(tarea, datos);
    if (datos.estado === "COMPLETADA" && !tarea.completadaEn) tarea.completadaEn = ahora();
    if (datos.estado && datos.estado !== "COMPLETADA") tarea.completadaEn = null;
    tarea.updatedAt = ahora();
    return { status: 200 as const };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    if (!db.tareas.some((t) => t.id === id)) return false;
    db.tareas = db.tareas.filter((t) => t.id !== id);
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
