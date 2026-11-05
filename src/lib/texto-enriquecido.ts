/**
 * Texto enriquecido de preguntas y mensajes del hilo: texto plano con saltos de linea,
 * hipervinculos guardados como [texto](https://...) e imagenes guardadas como ![](ruta). Las
 * URL sueltas tambien se muestran como enlace. Se guarda asi (y no como HTML) para que se pueda
 * traducir, buscar y mandar al ChatBot sin riesgo de inyectar HTML.
 */

export type FragmentoTexto =
  | { tipo: "texto"; texto: string }
  | { tipo: "enlace"; texto: string; url: string }
  | { tipo: "imagen"; alt: string; url: string };

// ![alt](ruta)  |  [texto](url)  |  url suelta (sin la puntuacion final de la frase)
const PATRON =
  /!\[([^\]\n]*)\]\(((?:https:\/\/|\/api\/archivos\/)[^\s)]+)\)|\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/)[^\s<>"]*[^\s<>".,;:!?)\]'])/g;

/** Solo se enlazan http(s) y mailto: nada de javascript: ni data:. */
export function urlSegura(url: string): string | null {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Imagenes: solo las subidas a la herramienta (/api/archivos/...) o https. */
export function urlImagenSegura(url: string): string | null {
  const limpia = url.trim();
  if (limpia.startsWith("/api/archivos/")) {
    return /^\/api\/archivos\/[A-Za-z0-9._\-/]+$/.test(limpia) && !limpia.includes("..") && !limpia.includes("//") ? limpia : null;
  }
  try {
    const u = new URL(limpia);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function fragmentarTexto(texto: string): FragmentoTexto[] {
  const fragmentos: FragmentoTexto[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PATRON)) {
    const inicio = m.index ?? 0;
    const esImagen = m[2] !== undefined;
    const url = esImagen ? urlImagenSegura(m[2]) : urlSegura(m[4] ?? m[5]);
    if (!url) continue;
    if (inicio > ultimo) fragmentos.push({ tipo: "texto", texto: texto.slice(ultimo, inicio) });
    fragmentos.push(esImagen ? { tipo: "imagen", alt: m[1], url } : { tipo: "enlace", texto: m[3] ?? m[5], url });
    ultimo = inicio + m[0].length;
  }
  if (ultimo < texto.length) fragmentos.push({ tipo: "texto", texto: texto.slice(ultimo) });
  return fragmentos;
}

/** Version para documentos sin hipervinculos (reporte en Word): "texto (url)"; las imagenes
 * quedan como "[imagen]". */
export function aTextoPlano(texto: string): string {
  return fragmentarTexto(texto)
    .map((f) => (f.tipo === "imagen" ? "[imagen]" : f.tipo === "enlace" && f.texto !== f.url ? `${f.texto} (${f.url})` : f.texto))
    .join("");
}

/** Enlace en el formato guardado; los corchetes del texto se cambian para no romperlo. */
export function enlaceMarkdown(texto: string, url: string): string {
  return `[${texto.replace(/[[\]\n]/g, " ").trim() || url}](${url})`;
}

/** Imagen en el formato guardado. */
export function imagenMarkdown(url: string, alt = ""): string {
  return `![${alt.replace(/[[\]\n]/g, " ").trim()}](${url})`;
}

/**
 * Convierte HTML (pegado desde una pagina web, Word o un correo, o el contenido del propio
 * editor) a texto con enlaces [texto](url) e imagenes ![](ruta), conservando los saltos de
 * linea. Solo para el navegador (usa DOMParser).
 */
export function htmlATexto(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return nodosATexto(doc.body);
}

/** Igual que htmlATexto pero sobre un elemento ya existente (el area del editor). */
export function nodosATexto(raiz: Node): string {
  const BLOQUES = new Set(["P", "DIV", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE"]);
  let salida = "";
  const recorrer = (nodo: Node) => {
    if (nodo.nodeType === Node.TEXT_NODE) {
      salida += (nodo.textContent ?? "").replace(/ /g, " ").replace(/[ \t\r\n]+/g, " ");
      return;
    }
    if (nodo.nodeType !== Node.ELEMENT_NODE) return;
    const el = nodo as HTMLElement;
    if (el.tagName === "BR") {
      // Un <br> al final de una linea con contenido no se ve (el navegador lo deja de relleno):
      // no suma linea. Solo, en un bloque vacio, si es una linea en blanco.
      const esRelleno = !el.nextSibling && !!el.previousSibling;
      if (!esRelleno) salida += "\n";
      return;
    }
    if (el.tagName === "STYLE" || el.tagName === "SCRIPT") return;
    if (el.tagName === "IMG") {
      // Del editor (data-ruta) o pegada desde una pagina web (https). Las de Word/correo
      // (file:, cid:, data:) no se pueden conservar. Mientras se sube no tiene data-ruta.
      const ruta = el.getAttribute("data-ruta") ?? (el.hasAttribute("data-subiendo") ? "" : el.getAttribute("src") ?? "");
      const url = urlImagenSegura(ruta);
      if (url) salida += imagenMarkdown(url, el.getAttribute("alt") ?? "");
      return;
    }
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
  raiz.childNodes.forEach(recorrer);
  return salida
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
