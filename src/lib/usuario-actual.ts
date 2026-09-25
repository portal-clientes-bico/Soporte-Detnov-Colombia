/**
 * Sesion del usuario actual en este navegador. El inicio de sesion (correo + contrasena)
 * se valida contra el servidor en /api/usuarios/login; una vez validado, solo se guarda
 * aqui el id y el nombre (nunca la contrasena) para prellenar "quien pregunta" / "quien
 * responde" en el modulo de Preguntas y mostrar quien esta identificado.
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

export function olvidarUsuarioActual(): void {
  try {
    window.localStorage.removeItem(USUARIO_ACTUAL_KEY);
  } catch {
    // ver nota en guardarUsuarioActual
  }
}

export function nombreUsuarioActual(): string {
  return leerUsuarioActual()?.nombre ?? "";
}
