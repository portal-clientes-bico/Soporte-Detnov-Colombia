import type { IdiomaVista, SoportePreguntaEstado, SoportePreguntaPrioridad } from "@/lib/db";

/** Cookie con el idioma elegido momentaneamente en las banderas del encabezado (no es secreta:
 * la lee el servidor y la escribe el navegador). Guarda "<usuarioId>:<idioma>" para que, si
 * otra persona inicia sesion en el mismo navegador, vea su propio idioma por defecto. */
export const COOKIE_IDIOMA = "idioma-vista";

export function valorCookieIdioma(usuarioId: string, idioma: IdiomaVista): string {
  return `${usuarioId}:${idioma}`;
}

/** Idioma en que se le muestra el contenido a la persona: el que eligio en las banderas (si la
 * cookie es suya) o, si no, su idioma por defecto (Usuarios), o español. */
export function idiomaEfectivo(cookie: string | undefined, usuarioId: string, idiomaPorDefecto: IdiomaVista | undefined | null): IdiomaVista {
  const [dueno, idioma] = (cookie ?? "").split(":");
  if (dueno === usuarioId && (IDIOMA_VALUES as string[]).includes(idioma)) return idioma as IdiomaVista;
  return normalizarIdioma(idiomaPorDefecto);
}

export const IDIOMA_VALUES: IdiomaVista[] = ["es", "en", "zh"];

export const IDIOMAS: Record<IdiomaVista, { corto: string; nombre: string }> = {
  es: { corto: "ES", nombre: "Español" },
  en: { corto: "EN", nombre: "English" },
  zh: { corto: "中文", nombre: "中文 (简体)" },
};

export function normalizarIdioma(valor: string | undefined | null): IdiomaVista {
  return valor && (IDIOMA_VALUES as string[]).includes(valor) ? (valor as IdiomaVista) : "es";
}

/** Hay caracteres chinos/japoneses: en vista Español esa pregunta (o su respuesta, p. ej. la
 * que mando un fabricante chino) se traduce automaticamente. */
export function contieneCJK(texto: string | null | undefined): boolean {
  return !!texto && /[㐀-鿿豈-﫿]/.test(texto);
}

/** Textos de la tarjeta de pregunta que cambian con el idioma de vista. Los formularios de
 * edicion se quedan en español: se edita siempre el texto original. */
export const TEXTOS_PREGUNTA: Record<
  IdiomaVista,
  {
    prioridad: string;
    prioridades: Record<SoportePreguntaPrioridad, string>;
    estados: Record<SoportePreguntaEstado, string>;
    pregunto: string;
    cerrada: string;
    asignadoA: string;
    respuestaDe: string;
    traduccionAutomatica: string;
    verOriginal: string;
    verTraduccion: string;
    traduciendo: string;
    traducirAlEspanol: string;
    errorTraduccion: string;
  }
> = {
  es: {
    prioridad: "Prioridad",
    prioridades: { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" },
    estados: { BORRADOR: "Borrador", ABIERTA: "Abierta", CERRADA: "Cerrada" },
    pregunto: "Preguntó",
    cerrada: "Cerrada",
    asignadoA: "Asignado a",
    respuestaDe: "Respuesta de",
    traduccionAutomatica: "Traducción automática",
    verOriginal: "Ver original",
    verTraduccion: "Ver traducción",
    traduciendo: "Traduciendo preguntas...",
    traducirAlEspanol: "Traducir al español",
    errorTraduccion: "No se pudieron traducir algunas preguntas",
  },
  en: {
    prioridad: "Priority",
    prioridades: { ALTA: "High", MEDIA: "Medium", BAJA: "Low" },
    estados: { BORRADOR: "Draft", ABIERTA: "Open", CERRADA: "Closed" },
    pregunto: "Asked by",
    cerrada: "Closed",
    asignadoA: "Assigned to",
    respuestaDe: "Answer by",
    traduccionAutomatica: "Automatic translation",
    verOriginal: "Show original",
    verTraduccion: "Show translation",
    traduciendo: "Translating questions...",
    traducirAlEspanol: "Translate to Spanish",
    errorTraduccion: "Some questions could not be translated",
  },
  zh: {
    prioridad: "优先级",
    prioridades: { ALTA: "高", MEDIA: "中", BAJA: "低" },
    estados: { BORRADOR: "草稿", ABIERTA: "待处理", CERRADA: "已关闭" },
    pregunto: "提问人",
    cerrada: "关闭于",
    asignadoA: "负责人",
    respuestaDe: "回答人",
    traduccionAutomatica: "机器翻译",
    verOriginal: "查看原文",
    verTraduccion: "查看译文",
    traduciendo: "正在翻译问题...",
    traducirAlEspanol: "翻译成西班牙语",
    errorTraduccion: "部分问题无法翻译",
  },
};
