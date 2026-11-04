"use client";

import { useEffect, useRef, useState } from "react";
import { fragmentarTexto, htmlATexto, nodosATexto, urlImagenSegura, urlSegura } from "@/lib/texto-enriquecido";
import { IMAGEN_MAX_BYTES, IMAGEN_TIPOS_PERMITIDOS } from "@/lib/tipos";

export interface TextosEditor {
  enlace: string;
  pideUrl: string;
  pideTexto: string;
  urlInvalida: string;
  imagen: string;
  subiendoImagen: string;
  imagenNoValida: string;
  errorImagen: string;
  ayuda: string;
}

export const TEXTOS_EDITOR_ES: TextosEditor = {
  enlace: "🔗 Insertar enlace",
  pideUrl: "Dirección del enlace (https://...)",
  pideTexto: "Texto que se mostrará",
  urlInvalida: "La dirección debe empezar por http://, https:// o mailto:",
  imagen: "🖼️ Insertar imagen",
  subiendoImagen: "Subiendo imagen...",
  imagenNoValida: "Solo se aceptan imágenes PNG, JPG o WEBP de hasta 10 MB.",
  errorImagen: "No se pudo subir la imagen",
  ayuda: "Puedes pegar capturas e imágenes (Ctrl+V) o arrastrarlas aquí, y pegar texto con enlaces desde una página, Word o un correo.",
};

/** Dibuja el texto guardado dentro del editor, con nodos del DOM (nunca innerHTML). */
function pintar(el: HTMLElement, texto: string) {
  el.replaceChildren(...nodosDeTexto(texto));
}

function nodosDeTexto(texto: string): Node[] {
  const nodos: Node[] = [];
  for (const f of fragmentarTexto(texto)) {
    if (f.tipo === "imagen") {
      nodos.push(crearImagen(f.url, f.alt));
    } else if (f.tipo === "enlace") {
      const a = document.createElement("a");
      a.href = f.url;
      a.textContent = f.texto;
      a.target = "_blank";
      a.rel = "noopener noreferrer nofollow";
      nodos.push(a);
    } else {
      f.texto.split("\n").forEach((linea, i) => {
        if (i > 0) nodos.push(document.createElement("br"));
        if (linea) nodos.push(document.createTextNode(linea));
      });
    }
  }
  return nodos;
}

function crearImagen(src: string, alt = "", ruta: string | null = src): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  if (ruta) img.setAttribute("data-ruta", ruta);
  img.contentEditable = "false";
  return img;
}

/**
 * Campo de texto enriquecido (editor visual). Se ve como el resultado final: enlaces e imagenes
 * dentro del texto. Por debajo se guarda en el formato de src/lib/texto-enriquecido.ts (texto
 * con [texto](url) e ![](ruta)), asi que lo que entra y sale por value/onChange sigue siendo texto.
 * - Pegar o arrastrar una imagen (captura, imagen copiada) la sube y la inserta donde esta el cursor.
 * - Pegar HTML (pagina web, Word, correo) conserva sus enlaces y las imagenes https; el resto
 *   del formato se descarta.
 * - Pegar una URL con texto seleccionado enlaza ese texto.
 */
