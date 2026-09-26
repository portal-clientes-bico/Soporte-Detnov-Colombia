import "server-only";
import type { getContextoChatbot } from "@/lib/queries";
import { labelFamilia } from "@/lib/tipos";
import { embederPregunta, similitudCoseno } from "@/lib/embeddings";

type Contexto = Awaited<ReturnType<typeof getContextoChatbot>>;
type ProductoCtx = Contexto["productos"][number];
type DocumentoCtx = Contexto["documentosConfirmados"][number];
type PreguntaCtx = Contexto["preguntasCerradas"][number];
type AprendizajeCtx = Contexto["aprendizajes"][number];
type PaginaCtx = NonNullable<DocumentoCtx["paginas"]>[number];

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const MAX_TOKENS = 1500;

export class ChatbotConfigError extends Error {}
export class ChatbotApiError extends Error {}

// ------------------------------------------------------- Filtro de relevancia
// No es "entrenamiento": es un filtro por palabras clave que decide que contenido puntual
// (fragmentos del cuerpo de los PDF, preguntas cerradas con detalle) se manda ademas del
// catalogo base. El catalogo completo de productos y la metadata de documentos SIEMPRE se
// mandan completos (ver construirBloqueEstatico) porque van en la parte del prompt marcada
// para cache de Anthropic: al ser identica pregunta a pregunta dentro de una sesion, se
// factura casi completa solo la primera vez.
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

