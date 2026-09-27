import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { TEXTO_EXTRAIDO_DIR, UPLOADS_DIR, ahora, type Documento } from "@/lib/db";
import { generarYGuardarEmbeddings } from "@/lib/embeddings";

export interface PaginaExtraida {
  numero: number;
  texto: string;
}

export interface TextoExtraidoDocumento {
  documentoId: string;
  extraidoEn: string;
  paginas: PaginaExtraida[];
}

/** Extensiones de archivo que sabemos extraer. Fase 1: solo PDF (es lo unico presente en
 * el 99% del corpus confirmado). Excel/Word/PowerPoint quedan para una fase futura. */
const EXTENSIONES_SOPORTADAS = new Set([".pdf"]);

export function extensionSoportada(archivoPath: string): boolean {
  return EXTENSIONES_SOPORTADAS.has(path.extname(archivoPath).toLowerCase());
}

async function extraerPdf(buf: Buffer): Promise<PaginaExtraida[]> {
  // pdf-parse (via pdfjs-dist) carga codigo pesado con efectos secundarios apenas se importa
  // (intenta polyfillear DOMMatrix/ImageData/Path2D via el paquete opcional @napi-rs/canvas, no
  // instalado) -- en Vercel eso revienta con "ReferenceError: DOMMatrix is not defined" para
  // CUALQUIER ruta que solo con importar este archivo arrastrara la carga (este modulo lo
  // importa queries.ts, usado por casi toda la app). Importar ambos paquetes de forma perezosa,
  // solo aqui dentro, evita pagar ese costo (y ese riesgo) fuera del momento en que si hace
  // falta extraer un PDF de verdad.
  const [{ PDFParse }, pdfjsWorker] = await Promise.all([import("pdf-parse"), import("pdfjs-dist/legacy/build/pdf.worker.mjs")]);
  // pdf-parse (via pdfjs-dist) intenta cargar su "worker" con un import() dinamico cuyo argumento
  // (GlobalWorkerOptions.workerSrc) solo se conoce en tiempo de ejecucion -- Turbopack no puede
  // seguirlo estaticamente y lo reescribe para resolver contra sus propios chunks del servidor,
  // ignorando el valor real. La salida documentada por pdfjs-dist para bundlers es publicar el
  // worker (importado aparte, con un literal que Turbopack si puede seguir) en
  // globalThis.pdfjsWorker: internamente, antes de intentar el import() dinamico, revisa si ya
  // existe globalThis.pdfjsWorker.WorkerMessageHandler y, si esta, lo usa directo sin import().
  (globalThis as unknown as { pdfjsWorker: typeof pdfjsWorker }).pdfjsWorker = pdfjsWorker;

  const parser = new PDFParse({ data: buf });
  try {
    const resultado = await parser.getText();
    return (resultado.pages ?? []).map((p) => ({ numero: p.num, texto: (p.text ?? "").trim() })).filter((p) => p.texto.length > 0);
  } finally {
    await parser.destroy().catch(() => {});
  }
}

// Ver la nota equivalente en storage.ts sobre resolucion automatica de credenciales.
const USAR_BLOB = !!process.env.BLOB_STORE_ID || !!process.env.BLOB_READ_WRITE_TOKEN;

async function leerArchivoOriginal(archivoPath: string): Promise<Buffer> {
  if (USAR_BLOB) {
    const { head } = await import("@vercel/blob");
    const info = await head(`uploads/${archivoPath}`);
    const respuesta = await fetch(info.url);
    return Buffer.from(await respuesta.arrayBuffer());
  }
  return fs.readFile(path.join(UPLOADS_DIR, archivoPath));
}

function rutaTextoDocumento(documentoId: string): string {
  return path.join(TEXTO_EXTRAIDO_DIR, `${documentoId}.json`);
}

export async function leerTextoDocumento(documentoId: string): Promise<TextoExtraidoDocumento | null> {
  if (USAR_BLOB) {
    try {
      const { head } = await import("@vercel/blob");
      const info = await head(`uploads-texto/${documentoId}.json`);
      const respuesta = await fetch(info.url);
      return (await respuesta.json()) as TextoExtraidoDocumento;
    } catch {
      return null;
    }
  }
  try {
    const raw = await fs.readFile(rutaTextoDocumento(documentoId), "utf8");
    return JSON.parse(raw) as TextoExtraidoDocumento;
  } catch {
    return null;
  }
}

async function guardarTextoDocumento(documentoId: string, paginas: PaginaExtraida[]): Promise<void> {
  const contenido: TextoExtraidoDocumento = { documentoId, extraidoEn: ahora(), paginas };
  if (USAR_BLOB) {
    const { put } = await import("@vercel/blob");
    await put(`uploads-texto/${documentoId}.json`, JSON.stringify(contenido), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(TEXTO_EXTRAIDO_DIR, { recursive: true });
  await fs.writeFile(rutaTextoDocumento(documentoId), JSON.stringify(contenido, null, 1), "utf8");
}

export async function borrarTextoDocumento(documentoId: string): Promise<void> {
  if (USAR_BLOB) {
    const { del } = await import("@vercel/blob");
    await del(`uploads-texto/${documentoId}.json`).catch(() => {});
    return;
  }
  await fs.unlink(rutaTextoDocumento(documentoId)).catch(() => {});
}

export interface ResultadoExtraccion {
  textoExtraidoEn: string | null;
  embeddingsGeneradasEn: string | null;
}

/**
 * Si el documento aplica (confianza CONFIRMADO, tiene archivo local, tipo soportado),
 * extrae su texto, lo guarda y de una vez calcula sus vectores de embedding (busqueda
 * semantica local, ver src/lib/embeddings.ts) -- el caller escribe ambas fechas en
 * documento.textoExtraidoEn / embeddingsGeneradasEn. Ninguno de los dos pasos lanza
 * excepcion: son mejoras sobre la operacion principal (crear/actualizar el documento), que
 * nunca deben tumbarla.
 */
export async function extraerYGuardarSiCorresponde(documento: Pick<Documento, "id" | "confianza" | "archivoPath">): Promise<ResultadoExtraccion> {
  const nada: ResultadoExtraccion = { textoExtraidoEn: null, embeddingsGeneradasEn: null };
  if (documento.confianza !== "CONFIRMADO") return nada;
  if (!documento.archivoPath) return nada;
  if (!extensionSoportada(documento.archivoPath)) return nada;

  let paginas: PaginaExtraida[];
  try {
    const buf = await leerArchivoOriginal(documento.archivoPath);
    paginas = await extraerPdf(buf);
    if (paginas.length === 0) return nada; // probablemente un PDF escaneado sin capa de texto
    await guardarTextoDocumento(documento.id, paginas);
  } catch (error) {
    console.error(`No se pudo extraer texto de documento ${documento.id} (${documento.archivoPath}):`, error);
    return nada;
  }

  const embeddingsGeneradasEn = await generarYGuardarEmbeddings(documento.id, paginas);
  return { textoExtraidoEn: ahora(), embeddingsGeneradasEn };
}
