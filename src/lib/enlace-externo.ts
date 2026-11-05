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

/** Pregunta duena del token. Si (por datos copiados o migrados) dos preguntas compartieran
 * token, el enlace no se resuelve: nunca se muestra una pregunta que no es la del enlace. */
export function preguntaPorToken(db: Db, token: string): Pregunta | null {
  if (!tokenValido(token)) return null;
  const duenas = db.preguntas.filter((p) => p.enlaceExterno?.token === token);
  return duenas.length === 1 ? duenas[0] : null;
}

/** Token nuevo que ninguna otra pregunta usa. */
export function tokenEnlaceUnico(db: Db): string {
  const usados = new Set(db.preguntas.map((p) => p.enlaceExterno?.token).filter(Boolean));
  let token = nuevoTokenEnlace();
  while (usados.has(token)) token = nuevoTokenEnlace();
  return token;
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
