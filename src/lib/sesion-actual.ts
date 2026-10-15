import "server-only";
import { cookies } from "next/headers";
import { COOKIE_SESION, verificarTokenSesion, type Sesion } from "@/lib/sesion";

/** Sesion del usuario que hace la peticion (o null), para Server Components y Route Handlers. */
export async function sesionActual(): Promise<Sesion | null> {
  const store = await cookies();
  return verificarTokenSesion(store.get(COOKIE_SESION)?.value);
}
