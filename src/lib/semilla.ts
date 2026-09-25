import "server-only";
import { ahora, leerDb, escribirDb, nuevoId } from "@/lib/db";
import type {
  Especificacion,
  SoporteConfianza,
  SoporteDocumentoTipo,
  SoporteFuenteTipo,
  SoporteHallazgoTipo,
  SoporteIdioma,
  SoporteProductoEstado,
} from "@/lib/db";

/**
 * Datos iniciales de una marca, escritos en codigo. Se aplican desde el resumen de la marca
 * ("Cargar / actualizar datos iniciales") y son idempotentes: las filas se identifican por
 * clave (slug de marca, nombre de fuente, referencia de producto, claveSemilla de documentos
 * y hallazgos) y se actualizan si ya existen, sin duplicar ni borrar lo agregado a mano.
 */
export interface SemillaMarca {
  slug: string;
  nombre: string;
  descripcion: string;
  fuentes: SemillaFuente[];
  productos: SemillaProducto[];
  compatibilidades: SemillaCompatibilidad[];
  documentos: SemillaDocumento[];
  hallazgos: SemillaHallazgo[];
}

export interface SemillaFuente {
  nombre: string;
  tipo: SoporteFuenteTipo;
  prioridad: number;
  url?: string;
  descripcion?: string;
}

export interface SemillaProducto {
  referencia: string;
  nombre: string;
  familia: string;
  generacion?: string;
  estado?: SoporteProductoEstado;
  descripcion?: string;
  notas?: string;
  especificaciones?: Especificacion[];
  sustituyeA?: string;
  sustituidaPor?: string;
}

export interface SemillaCompatibilidad {
  referencia: string;
  compatibles: string[];
  nota?: string;
}

export interface SemillaDocumento {
  clave: string;
  tipo: SoporteDocumentoTipo;
  titulo: string;
  fuente?: string;
  codigo?: string;
  revision?: string;
  fechaEmision?: string;
  idioma?: SoporteIdioma;
  urlOrigen?: string;
  confianza?: SoporteConfianza;
  notas?: string;
  referencias?: string[];
}

export interface SemillaHallazgo {
  clave: string;
  tipo: SoporteHallazgoTipo;
  titulo: string;
  contenido: string;
  referencia?: string;
}

export interface ResultadoSemilla {
  fuentes: number;
  productos: number;
  compatibilidades: number;
  documentos: number;
  hallazgos: number;
  advertencias: string[];
}

/**
 * Las filas de semilla se marcan con un id determinista para poder reconocerlas en corridas
 * futuras sin depender de una columna extra en el JSON. Se evita el caracter ":" porque
 * rompe el enrutador de paginas dinamicas de Next ("/productos/[id]"): un id con ":" hace
 * que la ruta devuelva 404 aunque el dato exista. Se usa "__" como separador y se codifica
 * cada parte variable por si tiene espacios, parentesis u otros caracteres especiales.
 */
function idSemillaFuente(marcaId: string, nombre: string) {
  return `seed__fuente__${marcaId}__${encodeURIComponent(nombre)}`;
}
function idSemillaProducto(marcaId: string, referencia: string) {
  return `seed__producto__${marcaId}__${encodeURIComponent(referencia)}`;
}
function idSemillaDocumento(clave: string) {
  return `seed__documento__${encodeURIComponent(clave)}`;
}
function idSemillaHallazgo(clave: string) {
  return `seed__hallazgo__${encodeURIComponent(clave)}`;
}

/**
 * Combina las especificaciones ya guardadas de un producto con las que trae la semilla,
 * emparejando por (grupo, nombre). Una especificacion presente solo en lo ya guardado
 * (por ejemplo, un precio cargado por un script de incorporacion aparte) se conserva tal
 * cual; una presente en la semilla reemplaza o agrega su version, en el mismo orden en
 * que aparece en la semilla.
 */
function fusionarEspecificaciones(existentes: Especificacion[] | undefined, deSemilla: Especificacion[]): Especificacion[] {
  const clave = (e: Especificacion) => `${e.grupo}\u0000${e.nombre}`;
  const desdeSemilla = new Set(deSemilla.map(clave));
  const conservadas = (existentes ?? []).filter((e) => !desdeSemilla.has(clave(e)));
  return [...deSemilla, ...conservadas];
}

