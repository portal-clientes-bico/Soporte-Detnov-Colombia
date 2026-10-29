import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { mensajePreguntaSchema } from "@/lib/schemas";
import { agregarMensaje } from "@/lib/hilo";
import { sesionActual } from "@/lib/sesion-actual";

/** Agrega una respuesta o contrapregunta al hilo, a nombre de quien tiene la sesion. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = mensajePreguntaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });
  const sesion = await sesionActual();
  if (!sesion) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });

  const resultado = await mutarDb((db) => {
    const pregunta = db.preguntas.find((p) => p.id === id);
    if (!pregunta) return { status: 404 as const, error: "Pregunta no encontrada" };
    if (pregunta.estado === "CERRADA") return { status: 409 as const, error: "La pregunta esta cerrada; reabrela para continuar el hilo" };
    const mensaje = agregarMensaje(pregunta, { id: nuevoId(), ...parsed.data, autor: sesion.nombre, origen: "INTERNO", fecha: ahora() });
    return { status: 200 as const, mensaje };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, mensaje: resultado.mensaje });
}
