import "server-only";
import type { getContextoChatbot } from "@/lib/queries";
import { labelFamilia } from "@/lib/tipos";

type Contexto = Awaited<ReturnType<typeof getContextoChatbot>>;
type ProductoCtx = Contexto["productos"][number];
type DocumentoCtx = Contexto["documentosConfirmados"][number];
type PreguntaCtx = Contexto["preguntasCerradas"][number];

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const MAX_TOKENS = 1500;

export class ChatbotConfigError extends Error {}
export class ChatbotApiError extends Error {}

// ------------------------------------------------------- Filtro de relevancia
// No es "entrenamiento": es un filtro por palabras clave que reduce cuanto contexto se
// manda a la API en cada pregunta, incluyendo el detalle completo solo de lo que parece
// relevante y un indice compacto (solo nombres) de todo lo demas. Baja el consumo de
// tokens sin necesidad de una base de datos vectorial.
const STOPWORDS = new Set([
  "que", "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "para", "con", "por", "es", "son",
  "y", "o", "en", "del", "al", "se", "su", "sus", "como", "cual", "cuales", "cuál", "cuáles", "donde",
  "dónde", "quien", "quién", "a", "the", "and", "or", "is", "are", "what", "which", "for", "with", "to",
  "sobre", "este", "esta", "estos", "estas", "hay", "tiene", "tienen", "puedo", "puede", "dame", "dime",
  "cómo", "qué", "existe", "existen", "tengo", "necesito", "favor", "porfa", "gracias",
]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function extraerPalabrasClave(pregunta: string): string[] {
  const palabras = normalizar(pregunta)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(palabras)];
}

function coincideAlgunaPalabra(texto: string | null | undefined, palabras: string[]): boolean {
  if (!texto) return false;
  const t = normalizar(texto);
  return palabras.some((p) => t.includes(p));
}

function productoRelevante(p: ProductoCtx, palabras: string[]): boolean {
  if (coincideAlgunaPalabra(p.referencia, palabras)) return true;
  if (coincideAlgunaPalabra(p.nombre, palabras)) return true;
  if (coincideAlgunaPalabra(labelFamilia(p.familia), palabras)) return true;
  if (coincideAlgunaPalabra(p.descripcion, palabras)) return true;
  if (coincideAlgunaPalabra(p.notas, palabras)) return true;
  if ((p.especificaciones ?? []).some((e) => coincideAlgunaPalabra(e.nombre, palabras) || coincideAlgunaPalabra(e.valor, palabras))) return true;
  return false;
}

function documentoRelevante(d: DocumentoCtx, palabras: string[], referenciasRelevantes: Set<string>): boolean {
  if (coincideAlgunaPalabra(d.titulo, palabras)) return true;
  if (coincideAlgunaPalabra(d.codigo, palabras)) return true;
  if (coincideAlgunaPalabra(d.notas, palabras)) return true;
  if (coincideAlgunaPalabra(d.tipo, palabras)) return true;
  return d.referencias.some((r) => referenciasRelevantes.has(r));
}

function preguntaRelevante(p: PreguntaCtx, palabras: string[], referenciasRelevantes: Set<string>): boolean {
  if (coincideAlgunaPalabra(p.titulo, palabras)) return true;
  if (coincideAlgunaPalabra(p.contenido, palabras)) return true;
  if (coincideAlgunaPalabra(p.respuesta, palabras)) return true;
  return p.referencias.some((r) => referenciasRelevantes.has(r));
}

interface ContextoFiltrado {
  productosRelevantes: ProductoCtx[];
  productosIndice: { referencia: string; nombre: string }[];
  documentosRelevantes: DocumentoCtx[];
  documentosOmitidos: number;
  preguntasRelevantes: PreguntaCtx[];
  preguntasOmitidas: number;
}

/** Limite de items relevantes por categoria, para no volver a inflar el contexto si la
 * pregunta es muy generica y "coincide" con medio catalogo. */
const MAX_RELEVANTES = 25;

