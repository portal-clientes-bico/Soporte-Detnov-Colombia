import { z } from "zod";
import {
  CONFIANZA_VALUES,
  DOCUMENTO_TIPO_VALUES,
  FAMILIA_PRODUCTO_VALUES,
  FUENTE_TIPO_VALUES,
  HALLAZGO_ESTADO_VALUES,
  HALLAZGO_TIPO_VALUES,
  IDIOMA_VALUES,
  PREGUNTA_ASIGNADO_VALUES,
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
  fuenteId: textoOpcional(60),
  urlOrigen: urlOpcional,
  confianza: z.enum(CONFIANZA_VALUES),
  notas: textoOpcional(5000),
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
  productoId: textoOpcional(60),
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
  asignadoA: z.enum(PREGUNTA_ASIGNADO_VALUES),
  titulo: z.string().trim().min(3).max(250),
  contenido: z.string().trim().min(3).max(10000),
  autor: z.string().trim().min(1).max(120),
  respondedor: textoOpcional(120),
  respuesta: textoOpcional(10000),
});

export const preguntaSchema = preguntaCamposSchema.extend({
  marcaId: z.string().min(1),
  productos: z.array(z.string().min(1)).optional(),
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
});

export const usuarioPatchSchema = usuarioSchema.partial();
