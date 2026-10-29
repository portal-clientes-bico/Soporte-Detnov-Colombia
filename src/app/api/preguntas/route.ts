import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora, type Pregunta } from "@/lib/db";
import { agregarMensaje } from "@/lib/hilo";
import { preguntaSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = preguntaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { marcaId, productos, documentos, ...datos } = parsed.data;

  const resultado = await mutarDb((db) => {
    if (!db.marcas.some((m) => m.id === marcaId)) return { status: 404 as const, error: "Marca no encontrada" };
    const now = ahora();
    const id = nuevoId();
    const { respondedor, respuesta, ...campos } = datos;
    const pregunta: Pregunta = {
      id,
      marcaId,
      ...campos,
      respondedor: null,
      respuesta: null,
      mensajes: [],
      estado: "ABIERTA",
      fechaCierre: null,
      createdAt: now,
      updatedAt: now,
    };
    // Si se crea ya con una respuesta, queda como primer mensaje del hilo.
    if (respuesta) agregarMensaje(pregunta, { id: nuevoId(), tipo: "RESPUESTA", autor: respondedor ?? datos.autor, origen: "INTERNO", texto: respuesta, fecha: now });
    db.preguntas.push(pregunta);
    for (const productoId of productos ?? []) {
      if (db.productos.some((p) => p.id === productoId && p.marcaId === marcaId)) {
        db.preguntaProductos.push({ preguntaId: id, productoId });
      }
    }
    for (const documentoId of documentos ?? []) {
      if (db.documentos.some((d) => d.id === documentoId && d.marcaId === marcaId)) {
        db.preguntaDocumentos.push({ preguntaId: id, documentoId });
      }
    }
    return { status: 200 as const, id };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, id: resultado.id });
}
