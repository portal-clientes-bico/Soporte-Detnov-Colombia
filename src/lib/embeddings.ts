import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { EMBEDDINGS_DIR, ahora } from "@/lib/db";

/**
 * Busqueda semantica local: complementa el filtro por palabras clave del ChatBot (ver
 * chatbot.ts) para preguntas que no comparten ninguna palabra literal con el documento
 * correcto -- el caso mas comun es una pregunta en español sobre un documento en ingles
 * (verificado con pruebas propias: "cuanto consume la tarjeta de interfaz de maquina
 * avanzada" encuentra la pagina correcta del datasheet en ingles aunque no comparte ninguna
 * palabra literal con "AMI (Advanced Machine Interface)").
 *
 * Corre 100% local via @huggingface/transformers (ONNX Runtime para Node, sin GPU ni
 * servidor externo) con un modelo de embeddings multilinguee pequeño. El modelo se descarga
 * una sola vez la primera vez que se usa (cache en disco, luego funciona sin internet).
 *
 * Modelo asimetrico (E5): las preguntas se codifican con el prefijo "query: " y los pasajes
 * de documento con "passage: ", como recomienda el modelo para mejorar la busqueda.
 */

const MODELO = "Xenova/multilingual-e5-small";
/** Caracteres maximos de texto que se codifican por pagina -- el modelo trunca alrededor de
 * 512 tokens; esto da margen para paginas tipicas (~1500 caracteres en promedio en este
 * corpus) sin arriesgar errores por exceso de longitud. */
const MAX_CHARS_POR_PASAJE = 1800;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Extractor = (textos: string[], opciones: { pooling: "mean"; normalize: boolean }) => Promise<{ tolist(): number[][] }>;

let extractorPromise: Promise<Extractor> | null = null;

/** Carga el modelo una sola vez por proceso (tarda unos segundos la primera vez); las
 * siguientes llamadas reutilizan la misma instancia. */
async function obtenerExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", MODELO) as unknown as Promise<Extractor>,
    );
  }
  return extractorPromise;
}

async function embeder(textos: string[]): Promise<number[][]> {
  if (textos.length === 0) return [];
  const extractor = await obtenerExtractor();
  const salida = await extractor(textos, { pooling: "mean", normalize: true });
  return salida.tolist();
}

/** Embebe la pregunta del usuario (prefijo "query:", convencion del modelo E5). */
export async function embederPregunta(pregunta: string): Promise<number[]> {
  const [vector] = await embeder([`query: ${pregunta}`]);
  return vector;
}

/** Embebe paginas de un documento (prefijo "passage:"), una llamada para todas a la vez. */
async function embederPaginas(textos: string[]): Promise<number[][]> {
  return embeder(textos.map((t) => `passage: ${t.slice(0, MAX_CHARS_POR_PASAJE)}`));
}

/** Los vectores ya salen normalizados (normalize: true), asi que el coseno es solo el
 * producto punto. */
export function similitudCoseno(a: number[], b: number[]): number {
  let producto = 0;
  for (let i = 0; i < a.length; i++) producto += a[i] * b[i];
  return producto;
}

export interface EmbeddingsDocumento {
  documentoId: string;
  modelo: string;
  generadoEn: string;
  /** Un vector por pagina, mismo orden/indices que TextoExtraidoDocumento.paginas. */
  vectores: number[][];
}

function rutaEmbeddingsDocumento(documentoId: string): string {
  return path.join(EMBEDDINGS_DIR, `${documentoId}.json`);
}

export async function leerEmbeddingsDocumento(documentoId: string): Promise<EmbeddingsDocumento | null> {
  try {
    const raw = await fs.readFile(rutaEmbeddingsDocumento(documentoId), "utf8");
    return JSON.parse(raw) as EmbeddingsDocumento;
  } catch {
    return null;
  }
}

export async function borrarEmbeddingsDocumento(documentoId: string): Promise<void> {
  await fs.unlink(rutaEmbeddingsDocumento(documentoId)).catch(() => {});
}

/**
 * Calcula y guarda los vectores de embedding para las paginas ya extraidas de un documento.
 * No lanza excepcion: es una mejora sobre la extraccion de texto, nunca debe tumbar esa
 * operacion principal. Devuelve la fecha de generacion, o null si no aplico o fallo.
 */
export async function generarYGuardarEmbeddings(documentoId: string, paginas: { texto: string }[]): Promise<string | null> {
  if (paginas.length === 0) return null;
  try {
    const vectores = await embederPaginas(paginas.map((p) => p.texto));
    await fs.mkdir(EMBEDDINGS_DIR, { recursive: true });
    const generadoEn = ahora();
    const contenido: EmbeddingsDocumento = { documentoId, modelo: MODELO, generadoEn, vectores };
    await fs.writeFile(rutaEmbeddingsDocumento(documentoId), JSON.stringify(contenido), "utf8");
    return generadoEn;
  } catch (error) {
    console.error(`No se pudieron generar embeddings para el documento ${documentoId}:`, error);
    return null;
  }
}
