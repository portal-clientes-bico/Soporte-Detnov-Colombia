import { fragmentarTexto } from "@/lib/texto-enriquecido";

/** Muestra texto enriquecido (saltos de linea + hipervinculos [texto](url) y URL sueltas).
 * Se arma con elementos de React, nunca con HTML crudo. */
export default function TextoEnriquecido({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <p className={`whitespace-pre-line break-words ${className}`}>
      {fragmentarTexto(texto).map((f, i) =>
        f.tipo === "enlace" ? (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-700 underline hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">
            {f.texto}
          </a>
        ) : (
          <span key={i}>{f.texto}</span>
        ),
      )}
    </p>
  );
}
