import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Base de datos local de la herramienta: un unico archivo JSON en disco
 * (data/db.json), sin servidor ni base de datos externa. Pensada para uso
 * personal en un solo computador: cada escritura relee y reescribe el
 * archivo completo, lo cual es mas que suficiente para el volumen de datos
 * de este proyecto (unos pocos miles de filas como mucho).
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
/** Texto extraido de los archivos confirmados, para el ChatBot. Un JSON por documento
 * (paginado), nunca contenido subido directamente por un usuario. */
export const TEXTO_EXTRAIDO_DIR = path.join(DATA_DIR, "uploads-texto");
/** Vectores de embedding (busqueda semantica local) calculados sobre el texto extraido, uno
 * por pagina. Ver src/lib/embeddings.ts. */
export const EMBEDDINGS_DIR = path.join(DATA_DIR, "uploads-embeddings");

export type SoporteFuenteTipo =
  | "FABRICANTE"
  | "CERTIFICADOR"
  | "GRUPO_EMPRESARIAL"
  | "REGULATORIO"
  | "ADUANAS"
  | "DISTRIBUIDOR"
  | "MARKETPLACE"
  | "INTERNO"
  | "OTRO";

export type SoporteProductoEstado = "ACTIVO" | "NUEVO" | "PENDIENTE" | "DESCONTINUADO" | "RENOMBRADO" | "INTERNO";

export type SoporteDocumentoTipo =
  | "DATASHEET"
  | "MANUAL_INSTALACION"
  | "MANUAL_USUARIO"
  | "MANUAL_PROGRAMACION"
  | "DIAGRAMA_CABLEADO"
  | "CATALOGO"
  | "BROCHURE"
  | "GUIA_APLICACION"
  | "CERTIFICADO"
  | "LISTADO_UL"
  | "PRESENTACION"
  | "CASO_ESTUDIO"
  | "VIDEO"
  | "SOFTWARE"
  | "INSTRUCTIVO"
  | "LISTA_PRECIOS"
  | "REGISTRO_EXPORTACION"
  | "OTRO";

export type SoporteIdioma = "EN" | "ES" | "ZH" | "FR" | "OTRO";
export type SoporteConfianza = "CONFIRMADO" | "PROBABLE" | "PENDIENTE";
export type SoporteHallazgoTipo = "REGLA" | "DISCREPANCIA" | "PENDIENTE" | "HALLAZGO";
export type SoporteHallazgoEstado = "ABIERTO" | "RESUELTO";
export type SoportePreguntaPrioridad = "ALTA" | "MEDIA" | "BAJA";
export type SoportePreguntaEstado = "ABIERTA" | "CERRADA";
export type SoportePreguntaAsignado = "SIN_ASIGNAR" | "DISTRIBUIDOR" | "DETNOV" | "MAPLE_ARMOR";

export interface Especificacion {
  grupo: string;
  nombre: string;
  valor: string;
}

