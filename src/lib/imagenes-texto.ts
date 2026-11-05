import "server-only";
import { NextResponse } from "next/server";
import { guardarArchivo, ArchivoValidationError } from "@/lib/storage";
import { IMAGEN_MAX_BYTES, IMAGEN_TIPOS_PERMITIDOS } from "@/lib/tipos";

/** Carpeta (dentro de las subidas) de las imagenes pegadas en preguntas y mensajes del hilo. */
const CARPETA = "preguntas-imagenes";

/**
 * Guarda una imagen pegada en el editor de texto (pregunta o mensaje del hilo) y responde con
 * su ruta publica (/api/archivos/...), que el editor inserta como ![](ruta). La imagen no queda
 * registrada como documento: solo existe dentro del texto que la usa.
 */
export async function subirImagenTexto(formData: FormData | null): Promise<NextResponse> {
  const archivo = formData?.get("file");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Select an image / Selecciona una imagen" }, { status: 400 });
  }
  if (!IMAGEN_TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json({ error: "Only PNG, JPG or WEBP / Solo imagenes PNG, JPG o WEBP" }, { status: 400 });
  }
  if (archivo.size > IMAGEN_MAX_BYTES) {
    return NextResponse.json({ error: `Max ${IMAGEN_MAX_BYTES / (1024 * 1024)} MB` }, { status: 400 });
  }
  // Los pegados desde el portapapeles se llaman "image.png": el nombre lleva la fecha delante.
  const extension = archivo.type === "image/jpeg" ? "jpg" : archivo.type.split("/")[1];
  const nombre = /\.(png|jpe?g|webp)$/i.test(archivo.name) ? archivo.name : `imagen.${extension}`;
  try {
    const { archivoPath } = await guardarArchivo(CARPETA, new File([archivo], nombre, { type: archivo.type }));
    return NextResponse.json({ ok: true, url: `/api/archivos/${archivoPath}` });
  } catch (error) {
    if (error instanceof ArchivoValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error subiendo imagen de texto:", error);
    return NextResponse.json({ error: "Upload failed / No se pudo subir la imagen" }, { status: 500 });
  }
}
