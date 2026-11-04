import { subirImagenTexto } from "@/lib/imagenes-texto";

/** Imagen pegada en el editor de una pregunta o del hilo (herramienta interna, con sesion). */
export async function POST(request: Request) {
  return subirImagenTexto(await request.formData().catch(() => null));
}
