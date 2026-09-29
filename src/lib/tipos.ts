import type {
  SoporteConfianza,
  SoporteDocumentoTipo,
  SoporteEstadoTraduccion,
  SoporteFuenteTipo,
  SoporteHallazgoEstado,
  SoporteHallazgoTipo,
  SoporteIdioma,
  SoporteOrganizacion,
  SoportePreguntaEstado,
  SoportePreguntaPrioridad,
  SoporteProductoEstado,
} from "@/lib/db";

export const FAMILIAS_PRODUCTO = {
  PANELES: "Paneles de control",
  ANUNCIADORES: "Anunciadores remotos",
  DETECTORES: "Detectores",
  BASES: "Bases de detector",
  INDICADORES: "Indicadores remotos",
  ESTACIONES_MANUALES: "Estaciones manuales",
  LIBERACION: "Liberacion (releasing)",
  MODULOS: "Modulos direccionables",
  COMPONENTES_INTERNOS: "Componentes internos de panel",
  ARQUITECTURA_PANEL: "Arquitectura modular de panel",
  NOTIFICACION: "Dispositivos de notificacion",
  CONVENCIONAL: "Productos convencionales",
  ASPIRACION: "Deteccion por aspiracion",
  TELEFONIA_EMERGENCIA: "Telefonia de incendio y comunicacion de emergencia",
  ACCESORIOS: "Accesorios y repuestos",
  SIN_CLASIFICAR: "Sin clasificar",
} as const;

export type FamiliaProducto = keyof typeof FAMILIAS_PRODUCTO;
export const FAMILIA_PRODUCTO_VALUES = Object.keys(FAMILIAS_PRODUCTO) as FamiliaProducto[];

export function isFamiliaProducto(value: string): value is FamiliaProducto {
  return value in FAMILIAS_PRODUCTO;
}

export function labelFamilia(familia: string): string {
  return isFamiliaProducto(familia) ? FAMILIAS_PRODUCTO[familia] : familia;
}

/**
 * Titulos de presentacion para el campo "generacion" de un producto, y su orden fijo al
 * agrupar (no alfabetico). El valor guardado en el producto no cambia -- esto solo afecta
 * como se rotula y en que orden aparece.
 */
export const GENERACION_SIN_CLASIFICAR = "Sin Clasificar";

const GENERACION_LABELS: Record<string, string> = {
  "Series 2": "Serie 2",
  "FireWatcher (legacy)": "FireWatcher (Serie 1)",
  China: "Productos mercado Chino",
};

export const GENERACION_ORDEN = ["Series 2", "FireWatcher (legacy)", "China"] as const;

export function labelGeneracion(generacion: string | null): string {
  if (!generacion) return GENERACION_SIN_CLASIFICAR;
  return GENERACION_LABELS[generacion] ?? generacion;
}

export function ordenGeneracion(generacion: string | null): number {
  if (!generacion) return GENERACION_ORDEN.length + 1;
  const i = GENERACION_ORDEN.indexOf(generacion as (typeof GENERACION_ORDEN)[number]);
  return i === -1 ? GENERACION_ORDEN.length : i;
}

export const GRUPOS_ESPECIFICACION = {
  IDENTIFICACION: {
    label: "Identificacion",
    campos: ["fabricante", "familia", "referencia", "variante", "generacion", "estado actual", "fecha primera aparicion", "fecha ultima aparicion"],
  },
  ELECTRICO: {
    label: "Electrico",
    campos: ["tension nominal", "rango de tension", "standby current", "alarm current", "supervision current", "activation current", "corriente maxima", "potencia", "resistencia EOL"],
  },
  COMUNICACION: {
    label: "Comunicacion",
    campos: ["protocolo", "SLC", "address", "cantidad de addresses", "auto-addressing", "velocidad", "aislamiento", "Class A", "Class B"],
  },
  CABLEADO: {
    label: "Cableado",
    campos: ["AWG", "distancia maxima", "polaridad", "terminales", "topologia", "EOL", "shielding"],
  },
  MECANICO: {
    label: "Mecanico",
    campos: ["dimensiones", "peso", "caja", "montaje", "flush/surface", "IP", "NEMA", "temperatura", "humedad"],
  },
  FUNCIONAL: {
    label: "Funcional",
    campos: ["entradas", "salidas", "relay", "supervised output", "dry contact", "LED", "buzzer", "display", "programming", "reset", "diagnostic"],
  },
  COMPATIBILIDAD: {
    label: "Compatibilidad",
    campos: ["panel", "detector", "base", "module", "annunciator", "notification", "software", "programmer"],
  },
  CERTIFICACIONES: {
    label: "Certificaciones",
    campos: ["UL", "ULC", "FM", "FCC", "CSA", "CE", "CCC", "GB", "NFPA references"],
  },
  COMERCIAL: {
    label: "Comercial",
    campos: ["precio de lista", "precio de exportacion", "moneda", "HS code", "peso de embalaje", "dimensiones de embalaje"],
  },
} as const;

