import "server-only";
import { randomBytes } from "node:crypto";
import type { Db, Pregunta } from "@/lib/db";

/** Token aleatorio de 32 bytes (no adivinable): es la unica "clave" del enlace externo. */
export function nuevoTokenEnlace(): string {
  return randomBytes(32).toString("base64url");
}

export function tokenValido(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,60}$/.test(token);
}

export function preguntaPorToken(db: Db, token: string): Pregunta | null {
  if (!tokenValido(token)) return null;
  return db.preguntas.find((p) => p.enlaceExterno?.token === token) ?? null;
}

/**
 * Preguntas no resueltas (ABIERTA) de la misma marca que la pregunta del enlace: quien entra
 * con el enlace puede consultarlas y responderlas desde el menu superior. Los borradores
 * (internos) y las cerradas no se muestran, salvo la propia pregunta del enlace.
 */
export function preguntasDelEnlace(db: Db, base: Pregunta): Pregunta[] {
  return db.preguntas
    .filter((p) => p.marcaId === base.marcaId && (p.id === base.id || p.estado === "ABIERTA"))
    .sort((a, b) => (a.id === base.id ? -1 : b.id === base.id ? 1 : b.createdAt.localeCompare(a.createdAt)));
}

/** Pregunta que se consulta o responde con el enlace: la del token o, si se indica otra, una
 * de las que permite el menu (misma marca y no resuelta). null si no esta permitida. */
export function resolverPreguntaExterna(db: Db, token: string, preguntaId?: string | null): { base: Pregunta; pregunta: Pregunta } | null {
  const base = preguntaPorToken(db, token);
  if (!base) return null;
  if (!preguntaId || preguntaId === base.id) return { base, pregunta: base };
  const pregunta = preguntasDelEnlace(db, base).find((p) => p.id === preguntaId);
  return pregunta ? { base, pregunta } : null;
}
