import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { documentoCamposSchema } from "@/lib/schemas";
import { borrarArchivo } from "@/lib/storage";
import { borrarTextoDocumento, extraerYGuardarSiCorresponde } from "@/lib/extraccion-texto";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = documentoCamposSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const { fuenteId, ...datos } = parsed.data;

  const actualizado = await mutarDb((db) => {
    const documento = db.documentos.find((d) => d.id === id);
    if (!documento) return null;
    Object.assign(documento, datos);
    if (fuenteId !== undefined) documento.fuenteId = fuenteId || null;
    documento.updatedAt = ahora();
    return { id: documento.id, confianza: documento.confianza, archivoPath: documento.archivoPath, textoExtraidoEn: documento.textoExtraidoEn };
  });

  if (!actualizado) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

  // Si la confianza acaba de pasar a CONFIRMADO (o nunca se habia intentado), extraer texto.
  if (!actualizado.textoExtraidoEn) {
    const extraidoEn = await extraerYGuardarSiCorresponde(actualizado);
    if (extraidoEn) {
      await mutarDb((db) => {
        const doc = db.documentos.find((d) => d.id === id);
        if (doc) doc.textoExtraidoEn = extraidoEn;
      });
    }
  }

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
  await borrarTextoDocumento(id);
  return NextResponse.json({ ok: true });
}
