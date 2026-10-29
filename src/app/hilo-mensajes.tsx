import type { MensajePregunta } from "@/lib/db";
import TextoEnriquecido from "./texto-enriquecido";

export interface TextosHilo {
  respuesta: string;
  contrapregunta: string;
  equipo: string;
  fabrica: string;
  sinMensajes: string;
}

/** Hilo de respuestas y contrapreguntas de una pregunta, en orden de fecha. Lo usan la vista
 * interna y la pagina del enlace de la fabrica; "traducido" da el texto en el idioma de vista. */
export default function HiloMensajes({
  mensajes,
  textos,
  traducido,
  locale,
  onBorrar,
}: {
  mensajes: MensajePregunta[];
  textos: TextosHilo;
  traducido?: (m: MensajePregunta) => string | null;
  locale: string;
  onBorrar?: (m: MensajePregunta) => void;
}) {
  if (mensajes.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">{textos.sinMensajes}</p>;

  return (
    <ol className="flex flex-col gap-2">
      {mensajes.map((m) => {
        const contra = m.tipo === "CONTRAPREGUNTA";
        return (
          <li
            key={m.id}
            className={`rounded-lg border-l-4 p-3 text-sm ${
              contra ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : "border-emerald-400 bg-zinc-50 dark:bg-zinc-800/60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{m.autor}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 ${
                  m.origen === "EXTERNO" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" : "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300"
                }`}
              >
                {m.origen === "EXTERNO" ? textos.fabrica : textos.equipo}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 ${
                  contra ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
              >
                {contra ? textos.contrapregunta : textos.respuesta}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">{new Date(m.fecha).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}</span>
              {onBorrar && (
                <button type="button" onClick={() => onBorrar(m)} className="ml-auto text-zinc-400 hover:text-red-600 dark:hover:text-red-400" title="Borrar mensaje">
                  ×
                </button>
              )}
            </div>
            <TextoEnriquecido texto={traducido?.(m) ?? m.texto} className="mt-1 text-zinc-700 dark:text-zinc-300" />
          </li>
        );
      })}
    </ol>
  );
}