export function labelGrupoEspecificacion(grupo: string): string {
  return grupo in GRUPOS_ESPECIFICACION ? GRUPOS_ESPECIFICACION[grupo as keyof typeof GRUPOS_ESPECIFICACION].label : grupo;
}

export interface EspecificacionTexto {
  grupo: string;
  nombre: string;
  valor: string;
}

/**
 * En este proyecto `especificaciones` ya es un `Especificacion[]` tipado (no un JSON crudo
 * como en la version con Prisma), asi que aqui solo se valida la forma por si el archivo
 * data/db.json fue editado a mano.
 */
export function parseEspecificaciones(valor: unknown): EspecificacionTexto[] {
  if (!Array.isArray(valor)) return [];
  const lista: EspecificacionTexto[] = [];
  for (const item of valor) {
    if (!item || typeof item !== "object") continue;
    const { grupo, nombre, valor: v } = item as Record<string, unknown>;
    if (typeof nombre !== "string" || typeof v !== "string") continue;
    lista.push({ grupo: typeof grupo === "string" && grupo ? grupo : "IDENTIFICACION", nombre, valor: v });
  }
  return lista;
}

export function especificacionesATexto(lista: EspecificacionTexto[]): string {
  return lista.map((e) => `${e.grupo} | ${e.nombre} | ${e.valor}`).join("\n");
}

export function textoAEspecificaciones(texto: string): EspecificacionTexto[] {
  const lista: EspecificacionTexto[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    const partes = linea.split("|").map((p) => p.trim());
    if (partes.length < 2 || partes.every((p) => p === "")) continue;
    if (partes.length === 2) {
      lista.push({ grupo: "IDENTIFICACION", nombre: partes[0], valor: partes[1] });
    } else {
      const grupo = partes[0].toUpperCase().replace(/\s+/g, "_");
      lista.push({ grupo: grupo || "IDENTIFICACION", nombre: partes[1], valor: partes.slice(2).join(" | ") });
    }
  }
  return lista.filter((e) => e.nombre && e.valor);
}

export const PRODUCTO_ESTADOS: Record<SoporteProductoEstado, { label: string; descripcion: string }> = {
  ACTIVO: { label: "Activo", descripcion: "Referencia vigente con documentacion primaria confirmada." },
  NUEVO: { label: "Nuevo", descripcion: "Incorporacion reciente a la familia." },
  PENDIENTE: { label: "Pendiente", descripcion: "Identificada pero sin documentacion primaria recuperada." },
  DESCONTINUADO: { label: "Descontinuado", descripcion: "Ya no se fabrica; se conserva por trazabilidad historica." },
  RENOMBRADO: { label: "Renombrado", descripcion: "Sustituida por otra referencia (ver sustituidaPor)." },
  INTERNO: { label: "Componente interno", descripcion: "Parte interna de un equipo, no un dispositivo de campo." },
};

export const PRODUCTO_ESTADO_VALUES = Object.keys(PRODUCTO_ESTADOS) as SoporteProductoEstado[];

export const DOCUMENTO_TIPOS: Record<SoporteDocumentoTipo, string> = {
  DATASHEET: "Datasheet / hoja de datos",
  MANUAL_INSTALACION: "Manual de instalacion",
  MANUAL_USUARIO: "Manual de usuario",
  MANUAL_PROGRAMACION: "Manual de programacion / software",
  DIAGRAMA_CABLEADO: "Diagrama de cableado",
  CATALOGO: "Catalogo",
  BROCHURE: "Brochure",
  GUIA_APLICACION: "Guia de aplicacion / diseno",
  CERTIFICADO: "Certificado",
  LISTADO_UL: "Listado UL / ULC",
  PRESENTACION: "Presentacion",
  CASO_ESTUDIO: "Caso de estudio",
  VIDEO: "Video / webinar",
  SOFTWARE: "Software / firmware",
  INSTRUCTIVO: "Instructivo",
  LISTA_PRECIOS: "Lista de precios",
  REGISTRO_EXPORTACION: "Registro de exportacion / aduana",
  OTRO: "Otro",
};

