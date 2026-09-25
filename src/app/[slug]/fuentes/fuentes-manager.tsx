"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getFuentesDeMarca } from "@/lib/queries";
import { FUENTE_TIPOS, FUENTE_TIPO_VALUES } from "@/lib/tipos";

type Fuente = Awaited<ReturnType<typeof getFuentesDeMarca>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

function valoresIniciales() {
  return { nombre: "", tipo: "OTRO", prioridad: "50", url: "", descripcion: "" };
}

function FuenteCampos({ valores, onChange }: { valores: { nombre: string; tipo: string; prioridad: string; url: string; descripcion: string }; onChange: (campo: string, valor: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Nombre</label>
        <input value={valores.nombre} onChange={(e) => onChange("nombre", e.target.value)} required minLength={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Tipo</label>
        <select value={valores.tipo} onChange={(e) => onChange("tipo", e.target.value)} className={inputClass}>
          {FUENTE_TIPO_VALUES.map((t) => (
            <option key={t} value={t}>
              {FUENTE_TIPOS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Prioridad (1 = mas confiable)</label>
        <input type="number" min={1} max={99} value={valores.prioridad} onChange={(e) => onChange("prioridad", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">URL (opcional)</label>
        <input value={valores.url} onChange={(e) => onChange("url", e.target.value)} placeholder="https://..." className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Descripcion</label>
        <textarea value={valores.descripcion} onChange={(e) => onChange("descripcion", e.target.value)} rows={2} className={inputClass} />
      </div>
    </div>
  );
}

function NuevaFuenteForm({ marcaId }: { marcaId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState(valoresIniciales());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nueva fuente
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/fuentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, ...valores }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la fuente");
      return;
    }
    setValores(valoresIniciales());
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nueva fuente</p>
      <FuenteCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear fuente"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FuenteCard({ fuente }: { fuente: Fuente }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ nombre: fuente.nombre, tipo: fuente.tipo, prioridad: String(fuente.prioridad), url: fuente.url ?? "", descripcion: fuente.descripcion ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/fuentes/${fuente.id}`, {
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
    if (!confirm(`¿Borrar la fuente "${fuente.nombre}"? Los documentos que la usan quedaran sin fuente.`)) return;
    setLoading(true);
    const res = await fetch(`/api/fuentes/${fuente.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar la fuente");
      return;
    }
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <FuenteCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
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

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">#{fuente.prioridad}</span>
          <p className="font-medium">{fuente.nombre}</p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{FUENTE_TIPOS[fuente.tipo]}</span>
        </div>
        {fuente.descripcion && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fuente.descripcion}</p>}
        {fuente.url && (
          <a href={fuente.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            {fuente.url}
          </a>
        )}
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{fuente._count.documentos} documento(s)</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div className="flex shrink-0 gap-3 text-sm">
        <button type="button" onClick={() => setEditando(true)} className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Editar
        </button>
        <button type="button" onClick={handleDelete} disabled={loading} className="text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
          Borrar
        </button>
      </div>
    </div>
  );
}

export default function FuentesManager({ marcaId, fuentes }: { marcaId: string; fuentes: Fuente[] }) {
  return (
    <div className="flex flex-col gap-4">
      {fuentes.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Aun no hay fuentes registradas.</p> : fuentes.map((f) => <FuenteCard key={f.id} fuente={f} />)}
      <NuevaFuenteForm marcaId={marcaId} />
    </div>
  );
}
