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
  createdAt: string;
  updatedAt: string;
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
  };
}

async function asegurarCarpetas(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
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