export async function aplicarSemilla(semilla: SemillaMarca): Promise<ResultadoSemilla> {
  const advertencias: string[] = [];
  const db = await leerDb();
  const now = ahora();

  let marca = db.marcas.find((m) => m.slug === semilla.slug);
  if (!marca) {
    marca = { id: nuevoId(), slug: semilla.slug, nombre: semilla.nombre, descripcion: semilla.descripcion, createdAt: now, updatedAt: now };
    db.marcas.push(marca);
  } else {
    marca.nombre = semilla.nombre;
    marca.descripcion = semilla.descripcion;
    marca.updatedAt = now;
  }
  const marcaId = marca.id;

  const fuentesPorNombre = new Map<string, string>();
  for (const f of semilla.fuentes) {
    const id = idSemillaFuente(marcaId, f.nombre);
    const existente = db.fuentes.find((x) => x.id === id);
    if (existente) {
      existente.tipo = f.tipo;
      existente.prioridad = f.prioridad;
      existente.url = f.url ?? null;
      existente.descripcion = f.descripcion ?? null;
      existente.updatedAt = now;
    } else {
      db.fuentes.push({
        id,
        marcaId,
        nombre: f.nombre,
        tipo: f.tipo,
        prioridad: f.prioridad,
        url: f.url ?? null,
        descripcion: f.descripcion ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }
    fuentesPorNombre.set(f.nombre, id);
  }

  const productosPorReferencia = new Map<string, string>();
  for (const p of semilla.productos) {
    const id = idSemillaProducto(marcaId, p.referencia);
    const existente = db.productos.find((x) => x.id === id);
    const data = {
      nombre: p.nombre,
      familia: p.familia,
      generacion: p.generacion ?? null,
      estado: p.estado ?? ("PENDIENTE" as SoporteProductoEstado),
      descripcion: p.descripcion ?? null,
      notas: p.notas ?? null,
      // Fusiona por (grupo, nombre) en vez de reemplazar el arreglo completo: preserva
      // especificaciones agregadas fuera de la semilla (ej. precios de listas de
      // distribucion cargadas con scripts propios) que la semilla no conoce, mientras
      // sigue permitiendo que la semilla actualice o agregue las suyas.
      especificaciones: fusionarEspecificaciones(existente?.especificaciones, p.especificaciones ?? []),
      sustituyeA: p.sustituyeA ?? null,
      sustituidaPor: p.sustituidaPor ?? null,
    };
    if (existente) {
      Object.assign(existente, data, { updatedAt: now });
    } else {
      db.productos.push({ id, marcaId, referencia: p.referencia, ...data, createdAt: now, updatedAt: now });
    }
    productosPorReferencia.set(p.referencia, id);
  }

  let compatibilidades = 0;
  for (const c of semilla.compatibilidades) {
    const origen = productosPorReferencia.get(c.referencia);
    if (!origen) {
      advertencias.push(`Compatibilidad: referencia ${c.referencia} no existe en la semilla`);
      continue;
    }
    for (const ref of c.compatibles) {
      const destino = productosPorReferencia.get(ref);
      if (!destino) {
        advertencias.push(`Compatibilidad ${c.referencia}: referencia ${ref} no existe en la semilla`);
        continue;
      }
      const existente = db.compatibilidades.find((x) => x.productoId === origen && x.compatibleId === destino);
      if (existente) {
        existente.nota = c.nota ?? null;
      } else {
        db.compatibilidades.push({ id: nuevoId(), productoId: origen, compatibleId: destino, nota: c.nota ?? null });
      }
      compatibilidades++;
    }
  }

  for (const d of semilla.documentos) {
    const id = idSemillaDocumento(d.clave);
    const fuenteId = d.fuente ? (fuentesPorNombre.get(d.fuente) ?? null) : null;
    if (d.fuente && !fuenteId) advertencias.push(`Documento ${d.clave}: fuente "${d.fuente}" no existe en la semilla`);

    const data = {
      fuenteId,
      tipo: d.tipo,
      titulo: d.titulo,
      codigo: d.codigo ?? null,
      revision: d.revision ?? null,
      fechaEmision: d.fechaEmision ?? null,
      idioma: d.idioma ?? ("EN" as SoporteIdioma),
      urlOrigen: d.urlOrigen ?? null,
      confianza: d.confianza ?? ("PENDIENTE" as SoporteConfianza),
      notas: d.notas ?? null,
    };
    const existente = db.documentos.find((x) => x.id === id);
    if (existente) {
      Object.assign(existente, data, { updatedAt: now });
    } else {
      db.documentos.push({ id, marcaId, archivoNombre: null, archivoPath: null, ...data, createdAt: now, updatedAt: now });
    }

    for (const ref of d.referencias ?? []) {
      const productoId = productosPorReferencia.get(ref);
      if (!productoId) {
        advertencias.push(`Documento ${d.clave}: referencia ${ref} no existe en la semilla`);
        continue;
      }
      if (!db.documentoProductos.some((dp) => dp.documentoId === id && dp.productoId === productoId)) {
        db.documentoProductos.push({ documentoId: id, productoId });
      }
    }
  }

  for (const h of semilla.hallazgos) {
    const id = idSemillaHallazgo(h.clave);
    const productoId = h.referencia ? (productosPorReferencia.get(h.referencia) ?? null) : null;
    if (h.referencia && !productoId) advertencias.push(`Hallazgo ${h.clave}: referencia ${h.referencia} no existe en la semilla`);
    const existente = db.hallazgos.find((x) => x.id === id);
    if (existente) {
      existente.productoId = productoId;
      existente.tipo = h.tipo;
      existente.titulo = h.titulo;
      existente.contenido = h.contenido;
      existente.updatedAt = now;
    } else {
      db.hallazgos.push({
        id,
        marcaId,
        productoId,
        tipo: h.tipo,
        estado: "ABIERTO",
        titulo: h.titulo,
        contenido: h.contenido,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await escribirDb(db);

  return {
    fuentes: semilla.fuentes.length,
    productos: semilla.productos.length,
    compatibilidades,
    documentos: semilla.documentos.length,
    hallazgos: semilla.hallazgos.length,
    advertencias,
  };
}
