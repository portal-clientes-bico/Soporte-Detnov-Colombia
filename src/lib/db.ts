import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Pool } from "pg";

/**
 * Base de datos de la herramienta: un unico objeto JSON (el mismo `Db` de
 * siempre) que segun el entorno vive en disco (data/db.json, uso local en un
 * solo computador) o en una fila de Postgres (columna jsonb, despliegue en
 * Vercel). El modo se elige solo con la presencia de POSTGRES_URL -- ningun
 * otro archivo del proyecto (queries.ts, schemas.ts, las rutas de API) sabe
 * ni le importa cual de los dos esta activo, porque ambos exponen la misma
 * API (leerDb/escribirDb/mutarDb) sobre el mismo objeto Db en memoria.
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
/** Organizacion a la que pertenece un usuario. La "Organizacion" de una pregunta ya no se
 * elige a mano: se consulta a partir del usuario asignado (ver Pregunta.asignadoAUsuarioId
 * y getPreguntasDeMarca en queries.ts). */
export type SoporteOrganizacion = "DISTRIBUIDOR" | "MAPLE_ARMOR" | "DETNOV";

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
  /** Usuario a cargo de la pregunta (id de Usuario). La "Organizacion" que se muestra en la
   * UI ya no se guarda aqui: se consulta desde este usuario (ver getPreguntasDeMarca). */
  asignadoAUsuarioId: string | null;
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
  organizacion: SoporteOrganizacion | null;
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

/** Una pregunta y su respuesta guardadas del ChatBot, para poder revisar el historial de
 * consultas mas tarde (antes solo vivia en memoria del navegador, se perdia al recargar la
 * pagina). Por marca, a diferencia de UsoChatbot que es global. */
export interface ConsultaChatbot {
  id: string;
  marcaId: string;
  pregunta: string;
  /** Texto completo tal como lo devolvio el modelo, incluida la seccion final de fuentes. */
  respuesta: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  createdAt: string;
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
  historialChatbot: ConsultaChatbot[];
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
    historialChatbot: [],
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
    historialChatbot: parcial.historialChatbot ?? vacia.historialChatbot,
  };
}

async function asegurarCarpetas(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TEXTO_EXTRAIDO_DIR, { recursive: true });
  await fs.mkdir(EMBEDDINGS_DIR, { recursive: true });
}

const USAR_POSTGRES = !!process.env.POSTGRES_URL;

let pool: Pool | null = null;
function obtenerPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  return pool;
}

async function asegurarTablaPostgres(): Promise<void> {
  await obtenerPool().query(
    `create table if not exists soporte_db (id smallint primary key, datos jsonb not null, actualizado_en timestamptz not null default now())`,
  );
}

/** Lee la fila unica. Si no existe todavia, la crea vacia. */
export async function leerDb(): Promise<Db> {
  if (USAR_POSTGRES) {
    await asegurarTablaPostgres();
    const { rows } = await obtenerPool().query<{ datos: Partial<Db> }>("select datos from soporte_db where id = 1");
    if (rows.length === 0) {
      const vacia = dbVacia();
      await escribirDb(vacia);
      return vacia;
    }
    return normalizarDb(rows[0].datos);
  }

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
 * Escribe la fila/archivo completo. En modo disco, un simple mutex en
 * memoria evita que dos escrituras concurrentes se pisen (suficiente para un
 * solo usuario local). En modo Postgres esto no aplica -- usar mutarDb, que
 * toma un lock de fila real valido entre invocaciones serverless distintas.
 */
let colaEscritura: Promise<void> = Promise.resolve();

export async function escribirDb(db: Db): Promise<void> {
  if (USAR_POSTGRES) {
    await asegurarTablaPostgres();
    await obtenerPool().query(
      `insert into soporte_db (id, datos, actualizado_en) values (1, $1, now())
       on conflict (id) do update set datos = $1, actualizado_en = now()`,
      [JSON.stringify(db)],
    );
    return;
  }

  await asegurarCarpetas();
  colaEscritura = colaEscritura.then(async () => {
    const tmp = DB_PATH + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
  });
  await colaEscritura;
}

/**
 * Lee, aplica una mutacion y escribe. Devuelve lo que la mutacion retorne.
 * En modo Postgres, todo ocurre dentro de una transaccion con "select ... for
 * update": el lock de fila bloquea a cualquier otra invocacion que tambien
 * quiera mutar hasta que esta termine, evitando que dos escrituras
 * concurrentes (llamadas serverless distintas, sin memoria compartida) se
 * pisen -- el rol que jugaba colaEscritura en modo disco.
 */
export async function mutarDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  if (USAR_POSTGRES) {
    await asegurarTablaPostgres();
    const cliente = await obtenerPool().connect();
    try {
      await cliente.query("begin");
      const { rows } = await cliente.query<{ datos: Partial<Db> }>("select datos from soporte_db where id = 1 for update");
      const db = rows.length > 0 ? normalizarDb(rows[0].datos) : dbVacia();
      const resultado = await fn(db);
      await cliente.query(
        `insert into soporte_db (id, datos, actualizado_en) values (1, $1, now())
         on conflict (id) do update set datos = $1, actualizado_en = now()`,
        [JSON.stringify(db)],
      );
      await cliente.query("commit");
      return resultado;
    } catch (error) {
      await cliente.query("rollback").catch(() => {});
      throw error;
    } finally {
      cliente.release();
    }
  }

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
