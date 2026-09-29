import "server-only";
import { leerDb } from "@/lib/db";
import { leerTextoDocumento } from "@/lib/extraccion-texto";
import { leerEmbeddingsDocumento } from "@/lib/embeddings";
import type {
  Compatibilidad,
  Documento,
  Fuente,
  Hallazgo,
  Marca,
  Producto,
  SoporteConfianza,
  SoporteDocumentoTipo,
  SoporteHallazgoEstado,
  SoporteHallazgoTipo,
  SoporteIdioma,
  SoportePreguntaEstado,
  SoportePreguntaPrioridad,
  SoporteProductoEstado,
} from "@/lib/db";

export interface MarcaResumen extends Marca {
  productos: number;
  documentos: number;
  fuentes: number;
  hallazgosAbiertos: number;
  preguntasAbiertas: number;
}

export async function getMarcas(): Promise<MarcaResumen[]> {
  const db = await leerDb();
  return db.marcas
    .map((m) => ({
      ...m,
      productos: db.productos.filter((p) => p.marcaId === m.id).length,
      documentos: db.documentos.filter((d) => d.marcaId === m.id).length,
      fuentes: db.fuentes.filter((f) => f.marcaId === m.id).length,
      hallazgosAbiertos: db.hallazgos.filter((h) => h.marcaId === m.id && h.estado === "ABIERTO").length,
      preguntasAbiertas: db.preguntas.filter((p) => p.marcaId === m.id && p.estado === "ABIERTA").length,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getMarcaPorSlug(slug: string): Promise<Marca | null> {
  const db = await leerDb();
  return db.marcas.find((m) => m.slug === slug) ?? null;
}

export interface FiltroProductos {
  q?: string;
  familia?: string;
  estado?: SoporteProductoEstado;
  generacion?: string;
}

export interface ProductoConConteo extends Producto {
  _count: { documentos: number; hallazgos: number; preguntas: number };
  precioListaBico: string | null;
  /** true si el producto esta vinculado a algun documento tipo LISTADO_UL (expediente de UL
   * Product iQ) -- ver columna "UL" en la tabla de productos. */
  ulListado: boolean;
  /** true si el producto esta vinculado a algun documento tipo CERTIFICADO cuya fuente es FM
   * Approvals (Approval Guide) -- ver columna "FM" en la tabla de productos. */
  fmAprobado: boolean;
}

const NOMBRE_ESPEC_PRECIO_BICO = "Precio distribucion BICO";

export async function getProductosDeMarca(marcaId: string, filtro: FiltroProductos = {}): Promise<ProductoConConteo[]> {
  const db = await leerDb();
  const q = filtro.q?.trim().toLowerCase();
  const docIdsListadoUL = new Set(db.documentos.filter((d) => d.marcaId === marcaId && d.tipo === "LISTADO_UL").map((d) => d.id));
  const fuenteIdsFM = new Set(db.fuentes.filter((f) => f.marcaId === marcaId && /FM Approvals/i.test(f.nombre)).map((f) => f.id));
  const docIdsFM = new Set(db.documentos.filter((d) => d.marcaId === marcaId && d.tipo === "CERTIFICADO" && d.fuenteId && fuenteIdsFM.has(d.fuenteId)).map((d) => d.id));
  return db.productos
    .filter((p) => p.marcaId === marcaId)
    .filter((p) => !filtro.familia || p.familia === filtro.familia)
    .filter((p) => !filtro.estado || p.estado === filtro.estado)
    .filter((p) => !filtro.generacion || p.generacion === filtro.generacion)
    .filter(
      (p) =>
        !q ||
        p.referencia.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion ?? "").toLowerCase().includes(q),
    )
    .map((p) => ({
      ...p,
      precioListaBico: p.especificaciones.find((e) => e.grupo === "COMERCIAL" && e.nombre === NOMBRE_ESPEC_PRECIO_BICO)?.valor.split(" · ")[0] ?? null,
      ulListado: db.documentoProductos.some((dp) => dp.productoId === p.id && docIdsListadoUL.has(dp.documentoId)),
      fmAprobado: db.documentoProductos.some((dp) => dp.productoId === p.id && docIdsFM.has(dp.documentoId)),
      _count: {
        documentos: db.documentoProductos.filter((dp) => dp.productoId === p.id).length,
        hallazgos: db.hallazgos.filter((h) => h.productoId === p.id).length,
        preguntas: db.preguntaProductos.filter((pp) => pp.productoId === p.id).length,
      },
    }))
    .sort((a, b) => a.familia.localeCompare(b.familia) || a.referencia.localeCompare(b.referencia));
}

export async function getResumenProductos(marcaId: string) {
  const db = await leerDb();
  const productos = db.productos.filter((p) => p.marcaId === marcaId);

  const porFamilia = new Map<string, number>();
  const porEstado = new Map<string, number>();
  const generaciones = new Set<string>();

  for (const p of productos) {
    porFamilia.set(p.familia, (porFamilia.get(p.familia) ?? 0) + 1);
    porEstado.set(p.estado, (porEstado.get(p.estado) ?? 0) + 1);
    if (p.generacion) generaciones.add(p.generacion);
  }

  return {
    porFamilia: [...porFamilia.entries()].map(([familia, total]) => ({ familia, total })),
    porEstado: [...porEstado.entries()].map(([estado, total]) => ({ estado, total })),
    generaciones: [...generaciones].sort(),
  };
}

export async function getProductoDetalle(marcaId: string, id: string) {
  const db = await leerDb();
  const producto = db.productos.find((p) => p.id === id && p.marcaId === marcaId);
  if (!producto) return null;

  const documentos = db.documentoProductos
    .filter((dp) => dp.productoId === id)
    .map((dp) => {
      const documento = db.documentos.find((d) => d.id === dp.documentoId);
      if (!documento) return null;
      const fuente = documento.fuenteId ? (db.fuentes.find((f) => f.id === documento.fuenteId) ?? null) : null;
      return { documento: { ...documento, fuente } };
    })
    .filter((x): x is { documento: Documento & { fuente: Fuente | null } } => x !== null)
    .sort((a, b) => a.documento.createdAt.localeCompare(b.documento.createdAt));

  const compatiblesMap = new Map<
    string,
    { id: string; referencia: string; nombre: string; familia: string; nota: string | null; compatibilidadId: string }
  >();
  for (const c of db.compatibilidades) {
    if (c.productoId === id) {
      const compatible = db.productos.find((p) => p.id === c.compatibleId);
      if (compatible) {
        compatiblesMap.set(compatible.id, {
          id: compatible.id,
          referencia: compatible.referencia,
          nombre: compatible.nombre,
          familia: compatible.familia,
          nota: c.nota,
          compatibilidadId: c.id,
        });
      }
    }
    if (c.compatibleId === id) {
      const origen = db.productos.find((p) => p.id === c.productoId);
      if (origen && !compatiblesMap.has(origen.id)) {
        compatiblesMap.set(origen.id, {
          id: origen.id,
          referencia: origen.referencia,
          nombre: origen.nombre,
          familia: origen.familia,
          nota: c.nota,
          compatibilidadId: c.id,
        });
      }
    }
  }

  const hallazgos = db.hallazgos
    .filter((h) => h.productoId === id)
    .sort((a, b) => (a.estado === b.estado ? b.createdAt.localeCompare(a.createdAt) : a.estado.localeCompare(b.estado)));

  const ordenPrioridad: Record<string, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };
  const preguntas = db.preguntaProductos
    .filter((pp) => pp.productoId === id)
    .map((pp) => db.preguntas.find((p) => p.id === pp.preguntaId))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .sort(
      (a, b) =>
        (a.estado === "ABIERTA" ? 0 : 1) - (b.estado === "ABIERTA" ? 0 : 1) ||
        (ordenPrioridad[a.prioridad] ?? 9) - (ordenPrioridad[b.prioridad] ?? 9) ||
        b.createdAt.localeCompare(a.createdAt),
    );

  return {
    ...producto,
    documentos,
    compatibles: [...compatiblesMap.values()].sort((a, b) => a.referencia.localeCompare(b.referencia)),
    hallazgos,
    preguntas,
  };
}

export interface FiltroDocumentos {
  q?: string;
  tipo?: SoporteDocumentoTipo;
  idioma?: SoporteIdioma;
  confianza?: SoporteConfianza;
  fuenteId?: string;
}

export interface DocumentoConProductos extends Documento {
  fuente: Fuente | null;
  productos: { producto: Producto }[];
}

export async function getDocumentosDeMarca(marcaId: string, filtro: FiltroDocumentos = {}): Promise<DocumentoConProductos[]> {
  const db = await leerDb();
  const q = filtro.q?.trim().toLowerCase();

  return db.documentos
    .filter((d) => d.marcaId === marcaId)
    .filter((d) => !filtro.tipo || d.tipo === filtro.tipo)
    .filter((d) => !filtro.idioma || d.idioma === filtro.idioma)
    .filter((d) => !filtro.confianza || d.confianza === filtro.confianza)
    .filter((d) => !filtro.fuenteId || d.fuenteId === filtro.fuenteId)
    .map((d) => {
      const fuente = d.fuenteId ? (db.fuentes.find((f) => f.id === d.fuenteId) ?? null) : null;
      const productos = db.documentoProductos
        .filter((dp) => dp.documentoId === d.id)
        .map((dp) => db.productos.find((p) => p.id === dp.productoId))
        .filter((p): p is Producto => !!p)
        .map((producto) => ({ producto }));
      return { ...d, fuente, productos };
    })
    .filter(
      (d) =>
        !q ||
        d.titulo.toLowerCase().includes(q) ||
        (d.codigo ?? "").toLowerCase().includes(q) ||
        (d.notas ?? "").toLowerCase().includes(q) ||
        d.productos.some((p) => p.producto.referencia.toLowerCase().includes(q)),
    )
    .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.titulo.localeCompare(b.titulo));
}

/** Cada documento en ingles de la marca junto con sus traducciones (normalmente 0 o 1, pero no
 * se impide tener varias -- ej. una traduccion vieja sin borrar y una nueva). Base del modulo
 * Traducciones: separar los que ya tienen traducciones.length > 0 de los que no. */
export async function getTraduccionesDeMarca(marcaId: string) {
  const db = await leerDb();
  const originales = db.documentos.filter((d) => d.marcaId === marcaId && d.idioma === "EN");
  return originales
    .map((original) => ({
      original,
      traducciones: db.documentos
        .filter((d) => d.traduccionDeId === original.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
    .sort((a, b) => a.original.tipo.localeCompare(b.original.tipo) || a.original.titulo.localeCompare(b.original.titulo));
}

export async function getFuentesDeMarca(marcaId: string) {
  const db = await leerDb();
  return db.fuentes
    .filter((f) => f.marcaId === marcaId)
    .map((f) => ({ ...f, _count: { documentos: db.documentos.filter((d) => d.fuenteId === f.id).length } }))
    .sort((a, b) => a.prioridad - b.prioridad || a.nombre.localeCompare(b.nombre));
}

export interface FiltroHallazgos {
  tipo?: SoporteHallazgoTipo;
  estado?: SoporteHallazgoEstado;
}

export async function getHallazgosDeMarca(marcaId: string, filtro: FiltroHallazgos = {}) {
  const db = await leerDb();
  return db.hallazgos
    .filter((h) => h.marcaId === marcaId)
    .filter((h) => !filtro.tipo || h.tipo === filtro.tipo)
    .filter((h) => !filtro.estado || h.estado === filtro.estado)
    .map((h) => ({ ...h, producto: h.productoId ? (db.productos.find((p) => p.id === h.productoId) ?? null) : null }))
    .sort(
      (a, b) =>
        (a.estado ?? "").localeCompare(b.estado ?? "") || (a.tipo ?? "").localeCompare(b.tipo ?? "") || (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
    );
}

export interface FiltroPreguntas {
  prioridad?: SoportePreguntaPrioridad;
  estado?: SoportePreguntaEstado;
  asignadoAUsuarioId?: string;
}

const ORDEN_PRIORIDAD: Record<string, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };
const ORDEN_ESTADO_PREGUNTA: Record<string, number> = { ABIERTA: 0, CERRADA: 1 };

export async function getPreguntasDeMarca(marcaId: string, filtro: FiltroPreguntas = {}) {
  const db = await leerDb();
  return db.preguntas
    .filter((p) => p.marcaId === marcaId)
    .filter((p) => !filtro.prioridad || p.prioridad === filtro.prioridad)
    .filter((p) => !filtro.estado || p.estado === filtro.estado)
    .filter((p) => !filtro.asignadoAUsuarioId || p.asignadoAUsuarioId === filtro.asignadoAUsuarioId)
    .map((p) => {
      const productos = db.preguntaProductos
        .filter((pp) => pp.preguntaId === p.id)
        .map((pp) => db.productos.find((x) => x.id === pp.productoId))
        .filter((x): x is Producto => !!x)
        .sort((a, b) => a.referencia.localeCompare(b.referencia));
      const archivos = db.preguntaDocumentos
        .filter((pd) => pd.preguntaId === p.id)
        .map((pd) => db.documentos.find((x) => x.id === pd.documentoId))
        .filter((x): x is Documento => !!x)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      // La Organizacion ya no se guarda en la pregunta: se consulta a partir del usuario
      // asignado (ver Usuario.organizacion en db.ts).
      const asignado = p.asignadoAUsuarioId ? (db.usuarios.find((u) => u.id === p.asignadoAUsuarioId) ?? null) : null;
      return { ...p, productos, archivos, asignadoNombre: asignado?.nombre ?? null, organizacion: asignado?.organizacion ?? null };
    })
    .sort(
      (a, b) =>
        (ORDEN_ESTADO_PREGUNTA[a.estado] ?? 9) - (ORDEN_ESTADO_PREGUNTA[b.estado] ?? 9) ||
        (ORDEN_PRIORIDAD[a.prioridad] ?? 9) - (ORDEN_PRIORIDAD[b.prioridad] ?? 9) ||
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
}

export async function getReferenciasDeMarca(marcaId: string) {
  const db = await leerDb();
  return db.productos
    .filter((p) => p.marcaId === marcaId)
    .map((p) => ({ id: p.id, referencia: p.referencia, nombre: p.nombre, familia: p.familia, descripcion: p.descripcion }))
    .sort((a, b) => a.referencia.localeCompare(b.referencia));
}

/** Usuarios de la herramienta (no estan asociados a una marca): se usan para identificar
 * quien pregunta / quien responde en el modulo de Preguntas. El hash de contrasena nunca
 * se expone al cliente -- solo se informa si el usuario tiene una contrasena configurada. */
export async function getUsuarios() {
  const db = await leerDb();
  return db.usuarios
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map(({ passwordHash, ...u }) => ({ ...u, tienePassword: !!passwordHash }));
}

/**
 * Reune el conocimiento con el que el ChatBot puede fundamentar una respuesta: productos
 * de la marca, documentos con confianza CONFIRMADO (nunca PROBABLE/PENDIENTE, que son
 * pistas sin verificar) y preguntas de soporte ya cerradas con respuesta (el conocimiento
 * "resuelto" del equipo). Para los documentos que ya tienen texto extraido (ver
 * src/lib/extraccion-texto.ts, hoy solo PDF) se incluye tambien ese texto por pagina, para
 * que el filtro de relevancia del ChatBot pueda buscar dentro del contenido real del
 * archivo y no solo en la metadata (titulo, notas, etc).
 */
export async function getContextoChatbot(marcaId: string) {
  const db = await leerDb();

  const productos = db.productos
    .filter((p) => p.marcaId === marcaId)
    .map((p) => ({
      referencia: p.referencia,
      nombre: p.nombre,
      familia: p.familia,
      estado: p.estado,
      descripcion: p.descripcion,
      notas: p.notas,
      especificaciones: p.especificaciones,
    }));

  const documentosConfirmados = await Promise.all(
    db.documentos
      .filter((d) => d.marcaId === marcaId && d.confianza === "CONFIRMADO")
      .map(async (d) => {
        const fuente = d.fuenteId ? (db.fuentes.find((f) => f.id === d.fuenteId) ?? null) : null;
        const referencias = db.documentoProductos
          .filter((dp) => dp.documentoId === d.id)
          .map((dp) => db.productos.find((p) => p.id === dp.productoId)?.referencia)
          .filter((r): r is string => !!r);
        const extraido = d.textoExtraidoEn ? await leerTextoDocumento(d.id) : null;
        const embeddings = d.embeddingsGeneradasEn ? await leerEmbeddingsDocumento(d.id) : null;
        return {
          titulo: d.titulo,
          tipo: d.tipo,
          codigo: d.codigo,
          revision: d.revision,
          fechaEmision: d.fechaEmision,
          idioma: d.idioma,
          notas: d.notas,
          fuente: fuente?.nombre ?? null,
          referencias,
          paginas: extraido?.paginas ?? null,
          // Vectores de embedding por pagina (busqueda semantica local), mismo orden/indices
          // que "paginas". null si el documento aun no los tiene (ver src/lib/embeddings.ts).
          vectoresPaginas: embeddings?.vectores ?? null,
        };
      }),
  );

  const preguntasCerradas = db.preguntas
    .filter((p) => p.marcaId === marcaId && p.estado === "CERRADA" && p.respuesta)
    .map((p) => {
      const referencias = db.preguntaProductos
        .filter((pp) => pp.preguntaId === p.id)
        .map((pp) => db.productos.find((x) => x.id === pp.productoId)?.referencia)
        .filter((r): r is string => !!r);
      return {
        titulo: p.titulo,
        contenido: p.contenido,
        respuesta: p.respuesta as string,
        respondedor: p.respondedor,
        referencias,
      };
    });

  // Hallazgos declarados como "Hallazgo / aprendizaje" (ver HALLAZGO_TIPOS en tipos.ts):
  // conocimiento confirmado util para soporte/capacitacion, a diferencia de REGLA (criterio
  // interno de mantenimiento de la base), DISCREPANCIA o PENDIENTE. El estado ABIERTO/RESUELTO
  // de un hallazgo es seguimiento de trabajo, no confiabilidad -- no se filtra por eso.
  const aprendizajes = db.hallazgos
    .filter((h) => h.marcaId === marcaId && h.tipo === "HALLAZGO")
    .map((h) => ({
      titulo: h.titulo,
      contenido: h.contenido,
      referencia: h.productoId ? (db.productos.find((p) => p.id === h.productoId)?.referencia ?? null) : null,
    }));

  return { productos, documentosConfirmados, preguntasCerradas, aprendizajes };
}

/** Contador acumulado de uso de la API del ChatBot (ver db.ts: UsoChatbot). */
export async function getUsoChatbot() {
  const db = await leerDb();
  return db.usoChatbot;
}

/** Historial de preguntas y respuestas del ChatBot para una marca, de la mas antigua a la mas
 * reciente (mismo orden en que se muestran en la pantalla). limite acota cuantas se traen (las
 * mas recientes) para no cargar toda la historia si ya es larga -- se sigue guardando completa. */
export async function getHistorialChatbot(marcaId: string, limite = 50) {
  const db = await leerDb();
  return db.historialChatbot
    .filter((c) => c.marcaId === marcaId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-limite);
}

export type { Compatibilidad };
