import "server-only";
import { randomBytes } from "node:crypto";
import { leerDb, ahora, type Db, type Pregunta } from "@/lib/db";

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

export async function leerPreguntaPorToken(token: string): Promise<{ db: Db; pregunta: Pregunta } | null> {
  const db = await leerDb();
  const pregunta = preguntaPorToken(db, token);
  return pregunta ? { db, pregunta } : null;
}

/**
 * Agrega la respuesta de un funcionario de la fabrica. La pregunta tiene un solo campo de
 * respuesta: si ya habia una, la nueva se anexa debajo con nombre y fecha, sin borrar lo que
 * respondio el equipo u otra persona.
 */
export function agregarRespuestaExterna(pregunta: Pregunta, nombre: string, texto: string): void {
  const fecha = ahora().slice(0, 10);
  if (!pregunta.respuesta?.trim()) {
    pregunta.respuesta = texto;
    pregunta.respondedor = nombre;
  } else {
    pregunta.respuesta = `${pregunta.respuesta.trimEnd()}\n\n— ${nombre} (${fecha}):\n${texto}`;
    const respondedores = (pregunta.respondedor ?? "").split(",").map((r) => r.trim()).filter(Boolean);
    if (!respondedores.includes(nombre)) pregunta.respondedor = [...respondedores, nombre].join(", ");
  }
  pregunta.updatedAt = ahora();
}
