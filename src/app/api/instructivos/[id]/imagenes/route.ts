import { NextResponse } from "next/server";
import { leerDb } from "@/lib/db";
import { guardarArchivo, ArchivoValidationError } from "@/lib/storage";
import { IMAGEN_MAX_BYTES, IMAGEN_TIPOS_PERMITIDOS } from "@/lib/tipos";

/**
 * Sube una imagen para un instructivo y devuelve su ruta. No toca el instructivo: el editor
 * agrega el bloque IMAGEN y lo guarda junto con el resto de cambios (PATCH).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  const archivo = formData?.get("file");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Selecciona una imagen" }, { status: 400 });
  }
  if (!IMAGEN_TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json({ error: "Solo se aceptan imagenes PNG, JPG o WEBP." }, { status: 400 });
  }
  if (archivo.size > IMAGEN_MAX_BYTES) {
    return NextResponse.json({ error: `La imagen supera el maximo de ${IMAGEN_MAX_BYTES / (1024 * 1024)}MB.` }, { status: 400 });
  }

  const db = await leerDb();
  const instructivo = db.instructivos.find((i) => i.id === id);
  if (!instructivo) return NextResponse.json({ error: "Instructivo no encontrado" }, { status: 404 });
  const marca = db.marcas.find((m) => m.id === instructivo.marcaId);
  if (!marca) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  try {
    const { nombreArchivo, archivoPath } = await guardarArchivo(`${marca.slug}/instructivos`, archivo);
    return NextResponse.json({ ok: true, archivoPath, archivoNombre: nombreArchivo });
  } catch (error) {
    if (error instanceof ArchivoValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error subiendo imagen de instructivo:", error);
    return NextResponse.json({ error: "No se pudo subir la imagen. Intenta de nuevo." }, { status: 500 });
  }
}
