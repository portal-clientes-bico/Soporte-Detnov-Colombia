import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { TEXTO_EXTRAIDO_DIR, UPLOADS_DIR, ahora, type Documento } from "@/lib/db";

/**
 * pdf-parse (via pdfjs-dist) intenta cargar su "worker" con un import() dinamico cuyo argumento
 * (GlobalWorkerOptions.workerSrc) solo se conoce en tiempo de ejecucion -- Turbopack no puede
 * seguirlo estaticamente y lo reescribe para resolver contra sus propios chunks del servidor,
 * ignorando el valor real. Falla con "Cannot find module .../pdf.worker.mjs" solo dentro del
 * server de Next (un script node comun, como scripts/extraer-texto-confirmados.js, no pasa por
 * Turbopack y no tiene este problema). La salida documentada por pdfjs-dist para bundlers es
 * importar el worker de forma estatica (Turbopack si la empaqueta bien) y publicarlo en
 * globalThis.pdfjsWorker: internamente, antes de intentar el import() dinamico, revisa si ya
 * existe globalThis.pdfjsWorker.WorkerMessageHandler y, si esta, lo usa directo sin import().
 */
(globalThis as unknown as { pdfjsWorker: typeof pdfjsWorker }).pdfjsWorker = pdfjsWorker;

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

async function extraerPdf(rutaCompleta: string): Promise<PaginaExtraida[]> {
  const buf = await fs.readFile(rutaCompleta);
  const parser = new PDFParse({ data: buf });
  try {
    const resultado = await parser.getText();
    return (resultado.pages ?? []).map((p) => ({ numero: p.num, texto: (p.text ?? "").trim() })).filter((p) => p.texto.length > 0);
  } finally {
    await parser.destroy().catch(() => {});
  }
}

function rutaTextoDocumento(documentoId: string): string {
  return path.join(TEXTO_EXTRAIDO_DIR, `${documentoId}.json`);
}

export async function leerTextoDocumento(documentoId: string): Promise<TextoExtraidoDocumento | null> {
  try {
    const raw = await fs.readFile(rutaTextoDocumento(documentoId), "utf8");
    return JSON.parse(raw) as TextoExtraidoDocumento;
  } catch {
    return null;
  }
}

async function guardarTextoDocumento(documentoId: string, paginas: PaginaExtraida[]): Promise<void> {
  await fs.mkdir(TEXTO_EXTRAIDO_DIR, { recursive: true });
  const contenido: TextoExtraidoDocumento = { documentoId, extraidoEn: ahora(), paginas };
  await fs.writeFile(rutaTextoDocumento(documentoId), JSON.stringify(contenido, null, 1), "utf8");
}

export async function borrarTextoDocumento(documentoId: string): Promise<void> {
  await fs.unlink(rutaTextoDocumento(documentoId)).catch(() => {});
}

/**
 * Si el documento aplica (confianza CONFIRMADO, tiene archivo local, tipo soportado),
 * extrae su texto y lo guarda. Devuelve la fecha de extraccion para que el caller la
 * escriba en documento.textoExtraidoEn, o null si no aplico o fallo (no lanza excepcion:
 * la extraccion es una mejora, nunca debe tumbar la operacion principal -- crear/actualizar
 * el documento).
 */
export async function extraerYGuardarSiCorresponde(documento: Pick<Documento, "id" | "confianza" | "archivoPath">): Promise<string | null> {
  if (documento.confianza !== "CONFIRMADO") return null;
  if (!documento.archivoPath) return null;
  if (!extensionSoportada(documento.archivoPath)) return null;

  try {
    const rutaCompleta = path.join(UPLOADS_DIR, documento.archivoPath);
    const paginas = await extraerPdf(rutaCompleta);
    if (paginas.length === 0) return null; // probablemente un PDF escaneado sin capa de texto
    await guardarTextoDocumento(documento.id, paginas);
    return ahora();
  } catch (error) {
    console.error(`No se pudo extraer texto de documento ${documento.id} (${documento.archivoPath}):`, error);
    return null;
  }
}
