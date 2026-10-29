import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { quitarMensaje } from "@/lib/hilo";

/** Borra un mensaje del hilo (p. ej. uno publicado por error). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; mensajeId: string }> }) {
  const { id, mensajeId } = await params;
  const ok = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    return pregunta ? quitarMensaje(pregunta, mensajeId, ahora()) : false;
  });
  if (!ok) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
