import type { MensajePregunta, Pregunta, TipoMensajePregunta } from "@/lib/db";

/** Id fijo del mensaje con que se leen las preguntas anteriores al hilo (respuesta unica). */
const ID_RESPUESTA_ANTERIOR = "respuesta-anterior";

/**
 * Mensajes del hilo de la pregunta, del mas antiguo al mas reciente. Las preguntas anteriores
 * al hilo solo tienen "respuesta": se leen como un primer mensaje de quien respondio.
 */
export function mensajesDe(p: Pick<Pregunta, "mensajes" | "respuesta" | "respondedor" | "fechaCierre" | "updatedAt">): MensajePregunta[] {
  if (p.mensajes) return p.mensajes;
  if (!p.respuesta?.trim()) return [];
  return [
    {
      id: ID_RESPUESTA_ANTERIOR,
      tipo: "RESPUESTA",
      autor: p.respondedor ?? "—",
      origen: "INTERNO",
      texto: p.respuesta,
      fecha: p.fechaCierre ?? p.updatedAt,
    },
  ];
}

/** Texto traducido de un mensaje del hilo (null = mostrar el original). Las traducciones
 * guardadas antes del hilo solo traen "respuesta", que corresponde a la respuesta anterior. */
export function textoTraducido(t: { respuesta: string | null; mensajes?: Record<string, string> } | null | undefined, m: MensajePregunta): string | null {
  if (!t) return null;
  return t.mensajes?.[m.id] ?? (m.id === ID_RESPUESTA_ANTERIOR ? t.respuesta : null);
}

/** Resumen del hilo en "respuesta"/"respondedor", que es lo que leen el ChatBot, el reporte en
 * Word y la ficha de producto. */
export function sincronizarResumenHilo(p: Pregunta): void {
  const mensajes = p.mensajes ?? [];
  p.respuesta = mensajes.length
    ? mensajes
        .map((m) => `[${m.fecha.slice(0, 10)} · ${m.autor}${m.tipo === "CONTRAPREGUNTA" ? " · Contrapregunta" : ""}]\n${m.texto}`)
        .join("\n\n")
    : null;
  p.respondedor = mensajes.length ? [...new Set(mensajes.map((m) => m.autor))].join(", ") : null;
}

export function agregarMensaje(
  p: Pregunta,
  datos: { id: string; tipo: TipoMensajePregunta; autor: string; origen: MensajePregunta["origen"]; texto: string; fecha: string },
): MensajePregunta {
  // Al primer mensaje de una pregunta anterior al hilo, su respuesta unica pasa a ser mensaje.
  p.mensajes = [...mensajesDe(p), datos];
  sincronizarResumenHilo(p);
  p.updatedAt = datos.fecha;
  return datos;
}

export function quitarMensaje(p: Pregunta, mensajeId: string, fecha: string): boolean {
  const mensajes = mensajesDe(p);
  if (!mensajes.some((m) => m.id === mensajeId)) return false;
  p.mensajes = mensajes.filter((m) => m.id !== mensajeId);
  sincronizarResumenHilo(p);
  p.updatedAt = fecha;
  return true;
}
