import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/db";
import { ARCHIVO_MAX_BYTES, ARCHIVO_TIPOS_PERMITIDOS } from "@/lib/tipos";

export class ArchivoValidationError extends Error {}

// @vercel/blob resuelve credenciales solo (BLOB_STORE_ID + VERCEL_OIDC_TOKEN en conexiones
// nuevas sin token estatico, o BLOB_READ_WRITE_TOKEN en conexiones con token clasico) -- solo
// hace falta detectar que un Blob store esta conectado.
const USAR_BLOB = !!process.env.BLOB_STORE_ID || !!process.env.BLOB_READ_WRITE_TOKEN;
/** Prefijo comun para distinguir estos archivos de los de texto extraido/embeddings dentro
 * del mismo Blob store (ver TEXTO_EXTRAIDO_PREFIX/EMBEDDINGS_PREFIX). */
const BLOB_PREFIX = "uploads";

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/** Guarda el archivo (disco local o Vercel Blob segun el entorno) y devuelve la ruta relativa
 * que sirve la API de descarga (/api/archivos/<archivoPath>). */
export async function guardarArchivo(marcaSlug: string, file: File): Promise<{ nombreArchivo: string; archivoPath: string }> {
  if (!(file.type in ARCHIVO_TIPOS_PERMITIDOS)) {
    throw new ArchivoValidationError(
      `Tipo de archivo no permitido. Acepta: ${Object.values(ARCHIVO_TIPOS_PERMITIDOS).join(", ")}.`,
    );
  }
  if (file.size > ARCHIVO_MAX_BYTES) {
    throw new ArchivoValidationError(`El archivo supera el maximo de ${ARCHIVO_MAX_BYTES / (1024 * 1024)}MB.`);
  }

  const nombreSeguro = `${Date.now()}-${sanitizeFilename(file.name || "documento")}`;
  const archivoPath = `${marcaSlug}/${nombreSeguro}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (USAR_BLOB) {
    const { put } = await import("@vercel/blob");
    await put(`${BLOB_PREFIX}/${archivoPath}`, buffer, { access: "public", addRandomSuffix: false });
  } else {
    const carpeta = path.join(UPLOADS_DIR, marcaSlug);
    await fs.mkdir(carpeta, { recursive: true });
    await fs.writeFile(path.join(carpeta, nombreSeguro), buffer);
  }

  return { nombreArchivo: file.name, archivoPath };
}

export async function borrarArchivo(archivoPath: string | null | undefined): Promise<void> {
  if (!archivoPath) return;
  if (USAR_BLOB) {
    const { del } = await import("@vercel/blob");
    await del(`${BLOB_PREFIX}/${archivoPath}`).catch(() => null);
    return;
  }
  await fs.unlink(path.join(UPLOADS_DIR, archivoPath)).catch(() => null);
}
