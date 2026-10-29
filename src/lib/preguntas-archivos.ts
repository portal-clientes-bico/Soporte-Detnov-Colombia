import "server-only";
import { mutarDb, nuevoId, ahora, leerDb, type SoporteConfianza, type SoporteDocumentoTipo } from "@/lib/db";
import { guardarArchivo } from "@/lib/storage";
import { extraerYGuardarSiCorresponde } from "@/lib/extraccion-texto";

export class PreguntaNoEncontradaError extends Error {}

/**
 * Sube un archivo a la biblioteca de la marca y lo vincula a la pregunta (y a sus productos).
 * Lo usan tanto el equipo interno (CONFIRMADO) como el enlace externo de la fabrica
 * (PENDIENTE: el equipo lo revisa antes de que el ChatBot lo use). Lanza ArchivoValidationError
 * (storage.ts) si el archivo no es valido.
 */
export async function adjuntarArchivoAPregunta(
  preguntaId: string,
  archivo: File,
  datos: { tipo: SoporteDocumentoTipo; titulo: string; notas?: string | null; confianza: SoporteConfianza },
): Promise<string> {
  const db0 = await leerDb();
  const pregunta = db0.preguntas.find((p) => p.id === preguntaId);
  if (!pregunta) throw new PreguntaNoEncontradaError("Pregunta no encontrada");
  const marca = db0.marcas.find((m) => m.id === pregunta.marcaId);
  if (!marca) throw new PreguntaNoEncontradaError("Marca no encontrada");

  const guardado = await guardarArchivo(marca.slug, archivo);

  const documentoId = await mutarDb((db) => {
    const now = ahora();
    const nuevoDocId = nuevoId();
    db.documentos.push({
      id: nuevoDocId,
      marcaId: pregunta.marcaId,
      fuenteId: null,
      tipo: datos.tipo,
      titulo: datos.titulo,
      codigo: null,
      revision: null,
      fechaEmision: null,
      idioma: "ES",
      urlOrigen: null,
      archivoNombre: guardado.nombreArchivo,
      archivoPath: guardado.archivoPath,
      confianza: datos.confianza,
      notas: datos.notas ?? `Adjuntado desde la pregunta: ${pregunta.titulo}`,
      textoExtraidoEn: null,
      embeddingsGeneradasEn: null,
      traduccionDeId: null,
      estadoTraduccion: null,
      createdAt: now,
      updatedAt: now,
    });
    db.preguntaDocumentos.push({ preguntaId, documentoId: nuevoDocId });
    // El archivo tambien queda vinculado a los mismos productos de la pregunta,
    // para que aparezca en la ficha de cada referencia relacionada.
    const productoIds = db.preguntaProductos.filter((pp) => pp.preguntaId === preguntaId).map((pp) => pp.productoId);
    for (const productoId of productoIds) {
      db.documentoProductos.push({ documentoId: nuevoDocId, productoId });
    }
    return nuevoDocId;
  });

  // Extraccion de texto + embeddings para el ChatBot: intento aparte, nunca hace fallar la subida.
  const resultado = await extraerYGuardarSiCorresponde({ id: documentoId, confianza: datos.confianza, archivoPath: guardado.archivoPath });
  if (resultado.textoExtraidoEn) {
    await mutarDb((db) => {
      const doc = db.documentos.find((d) => d.id === documentoId);
      if (doc) {
        doc.textoExtraidoEn = resultado.textoExtraidoEn;
        doc.embeddingsGeneradasEn = resultado.embeddingsGeneradasEn;
      }
    });
  }
  return documentoId;
}
