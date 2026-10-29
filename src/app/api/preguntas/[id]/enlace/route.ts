import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { nuevoTokenEnlace } from "@/lib/enlace-externo";
import { sesionActual } from "@/lib/sesion-actual";

/** Genera (o regenera, invalidando el anterior) el enlace externo de la pregunta. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await sesionActual();
  const enlace = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    if (!pregunta) return null;
    pregunta.enlaceExterno = { token: nuevoTokenEnlace(), creadoEn: ahora(), creadoPor: sesion?.nombre ?? null };
    pregunta.updatedAt = ahora();
    return pregunta.enlaceExterno;
  });
  if (!enlace) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true, enlace });
}

/** Revoca el enlace: quien lo tenga ya no puede entrar. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    if (!pregunta) return false;
    pregunta.enlaceExterno = null;
    pregunta.updatedAt = ahora();
    return true;
  });
  if (!ok) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
