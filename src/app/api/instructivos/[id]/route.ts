import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import type { BloqueInstructivo } from "@/lib/db";
import { instructivoPatchSchema } from "@/lib/schemas";
import { borrarArchivo } from "@/lib/storage";

function rutasImagenes(bloques: BloqueInstructivo[]): string[] {
  return bloques.flatMap((b) => (b.tipo === "IMAGEN" ? [b.archivoPath] : []));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = instructivoPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const datos = parsed.data;

  const resultado = await mutarDb((db) => {
    const instructivo = db.instructivos.find((i) => i.id === id);
    if (!instructivo) return null;
    const imagenesAntes = rutasImagenes(instructivo.bloques);
    const { productoIds, ...resto } = datos;
    Object.assign(instructivo, resto);
    if (productoIds) {
      instructivo.productoIds = productoIds.filter((pid) => db.productos.some((p) => p.id === pid && p.marcaId === instructivo.marcaId));
    }
    if (datos.estado === "PUBLICADO" && !instructivo.publicadoEn) instructivo.publicadoEn = ahora();
    instructivo.updatedAt = ahora();
    const imagenesDespues = new Set(rutasImagenes(instructivo.bloques));
    return { imagenesQuitadas: imagenesAntes.filter((p) => !imagenesDespues.has(p)) };
  });

  if (!resultado) return NextResponse.json({ error: "Instructivo no encontrado" }, { status: 404 });
  // Las imagenes que se quitaron del instructivo ya no las usa nadie mas (se suben solo para el).
  await Promise.all(resultado.imagenesQuitadas.map((p) => borrarArchivo(p)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imagenes = await mutarDb((db) => {
    const instructivo = db.instructivos.find((i) => i.id === id);
    if (!instructivo) return null;
    db.instructivos = db.instructivos.filter((i) => i.id !== id);
    return rutasImagenes(instructivo.bloques);
  });

  if (!imagenes) return NextResponse.json({ error: "Instructivo no encontrado" }, { status: 404 });
  await Promise.all(imagenes.map((p) => borrarArchivo(p)));
  return NextResponse.json({ ok: true });
}
