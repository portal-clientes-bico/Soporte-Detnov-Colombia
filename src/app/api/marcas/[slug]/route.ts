import { NextResponse } from "next/server";
import { z } from "zod";
import { borrarArchivo } from "@/lib/storage";
import { mutarDb, ahora } from "@/lib/db";

const schema = z.object({
  nombre: z.string().trim().min(2).max(100).optional(),
  descripcion: z.string().trim().max(2000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const ok = await mutarDb((db) => {
    const marca = db.marcas.find((m) => m.slug === slug);
    if (!marca) return false;
    if (parsed.data.nombre !== undefined) marca.nombre = parsed.data.nombre;
    if (parsed.data.descripcion !== undefined) marca.descripcion = parsed.data.descripcion;
    marca.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const archivosABorrar = await mutarDb((db) => {
    const marca = db.marcas.find((m) => m.slug === slug);
    if (!marca) return null;
    const docs = db.documentos.filter((d) => d.marcaId === marca.id);
    const paths = docs.map((d) => d.archivoPath).filter((p): p is string => !!p);

    db.documentos = db.documentos.filter((d) => d.marcaId !== marca.id);
    const productoIds = new Set(db.productos.filter((p) => p.marcaId === marca.id).map((p) => p.id));
    db.productos = db.productos.filter((p) => p.marcaId !== marca.id);
    db.fuentes = db.fuentes.filter((f) => f.marcaId !== marca.id);
    db.hallazgos = db.hallazgos.filter((h) => h.marcaId !== marca.id);
    db.compatibilidades = db.compatibilidades.filter((c) => !productoIds.has(c.productoId) && !productoIds.has(c.compatibleId));
    db.documentoProductos = db.documentoProductos.filter((dp) => !productoIds.has(dp.productoId));
    db.marcas = db.marcas.filter((m) => m.id !== marca.id);

    return paths;
  });

  if (archivosABorrar === null) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  await Promise.all(archivosABorrar.map((p) => borrarArchivo(p)));
  return NextResponse.json({ ok: true });
}
