"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { getHallazgosDeMarca, getReferenciasDeMarca } from "@/lib/queries";
import { HALLAZGO_TIPOS, HALLAZGO_TIPO_VALUES } from "@/lib/tipos";

type Hallazgo = Awaited<ReturnType<typeof getHallazgosDeMarca>>[number];
type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

const tipoBadge: Record<string, string> = {
  REGLA: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
  DISCREPANCIA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  HALLAZGO: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
};

function valoresIniciales() {
  return { tipo: "HALLAZGO", productoId: "", titulo: "", contenido: "" };
}

function HallazgoCampos({
  valores,
  onChange,
  referencias,
}: {
  valores: { tipo: string; productoId: string; titulo: string; contenido: string };
  onChange: (campo: string, valor: string) => void;
  referencias: Referencia[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Tipo</label>
          <select value={valores.tipo} onChange={(e) => onChange("tipo", e.target.value)} className={inputClass}>
            {HALLAZGO_TIPO_VALUES.map((t) => (
              <option key={t} value={t}>
                {HALLAZGO_TIPOS[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Referencia relacionada (opcional)</label>
          <select value={valores.productoId} onChange={(e) => onChange("productoId", e.target.value)} className={inputClass}>
            <option value="">Ninguna</option>
            {referencias.map((r) => (
              <option key={r.id} value={r.id}>
                {r.referencia}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Titulo</label>
        <input value={valores.titulo} onChange={(e) => onChange("titulo", e.target.value)} required minLength={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Contenido</label>
        <textarea value={valores.contenido} onChange={(e) => onChange("contenido", e.target.value)} required rows={4} className={inputClass} />
      </div>
    </div>
  );
}

function NuevoHallazgoForm({ marcaId, referencias }: { marcaId: string; referencias: Referencia[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState(valoresIniciales());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nuevo hallazgo
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/hallazgos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, ...valores }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el hallazgo");
      return;
    }
    setValores(valoresIniciales());
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nuevo hallazgo</p>
      <HallazgoCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} referencias={referencias} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear hallazgo"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function HallazgoCard({ hallazgo, referencias, slug }: { hallazgo: Hallazgo; referencias: Referencia[]; slug: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ tipo: hallazgo.tipo, productoId: hallazgo.productoId ?? "", titulo: hallazgo.titulo, contenido: hallazgo.contenido });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/hallazgos/${hallazgo.id}`, {
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

  async function toggleEstado() {
    setLoading(true);
    const nuevoEstado = hallazgo.estado === "ABIERTO" ? "RESUELTO" : "ABIERTO";
    await fetch(`/api/hallazgos/${hallazgo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Borrar el hallazgo "${hallazgo.titulo}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/hallazgos/${hallazgo.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar el hallazgo");
      return;
    }
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <HallazgoCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} referencias={referencias} />
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
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${hallazgo.estado === "RESUELTO" ? "border-zinc-100 bg-zinc-50 opacity-70 dark:border-zinc-800/60 dark:bg-zinc-900/40" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs ${tipoBadge[hallazgo.tipo]}`}>{HALLAZGO_TIPOS[hallazgo.tipo].label}</span>
          <p className="font-medium">{hallazgo.titulo}</p>
          {hallazgo.producto && (
            <Link href={`/${slug}/productos/${hallazgo.producto.id}`} className="text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
              {hallazgo.producto.referencia}
            </Link>
          )}
        </div>
        <div className="flex shrink-0 gap-3 text-xs">
          <button type="button" onClick={toggleEstado} disabled={loading} className="text-zinc-500 underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-zinc-50">
            {hallazgo.estado === "ABIERTO" ? "Marcar resuelto" : "Reabrir"}
          </button>
          <button type="button" onClick={() => setEditando(true)} className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Editar
          </button>
          <button type="button" onClick={handleDelete} disabled={loading} className="text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
            Borrar
          </button>
        </div>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{hallazgo.contenido}</p>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function HallazgosManager({ marcaId, hallazgos, referencias, slug }: { marcaId: string; hallazgos: Hallazgo[]; referencias: Referencia[]; slug: string }) {
  return (
    <div className="flex flex-col gap-4">
      {hallazgos.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Ningun hallazgo coincide con el filtro.</p> : hallazgos.map((h) => <HallazgoCard key={h.id} hallazgo={h} referencias={referencias} slug={slug} />)}
      <NuevoHallazgoForm marcaId={marcaId} referencias={referencias} />
    </div>
  );
}
