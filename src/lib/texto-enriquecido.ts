/**
 * Texto enriquecido de preguntas y mensajes del hilo: texto plano con saltos de linea e
 * hipervinculos dentro de los parrafos, guardados como [texto](https://...). Las URL sueltas
 * tambien se muestran como enlace. Se guarda asi (y no como HTML) para que se pueda traducir,
 * buscar y mandar al ChatBot sin riesgo de inyectar HTML.
 */

export type FragmentoTexto = { tipo: "texto"; texto: string } | { tipo: "enlace"; texto: string; url: string };

// [texto](url)  |  url suelta (sin la puntuacion final de la frase)
const PATRON = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/)[^\s<>"]*[^\s<>".,;:!?)\]'])/g;

/** Solo se enlazan http(s) y mailto: nada de javascript: ni data:. */
export function urlSegura(url: string): string | null {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function fragmentarTexto(texto: string): FragmentoTexto[] {
  const fragmentos: FragmentoTexto[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PATRON)) {
    const inicio = m.index ?? 0;
    const url = urlSegura(m[2] ?? m[3]);
    if (!url) continue;
    if (inicio > ultimo) fragmentos.push({ tipo: "texto", texto: texto.slice(ultimo, inicio) });
    fragmentos.push({ tipo: "enlace", texto: m[1] ?? m[3], url });
    ultimo = inicio + m[0].length;
  }
  if (ultimo < texto.length) fragmentos.push({ tipo: "texto", texto: texto.slice(ultimo) });
  return fragmentos;
}

export function tieneEnlaces(texto: string): boolean {
  return fragmentarTexto(texto).some((f) => f.tipo === "enlace");
}

/** Version para documentos sin hipervinculos (reporte en Word): "texto (url)". */
export function aTextoPlano(texto: string): string {
  return fragmentarTexto(texto)
    .map((f) => (f.tipo === "enlace" && f.texto !== f.url ? `${f.texto} (${f.url})` : f.texto))
    .join("");
}

/** Enlace en el formato guardado; los corchetes del texto se cambian para no romperlo. */
export function enlaceMarkdown(texto: string, url: string): string {
  return `[${texto.replace(/[[\]\n]/g, " ").trim() || url}](${url})`;
}

/** Convierte HTML pegado (pagina web, Word, correo) a texto con enlaces [texto](url),
 * conservando los saltos de parrafo. Solo para el navegador (usa DOMParser). */
export function htmlATexto(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const BLOQUES = new Set(["P", "DIV", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE"]);
  let salida = "";
  const recorrer = (nodo: Node) => {
    if (nodo.nodeType === Node.TEXT_NODE) {
      salida += (nodo.textContent ?? "").replace(/\s+/g, " ");
      return;
    }
    if (nodo.nodeType !== Node.ELEMENT_NODE) return;
    const el = nodo as HTMLElement;
    if (el.tagName === "BR") {
      salida += "\n";
      return;
    }
    if (el.tagName === "STYLE" || el.tagName === "SCRIPT") return;
    if (el.tagName === "A") {
      const url = urlSegura(el.getAttribute("href") ?? "");
      const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (url && texto) {
        salida += texto === url ? url : enlaceMarkdown(texto, url);
        return;
      }
    }
    const bloque = BLOQUES.has(el.tagName);
    if (bloque && salida && !salida.endsWith("\n")) salida += "\n";
    if (el.tagName === "LI") salida += "• ";
    el.childNodes.forEach(recorrer);
    if (bloque && !salida.endsWith("\n")) salida += "\n";
  };
  doc.body.childNodes.forEach(recorrer);
  return salida
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