export const DOCUMENTO_TIPO_VALUES = Object.keys(DOCUMENTO_TIPOS) as SoporteDocumentoTipo[];

export const IDIOMAS: Record<SoporteIdioma, string> = {
  EN: "Ingles",
  ES: "Espanol",
  ZH: "Chino",
  FR: "Frances",
  OTRO: "Otro",
};

export const IDIOMA_VALUES = Object.keys(IDIOMAS) as SoporteIdioma[];

export const CONFIANZAS: Record<SoporteConfianza, { label: string; descripcion: string }> = {
  CONFIRMADO: { label: "Confirmado", descripcion: "Documento recuperado y verificado contra fuente primaria." },
  PROBABLE: { label: "Probable", descripcion: "Existencia confirmada por una fuente pero contenido no verificado." },
  PENDIENTE: { label: "Pendiente", descripcion: "Referenciado en la investigacion; falta recuperar el archivo." },
};

export const CONFIANZA_VALUES = Object.keys(CONFIANZAS) as SoporteConfianza[];

export const ESTADOS_TRADUCCION: Record<SoporteEstadoTraduccion, string> = {
  BORRADOR: "Borrador",
  EN_REVISION: "En Revisión",
  APROBADO: "Aprobado",
};

export const ESTADO_TRADUCCION_VALUES = Object.keys(ESTADOS_TRADUCCION) as SoporteEstadoTraduccion[];

export const FUENTE_TIPOS: Record<SoporteFuenteTipo, string> = {
  FABRICANTE: "Fabricante",
  CERTIFICADOR: "Organismo certificador",
  GRUPO_EMPRESARIAL: "Grupo empresarial / filial",
  REGULATORIO: "Documento regulatorio",
  ADUANAS: "Exportaciones / aduanas",
  DISTRIBUIDOR: "Distribuidor",
  MARKETPLACE: "Marketplace / fabricante secundario",
  INTERNO: "Investigacion interna",
  OTRO: "Otro",
};

export const FUENTE_TIPO_VALUES = Object.keys(FUENTE_TIPOS) as SoporteFuenteTipo[];

export const HALLAZGO_TIPOS: Record<SoporteHallazgoTipo, { label: string; descripcion: string }> = {
  REGLA: { label: "Regla de trabajo", descripcion: "Criterio que debe respetarse al alimentar la base." },
  DISCREPANCIA: { label: "Discrepancia", descripcion: "Dos fuentes dicen cosas distintas; se conservan ambas hasta resolver." },
  PENDIENTE: { label: "Pendiente de investigacion", descripcion: "Informacion que falta recuperar o confirmar." },
  HALLAZGO: { label: "Hallazgo / aprendizaje", descripcion: "Conocimiento confirmado util para soporte y capacitacion." },
};

export const HALLAZGO_TIPO_VALUES = Object.keys(HALLAZGO_TIPOS) as SoporteHallazgoTipo[];

export const HALLAZGO_ESTADOS: Record<SoporteHallazgoEstado, string> = {
  ABIERTO: "Abierto",
  RESUELTO: "Resuelto",
};

export const HALLAZGO_ESTADO_VALUES = Object.keys(HALLAZGO_ESTADOS) as SoporteHallazgoEstado[];

export const PREGUNTA_PRIORIDADES: Record<SoportePreguntaPrioridad, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

export const PREGUNTA_PRIORIDAD_VALUES = Object.keys(PREGUNTA_PRIORIDADES) as SoportePreguntaPrioridad[];

export const PREGUNTA_ESTADOS: Record<SoportePreguntaEstado, string> = {
  ABIERTA: "Abierta",
  CERRADA: "Cerrada",
};

export const PREGUNTA_ESTADO_VALUES = Object.keys(PREGUNTA_ESTADOS) as SoportePreguntaEstado[];

export const ORGANIZACIONES: Record<SoporteOrganizacion, string> = {
  DISTRIBUIDOR: "Distribuidor",
  MAPLE_ARMOR: "Maple Armor",
  DETNOV: "Detnov",
};

export const ORGANIZACION_VALUES = Object.keys(ORGANIZACIONES) as SoporteOrganizacion[];

/** Tipos de archivo aceptados al subir un documento. */
export const ARCHIVO_TIPOS_PERMITIDOS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/zip": "ZIP",
  "text/plain": "TXT",
};

export const ARCHIVO_MAX_BYTES = 50 * 1024 * 1024;

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
