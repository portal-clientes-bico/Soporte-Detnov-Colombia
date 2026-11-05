import { fragmentarTexto } from "@/lib/texto-enriquecido";

/** Muestra texto enriquecido (saltos de linea, hipervinculos [texto](url), URL sueltas e
 * imagenes ![](ruta)). Se arma con elementos de React, nunca con HTML crudo. Cada imagen abre
 * en tamano completo en otra pestana. */
export default function TextoEnriquecido({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <div className={`whitespace-pre-line break-words ${className}`}>
      {fragmentarTexto(texto).map((f, i) =>
        f.tipo === "imagen" ? (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="my-1 block w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.alt} loading="lazy" className="max-h-96 max-w-full rounded-md border border-zinc-200 dark:border-zinc-700" />
          </a>
        ) : f.tipo === "enlace" ? (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-700 underline hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">
            {f.texto}
          </a>
        ) : (
          <span key={i}>{f.texto}</span>
        ),
      )}
    </div>
  );
}