// Coincidencia por PALABRA COMPLETA (limites de palabra), no por subcadena: con substring
// simple, una palabra clave corta como "ami" (del modulo AMI) tambien "coincide" dentro de
// palabras en ingles como "ceramic" o "family", generando ruido. El limite de palabra evita
// ese falso positivo sin perder la deteccion real del termino.
const regexPorPalabra = new Map<string, RegExp>();
function regexDePalabra(palabra: string): RegExp {
  let r = regexPorPalabra.get(palabra);
  if (!r) {
    r = new RegExp(`\\b${palabra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    regexPorPalabra.set(palabra, r);
  }
  return r;
}

function coincideAlgunaPalabra(texto: string | null | undefined, palabras: string[]): boolean {
  if (!texto) return false;
  const t = normalizar(texto);
  return palabras.some((p) => regexDePalabra(p).test(t));
}

/** Cuenta cuantas palabras clave DISTINTAS aparecen en el texto (no ocurrencias totales): una
 * pagina que menciona 3 palabras clave distintas es una senal de relevancia mucho mas fuerte
 * que una que repite la misma palabra comun muchas veces. */
function contarPalabrasDistintas(texto: string | null | undefined, palabras: string[]): number {
  if (!texto) return 0;
  const t = normalizar(texto);
  return palabras.reduce((n, p) => n + (regexDePalabra(p).test(t) ? 1 : 0), 0);
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

// ------------------------------------------------- Ranking y extraccion de fragmentos
// Cuantos documentos con fragmentos de cuerpo se incluyen como maximo, y cuanto "presupuesto"
// de caracteres se reparte entre todos ellos (no un tope fijo por documento: una pregunta con
// una palabra comun no debe poder inflar el prompt con 25 documentos completos).
const MAX_DOCUMENTOS_CON_EXTRACTO = 6;
const PRESUPUESTO_TOTAL_EXTRACTOS = 12000;
const MAX_PAGINAS_POR_DOCUMENTO = 4;
const MAX_EXTRACTOS_POR_PAGINA = 2;
/** Caracteres de contexto a cada lado de la coincidencia, en vez de mandar la pagina entera. */
const VENTANA_RADIO = 300;
/** Si un documento es relevante por titulo/notas/referencia pero su cuerpo no menciona
 * ninguna palabra clave, se manda solo un vistazo corto (no un extracto de 6000 caracteres). */
const CHARS_RESUMEN_FALLBACK = 600;
const MAX_PREGUNTAS_RELEVANTES = 15;

const PESO_TITULO = 5;
const PESO_CODIGO = 3;
const PESO_NOTAS = 2;
const PESO_REFERENCIA_RELEVANTE = 4;
/** Peso por cada palabra clave distinta que aparece en la MEJOR pagina del documento (no la
 * suma de todas las paginas): usar el total de paginas que "tocan" alguna palabra favorece a
 * los documentos mas largos solo por tener mas paginas donde una palabra comun puede aparecer
 * (ej. un manual de 80 paginas le gano a la ficha tecnica de 7 paginas que si tenia la
 * respuesta, solo por mencionar "panel" en casi todas sus paginas). */
const PESO_MEJOR_PAGINA = 3;

// --------------------------------------------------- Busqueda semantica local (embeddings)
// Complementa el filtro por palabras clave para preguntas que no comparten ninguna palabra
// literal con el documento correcto -- el caso mas comun es una pregunta en español sobre un
// documento en ingles (ver src/lib/embeddings.ts para el detalle y las pruebas que motivaron
// esto). Los umbrales de abajo salen de pruebas manuales propias (no de un benchmark), y son
// el primer lugar a ajustar si la busqueda semantica resulta muy laxa o muy estricta en uso
// real.
/** Similitud coseno minima para considerar una pagina "relevante por semantica" cuando no
 * comparte ninguna palabra clave literal -- por debajo de esto, para este modelo, la similitud
 * suele ser ruido de fondo (paginas del mismo documento/dominio sin relacion real). */
const UMBRAL_SEMANTICO_MINIMO = 0.76;
/** Peso de la similitud semantica de la mejor pagina en el puntaje del documento, en la misma
 * escala que PESO_TITULO/PESO_REFERENCIA_RELEVANTE (una similitud de 0.8 aporta ~8 puntos). */
const PESO_SEMANTICO = 10;

/** Quita lineas de encabezado/pie repetitivas (paginacion, revision) antes de buscar
 * coincidencias, para que los extractos no desperdicien caracteres en ese boilerplate. */
function limpiarTextoPagina(texto: string): string {
  return texto
    .split("\n")
    .filter((linea) => {
      const l = linea.trim();
      if (l.length === 0) return false;
      if (/^page\s+\d+\s+of\s+\d+/i.test(l)) return false;
      if (/^p[aá]gina\s+\d+\s+de\s+\d+/i.test(l)) return false;
      if (/^rev\.?\s*[\d.]+\s+\d{1,2}\/\d{4}$/i.test(l)) return false;
      if (/^\d+\s*\/\s*\d+$/.test(l)) return false;
      return true;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface PaginaCandidata {
  pagina: PaginaCtx;
  distintas: number;
  similitud: number;
  /** true si califico solo por similitud semantica (cero palabras clave literales) -- se usa
   * despues para no intentar centrar una ventana de texto en una posicion de palabra que no
   * existe, y para avisarle al modelo que el fragmento es una coincidencia semantica, no
   * literal. */
  soloSemantica: boolean;
}

interface DocumentoPuntuado {
  documento: DocumentoCtx;
  score: number;
  paginasCoincidentes: PaginaCandidata[];
}

function puntuarDocumento(d: DocumentoCtx, palabras: string[], referenciasRelevantes: Set<string>, vectorPregunta: number[] | null): DocumentoPuntuado {
  let score = contarPalabrasDistintas(d.titulo, palabras) * PESO_TITULO;
  score += contarPalabrasDistintas(d.codigo, palabras) * PESO_CODIGO;
  score += contarPalabrasDistintas(d.notas, palabras) * PESO_NOTAS;
  if (d.referencias.some((r) => referenciasRelevantes.has(r))) score += PESO_REFERENCIA_RELEVANTE;

  const vectores = d.vectoresPaginas;

  // Para cada pagina calcula dos señales independientes: cuantas palabras clave literales
  // tiene, y (si hay vector de embedding para esa pagina) que tan semanticamente parecida es
  // a la pregunta -- esto ultimo encuentra paginas relevantes aunque no compartan ninguna
  // palabra literal con la pregunta (ver comentario de UMBRAL_SEMANTICO_MINIMO arriba).
  const paginasConPuntaje: PaginaCandidata[] = (d.paginas ?? []).map((p, i) => {
    const distintas = contarPalabrasDistintas(p.texto, palabras);
    const similitud = vectorPregunta && vectores?.[i] ? similitudCoseno(vectorPregunta, vectores[i]) : 0;
    return { pagina: p, distintas, similitud, soloSemantica: distintas === 0 };
  });

  // Ordena por el puntaje combinado (palabras clave + semantica), no por numero de pagina: al
  // extraer despues solo unas pocas (MAX_PAGINAS_POR_DOCUMENTO), asi se quedan las paginas
  // realmente mas relacionadas y no las primeras que aparecen en el archivo.
  const puntajePagina = (x: Pick<PaginaCandidata, "distintas" | "similitud">) =>
    x.distintas * PESO_MEJOR_PAGINA + (x.similitud >= UMBRAL_SEMANTICO_MINIMO ? x.similitud * PESO_SEMANTICO : 0);
  const candidatas = paginasConPuntaje.filter((x) => x.distintas > 0 || x.similitud >= UMBRAL_SEMANTICO_MINIMO).sort((a, b) => puntajePagina(b) - puntajePagina(a));

  score += candidatas[0] ? puntajePagina(candidatas[0]) : 0;

  return { documento: d, score, paginasCoincidentes: candidatas };
}

interface Extracto {
  pagina: number;
  texto: string;
  /** true si esta pagina no comparte ninguna palabra clave literal con la pregunta y se
   * incluyo solo por similitud semantica -- el modelo debe saber que el fragmento puede no
   * mencionar los terminos exactos de la pregunta aunque hable del mismo tema. */
  soloSemantica: boolean;
}

/** Encuentra donde aparece cada palabra clave en la pagina (ya limpia) y devuelve ventanas de
 * texto alrededor de esas coincidencias, fusionando las que se superponen, en vez de la pagina
 * completa -- el ahorro tipico es de varias veces el tamano original. */
function extraerVentanas(paginaTexto: string, palabras: string[]): string[] {
  const limpio = limpiarTextoPagina(paginaTexto);
  const normalizado = normalizar(limpio);
  const posiciones: number[] = [];
  for (const palabra of palabras) {
    const regex = new RegExp(regexDePalabra(palabra).source, "g");
    for (const m of normalizado.matchAll(regex)) {
      if (m.index !== undefined) posiciones.push(m.index);
    }
  }
  if (posiciones.length === 0) return [];
  posiciones.sort((a, b) => a - b);

  const rangos: { inicio: number; fin: number }[] = [];
  for (const pos of posiciones) {
    const inicio = Math.max(0, pos - VENTANA_RADIO);
    const fin = Math.min(limpio.length, pos + VENTANA_RADIO);
    const ultimo = rangos[rangos.length - 1];
    if (ultimo && inicio <= ultimo.fin) {
      ultimo.fin = Math.max(ultimo.fin, fin);
    } else {
      rangos.push({ inicio, fin });
    }
  }

  return rangos.slice(0, MAX_EXTRACTOS_POR_PAGINA).map((r) => {
    const prefijo = r.inicio > 0 ? "..." : "";
    const sufijo = r.fin < limpio.length ? "..." : "";
    return `${prefijo}${limpio.slice(r.inicio, r.fin)}${sufijo}`;
  });
}

interface DocumentoConExtracto {
  documento: DocumentoCtx;
  modo: "coincidencia" | "resumen";
  extractos: Extracto[];
  paginasOmitidas: number;
}

/**
 * Elige, entre los documentos confirmados, los que parecen mas relevantes para esta pregunta
 * (por puntaje, no por orden de aparicion) y arma sus fragmentos de texto respetando un
 * presupuesto total de caracteres compartido entre todos -- evita que una palabra clave comun
 * que "pega" en muchos documentos infle el prompt.
 */
function seleccionarDocumentosConExtractos(
  documentos: DocumentoCtx[],
  palabras: string[],
  referenciasRelevantes: Set<string>,
  vectorPregunta: number[] | null,
): { seleccionados: DocumentoConExtracto[]; documentosConsiderados: number } {
  if (palabras.length === 0) return { seleccionados: [], documentosConsiderados: 0 };

  const puntuados = documentos
    .map((d) => puntuarDocumento(d, palabras, referenciasRelevantes, vectorPregunta))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_DOCUMENTOS_CON_EXTRACTO);

  const seleccionados: DocumentoConExtracto[] = [];
  let presupuesto = PRESUPUESTO_TOTAL_EXTRACTOS;

  for (const { documento, paginasCoincidentes } of puntuados) {
    if (presupuesto <= 0) break;

    if (paginasCoincidentes.length > 0) {
      const paginasUsadas = paginasCoincidentes.slice(0, MAX_PAGINAS_POR_DOCUMENTO);
      const extractos: Extracto[] = [];
      for (const { pagina, soloSemantica } of paginasUsadas) {
        if (presupuesto <= 0) break;
        // Las ventanas se centran en la posicion de una palabra clave literal: una pagina que
        // solo califico por semantica no tiene esa posicion, asi que en vez de una ventana se
        // toma un tramo inicial de la pagina (limpia de encabezados/pies).
        const ventanas = soloSemantica ? [] : extraerVentanas(pagina.texto, palabras);
        const fragmentos = ventanas.length > 0 ? ventanas : [limpiarTextoPagina(pagina.texto).slice(0, VENTANA_RADIO * 2)];
        for (const texto of fragmentos) {
          if (presupuesto <= 0) break;
          const recortado = texto.length > presupuesto ? `${texto.slice(0, presupuesto)}...` : texto;
          extractos.push({ pagina: pagina.numero, texto: recortado, soloSemantica });
          presupuesto -= recortado.length;
        }
      }
      if (extractos.length > 0) {
        seleccionados.push({ documento, modo: "coincidencia", extractos, paginasOmitidas: paginasCoincidentes.length - paginasUsadas.length });
      }
    } else {
      // Relevante por titulo/notas/referencia, no por su contenido: un vistazo corto, no un
      // extracto grande, para no gastar presupuesto en un documento que no tiene la respuesta.
      const primeraPagina = (documento.paginas ?? [])[0];
      if (!primeraPagina) continue;
      const limpio = limpiarTextoPagina(primeraPagina.texto);
      const largo = Math.min(CHARS_RESUMEN_FALLBACK, presupuesto);
      if (largo <= 0) continue;
      const texto = limpio.length > largo ? `${limpio.slice(0, largo)}...` : limpio;
      seleccionados.push({ documento, modo: "resumen", extractos: [{ pagina: primeraPagina.numero, texto, soloSemantica: false }], paginasOmitidas: (documento.paginas?.length ?? 1) - 1 });
      presupuesto -= texto.length;
    }
  }

  return { seleccionados, documentosConsiderados: puntuados.length };
}

function preguntaRelevante(p: PreguntaCtx, palabras: string[], referenciasRelevantes: Set<string>): boolean {
  if (coincideAlgunaPalabra(p.titulo, palabras)) return true;
  if (coincideAlgunaPalabra(p.contenido, palabras)) return true;
  if (coincideAlgunaPalabra(p.respuesta, palabras)) return true;
  return p.referencias.some((r) => referenciasRelevantes.has(r));
}

interface ContextoFiltrado {
  referenciasRelevantes: string[];
  documentosConExtracto: DocumentoConExtracto[];
  documentosOmitidos: number;
  preguntasRelevantes: PreguntaCtx[];
  preguntasOmitidas: number;
}

async function filtrarContexto(pregunta: string, contexto: Contexto): Promise<ContextoFiltrado> {
  const palabras = extraerPalabrasClave(pregunta);
  if (palabras.length === 0) {
    return {
      referenciasRelevantes: [],
      documentosConExtracto: [],
      documentosOmitidos: contexto.documentosConfirmados.length,
      preguntasRelevantes: [],
      preguntasOmitidas: contexto.preguntasCerradas.length,
    };
  }

  // Busqueda semantica: best-effort. Si el modelo local falla por cualquier razon (primera
  // carga sin internet para descargarlo, error de runtime, etc.) se sigue solo con el filtro
  // por palabras clave, exactamente el comportamiento de antes de tener embeddings.
  let vectorPregunta: number[] | null = null;
  try {
    vectorPregunta = await embederPregunta(pregunta);
  } catch (error) {
    console.error("No se pudo calcular el embedding de la pregunta (se sigue solo con palabras clave):", error);
  }

  const productosRelevantes = contexto.productos.filter((p) => productoRelevante(p, palabras));
  const referenciasRelevantes = new Set(productosRelevantes.map((p) => p.referencia));

  const { seleccionados, documentosConsiderados } = seleccionarDocumentosConExtractos(contexto.documentosConfirmados, palabras, referenciasRelevantes, vectorPregunta);

  const preguntasRelevantesTodas = contexto.preguntasCerradas.filter((p) => preguntaRelevante(p, palabras, referenciasRelevantes));
  const preguntasRelevantes = preguntasRelevantesTodas.slice(0, MAX_PREGUNTAS_RELEVANTES);

  return {
    referenciasRelevantes: [...referenciasRelevantes],
    documentosConExtracto: seleccionados,
    documentosOmitidos: documentosConsiderados - seleccionados.length,
    preguntasRelevantes,
    preguntasOmitidas: contexto.preguntasCerradas.length - preguntasRelevantes.length,
  };
}

// ------------------------------------------------------------------- Formato
function formatearEspecificaciones(especificaciones: ProductoCtx["especificaciones"]): string {
  if (!especificaciones || especificaciones.length === 0) return "";
  return especificaciones.map((e) => `${e.nombre}: ${e.valor}`).join("; ");
}

/** Catalogo completo (todas las referencias, con detalle) -- va en el bloque cacheado, por
 * eso no se filtra por pregunta: filtrar aqui rompería la cache (el contenido cacheado debe
 * ser identico entre preguntas). */
function formatearCatalogoCompleto(productos: ProductoCtx[]): string {
  if (productos.length === 0) return "(sin referencias registradas)";
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

/** Metadata de todos los documentos confirmados, sin el cuerpo del archivo -- tambien va en
 * el bloque cacheado. */
function formatearDocumentosMetadata(documentos: DocumentoCtx[]): string {
  if (documentos.length === 0) return "(sin documentos confirmados)";
  return documentos
    .map((d) => {
      const detalle = [d.tipo, d.codigo, d.revision, d.fechaEmision, d.idioma].filter(Boolean).join(" · ");
      const tieneTexto = (d.paginas?.length ?? 0) > 0;
      const partes = [`- [DOCUMENTO] "${d.titulo}"${detalle ? ` (${detalle})` : ""}${tieneTexto ? "" : " [sin texto extraido]"}`];
      if (d.fuente) partes.push(`  Fuente: ${d.fuente}`);
      if (d.referencias.length > 0) partes.push(`  Referencias: ${d.referencias.join(", ")}`);
      if (d.notas) partes.push(`  Notas: ${d.notas}`);
      return partes.join("\n");
    })
    .join("\n");
}

/** Solo los titulos de las preguntas cerradas (para que el modelo sepa que existen); el
 * contenido y la respuesta completos solo se mandan para las que resultan relevantes a la
 * pregunta actual (bloque dinamico, ver formatearPreguntasDetalle). */
function formatearPreguntasIndice(preguntas: PreguntaCtx[]): string {
  if (preguntas.length === 0) return "(sin preguntas de soporte cerradas todavia)";
  return preguntas.map((p) => `- "${p.titulo}"${p.referencias.length > 0 ? ` (${p.referencias.join(", ")})` : ""}`).join("\n");
}

/** Hallazgos declarados como "Hallazgo / aprendizaje" (ver getContextoChatbot): conocimiento
 * confirmado, en general, no ligado a una sola pregunta -- por eso va completo en el bloque
 * cacheado (como el catalogo) en vez de filtrarse por pregunta. */
function formatearAprendizajes(aprendizajes: AprendizajeCtx[]): string {
  if (aprendizajes.length === 0) return "(sin hallazgos/aprendizajes registrados todavia)";
  return aprendizajes
    .map((a) => `- "${a.titulo}"${a.referencia ? ` (${a.referencia})` : ""}: ${a.contenido}`)
    .join("\n");
}

function formatearDocumentosConExtracto(seleccionados: DocumentoConExtracto[]): string {
  if (seleccionados.length === 0) return "(ningun documento parecio tener contenido puntual relacionado con esta pregunta)";
  return seleccionados
    .map(({ documento, modo, extractos, paginasOmitidas }) => {
      const encabezado = modo === "coincidencia" ? "Fragmentos que mencionan la pregunta" : "Vistazo del documento (su contenido no coincidio con palabras clave puntuales)";
      const partes = [`- "${documento.titulo}" -- ${encabezado}:`];
      for (const extracto of extractos) {
        const marca = extracto.soloSemantica ? " (coincidencia semantica: puede no usar las mismas palabras de la pregunta)" : "";
        partes.push(`    [pagina ${extracto.pagina}]${marca} ${extracto.texto}`);
      }
      if (paginasOmitidas > 0) partes.push(`    (hay ${paginasOmitidas} pagina(s) adicional(es) de este documento no incluidas aqui por espacio)`);
      return partes.join("\n");
    })
    .join("\n");
}

function formatearPreguntasDetalle(preguntas: PreguntaCtx[]): string {
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

/**
 * Parte fija del prompt: instrucciones + catalogo completo de productos + metadata de todos
 * los documentos confirmados + indice de preguntas cerradas. Es identica entre preguntas de
 * una misma sesion (mientras no cambie el catalogo), por lo que se marca con cache_control
 * para que Anthropic la facture casi completa solo la primera vez.
 */
function construirBloqueEstatico(marcaNombre: string, contexto: Contexto): string {
  return [
    `Eres el asistente tecnico interno de Detnov Colombia para el soporte de la marca "${marcaNombre}".`,
    "Responde SOLO con base en la informacion suministrada (catalogo de referencias, documentos con confianza CONFIRMADO, preguntas de soporte ya cerradas con respuesta, y hallazgos/aprendizajes confirmados). No inventes especificaciones, precios ni referencias que no esten en esta informacion.",
    "IMPORTANTE: para cada documento ves su metadata (titulo, tipo, notas) siempre, pero el contenido real del archivo (cuando existe texto extraido -- hoy solo PDF; Excel, escaneados y archivos sin descargar no lo tienen) solo aparece mas abajo para los documentos que parecieron relacionados con la pregunta especifica, y no es el archivo completo: son fragmentos (paginas que mencionan la pregunta, o un vistazo inicial si ninguna coincidio puntualmente). Algunos fragmentos se marcan como 'coincidencia semantica': se encontraron por similitud de significado (util cuando la pregunta esta en español y el documento en ingles, por ejemplo), no porque compartan las palabras exactas -- tratalos igual de validos, solo pueden requerir un poco mas de interpretacion. Si un dato puntual (un valor exacto, un procedimiento, una cifra) no aparece en los fragmentos incluidos, di que no esta capturado en lo que tienes disponible y que hay que abrir el documento original (menciona cual, por titulo) para confirmarlo -- no asumas que 'no existe' en el documento, solo que no esta en el fragmento que se te dio.",
    "Si la informacion disponible no alcanza para responder con certeza, dilo explicitamente en vez de adivinar.",
    "Responde en español, de forma clara y tecnica, apta para un ingeniero.",
    "Al final de tu respuesta agrega siempre una seccion literal 'Fuentes utilizadas:' con una lista de los documentos (titulo, y codigo si lo tiene), preguntas cerradas y/o hallazgos/aprendizajes que usaste para responder. Si no usaste ninguna fuente puntual porque la respuesta es general, escribe 'Fuentes utilizadas: ninguna en particular'.",
    "",
    "=== CATALOGO COMPLETO DE REFERENCIAS DE PRODUCTO ===",
    formatearCatalogoCompleto(contexto.productos),
    "",
    "=== DOCUMENTOS CONFIRMADOS (metadata; el contenido puntual relevante, si lo hay, va mas abajo) ===",
    formatearDocumentosMetadata(contexto.documentosConfirmados),
    "",
    "=== PREGUNTAS DE SOPORTE CERRADAS (titulos; el detalle de las relevantes va mas abajo) ===",
    formatearPreguntasIndice(contexto.preguntasCerradas),
    "",
    "=== HALLAZGOS / APRENDIZAJES CONFIRMADOS ===",
    formatearAprendizajes(contexto.aprendizajes),
  ].join("\n");
}

/**
 * Parte variable del prompt: fragmentos de documentos y preguntas cerradas especificos de
 * esta pregunta. Cambia en cada llamada, por lo que NO se marca para cache -- se agrega
 * despues del bloque cacheado sin invalidarlo.
 */
function construirBloqueDinamico(pregunta: string, filtrado: ContextoFiltrado): string {
  const partes = [
    "A continuacion, contenido puntual seleccionado especificamente para la pregunta actual del usuario (no es todo lo disponible, solo lo que parecio mas relacionado):",
    "",
    "=== CONTENIDO DE DOCUMENTOS RELACIONADO CON LA PREGUNTA ===",
    formatearDocumentosConExtracto(filtrado.documentosConExtracto),
  ];
  if (filtrado.documentosOmitidos > 0) {
    partes.push(`(hay ${filtrado.documentosOmitidos} documento(s) adicional(es) que parecieron algo relacionados pero no se incluyeron por espacio)`);
  }
  partes.push("", "=== PREGUNTAS DE SOPORTE CERRADAS RELACIONADAS (detalle completo) ===", formatearPreguntasDetalle(filtrado.preguntasRelevantes));
  if (filtrado.preguntasOmitidas > 0) {
    partes.push(`(hay ${filtrado.preguntasOmitidas} pregunta(s) cerrada(s) adicional(es) que no parecieron relacionadas y no se incluyeron)`);
  }
  if (filtrado.referenciasRelevantes.length === 0 && filtrado.documentosConExtracto.length === 0 && filtrado.preguntasRelevantes.length === 0) {
    partes.push("", "(la pregunta no tuvo palabras clave especificas o no coincidio con nada puntual; respondela con base en el catalogo y la metadata de arriba)");
  }
  return partes.join("\n");
}

export interface RespuestaChatbot {
  texto: string;
  uso: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheCreationTokens: number };
}

export async function preguntarChatbot(pregunta: string, marcaNombre: string, contexto: Contexto): Promise<RespuestaChatbot> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ChatbotConfigError(
      "Falta configurar ANTHROPIC_API_KEY. Crea un archivo .env.local en la raiz del proyecto con la linea ANTHROPIC_API_KEY=tu-clave y reinicia el servidor.",
    );
  }

  const filtrado = await filtrarContexto(pregunta, contexto);
  const bloqueEstatico = construirBloqueEstatico(marcaNombre, contexto);
  const bloqueDinamico = construirBloqueDinamico(pregunta, filtrado);

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
      system: [
        { type: "text", text: bloqueEstatico, cache_control: { type: "ephemeral" } },
        { type: "text", text: bloqueDinamico },
      ],
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

  const uso = {
    inputTokens: typeof data.usage?.input_tokens === "number" ? data.usage.input_tokens : 0,
    outputTokens: typeof data.usage?.output_tokens === "number" ? data.usage.output_tokens : 0,
    cacheReadTokens: typeof data.usage?.cache_read_input_tokens === "number" ? data.usage.cache_read_input_tokens : 0,
    cacheCreationTokens: typeof data.usage?.cache_creation_input_tokens === "number" ? data.usage.cache_creation_input_tokens : 0,
  };
  return { texto, uso };
}
