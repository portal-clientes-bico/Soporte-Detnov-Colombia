import "server-only";
import { createHash } from "node:crypto";
import type { IdiomaVista, Pregunta, TraduccionPregunta } from "@/lib/db";
import { contieneCJK } from "@/lib/idioma";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
// El razonamiento adaptativo cuenta dentro de max_tokens (ver chatbot.ts): tope holgado.
const MAX_TOKENS = 16000;

const NOMBRE_IDIOMA: Record<IdiomaVista, string> = {
  es: "español (Colombia)",
  en: "English",
  zh: "简体中文 (chino simplificado)",
};

export class TraduccionError extends Error {}

/** Identifica el texto original que se tradujo: si cambia, la traduccion guardada queda
 * desactualizada. */
export function huellaPregunta(p: Pick<Pregunta, "titulo" | "contenido" | "respuesta">): string {
  return createHash("sha1").update(JSON.stringify([p.titulo, p.contenido, p.respuesta ?? ""])).digest("hex");
}

export function traduccionVigente(p: Pregunta, idioma: IdiomaVista): TraduccionPregunta | null {
  const t = p.traducciones?.[idioma];
  return t && t.huella === huellaPregunta(p) ? t : null;
}

/** En que idiomas hace falta traducir sin que nadie lo pida: en ingles y chino siempre; en
 * español solo si el texto trae caracteres chinos (p. ej. la respuesta de un fabricante). Para
 * respuestas en ingles el usuario puede pedirlo a mano ("Traducir al español"). */
export function requiereTraduccion(p: Pregunta, idioma: IdiomaVista): boolean {
  if (idioma !== "es") return true;
  return contieneCJK(p.titulo) || contieneCJK(p.contenido) || contieneCJK(p.respuesta);
}

const SYSTEM = `Eres traductor tecnico de una empresa colombiana que da soporte a sistemas de deteccion y alarma de incendio (paneles, lazos, detectores, modulos, fuentes, baterias).
Traduce los textos de una pregunta de soporte interna al idioma indicado.
Reglas:
- Usa la terminologia tecnica habitual del sector en el idioma destino y se consistente.
- No traduzcas codigos de modelo o referencias (p. ej. FW2105, JBF-11S), nombres de marcas, nombres de personas, URLs, numeros, unidades ni valores.
- Si un fragmento ya esta en el idioma destino, dejalo igual. Si el texto mezcla idiomas, entrega todo en el idioma destino.
- Conserva saltos de linea, listas y numeracion. No agregues notas, explicaciones ni comillas.
- Si la respuesta viene vacia, devuelve "respuesta" como cadena vacia.`;

export async function traducirPregunta(p: Pregunta, idioma: IdiomaVista): Promise<TraduccionPregunta> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new TraduccionError("Falta configurar ANTHROPIC_API_KEY.");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `Idioma destino: ${NOMBRE_IDIOMA[idioma]}\n\n${JSON.stringify({ titulo: p.titulo, contenido: p.contenido, respuesta: p.respuesta ?? "" }, null, 2)}`,
        },
      ],
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { titulo: { type: "string" }, contenido: { type: "string" }, respuesta: { type: "string" } },
            required: ["titulo", "contenido", "respuesta"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new TraduccionError(`La API de Claude respondio con error (${res.status}). ${detalle.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.stop_reason === "max_tokens" || data.stop_reason === "refusal") {
    throw new TraduccionError(`La traduccion no se completo (${data.stop_reason}).`);
  }
  const texto = Array.isArray(data.content) ? data.content.map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join("") : "";
  let json: { titulo?: unknown; contenido?: unknown; respuesta?: unknown };
  try {
    json = JSON.parse(texto);
  } catch {
    throw new TraduccionError("La API de Claude no devolvio una traduccion valida.");
  }
  if (typeof json.titulo !== "string" || typeof json.contenido !== "string") {
    throw new TraduccionError("La API de Claude no devolvio una traduccion valida.");
  }
  return {
    titulo: json.titulo,
    contenido: json.contenido,
    respuesta: p.respuesta && typeof json.respuesta === "string" && json.respuesta ? json.respuesta : null,
    huella: huellaPregunta(p),
    generadaEn: new Date().toISOString(),
  };
}
