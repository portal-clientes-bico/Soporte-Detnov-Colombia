import "server-only";
import { cookies } from "next/headers";
import { leerDb, type IdiomaVista } from "@/lib/db";
import { COOKIE_IDIOMA, idiomaEfectivo, normalizarIdioma } from "@/lib/idioma";
import { sesionActual } from "@/lib/sesion-actual";

/** Idioma de vista de quien hace la peticion, y su idioma por defecto (para las banderas). */
export async function idiomaDeLaPeticion(): Promise<{ idioma: IdiomaVista; idiomaPorDefecto: IdiomaVista; usuarioId: string | null }> {
  const sesion = await sesionActual();
  if (!sesion) return { idioma: "es", idiomaPorDefecto: "es", usuarioId: null };
  const db = await leerDb();
  const idiomaPorDefecto = normalizarIdioma(db.usuarios.find((u) => u.id === sesion.id)?.idioma);
  const cookie = (await cookies()).get(COOKIE_IDIOMA)?.value;
  return { idioma: idiomaEfectivo(cookie, sesion.id, idiomaPorDefecto), idiomaPorDefecto, usuarioId: sesion.id };
}
