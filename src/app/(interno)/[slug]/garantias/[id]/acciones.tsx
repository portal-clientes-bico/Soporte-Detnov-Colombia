"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import type { Garantia, SoporteGarantiaEstado } from "@/lib/db";
import { GARANTIA_ESTADOS, GARANTIA_ESTADO_VALUES } from "@/lib/tipos";
import EditorTexto from "../../../../editor-texto";
import GarantiaForm, { inputClass } from "../garantia-form";

type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];
type Usuario = Awaited<ReturnType<typeof getUsuarios>>[number];

/** Muestra la ficha (children, armada en el servidor) o, al pulsar Editar, el formulario. */
export function FichaEditable({
  slug,
  garantia,
  referencias,
  usuarios,
  children,
}: {
  slug: string;
  garantia: Garantia;
  referencias: Referencia[];
  usuarios: Usuario[];
  children: React.ReactNode;
}) {
  const [editando, setEditando] = useState(false);
  if (editando) {
    return <GarantiaForm slug={slug} marcaId={garantia.marcaId} garantia={garantia} referencias={referencias} usuarios={usuarios} onCancelar={() => setEditando(false)} />;
  }
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="self-start rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        ✏️ Editar datos
      </button>
      {children}
    </div>
  );
}

/** Siguiente paso habitual del flujo, para ofrecerlo primero en la lista de estados. */
const SIGUIENTE: Record<SoporteGarantiaEstado, SoporteGarantiaEstado> = {
  BORRADOR: "ENVIADA",
  ENVIADA: "EN_REVISION",
  EN_REVISION: "APROBADA",
  INFO_SOLICITADA: "EN_REVISION",
  APROBADA: "CERRADA",
  RECHAZADA: "CERRADA",
  CERRADA: "CERRADA",
};

/** Agregar a la bitacora: un comentario, o un cambio de estado con su comentario. */
export function NuevoEvento({ garantiaId, estadoActual }: { garantiaId: string; estadoActual: SoporteGarantiaEstado }) {
  const router = useRouter();
  const [estado, setEstado] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar() {
    setGuardando(true);
    setError(null);
    const res = await fetch(`/api/garantias/${encodeURIComponent(garantiaId)}/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estado || undefined, texto }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) ?? {};
    setGuardando(false);
    if (!res?.ok) return setError(data.error ?? "No se pudo guardar");
    setEstado("");
    setTexto("");
    router.refresh();
  }

  const sugerido = SIGUIENTE[estadoActual];
  const opciones = [sugerido, ...GARANTIA_ESTADO_VALUES.filter((e) => e !== sugerido)].filter((e) => e !== estadoActual);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">Cambiar estado a</span>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
          <option value="">— solo comentar —</option>
          {opciones.map((e) => (
            <option key={e} value={e}>
              {GARANTIA_ESTADOS[e]}
              {e === sugerido ? " (siguiente paso)" : ""}
            </option>
          ))}
        </select>
      </div>
      <EditorTexto
        value={texto}
        onChange={setTexto}
        rows={2}
        className={inputClass}
        placeholder={estado ? "Comentario del cambio (opcional): respuesta del fabricante, guía, etc." : "Escribe un comentario, pega una captura o un enlace..."}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={enviar}
        disabled={guardando || (!estado && !texto.trim())}
        className="self-start rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {guardando ? "Guardando..." : estado ? `Cambiar a «${GARANTIA_ESTADOS[estado as SoporteGarantiaEstado]}»` : "Agregar comentario"}
      </button>
    </div>
  );
}

export function BorrarGarantia({ garantiaId, numero, slug }: { garantiaId: string; numero: string; slug: string }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);
  async function borrar() {
    if (!confirm(`¿Borrar la garantía ${numero}? No se puede deshacer.`)) return;
    setBorrando(true);
    const res = await fetch(`/api/garantias/${encodeURIComponent(garantiaId)}`, { method: "DELETE" }).catch(() => null);
    setBorrando(false);
    if (!res?.ok) return alert("No se pudo borrar la garantía");
    router.push(`/${slug}/garantias`);
    router.refresh();
  }
  return (
    <button type="button" onClick={borrar} disabled={borrando} className="text-sm text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
      {borrando ? "Borrando..." : "Borrar garantía"}
    </button>
  );
}
