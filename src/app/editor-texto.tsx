"use client";

import { useRef } from "react";
import { enlaceMarkdown, htmlATexto, tieneEnlaces, urlSegura } from "@/lib/texto-enriquecido";
import TextoEnriquecido from "./texto-enriquecido";

export interface TextosEditor {
  enlace: string;
  pideUrl: string;
  pideTexto: string;
  urlInvalida: string;
  vistaPrevia: string;
  ayuda: string;
}

export const TEXTOS_EDITOR_ES: TextosEditor = {
  enlace: "🔗 Insertar enlace",
  pideUrl: "Dirección del enlace (https://...)",
  pideTexto: "Texto que se mostrará",
  urlInvalida: "La dirección debe empezar por http://, https:// o mailto:",
  vistaPrevia: "Vista previa",
  ayuda: "Puedes pegar texto con enlaces desde una página, Word o un correo; o seleccionar una palabra y pegar encima una URL.",
};

/**
 * Campo de texto enriquecido: un textarea normal donde los hipervinculos quedan como
 * [texto](url). Al pegar HTML (pagina web, Word, correo) conserva sus enlaces; al pegar una URL
 * con texto seleccionado, enlaza ese texto; y el boton "Insertar enlace" enlaza la seleccion.
 * Debajo muestra una vista previa cuando hay enlaces.
 */
export default function EditorTexto({
  value,
  onChange,
  rows = 3,
  placeholder,
  className = "",
  required,
  textos = TEXTOS_EDITOR_ES,
}: {
  value: string;
  onChange: (valor: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  required?: boolean;
  textos?: TextosEditor;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function reemplazarSeleccion(insertar: string) {
    const el = ref.current;
    if (!el) return onChange(value + insertar);
    const { selectionStart: ini, selectionEnd: fin } = el;
    onChange(value.slice(0, ini) + insertar + value.slice(fin));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + insertar.length, ini + insertar.length);
    });
  }

  function seleccion(): string {
    const el = ref.current;
    return el ? value.slice(el.selectionStart, el.selectionEnd) : "";
  }

  function insertarEnlace() {
    const url = urlSegura(prompt(textos.pideUrl, "https://") ?? "");
    if (!url) return alert(textos.urlInvalida);
    const texto = seleccion() || prompt(textos.pideTexto, "") || url;
    reemplazarSeleccion(enlaceMarkdown(texto, url));
  }

  function alPegar(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const html = e.clipboardData.getData("text/html");
    const plano = e.clipboardData.getData("text/plain");
    const seleccionado = seleccion();
    const url = urlSegura(plano.trim());
    if (url && !/\s/.test(plano.trim()) && seleccionado.trim()) {
      e.preventDefault();
      return reemplazarSeleccion(enlaceMarkdown(seleccionado, url));
    }
    if (html && /<a\s[^>]*href/i.test(html)) {
      const convertido = htmlATexto(html);
      if (convertido) {
        e.preventDefault();
        reemplazarSeleccion(convertido);
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={alPegar}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <button type="button" onClick={insertarEnlace} className="rounded-full border border-zinc-300 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          {textos.enlace}
        </button>
        <span>{textos.ayuda}</span>
      </div>
      {tieneEnlaces(value) && (
        <div className="rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{textos.vistaPrevia}</p>
          <TextoEnriquecido texto={value} className="text-zinc-700 dark:text-zinc-300" />
        </div>
      )}
    </div>
  );
}
