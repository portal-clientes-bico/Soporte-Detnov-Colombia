import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hash de contrasenas con scrypt (nativo de Node, sin dependencias externas). Formato
 * guardado: "salt:hash", ambos en hex. No es para un sistema expuesto a internet con
 * miles de usuarios, pero es muchisimo mejor que texto plano para esta herramienta local.
 */
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verificarPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, KEYLEN);
  return hashBuffer.length === suppliedBuffer.length && timingSafeEqual(hashBuffer, suppliedBuffer);
}
