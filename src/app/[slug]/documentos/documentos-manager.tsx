"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getDocumentosDeMarca, getFuentesDeMarca, getReferenciasDeMarca } from "@/lib/queries";
import { ARCHIVO_MAX_BYTES, CONFIANZAS, CONFIANZA_VALUES, DOCUMENTO_TIPO_VALUES, DOCUMENTO_TIPOS, IDIOMAS, IDIOMA_VALUES } from "@/lib/tipos";

type Documento = Awaited<ReturnType<typeof getDocumentosDeMarca>>[number];
type Fuente = Awaited<ReturnType<typeof getFuentesDeMarca>>[number];
type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** El glifo unicode "▶" se renderiza en algunos navegadores/fuentes con su propio color de
 * emoji, ignorando el CSS "color". Un SVG con fill="currentColor" si respeta el color de
 * texto heredado (ver el mismo problema en preguntas-manager.tsx). */
function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M5 3l6 5-6 5V3z" />
    </svg>
  );
}

const confianzaBadge: Record<string, string> = {
  CONFIRMADO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  PROBABLE: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

function archivoUrl(archivoPath: string | null): string | null {
  return archivoPath ? `/api/archivos/${archivoPath}` : null;
}

function CamposDocumento({
  valores,
  onChange,
  fuentes,
}: {
  valores: { tipo: string; titulo: string; codigo: string; revision: string; fechaEmision: string; idioma: string; fuenteId: string; urlOrigen: string; confianza: string; notas: string };
  onChange: (campo: string, valor: string) => void;
  fuentes: Fuente[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Tipo</label>
        <select value={valores.tipo} onChange={(e) => onChange("tipo", e.target.value)} className={inputClass}>
          {DOCUMENTO_TIPO_VALUES.map((t) => (
            <option key={t} value={t}>
              {DOCUMENTO_TIPOS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Titulo</label>
        <input value={valores.titulo} onChange={(e) => onChange("titulo", e.target.value)} required minLength={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Codigo (ej. DOC-12105)</label>
        <input value={valores.codigo} onChange={(e) => onChange("codigo", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Revision</label>
        <input value={valores.revision} onChange={(e) => onChange("revision", e.target.value)} placeholder="Rev 0.2" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Fecha de emision</label>
        <input value={valores.fechaEmision} onChange={(e) => onChange("fechaEmision", e.target.value)} placeholder="06/2025" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Idioma</label>
        <select value={valores.idioma} onChange={(e) => onChange("idioma", e.target.value)} className={inputClass}>
          {IDIOMA_VALUES.map((i) => (
            <option key={i} value={i}>
              {IDIOMAS[i]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Fuente</label>
        <select value={valores.fuenteId} onChange={(e) => onChange("fuenteId", e.target.value)} className={inputClass}>
          <option value="">Sin fuente</option>
          {fuentes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Confianza</label>
        <select value={valores.confianza} onChange={(e) => onChange("confianza", e.target.value)} className={inputClass}>
          {CONFIANZA_VALUES.map((c) => (
            <option key={c} value={c}>
              {CONFIANZAS[c].label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">URL de origen (pagina del fabricante, UL, etc.)</label>
        <input value={valores.urlOrigen} onChange={(e) => onChange("urlOrigen", e.target.value)} placeholder="https://..." className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Notas</label>
        <textarea value={valores.notas} onChange={(e) => onChange("notas", e.target.value)} rows={2} className={inputClass} />
      </div>
    </div>
  );
}

function valoresIniciales() {
  return { tipo: "DATASHEET", titulo: "", codigo: "", revision: "", fechaEmision: "", idioma: "EN", fuenteId: "", urlOrigen: "", confianza: "PENDIENTE", notas: "" };
}

function NuevoDocumentoForm({ marcaId, fuentes, referencias }: { marcaId: string; fuentes: Fuente[]; referencias: Referencia[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState(valoresIniciales());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [productos, setProductos] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nuevo documento
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (archivo && archivo.size > ARCHIVO_MAX_BYTES) {
      setError(`El archivo supera el maximo de ${ARCHIVO_MAX_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("marcaId", marcaId);
    for (const [k, v] of Object.entries(valores)) formData.set(k, v);
    if (archivo) formData.set("file", archivo);
    for (const p of productos) formData.append("productos", p);

    const res = await fetch("/api/documentos", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el documento");
      return;
    }
    setValores(valoresIniciales());
    setArchivo(null);
    setProductos([]);
    setInputKey((k) => k + 1);
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nuevo documento</p>
      <CamposDocumento valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} fuentes={fuentes} />
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Archivo (opcional, maximo {ARCHIVO_MAX_BYTES / (1024 * 1024)}MB). Si no lo tienes aun, deja la URL de origen y marca la confianza como Pendiente o Probable.
        </label>
        <input key={inputKey} type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700" />
      </div>
      {referencias.length > 0 && (
        <div>
          <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">Productos que documenta</p>
          <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 sm:grid-cols-3 dark:border-zinc-800">
            {referencias.map((r) => (
              <label key={r.id} className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={productos.includes(r.id)} onChange={() => setProductos((prev) => (prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]))} />
                {r.referencia}
              </label>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Guardando..." : "Crear documento"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function DocumentoCard({ documento, fuentes, referencias }: { documento: Documento; fuentes: Fuente[]; referencias: Referencia[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({
    tipo: documento.tipo,
    titulo: documento.titulo,
    codigo: documento.codigo ?? "",
    revision: documento.revision ?? "",
    fechaEmision: documento.fechaEmision ?? "",
    idioma: documento.idioma,
    fuenteId: documento.fuenteId ?? "",
    urlOrigen: documento.urlOrigen ?? "",
    confianza: documento.confianza,
    notas: documento.notas ?? "",
  });
  const [nuevaReferenciaId, setNuevaReferenciaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referenciasVinculadas = documento.productos.map((p) => p.producto);
  const referenciasDisponibles = referencias.filter((r) => !referenciasVinculadas.some((v) => v.id === r.id));

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/documentos/${encodeURIComponent(documento.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Borrar el documento "${documento.titulo}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/documentos/${encodeURIComponent(documento.id)}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar el documento");
      return;
    }
    router.refresh();
  }

  async function handleVincular() {
    if (!nuevaReferenciaId) return;
    setLoading(true);
    await fetch(`/api/documentos/${encodeURIComponent(documento.id)}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: nuevaReferenciaId }),
    });
    setNuevaReferenciaId("");
    setLoading(false);
    router.refresh();
  }

  async function handleDesvincular(productoId: string) {
    setLoading(true);
    await fetch(`/api/documentos/${encodeURIComponent(documento.id)}/productos/${encodeURIComponent(productoId)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <CamposDocumento valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} fuentes={fuentes} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const url = archivoUrl(documento.archivoPath);
  const sinArchivo = !documento.archivoPath;

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-4 ${
        sinArchivo
          ? "border-zinc-100 bg-zinc-50 opacity-70 dark:border-zinc-800/60 dark:bg-zinc-900/40"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{documento.titulo}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {DOCUMENTO_TIPOS[documento.tipo]}
            {documento.codigo ? ` · ${documento.codigo}` : ""}
            {documento.revision ? ` · ${documento.revision}` : ""}
            {documento.fechaEmision ? ` · ${documento.fechaEmision}` : ""}
            {" · "}
            {IDIOMAS[documento.idioma]}
            {documento.fuente ? ` · ${documento.fuente.nombre}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`rounded-full px-2 py-0.5 text-xs ${confianzaBadge[documento.confianza]}`}>{CONFIANZAS[documento.confianza].label}</span>
          <button type="button" onClick={() => setEditando(true)} className="text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Editar
          </button>
          <button type="button" onClick={handleDelete} disabled={loading} className="text-xs text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
            Borrar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Archivo {documento.archivoNombre ? `(${documento.archivoNombre})` : ""}
          </a>
        )}
        {documento.urlOrigen && (
          <a href={documento.urlOrigen} target="_blank" rel="noopener noreferrer" className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Fuente original
          </a>
        )}
        {sinArchivo && !documento.urlOrigen && <span className="italic text-zinc-400 dark:text-zinc-500">Sin archivo descargado aun</span>}
      </div>

      {documento.notas && <p className="text-xs text-zinc-600 dark:text-zinc-400">{documento.notas}</p>}

      <div className="flex flex-wrap items-center gap-1.5">
        {referenciasVinculadas.map((r) => (
          <span key={r.id} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {r.referencia}
            <button type="button" onClick={() => handleDesvincular(r.id)} disabled={loading} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
              ×
            </button>
          </span>
        ))}
        {referenciasDisponibles.length > 0 && (
          <span className="flex items-center gap-1">
            <select value={nuevaReferenciaId} onChange={(e) => setNuevaReferenciaId(e.target.value)} className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <option value="">+ vincular producto</option>
              {referenciasDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referencia}
                </option>
              ))}
            </select>
            {nuevaReferenciaId && (
              <button type="button" onClick={handleVincular} disabled={loading} className="text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
                Vincular
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function GrupoDocumentos({
  titulo,
  documentos,
  fuentes,
  referencias,
  abiertoPorDefecto,
}: {
  titulo: string;
  documentos: Documento[];
  fuentes: Fuente[];
  referencias: Referencia[];
  abiertoPorDefecto: boolean;
}) {
  if (documentos.length === 0) return null;
  return (
    <details open={abiertoPorDefecto} className="group rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 select-none marker:content-none">
        <span className="flex items-center gap-2 font-medium">
          <span className="inline-block text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
            <Chevron />
          </span>
          {titulo}
        </span>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{documentos.length}</span>
      </summary>
      <div className="flex flex-col gap-4 p-4 pt-0">
        {documentos.map((d) => (
          <DocumentoCard key={d.id} documento={d} fuentes={fuentes} referencias={referencias} />
        ))}
      </div>
    </details>
  );
}

export default function DocumentosManager({
  marcaId,
  documentos,
  fuentes,
  referencias,
}: {
  marcaId: string;
  documentos: Documento[];
  fuentes: Fuente[];
  referencias: Referencia[];
}) {
  const conArchivo = documentos.filter((d) => d.archivoPath);
  const sinArchivo = documentos.filter((d) => !d.archivoPath);

  return (
    <div className="flex flex-col gap-4">
      {documentos.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Ningun documento coincide con el filtro.</p>
      ) : (
        <>
          <GrupoDocumentos titulo="Con archivo descargado" documentos={conArchivo} fuentes={fuentes} referencias={referencias} abiertoPorDefecto={true} />
          <GrupoDocumentos titulo="Sin archivo (pendiente de descarga)" documentos={sinArchivo} fuentes={fuentes} referencias={referencias} abiertoPorDefecto={false} />
        </>
      )}
      <NuevoDocumentoForm marcaId={marcaId} fuentes={fuentes} referencias={referencias} />
    </div>
  );
}
