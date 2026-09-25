import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/db";
import { ARCHIVO_MAX_BYTES, ARCHIVO_TIPOS_PERMITIDOS } from "@/lib/tipos";

export class ArchivoValidationError extends Error {}

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/** Guarda el archivo en data/uploads/<marcaSlug>/ y devuelve la ruta relativa que sirve la API de descarga. */
export async function guardarArchivo(marcaSlug: string, file: File): Promise<{ nombreArchivo: string; archivoPath: string }> {
  if (!(file.type in ARCHIVO_TIPOS_PERMITIDOS)) {
    throw new ArchivoValidationError(
      `Tipo de archivo no permitido. Acepta: ${Object.values(ARCHIVO_TIPOS_PERMITIDOS).join(", ")}.`,
    );
  }
  if (file.size > ARCHIVO_MAX_BYTES) {
    throw new ArchivoValidationError(`El archivo supera el maximo de ${ARCHIVO_MAX_BYTES / (1024 * 1024)}MB.`);
  }

  const carpeta = path.join(UPLOADS_DIR, marcaSlug);
  await fs.mkdir(carpeta, { recursive: true });

  const nombreSeguro = `${Date.now()}-${sanitizeFilename(file.name || "documento")}`;
  const destino = path.join(carpeta, nombreSeguro);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destino, buffer);

  return { nombreArchivo: file.name, archivoPath: `${marcaSlug}/${nombreSeguro}` };
}

export async function borrarArchivo(archivoPath: string | null | undefined): Promise<void> {
  if (!archivoPath) return;
  await fs.unlink(path.join(UPLOADS_DIR, archivoPath)).catch(() => null);
}
