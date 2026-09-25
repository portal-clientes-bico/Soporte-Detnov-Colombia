import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { documentoCamposSchema } from "@/lib/schemas";
import { borrarArchivo } from "@/lib/storage";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = documentoCamposSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { fuenteId, ...datos } = parsed.data;

  const ok = await mutarDb((db) => {
    const documento = db.documentos.find((d) => d.id === id);
    if (!documento) return false;
    Object.assign(documento, datos);
    if (fuenteId !== undefined) documento.fuenteId = fuenteId || null;
    documento.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const archivoPath = await mutarDb((db) => {
    const documento = db.documentos.find((d) => d.id === id);
    if (!documento) return undefined;
    const path = documento.archivoPath;
    db.documentos = db.documentos.filter((d) => d.id !== id);
    db.documentoProductos = db.documentoProductos.filter((dp) => dp.documentoId !== id);
    return path;
  });

  if (archivoPath === undefined) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  await borrarArchivo(archivoPath);
  return NextResponse.json({ ok: true });
}