export default function EditorTexto({
  value,
  onChange,
  rows = 3,
  placeholder,
  className = "",
  required,
  textos = TEXTOS_EDITOR_ES,
  urlSubirImagen = "/api/preguntas/imagenes",
  camposSubida,
}: {
  value: string;
  onChange: (valor: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  required?: boolean;
  textos?: TextosEditor;
  /** Endpoint que recibe la imagen (FormData "file") y responde { url }. */
  urlSubirImagen?: string;
  /** Campos extra que se mandan junto con la imagen (p. ej. preguntaId en el enlace externo). */
  camposSubida?: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const archivoRef = useRef<HTMLInputElement>(null);
  // Ultimo valor que salio del editor: si value cambia desde fuera (p. ej. se vacia al
  // publicar), se vuelve a pintar; si es el mismo que se emitio, no se toca (perderia el cursor).
  const emitido = useRef<string | null>(null);
  const rango = useRef<Range | null>(null);
  const [subiendo, setSubiendo] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === emitido.current) return;
    pintar(el, value);
    emitido.current = value;
  }, [value]);

  function emitir() {
    const el = ref.current;
    if (!el) return;
    const texto = nodosATexto(el);
    // Si quedo vacio, se limpia el <br> que deja el navegador para que se vea el placeholder.
    if (!texto && el.childNodes.length && !el.querySelector("img")) el.replaceChildren();
    emitido.current = texto;
    onChange(texto);
  }

  function guardarRango() {
    const sel = window.getSelection();
    const el = ref.current;
    if (el && sel && sel.rangeCount && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      rango.current = sel.getRangeAt(0).cloneRange();
    }
  }

  /** Rango donde insertar: la seleccion actual dentro del editor, la ultima guardada o el final. */
  function rangoActual(): Range {
    const el = ref.current!;
    const sel = window.getSelection();
    if (sel && sel.rangeCount && el.contains(sel.getRangeAt(0).commonAncestorContainer)) return sel.getRangeAt(0);
    if (rango.current && el.contains(rango.current.commonAncestorContainer)) return rango.current;
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    return r;
  }

  function insertarNodos(nodos: Node[], r: Range = rangoActual()) {
    r.deleteContents();
    const frag = document.createDocumentFragment();
    nodos.forEach((n) => frag.appendChild(n));
    const ultimo = frag.lastChild;
    r.insertNode(frag);
    if (ultimo) {
      r.setStartAfter(ultimo);
      r.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
      rango.current = r.cloneRange();
    }
    emitir();
  }

  async function subirImagenes(archivos: File[], r?: Range) {
    setError(null);
    const validos = archivos.filter((f) => IMAGEN_TIPOS_PERMITIDOS.includes(f.type) && f.size <= IMAGEN_MAX_BYTES);
    if (validos.length < archivos.length) setError(textos.imagenNoValida);
    if (!validos.length) return;

    // Se muestran al instante (vista local) y se reemplazan por la ruta definitiva al subir.
    const imagenes = validos.map((f) => {
      const img = crearImagen(URL.createObjectURL(f), "", null);
      img.setAttribute("data-subiendo", "");
      img.style.opacity = "0.5";
      return img;
    });
    insertarNodos(imagenes, r);
    setSubiendo((n) => n + validos.length);

    await Promise.all(
      validos.map(async (archivo, i) => {
        const img = imagenes[i];
        const formData = new FormData();
        formData.set("file", archivo);
        for (const [k, v] of Object.entries(camposSubida ?? {})) formData.set(k, v);
        const res = await fetch(urlSubirImagen, { method: "POST", body: formData }).catch(() => null);
        const data = (await res?.json().catch(() => ({}))) ?? {};
        const url = res?.ok && typeof data.url === "string" ? urlImagenSegura(data.url) : null;
        URL.revokeObjectURL(img.src);
        if (url) {
          img.src = url;
          img.setAttribute("data-ruta", url);
          img.removeAttribute("data-subiendo");
          img.style.opacity = "";
        } else {
          img.remove();
          setError(`${textos.errorImagen}${data.error ? `: ${data.error}` : ""}`);
        }
        setSubiendo((n) => n - 1);
        emitir();
      }),
    );
  }

  function alPegar(e: React.ClipboardEvent<HTMLDivElement>) {
    // Siempre se pega "a mano": asi no entran estilos ni HTML ajeno al editor.
    e.preventDefault();
    const datos = e.clipboardData;
    const imagenes = Array.from(datos.files).filter((f) => f.type.startsWith("image/"));
    const html = datos.getData("text/html");
    const plano = datos.getData("text/plain");

    // Captura de pantalla o imagen copiada (sin texto que acompane).
    if (imagenes.length && !plano.trim()) return void subirImagenes(imagenes);

    const r = rangoActual();
    const seleccionado = r.toString();
    const url = urlSegura(plano.trim());
    if (url && !/\s/.test(plano.trim()) && seleccionado.trim()) {
      const a = document.createElement("a");
      a.href = url;
      a.textContent = seleccionado;
      a.target = "_blank";
      a.rel = "noopener noreferrer nofollow";
      return insertarNodos([a], r);
    }
    const texto = html ? htmlATexto(html) || plano : plano;
    insertarNodos(nodosDeTexto(texto.replace(/\r\n?/g, "\n")), r);
  }

  function alSoltar(e: React.DragEvent<HTMLDivElement>) {
    const imagenes = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!imagenes.length) return;
    e.preventDefault();
    // Inserta donde se solto la imagen (si el navegador lo informa).
    const doc = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null };
    const r = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
    void subirImagenes(imagenes, r && ref.current?.contains(r.commonAncestorContainer) ? r : undefined);
  }

  function insertarEnlace() {
    guardarRango();
    const r = rangoActual().cloneRange();
    const url = urlSegura(prompt(textos.pideUrl, "https://") ?? "");
    if (!url) return alert(textos.urlInvalida);
    const texto = r.toString() || prompt(textos.pideTexto, "") || url;
    const a = document.createElement("a");
    a.href = url;
    a.textContent = texto;
    a.target = "_blank";
    a.rel = "noopener noreferrer nofollow";
    ref.current?.focus();
    insertarNodos([a], r);
  }

  const vacio = !value.trim() && subiendo === 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-placeholder={placeholder}
          onInput={emitir}
          onPaste={alPegar}
          onDrop={alSoltar}
          onKeyUp={guardarRango}
          onMouseUp={guardarRango}
          onBlur={guardarRango}
          style={{ minHeight: `${rows * 1.5 + 1}rem` }}
          className={`${className} overflow-auto break-words whitespace-pre-wrap [&_a]:text-sky-700 [&_a]:underline dark:[&_a]:text-sky-400 [&_img]:my-1 [&_img]:block [&_img]:max-h-72 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-zinc-200 dark:[&_img]:border-zinc-700`}
        />
        {vacio && placeholder && <span className="pointer-events-none absolute left-3 top-2 text-sm text-zinc-400 dark:text-zinc-500">{placeholder}</span>}
        {/* contentEditable no participa en la validacion del formulario: este campo oculto si. */}
        {required && (
          <input
            tabIndex={-1}
            aria-hidden
            required
            value={value}
            onChange={() => {}}
            onFocus={() => ref.current?.focus()}
            className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertarEnlace}
          className="rounded-full border border-zinc-300 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {textos.enlace}
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            guardarRango();
          }}
          onClick={() => archivoRef.current?.click()}
          className="rounded-full border border-zinc-300 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {textos.imagen}
        </button>
        <input
          ref={archivoRef}
          type="file"
          accept={IMAGEN_TIPOS_PERMITIDOS.join(",")}
          multiple
          hidden
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (archivos.length) void subirImagenes(archivos);
          }}
        />
        {subiendo > 0 ? <span className="text-sky-700 dark:text-sky-400">{textos.subiendoImagen}</span> : <span>{textos.ayuda}</span>}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
