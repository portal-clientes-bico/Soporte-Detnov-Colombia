import { z } from "zod";
import type { SoporteEstadoTraduccion, SoporteOrganizacion } from "@/lib/db";
import {
  CONFIANZA_VALUES,
  DOCUMENTO_TIPO_VALUES,
  ESTADO_TRADUCCION_VALUES,
  FAMILIA_PRODUCTO_VALUES,
  FUENTE_TIPO_VALUES,
  HALLAZGO_ESTADO_VALUES,
  HALLAZGO_TIPO_VALUES,
  IDIOMA_VALUES,
  ORGANIZACION_VALUES,
  PREGUNTA_ESTADO_VALUES,
  PREGUNTA_PRIORIDAD_VALUES,
  PRODUCTO_ESTADO_VALUES,
} from "@/lib/tipos";

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const urlOpcional = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "La URL debe empezar por http:// o https://");

const emailOpcional = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalido");

const organizacionOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v): v is SoporteOrganizacion | null => v === null || (ORGANIZACION_VALUES as string[]).includes(v), "Organizacion invalida");

const estadoTraduccionOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v): v is SoporteEstadoTraduccion | null => v === null || (ESTADO_TRADUCCION_VALUES as string[]).includes(v), "Estado de traduccion invalido");

export const marcaSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  descripcion: textoOpcional(2000),
});

export const productoSchema = z.object({
  marcaId: z.string().min(1),
  referencia: z.string().trim().min(1).max(60),
  nombre: z.string().trim().min(2).max(200),
  familia: z.enum(FAMILIA_PRODUCTO_VALUES),
  generacion: textoOpcional(60),
  estado: z.enum(PRODUCTO_ESTADO_VALUES),
  descripcion: textoOpcional(2000),
  notas: textoOpcional(5000),
  especificacionesTexto: z.string().max(20000).optional(),
  sustituyeA: textoOpcional(60),
  sustituidaPor: textoOpcional(60),
});

export const productoPatchSchema = productoSchema.omit({ marcaId: true }).partial();

export const compatibilidadSchema = z.object({
  compatibleId: z.string().min(1),
  nota: textoOpcional(500),
});

export const documentoCamposSchema = z.object({
  tipo: z.enum(DOCUMENTO_TIPO_VALUES),
  titulo: z.string().trim().min(3).max(250),
  codigo: textoOpcional(60),
  revision: textoOpcional(60),
  fechaEmision: textoOpcional(30),
  idioma: z.enum(IDIOMA_VALUES),
  fuenteId: textoOpcional(200),
  urlOrigen: urlOpcional,
  confianza: z.enum(CONFIANZA_VALUES),
  notas: textoOpcional(5000),
  /** Id del Documento (en ingles, normalmente) del que este es traduccion. Ver modulo
   * Traducciones -- traducciones-manager.tsx. */
  traduccionDeId: textoOpcional(200),
  estadoTraduccion: estadoTraduccionOpcional,
});

export const fuenteSchema = z.object({
  marcaId: z.string().min(1),
  nombre: z.string().trim().min(2).max(120),
  tipo: z.enum(FUENTE_TIPO_VALUES),
  prioridad: z.coerce.number().int().min(1).max(99),
  url: urlOpcional,
  descripcion: textoOpcional(2000),
});

export const fuentePatchSchema = fuenteSchema.omit({ marcaId: true }).partial();

export const hallazgoSchema = z.object({
  marcaId: z.string().min(1),
  productoId: textoOpcional(200),
  tipo: z.enum(HALLAZGO_TIPO_VALUES),
  estado: z.enum(HALLAZGO_ESTADO_VALUES).optional(),
  titulo: z.string().trim().min(3).max(200),
  contenido: z.string().trim().min(3).max(10000),
});

export const hallazgoPatchSchema = hallazgoSchema.omit({ marcaId: true }).partial();

/**
 * Base sin marcaId/productos/estado. Los campos "textoOpcional" combinan
 * .optional() con .transform(), asi que un PATCH que solo cambia un campo
 * (ej. {estado: "CERRADA"}) NO debe validarse contra este objeto directo:
 * ZodEffects siempre corre su transform incluso si la clave vino ausente,
 * lo que convertiria "ausente" en null y borraria el campo al hacer
 * Object.assign. Por eso preguntaPatchSchema se deriva con .partial(),
 * que envuelve cada campo en un ZodOptional adicional y sí corta en corto
 * antes de tocar el transform (mismo patron que documentoPatchSchema y
 * hallazgoPatchSchema).
 */
export const preguntaCamposSchema = z.object({
  prioridad: z.enum(PREGUNTA_PRIORIDAD_VALUES),
  /** Usuario a cargo de la pregunta; la Organizacion se consulta a partir de este usuario
   * (ver getPreguntasDeMarca), ya no se guarda en la pregunta. */
  asignadoAUsuarioId: textoOpcional(60),
  titulo: z.string().trim().min(3).max(250),
  contenido: z.string().trim().min(3).max(10000),
  autor: z.string().trim().min(1).max(120),
  respondedor: textoOpcional(120),
  respuesta: textoOpcional(10000),
});

export const preguntaSchema = preguntaCamposSchema.extend({
  marcaId: z.string().min(1),
  productos: z.array(z.string().min(1)).optional(),
  documentos: z.array(z.string().min(1)).optional(),
});

export const preguntaPatchSchema = preguntaCamposSchema.partial().extend({
  estado: z.enum(PREGUNTA_ESTADO_VALUES).optional(),
});

export const preguntaArchivoCamposSchema = z.object({
  tipo: z.enum(DOCUMENTO_TIPO_VALUES),
  titulo: z.string().trim().min(3).max(250),
  notas: textoOpcional(2000),
});

export const usuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: emailOpcional,
  organizacion: organizacionOpcional,
});

export const usuarioPatchSchema = usuarioSchema.partial();

const emailRequerido = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalido");

/** Crear usuario con acceso: requiere email (es el identificador de inicio de sesion) y contrasena. */
export const usuarioConPasswordSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: emailRequerido,
  password: z.string().min(4).max(200),
  organizacion: organizacionOpcional,
});

/** Establecer o cambiar la contrasena de un usuario existente (accion separada del PATCH normal). */
export const usuarioPasswordSchema = z.object({
  password: z.string().min(4).max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
});

export const chatbotPreguntaSchema = z.object({
  pregunta: z.string().trim().min(3).max(2000),
});
