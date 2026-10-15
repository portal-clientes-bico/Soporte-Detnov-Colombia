"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INSTRUCTIVO_TIPOS, INSTRUCTIVO_TIPO_VALUES } from "@/lib/tipos";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** Crea el registro solo con pregunta y tipo, y lleva directo al editor para armar la respuesta. */
export default function NuevoInstructivoForm({ marcaId, slug }: { marcaId: string; slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>("INSTRUCTIVO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nuevo registro
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/instructivos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, tipo, titulo, bloques: [], productoIds: [] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "No se pudo crear el registro");
      return;
    }
    router.push(`/${slug}/instructivos/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:w-[28rem] dark:border-zinc-800">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
          {INSTRUCTIVO_TIPO_VALUES.map((t) => (
            <option key={t} value={t}>
              {INSTRUCTIVO_TIPOS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Pregunta del cliente</label>
        <input
          autoFocus
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          minLength={3}
          placeholder="Ej: ¿Como reinicio el panel despues de una alarma?"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear y editar respuesta"}
        </button>
      </div>
    </form>
  );
}
