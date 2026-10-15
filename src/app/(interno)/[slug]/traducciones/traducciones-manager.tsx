"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getTraduccionesDeMarca } from "@/lib/queries";
import { ARCHIVO_MAX_BYTES, DOCUMENTO_TIPOS, ESTADOS_TRADUCCION, ESTADO_TRADUCCION_VALUES } from "@/lib/tipos";
import { IconoTipoDocumento } from "../documentos/documentos-manager";

type Entrada = Awaited<ReturnType<typeof getTraduccionesDeMarca>>[number];
type Traduccion = Entrada["traducciones"][number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** Mismo glifo/SVG que documentos-manager.tsx y preguntas-manager.tsx -- ver la nota ahi sobre
 * por que un SVG y no el caracter unicode "▶". */
function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M5 3l6 5-6 5V3z" />
    </svg>
  );
}

/** Tonos tenues, mismo criterio que prioridadCardClass en preguntas-manager.tsx: gris para un
 * borrador (todavia no hay nada que revisar), ambar mientras esta en revision, esmeralda una
 * vez aprobado. */
const estadoBadge: Record<string, string> = {
  BORRADOR: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  EN_REVISION: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  APROBADO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function archivoUrl(archivoPath: string | null): string | null {
  return archivoPath ? `/api/archivos/${archivoPath}` : null;
}

function FilaTraduccion({ traduccion }: { traduccion: Traduccion }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const url = archivoUrl(traduccion.archivoPath);

  async function handleCambiarEstado(nuevoEstado: string) {
    setLoading(true);
    await fetch(`/api/documentos/${encodeURIComponent(traduccion.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoTraduccion: nuevoEstado }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleBorrar() {
    if (!confirm(`¿Borrar esta traduccion ("${traduccion.titulo}")?`)) return;
    setLoading(true);
    await fetch(`/api/documentos/${encodeURIComponent(traduccion.id)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/30">
      <span className={`rounded-full px-2 py-0.5 ${estadoBadge[traduccion.estadoTraduccion ?? "BORRADOR"]}`}>
        {ESTADOS_TRADUCCION[traduccion.estadoTraduccion ?? "BORRADOR"]}
      </span>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
          Archivo {traduccion.archivoNombre ? `(${traduccion.archivoNombre})` : ""}
        </a>
      ) : (
        <span className="italic text-zinc-400 dark:text-zinc-500">Sin archivo</span>
      )}
      <select
        value={traduccion.estadoTraduccion ?? "BORRADOR"}
        onChange={(e) => handleCambiarEstado(e.target.value)}
        disabled={loading}
        className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {ESTADO_TRADUCCION_VALUES.map((e) => (
          <option key={e} value={e}>
            {ESTADOS_TRADUCCION[e]}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleBorrar} disabled={loading} className="text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
        Borrar
      </button>
    </div>
  );
}

function SubirTraduccionForm({ original, abierta }: { original: Entrada["original"]; abierta: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(abierta);
  const [titulo, setTitulo] = useState(original.titulo);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
        + Agregar otra traduccion
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!archivo) {
      setError("Selecciona el archivo traducido.");
      return;
    }
    if (archivo.size > ARCHIVO_MAX_BYTES) {
      setError(`El archivo supera el maximo de ${ARCHIVO_MAX_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("marcaId", original.marcaId);
    formData.set("tipo", original.tipo);
    formData.set("titulo", titulo);
    formData.set("codigo", original.codigo ?? "");
    formData.set("idioma", "ES");
    formData.set("confianza", "CONFIRMADO");
    formData.set("traduccionDeId", original.id);
    formData.set("estadoTraduccion", "BORRADOR");
    formData.set("file", archivo);

    const res = await fetch("/api/documentos", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo subir la traduccion");
      return;
    }
    setArchivo(null);
    setInputKey((k) => k + 1);
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <label className="block text-xs text-zinc-600 dark:text-zinc-400">Titulo (en español)</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-zinc-600 dark:text-zinc-400">Archivo traducido</label>
        <input
          key={inputKey}
          type="file"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700"
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Subiendo..." : "Subir traduccion"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EntradaCard({ entrada }: { entrada: Entrada }) {
  const { original, traducciones } = entrada;
  const urlOriginal = archivoUrl(original.archivoPath);
  return (
    <details className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 select-none marker:content-none">
        <span className="inline-block shrink-0 text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
          <Chevron />
        </span>
        <IconoTipoDocumento tipo={original.tipo} />
        <p className="font-medium">{original.titulo}</p>
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {DOCUMENTO_TIPOS[original.tipo]}
          {original.codigo ? ` · ${original.codigo}` : ""}
        </p>
        {urlOriginal ? (
          <a
            href={urlOriginal}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Ver documento en ingles {original.archivoNombre ? `(${original.archivoNombre})` : ""}
          </a>
        ) : (
          <p className="text-xs italic text-zinc-400 dark:text-zinc-500">Documento en ingles sin archivo cargado</p>
        )}
        <div className="flex flex-col gap-1.5">
          {traducciones.map((t) => (
            <FilaTraduccion key={t.id} traduccion={t} />
          ))}
        </div>
        <SubirTraduccionForm original={original} abierta={traducciones.length === 0} />
      </div>
    </details>
  );
}

export default function TraduccionesManager({ entradas }: { entradas: Entrada[] }) {
  const conTraduccion = entradas.filter((e) => e.traducciones.length > 0);
  const sinTraduccion = entradas.filter((e) => e.traducciones.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <details open className="group rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 select-none marker:content-none">
          <span className="flex items-center gap-2 font-medium">
            <span className="inline-block text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
              <Chevron />
            </span>
            Con traduccion
          </span>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{conTraduccion.length}</span>
        </summary>
        <div className="flex flex-col gap-3 p-4 pt-0">
          {conTraduccion.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ningun documento tiene traduccion todavia.</p>
          ) : (
            conTraduccion.map((e) => <EntradaCard key={e.original.id} entrada={e} />)
          )}
        </div>
      </details>

      <details className="group rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 select-none marker:content-none">
          <span className="flex items-center gap-2 font-medium">
            <span className="inline-block text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
              <Chevron />
            </span>
            Sin traduccion
          </span>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{sinTraduccion.length}</span>
        </summary>
        <div className="flex flex-col gap-3 p-4 pt-0">
          {sinTraduccion.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Todos los documentos en ingles ya tienen traduccion.</p>
          ) : (
            sinTraduccion.map((e) => <EntradaCard key={e.original.id} entrada={e} />)
          )}
        </div>
      </details>
    </div>
  );
}
