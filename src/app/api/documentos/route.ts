import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora, leerDb } from "@/lib/db";
import { documentoCamposSchema } from "@/lib/schemas";
import { guardarArchivo, ArchivoValidationError } from "@/lib/storage";
import { extraerYGuardarSiCorresponde } from "@/lib/extraccion-texto";

function formDataAObjeto(formData: FormData): Record<string, string> {
  const objeto: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    if (typeof valor === "string" && !(clave in objeto)) objeto[clave] = valor;
  }
  return objeto;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const marcaId = formData.get("marcaId");
  if (typeof marcaId !== "string" || !marcaId) return NextResponse.json({ error: "Falta marcaId" }, { status: 400 });

  const parsed = documentoCamposSchema.safeParse(formDataAObjeto(formData));
  if (!parsed.success) {
    return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });
  }

  const db0 = await leerDb();
  const marca = db0.marcas.find((m) => m.id === marcaId);
  if (!marca) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  const productoIds = formData.getAll("productos").filter((v): v is string => typeof v === "string" && v.length > 0);

  const archivo = formData.get("file");
  let guardado: { nombreArchivo: string; archivoPath: string } | null = null;
  if (archivo instanceof File && archivo.size > 0) {
    try {
      guardado = await guardarArchivo(marca.slug, archivo);
    } catch (error) {
      if (error instanceof ArchivoValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      console.error("Error subiendo documento:", error);
      return NextResponse.json({ error: "No se pudo subir el archivo. Intenta de nuevo." }, { status: 500 });
    }
  }

  const { fuenteId, ...datos } = parsed.data;

  const id = await mutarDb((db) => {
    const now = ahora();
    const nuevoDocId = nuevoId();
    db.documentos.push({
      id: nuevoDocId,
      marcaId,
      fuenteId: fuenteId || null,
      ...datos,
      archivoNombre: guardado?.nombreArchivo ?? null,
      archivoPath: guardado?.archivoPath ?? null,
      textoExtraidoEn: null,
      createdAt: now,
      updatedAt: now,
    });
    for (const productoId of productoIds) {
      if (db.productos.some((p) => p.id === productoId)) {
        db.documentoProductos.push({ documentoId: nuevoDocId, productoId });
      }
    }
    return nuevoDocId;
  });

  // Extraccion de texto para el ChatBot: intento aparte, nunca hace fallar la creacion.
  const extraidoEn = await extraerYGuardarSiCorresponde({ id, confianza: parsed.data.confianza, archivoPath: guardado?.archivoPath ?? null });
  if (extraidoEn) {
    await mutarDb((db) => {
      const doc = db.documentos.find((d) => d.id === id);
      if (doc) doc.textoExtraidoEn = extraidoEn;
    });
  }

  return NextResponse.json({ ok: true, id });
}
