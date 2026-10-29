import { NextResponse } from "next/server";
import { z } from "zod";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { resolverPreguntaExterna } from "@/lib/enlace-externo";
import { agregarMensaje } from "@/lib/hilo";

const schema = z.object({
  nombre: z.string().trim().min(2).max(120),
  respuesta: z.string().trim().min(2).max(20000),
  tipo: z.enum(["RESPUESTA", "CONTRAPREGUNTA"]).default("RESPUESTA"),
  /** Otra pregunta no resuelta de la misma marca, elegida en el menu (si no, la del enlace). */
  preguntaId: z.string().min(1).max(60).optional(),
});

/** Respuesta o contrapregunta desde el enlace externo (sin sesion: el token del enlace es la
 * autorizacion). Se agrega al hilo de la pregunta con nombre y fecha. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data / Datos invalidos" }, { status: 400 });

  const resultado = await mutarDb((db) => {
    const pregunta = resolverPreguntaExterna(db, token, parsed.data.preguntaId)?.pregunta;
    if (!pregunta) return 404 as const;
    if (pregunta.estado === "CERRADA") return 409 as const;
    agregarMensaje(pregunta, {
      id: nuevoId(),
      tipo: parsed.data.tipo,
      autor: parsed.data.nombre,
      origen: "EXTERNO",
      texto: parsed.data.respuesta,
      fecha: ahora(),
    });
    return 200 as const;
  });

  if (resultado === 404) return NextResponse.json({ error: "Link not valid / Enlace no valido" }, { status: 404 });
  if (resultado === 409) return NextResponse.json({ error: "Question closed / Pregunta cerrada" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
