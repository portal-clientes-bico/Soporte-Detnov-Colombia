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
 * Preguntas que se ven con el enlace: solo las ABIERTA de la misma marca que la pregunta del
 * enlace (ni borradores, que son internos, ni cerradas; tampoco la propia pregunta del enlace
 * si ya se cerro). La del enlace va primero.
 */
export function preguntasDelEnlace(db: Db, base: Pregunta): Pregunta[] {
  return db.preguntas
    .filter((p) => p.marcaId === base.marcaId && p.estado === "ABIERTA")
    .sort((a, b) => (a.id === base.id ? -1 : b.id === base.id ? 1 : b.createdAt.localeCompare(a.createdAt)));
}

/**
 * Pregunta abierta que se consulta o responde con el enlace: la indicada (si esta entre las
 * del menu) o, sin indicar, la del enlace. null si el token no existe o la pregunta no esta
 * abierta / no pertenece a la marca del enlace.
 */
export function resolverPreguntaExterna(db: Db, token: string, preguntaId?: string | null): { base: Pregunta; pregunta: Pregunta } | null {
  const base = preguntaPorToken(db, token);
  if (!base) return null;
  const pregunta = preguntasDelEnlace(db, base).find((p) => p.id === (preguntaId || base.id));
  return pregunta ? { base, pregunta } : null;
}
