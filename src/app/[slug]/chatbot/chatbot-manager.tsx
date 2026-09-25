"use client";

import { useState } from "react";
import type { UsoChatbot } from "@/lib/db";

interface Turno {
  pregunta: string;
  respuesta: string | null;
  error: string | null;
  loading: boolean;
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** Separa la respuesta del modelo en cuerpo + seccion de fuentes, si viene marcada como tal. */
function separarFuentes(respuesta: string): { cuerpo: string; fuentes: string | null } {
  const marcador = /fuentes utilizadas:/i;
  const match = respuesta.search(marcador);
  if (match === -1) return { cuerpo: respuesta, fuentes: null };
  return { cuerpo: respuesta.slice(0, match).trim(), fuentes: respuesta.slice(match).trim() };
}

export default function ChatbotManager({ slug, usoInicial }: { slug: string; usoInicial: UsoChatbot }) {
  const [pregunta, setPregunta] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [uso, setUso] = useState(usoInicial);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texto = pregunta.trim();
    if (!texto) return;
    setPregunta("");
    const indice = turnos.length;
    setTurnos((prev) => [...prev, { pregunta: texto, respuesta: null, error: null, loading: true }]);

    const res = await fetch(`/api/marcas/${slug}/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta: texto }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.uso) setUso(data.uso);

    setTurnos((prev) => {
      const copia = [...prev];
      copia[indice] = res.ok
        ? { pregunta: texto, respuesta: data.respuesta, error: null, loading: false }
        : { pregunta: texto, respuesta: null, error: data.error ?? "No se pudo obtener respuesta", loading: false };
      return copia;
    });
  }

  const totalTokens = uso.totalInputTokens + uso.totalOutputTokens;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Pregunta en lenguaje natural sobre esta marca. El ChatBot responde solo con base en las referencias registradas, los documentos con confianza{" "}
        <span className="font-medium">confirmado</span> y las preguntas de soporte ya cerradas — y cita al final que uso.
      </p>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
        title="Conteo propio de uso dentro de esta herramienta, no el saldo real de la cuenta de Anthropic (eso solo se ve en console.anthropic.com)."
      >
        <span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{uso.totalPreguntas.toLocaleString("es-CO")}</span> pregunta(s) realizada(s)
        </span>
        <span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{totalTokens.toLocaleString("es-CO")}</span> tokens consumidos ({uso.totalInputTokens.toLocaleString("es-CO")} entrada · {uso.totalOutputTokens.toLocaleString("es-CO")} salida)
          {uso.totalCacheReadTokens > 0 && <> · {uso.totalCacheReadTokens.toLocaleString("es-CO")} leidos de cache (mas barato)</>}
        </span>
        <span className="text-zinc-400 dark:text-zinc-500">Consumo estimado local, no el saldo de la cuenta</span>
      </div>

      {turnos.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Aun no has hecho ninguna pregunta. Ejemplo: &quot;¿Qué paneles admiten liberación de agente extintor?&quot;
        </p>
      )}

      <div className="flex flex-col gap-4">
        {turnos.map((t, i) => {
          const partes = t.respuesta ? separarFuentes(t.respuesta) : null;
          return (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">🧑 {t.pregunta}</p>
              {t.loading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Consultando...</p>}
              {t.error && <p className="text-sm text-red-600 dark:text-red-400">{t.error}</p>}
              {partes && (
                <div className="flex flex-col gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{partes.cuerpo}</p>
                  {partes.fuentes && (
                    <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-2 text-xs text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">{partes.fuentes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Escribe tu pregunta..."
          rows={2}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!pregunta.trim()}
          className="self-end rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Preguntar
        </button>
      </form>
    </div>
  );
}
