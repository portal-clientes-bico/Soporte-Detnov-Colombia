"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EnlaceExterno, IdiomaVista, SoportePreguntaEstado } from "@/lib/db";
import { IDIOMAS, IDIOMA_VALUES } from "@/lib/idioma";
import BanderaIdioma from "../../../bandera-idioma";

/**
 * Enlace de la pregunta para funcionarios de la fabrica: entran sin usuario ni contraseña a
 * /responder/<token>, ven la pregunta en su idioma y pueden responder y adjuntar documentos.
 * Se copia en el idioma que se quiera (?lang=), se comparte por WhatsApp o se revoca.
 *
 * Copiar, Abrir y WhatsApp no arman la direccion con lo que tenga pintado la pagina: piden al
 * servidor el enlace vigente de ESTA pregunta (por su id) en el momento del clic, asi nunca se
 * entrega un token viejo o de otra tarjeta. Si la pregunta sigue en Borrador, ofrece publicarla
 * antes, porque la fabrica no puede ver borradores.
 */
export default function EnlaceFabrica({
  preguntaId,
  titulo,
  estado,
  enlace,
}: {
  preguntaId: string;
  titulo: string;
  estado: SoportePreguntaEstado;
  enlace: EnlaceExterno | null | undefined;
}) {
  const router = useRouter();
  const [origen, setOrigen] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState<IdiomaVista | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setOrigen(window.location.origin), []);

  function armarUrl(token: string, idioma: IdiomaVista): string {
    const u = new URL(`/responder/${encodeURIComponent(token)}`, window.location.origin);
    u.searchParams.set("lang", idioma);
    return u.toString();
  }

  /** Direccion vigente del enlace de esta pregunta, confirmada con el servidor (null = no se
   * pudo o se cancelo; el motivo queda en error). */
  async function urlVigente(idioma: IdiomaVista): Promise<string | null> {
    setError(null);
    const res = await fetch(`/api/preguntas/${encodeURIComponent(preguntaId)}/enlace`, { cache: "no-store" }).catch(() => null);
    const data = (await res?.json().catch(() => null)) ?? null;
    if (!res?.ok || data?.preguntaId !== preguntaId) {
      setError("No se pudo leer el enlace de esta pregunta. Recarga la página e intenta de nuevo.");
      return null;
    }
    const token: string | undefined = data.enlace?.token;
    if (!token) {
      setError("Esta pregunta ya no tiene enlace (fue revocado). Genera uno nuevo.");
      router.refresh();
      return null;
    }
    if (token !== enlace?.token) router.refresh(); // la pagina estaba desactualizada
    if (data.estado === "BORRADOR") {
      if (!confirm("Esta pregunta está en Borrador: la fábrica no podrá verla. ¿Publicarla ahora?")) return null;
      const pub = await fetch(`/api/preguntas/${encodeURIComponent(preguntaId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "ABIERTA" }),
      }).catch(() => null);
      if (!pub?.ok) {
        setError("No se pudo publicar la pregunta.");
        return null;
      }
      router.refresh();
    }
    return armarUrl(token, idioma);
  }

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
    const pendiente = urlVigente(idioma);
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        // Se entrega al portapapeles una promesa: asi Safari no rechaza la copia por haber
        // esperado la respuesta del servidor despues del clic.
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": pendiente.then((url) => {
              if (!url) throw new Error("sin enlace");
              return new Blob([url], { type: "text/plain" });
            }),
          }),
        ]);
      } else {
        const url = await pendiente;
        if (!url) return;
        await navigator.clipboard.writeText(url);
      }
      setCopiado(idioma);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Si fallo por no haber enlace, urlVigente ya dejo el motivo en error.
      if (await pendiente) setError("No se pudo copiar; usa Abrir y copia la dirección del navegador.");
    }
  }

  /** Abre una pestana al instante (si se abre despues de esperar al servidor, el navegador la
   * bloquea) y la lleva a la direccion confirmada. */
  async function abrirEn(destino: (url: string) => string, idioma: IdiomaVista) {
    const ventana = window.open("about:blank", "_blank");
    const url = await urlVigente(idioma);
    if (!url) return void ventana?.close();
    if (ventana) {
      ventana.opener = null;
      ventana.location.href = destino(url);
    } else window.location.href = destino(url);
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
      {estado !== "ABIERTA" && (
        <p className="rounded-md bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          {estado === "BORRADOR"
            ? "Esta pregunta está en Borrador: quien abra el enlace no podrá verla hasta que la publiques."
            : "Esta pregunta está Cerrada: el enlace la muestra, pero ya no se puede responder."}
        </p>
      )}
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
        <button
          type="button"
          onClick={() => abrirEn((url) => `https://wa.me/?text=${encodeURIComponent(`${titulo}\n${url}`)}`, "en")}
          disabled={!origen}
          className="rounded-full bg-[#25D366] px-2.5 py-0.5 font-medium text-white hover:bg-[#1ebe5b]"
        >
          WhatsApp
        </button>
        <button type="button" onClick={() => abrirEn((url) => url, "es")} disabled={!origen} className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Abrir
        </button>
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