export function filtrarContexto(pregunta: string, contexto: Contexto): ContextoFiltrado {
  const palabras = extraerPalabrasClave(pregunta);

  // Sin palabras clave utiles (pregunta muy corta/generica): no hay como filtrar con
  // sentido, se manda el indice compacto de todo y el detalle completo de nada puntual.
  if (palabras.length === 0) {
    return {
      productosRelevantes: [],
      productosIndice: contexto.productos.map((p) => ({ referencia: p.referencia, nombre: p.nombre })),
      documentosRelevantes: [],
      documentosOmitidos: contexto.documentosConfirmados.length,
      preguntasRelevantes: [],
      preguntasOmitidas: contexto.preguntasCerradas.length,
    };
  }

  const productosRelevantes = contexto.productos.filter((p) => productoRelevante(p, palabras)).slice(0, MAX_RELEVANTES);
  const referenciasRelevantes = new Set(productosRelevantes.map((p) => p.referencia));

  const productosIndice = contexto.productos
    .filter((p) => !referenciasRelevantes.has(p.referencia))
    .map((p) => ({ referencia: p.referencia, nombre: p.nombre }));

  const documentosRelevantesTodos = contexto.documentosConfirmados.filter((d) => documentoRelevante(d, palabras, referenciasRelevantes));
  const documentosRelevantes = documentosRelevantesTodos.slice(0, MAX_RELEVANTES);

  const preguntasRelevantesTodas = contexto.preguntasCerradas.filter((p) => preguntaRelevante(p, palabras, referenciasRelevantes));
  const preguntasRelevantes = preguntasRelevantesTodas.slice(0, MAX_RELEVANTES);

  return {
    productosRelevantes,
    productosIndice,
    documentosRelevantes,
    documentosOmitidos: contexto.documentosConfirmados.length - documentosRelevantes.length,
    preguntasRelevantes,
    preguntasOmitidas: contexto.preguntasCerradas.length - preguntasRelevantes.length,
  };
}

// ------------------------------------------------------------------- Formato
function formatearEspecificaciones(especificaciones: ProductoCtx["especificaciones"]): string {
  if (!especificaciones || especificaciones.length === 0) return "";
  return especificaciones.map((e) => `${e.nombre}: ${e.valor}`).join("; ");
}

function formatearProductosDetalle(productos: ProductoCtx[]): string {
  if (productos.length === 0) return "(ninguna referencia parecio relevante para esta pregunta)";
  return productos
    .map((p) => {
      const partes = [`- [PRODUCTO] ${p.referencia} — ${p.nombre} (familia: ${labelFamilia(p.familia)}, estado: ${p.estado})`];
      if (p.descripcion) partes.push(`  Descripcion: ${p.descripcion}`);
      if (p.notas) partes.push(`  Notas: ${p.notas}`);
      const specs = formatearEspecificaciones(p.especificaciones);
      if (specs) partes.push(`  Especificaciones: ${specs}`);
      return partes.join("\n");
    })
    .join("\n");
}

function formatearProductosIndice(indice: { referencia: string; nombre: string }[]): string {
  if (indice.length === 0) return "";
  return indice.map((p) => `${p.referencia} (${p.nombre})`).join(", ");
}

function formatearDocumentos(documentos: DocumentoCtx[]): string {
  if (documentos.length === 0) return "(ningun documento confirmado parecio relevante para esta pregunta)";
  return documentos
    .map((d) => {
      const detalle = [d.tipo, d.codigo, d.revision, d.fechaEmision, d.idioma].filter(Boolean).join(" · ");
      const partes = [`- [DOCUMENTO CONFIRMADO] "${d.titulo}"${detalle ? ` (${detalle})` : ""}`];
      if (d.fuente) partes.push(`  Fuente: ${d.fuente}`);
      if (d.referencias.length > 0) partes.push(`  Referencias: ${d.referencias.join(", ")}`);
      if (d.notas) partes.push(`  Notas: ${d.notas}`);
      return partes.join("\n");
    })
    .join("\n");
}

function formatearPreguntas(preguntas: PreguntaCtx[]): string {
  if (preguntas.length === 0) return "(ninguna pregunta cerrada parecio relevante para esta pregunta)";
  return preguntas
    .map((p) => {
      const partes = [`- [PREGUNTA CERRADA] "${p.titulo}"`];
      partes.push(`  Pregunta: ${p.contenido}`);
      partes.push(`  Respuesta${p.respondedor ? ` de ${p.respondedor}` : ""}: ${p.respuesta}`);
      if (p.referencias.length > 0) partes.push(`  Referencias: ${p.referencias.join(", ")}`);
      return partes.join("\n");
    })
    .join("\n");
}

