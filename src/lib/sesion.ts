import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Sesion del lado del servidor: al iniciar sesion se emite una cookie httpOnly con
 * "<payload>.<firma>", donde la firma es un HMAC-SHA256 del payload con SESSION_SECRET. Sin
 * base de datos de sesiones: la cookie se valida solo con el secreto, asi que sirve igual en
 * local (data/db.json) y en Vercel (Postgres), y la puede revisar src/proxy.ts sin leer la db.
 *
 * Secreto:
 * - En la nube (hay POSTGRES_URL) es obligatorio definir SESSION_SECRET en las variables de
 *   entorno de Vercel. Si falta, nadie puede iniciar sesion (falla cerrado).
 * - En local, si no hay SESSION_SECRET se genera uno aleatorio la primera vez y se guarda en
 *   data/.session-secret (data/ no va a git).
 */
export const COOKIE_SESION = "soporte-tecnico-sesion";
export const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

export interface Sesion {
  id: string;
  nombre: string;
  /** Vencimiento, en segundos desde epoch. */
  exp: number;
}

const CORRIENDO_EN_LA_NUBE = !!process.env.POSTGRES_URL;
const ARCHIVO_SECRETO_LOCAL = path.join(process.cwd(), "data", ".session-secret");

let secretoCache: string | null = null;

function secreto(): string | null {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (CORRIENDO_EN_LA_NUBE) return null;
  if (secretoCache) return secretoCache;
  try {
    if (existsSync(ARCHIVO_SECRETO_LOCAL)) {
      secretoCache = readFileSync(ARCHIVO_SECRETO_LOCAL, "utf8").trim() || null;
    }
    if (!secretoCache) {
      secretoCache = randomBytes(32).toString("hex");
      mkdirSync(path.dirname(ARCHIVO_SECRETO_LOCAL), { recursive: true });
      writeFileSync(ARCHIVO_SECRETO_LOCAL, secretoCache, "utf8");
    }
    return secretoCache;
  } catch {
    return null;
  }
}

export function sesionConfigurada(): boolean {
  return secreto() !== null;
}

function firmar(payload: string, clave: string): string {
  return createHmac("sha256", clave).update(payload).digest("base64url");
}

export function crearTokenSesion(usuario: { id: string; nombre: string }): string {
  const clave = secreto();
  if (!clave) throw new Error("Falta configurar SESSION_SECRET");
  const sesion: Sesion = {
    id: usuario.id,
    nombre: usuario.nombre,
    exp: Math.floor(Date.now() / 1000) + DURACION_SESION_SEGUNDOS,
  };
  const payload = Buffer.from(JSON.stringify(sesion), "utf8").toString("base64url");
  return `${payload}.${firmar(payload, clave)}`;
}

export function verificarTokenSesion(token: string | undefined | null): Sesion | null {
  if (!token) return null;
  const clave = secreto();
  if (!clave) return null;
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const esperada = Buffer.from(firmar(payload, clave));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

  try {
    const sesion = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof sesion?.id !== "string" || typeof sesion?.nombre !== "string" || typeof sesion?.exp !== "number") return null;
    if (sesion.exp < Math.floor(Date.now() / 1000)) return null;
    return sesion;
  } catch {
    return null;
  }
}

/** Opciones de la cookie de sesion (Secure solo en produccion para que funcione en http://localhost). */
export function opcionesCookieSesion(maxAge: number = DURACION_SESION_SEGUNDOS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
