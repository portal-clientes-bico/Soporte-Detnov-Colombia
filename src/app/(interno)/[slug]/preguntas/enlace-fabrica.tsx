"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EnlaceExterno, IdiomaVista } from "@/lib/db";
import { IDIOMAS, IDIOMA_VALUES } from "@/lib/idioma";
import BanderaIdioma from "../../../bandera-idioma";

/**
 * Enlace de la pregunta para funcionarios de la fabrica: entran sin usuario ni contraseña a
 * /responder/<token>, ven la pregunta en su idioma y pueden responder y adjuntar documentos.
 * Se copia en el idioma que se quiera (?lang=), se comparte por WhatsApp o se revoca.
 */
export default function EnlaceFabrica({ preguntaId, titulo, enlace }: { preguntaId: string; titulo: string; enlace: EnlaceExterno | null | undefined }) {
  const router = useRouter();
  const [origen, setOrigen] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState<IdiomaVista | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setOrigen(window.location.origin), []);

  const url = (idioma: IdiomaVista) => (enlace ? `${origen}/responder/${enlace.token}?lang=${idioma}` : "");

  async function generar() {
    if (enlace && !confirm("¿Generar un enlace nuevo? El enlace anterior dejará de funcionar.")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/preguntas/${encodeURIComponent(preguntaId)}/enlace`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return setError("No se pudo generar el enlace");
    router.refresh();
  }

  async function revocar() {
    if (!confirm("¿Revocar el enlace? Quien lo tenga ya no podrá entrar a la pregunta.")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/preguntas/${encodeURIComponent(preguntaId)}/enlace`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return setError("No se pudo revocar el enlace");
    router.refresh();
  }

  async function copiar(idioma: IdiomaVista) {
    try {
      await navigator.clipboard.writeText(url(idioma));
      setCopiado(idioma);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setError("No se pudo copiar; abre el enlace y copia la dirección del navegador.");
    }
  }

  if (!enlace) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={generar} disabled={loading} className="self-start text-xs text-zinc-500 underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-zinc-50">
          🔗 {loading ? "Generando..." : "Generar enlace para fábrica"}
        </button>
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-sky-200 bg-sky-50/60 p-3 text-xs dark:border-sky-900/50 dark:bg-sky-950/20">
      <p className="font-medium text-sky-900 dark:text-sky-200">🔗 Enlace para fábrica — sin usuario ni contraseña</p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Quien tenga el enlace puede ver la pregunta, responderla y adjuntar documentos. Copia el enlace en el idioma de quien lo recibe.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {IDIOMA_VALUES.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => copiar(i)}
            disabled={!origen}
            className="flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <BanderaIdioma idioma={i} className="h-2.5 w-[15px] rounded-[1px]" />
            {copiado === i ? "¡Copiado!" : `Copiar (${IDIOMAS[i].corto})`}
          </button>
        ))}
        <a
          href={origen ? `https://wa.me/?text=${encodeURIComponent(`${titulo}\n${url("en")}`)}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] px-2.5 py-0.5 font-medium text-white hover:bg-[#1ebe5b]"
        >
          WhatsApp
        </a>
        <a href={origen ? url("es") : "#"} target="_blank" rel="noopener noreferrer" className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Abrir
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
        <span>
          Creado {enlace.creadoPor ? `por ${enlace.creadoPor} ` : ""}el {new Date(enlace.creadoEn).toLocaleDateString("es-CO", { dateStyle: "medium" })}
        </span>
        <button type="button" onClick={generar} disabled={loading} className="underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-zinc-50">
          Generar uno nuevo
        </button>
        <button type="button" onClick={revocar} disabled={loading} className="text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
          Revocar
        </button>
      </div>
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