function construirSystemPrompt(marcaNombre: string, filtrado: ContextoFiltrado): string {
  const indiceTexto = formatearProductosIndice(filtrado.productosIndice);
  return [
    `Eres el asistente tecnico interno de Detnov Colombia para el soporte de la marca "${marcaNombre}".`,
    "Responde SOLO con base en la informacion suministrada abajo (referencias de producto, documentos con confianza CONFIRMADO, y preguntas de soporte ya cerradas con respuesta). No inventes especificaciones, precios ni referencias que no esten en esta informacion.",
    "IMPORTANTE: lo que ves abajo es la metadata capturada en la base de conocimiento (titulos, tipos, notas breves de verificacion), NO el texto completo de los PDF/Excel originales -- la herramienta no extrae el contenido de esos archivos. Si una pregunta pide un dato tecnico puntual (un valor exacto, un procedimiento de cableado, una cifra) que no aparece explicitamente abajo, di que ese detalle no esta capturado en la base y que hay que abrir el documento original (menciona cual, por titulo) para confirmarlo -- no asumas que 'no esta' en el documento, solo que no esta en lo que tienes disponible.",
    "Para reducir el consumo de tokens, solo se incluye el detalle completo de las referencias/documentos/preguntas que parecen relacionadas con esta pregunta especifica; el resto del catalogo de referencias aparece solo como una lista de nombres (sin detalle) para que sepas que existen.",
    "Si la informacion disponible no alcanza para responder con certeza, dilo explicitamente en vez de adivinar.",
    "Responde en español, de forma clara y tecnica, apta para un ingeniero.",
    "Al final de tu respuesta agrega siempre una seccion literal 'Fuentes utilizadas:' con una lista de los documentos (titulo, y codigo si lo tiene) y/o preguntas cerradas que usaste para responder. Si no usaste ninguna fuente puntual porque la respuesta es general, escribe 'Fuentes utilizadas: ninguna en particular'.",
    "",
    "=== REFERENCIAS DE PRODUCTO RELEVANTES (detalle completo) ===",
    formatearProductosDetalle(filtrado.productosRelevantes),
    "",
    indiceTexto ? `=== OTRAS REFERENCIAS EXISTENTES (solo nombre, sin detalle) ===\n${indiceTexto}` : "",
    "",
    "=== DOCUMENTOS CONFIRMADOS RELEVANTES ===",
    formatearDocumentos(filtrado.documentosRelevantes),
    filtrado.documentosOmitidos > 0 ? `(hay ${filtrado.documentosOmitidos} documento(s) confirmado(s) adicional(es) que no parecieron relacionados con esta pregunta y no se incluyeron)` : "",
    "",
    "=== PREGUNTAS DE SOPORTE CERRADAS RELEVANTES ===",
    formatearPreguntas(filtrado.preguntasRelevantes),
    filtrado.preguntasOmitidas > 0 ? `(hay ${filtrado.preguntasOmitidas} pregunta(s) cerrada(s) adicional(es) que no parecieron relacionadas con esta pregunta y no se incluyeron)` : "",
  ]
    .filter((linea) => linea !== "")
    .join("\n");
}

export async function preguntarChatbot(pregunta: string, marcaNombre: string, contexto: Contexto): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ChatbotConfigError(
      "Falta configurar ANTHROPIC_API_KEY. Crea un archivo .env.local en la raiz del proyecto con la linea ANTHROPIC_API_KEY=tu-clave y reinicia el servidor.",
    );
  }

  const filtrado = filtrarContexto(pregunta, contexto);
  const systemPrompt = construirSystemPrompt(marcaNombre, filtrado);

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: pregunta }],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new ChatbotApiError(`La API de Claude respondio con error (${res.status}). ${detalle.slice(0, 300)}`);
  }

  const data = await res.json();
  const texto = Array.isArray(data.content) ? data.content.map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join("") : "";
  if (!texto) throw new ChatbotApiError("La API de Claude no devolvio texto en la respuesta.");
  return texto;
}