export interface Marca {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Fuente {
  id: string;
  marcaId: string;
  nombre: string;
  tipo: SoporteFuenteTipo;
  prioridad: number;
  url: string | null;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Producto {
  id: string;
  marcaId: string;
  referencia: string;
  nombre: string;
  familia: string;
  generacion: string | null;
  estado: SoporteProductoEstado;
  descripcion: string | null;
  notas: string | null;
  especificaciones: Especificacion[];
  sustituyeA: string | null;
  sustituidaPor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Compatibilidad {
  id: string;
  productoId: string;
  compatibleId: string;
  nota: string | null;
}

export interface Documento {
  id: string;
  marcaId: string;
  fuenteId: string | null;
  tipo: SoporteDocumentoTipo;
  titulo: string;
  codigo: string | null;
  revision: string | null;
  fechaEmision: string | null;
  idioma: SoporteIdioma;
  urlOrigen: string | null;
  archivoNombre: string | null;
  archivoPath: string | null;
  confianza: SoporteConfianza;
  notas: string | null;
  /** Fecha en que se extrajo el texto del archivo local para el ChatBot (null = nunca
   * intentado, o no aplica: sin archivo, tipo no soportado, o confianza distinta de
   * CONFIRMADO). Ver src/lib/extraccion-texto.ts. */
  textoExtraidoEn: string | null;
  /** Fecha en que se calcularon los vectores de embedding sobre el texto extraido (null =
   * aun no aplica: requiere textoExtraidoEn). Ver src/lib/embeddings.ts. */
  embeddingsGeneradasEn: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoProducto {
  documentoId: string;
  productoId: string;
}

export interface Hallazgo {
  id: string;
  marcaId: string;
  productoId: string | null;
  tipo: SoporteHallazgoTipo;
  estado: SoporteHallazgoEstado;
  titulo: string;
  contenido: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pregunta {
  id: string;
  marcaId: string;
  prioridad: SoportePreguntaPrioridad;
  asignadoA: SoportePreguntaAsignado;
  titulo: string;
  contenido: string;
  autor: string;
  respondedor: string | null;
  respuesta: string | null;
  estado: SoportePreguntaEstado;
  fechaCierre: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreguntaProducto {
  preguntaId: string;
  productoId: string;
}

export interface PreguntaDocumento {
  preguntaId: string;
  documentoId: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string | null;
  /** "salt:hash" (scrypt). Nunca se envia al cliente; ver queries.ts (getUsuarios lo omite). */
  passwordHash: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contador acumulado de uso de la API de Claude desde el ChatBot. No es el saldo real de la
 * cuenta de Anthropic (eso no tiene endpoint publico, solo se ve en console.anthropic.com):
 * es un conteo propio de preguntas y tokens consumidos dentro de esta herramienta, para tener
 * una idea del consumo. Global (no por marca), se incrementa en cada respuesta exitosa.
 */
export interface UsoChatbot {
  totalPreguntas: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  /** Tokens de entrada facturados a precio reducido por venir de la cache de prompts de
   * Anthropic (catalogo de referencias + metadata de documentos, ver src/lib/chatbot.ts). */
  totalCacheReadTokens: number;
  /** Tokens de entrada facturados con el recargo de "escribir" la cache (la primera vez que
   * se arma, o cuando expira). Se distingue de totalInputTokens para poder ver si la cache
   * realmente se esta reutilizando entre preguntas. */
  totalCacheCreationTokens: number;
  actualizadoEn: string | null;
}

export interface Db {
  marcas: Marca[];
  fuentes: Fuente[];
  productos: Producto[];
  compatibilidades: Compatibilidad[];
  documentos: Documento[];
  documentoProductos: DocumentoProducto[];
  hallazgos: Hallazgo[];
  preguntas: Pregunta[];
  preguntaProductos: PreguntaProducto[];
  preguntaDocumentos: PreguntaDocumento[];
  usuarios: Usuario[];
  usoChatbot: UsoChatbot;
}

function dbVacia(): Db {
  return {
    marcas: [],
    fuentes: [],
    productos: [],
    compatibilidades: [],
    documentos: [],
    documentoProductos: [],
    hallazgos: [],
    preguntas: [],
    preguntaProductos: [],
    preguntaDocumentos: [],
    usuarios: [],
    usoChatbot: { totalPreguntas: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCacheReadTokens: 0, totalCacheCreationTokens: 0, actualizadoEn: null },
  };
}

/**
 * Rellena con arreglos vacios cualquier coleccion que no exista todavia en un
 * data/db.json escrito por una version anterior de la herramienta (migracion
 * hacia adelante sin script aparte). Evita que un campo faltante rompa un
 * .filter/.map/.sort en tiempo de ejecucion (ver el bug de hallazgos sin
 * "estado": la falta de esta normalizacion es la misma clase de error).
 */
function normalizarDb(parcial: Partial<Db>): Db {
  const vacia = dbVacia();
  return {
    marcas: parcial.marcas ?? vacia.marcas,
    fuentes: parcial.fuentes ?? vacia.fuentes,
    productos: parcial.productos ?? vacia.productos,
    compatibilidades: parcial.compatibilidades ?? vacia.compatibilidades,
    documentos: parcial.documentos ?? vacia.documentos,
    documentoProductos: parcial.documentoProductos ?? vacia.documentoProductos,
    hallazgos: parcial.hallazgos ?? vacia.hallazgos,
    preguntas: parcial.preguntas ?? vacia.preguntas,
    preguntaProductos: parcial.preguntaProductos ?? vacia.preguntaProductos,
    preguntaDocumentos: parcial.preguntaDocumentos ?? vacia.preguntaDocumentos,
    usuarios: parcial.usuarios ?? vacia.usuarios,
    // Merge campo a campo (no solo el objeto completo): un db.json escrito antes de agregar
    // totalCacheReadTokens/totalCacheCreationTokens tendria un usoChatbot sin esas llaves, y
    // sumarles encima daria NaN.
    usoChatbot: { ...vacia.usoChatbot, ...parcial.usoChatbot },
  };
}

async function asegurarCarpetas(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TEXTO_EXTRAIDO_DIR, { recursive: true });
  await fs.mkdir(EMBEDDINGS_DIR, { recursive: true });
}

/** Lee el archivo completo. Si no existe todavia, lo crea vacio. */
export async function leerDb(): Promise<Db> {
  await asegurarCarpetas();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return normalizarDb(JSON.parse(raw) as Partial<Db>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const vacia = dbVacia();
      await escribirDb(vacia);
      return vacia;
    }
    throw error;
  }
}

/**
 * Escribe el archivo completo. Simple mutex en memoria para evitar que dos
 * escrituras concurrentes se pisen (suficiente para un solo usuario local).
 */
let colaEscritura: Promise<void> = Promise.resolve();

export async function escribirDb(db: Db): Promise<void> {
  await asegurarCarpetas();
  colaEscritura = colaEscritura.then(async () => {
    const tmp = DB_PATH + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
  });
  await colaEscritura;
}

/** Lee, aplica una mutacion y escribe. Devuelve lo que la mutacion retorne. */
export async function mutarDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const db = await leerDb();
  const resultado = await fn(db);
  await escribirDb(db);
  return resultado;
}

export function nuevoId(): string {
  return randomUUID();
}

export function ahora(): string {
  return new Date().toISOString();
}
