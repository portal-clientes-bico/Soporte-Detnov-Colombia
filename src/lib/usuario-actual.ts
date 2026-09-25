/**
 * Identidad del usuario actual de esta herramienta, guardada en localStorage del
 * navegador (no hay autenticacion: es una comodidad para prellenar "quien pregunta" /
 * "quien responde" en el modulo de Preguntas, no un control de acceso).
 */
export const USUARIO_ACTUAL_KEY = "soporte-tecnico:usuario-actual";

export interface UsuarioActual {
  id: string;
  nombre: string;
}

export function leerUsuarioActual(): UsuarioActual | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USUARIO_ACTUAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.id === "string" && typeof parsed?.nombre === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function guardarUsuarioActual(usuario: UsuarioActual): void {
  try {
    window.localStorage.setItem(USUARIO_ACTUAL_KEY, JSON.stringify(usuario));
  } catch {
    // localStorage no disponible (modo privado, etc.): la herramienta sigue funcionando,
    // simplemente sin prellenar los campos de autor/respondedor.
  }
}

export function nombreUsuarioActual(): string {
  return leerUsuarioActual()?.nombre ?? "";
}
