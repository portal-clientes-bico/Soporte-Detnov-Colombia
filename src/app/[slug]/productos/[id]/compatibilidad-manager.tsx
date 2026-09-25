"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { labelFamilia } from "@/lib/tipos";

interface Compatible {
  id: string;
  referencia: string;
  nombre: string;
  familia: string;
  nota: string | null;
  compatibilidadId: string;
}

interface ReferenciaDisponible {
  id: string;
  referencia: string;
  nombre: string;
  familia: string;
}

export default function CompatibilidadManager({
  productoId,
  compatibles,
  referenciasDisponibles,
}: {
  productoId: string;
  compatibles: Compatible[];
  referenciasDisponibles: ReferenciaDisponible[];
}) {
  const router = useRouter();
  const [compatibleId, setCompatibleId] = useState("");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!compatibleId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/productos/${productoId}/compatibilidad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compatibleId, nota }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo agregar la compatibilidad");
      return;
    }
    setCompatibleId("");
    setNota("");
    router.refresh();
  }

  async function handleRemove(compatibilidadId: string) {
    setLoading(true);
    await fetch(`/api/productos/${productoId}/compatibilidad/${compatibilidadId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {compatibles.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin compatibilidad registrada.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {compatibles.map((c) => (
            <li key={c.compatibilidadId} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <span>{c.referencia}</span>
                <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {c.nombre} · {labelFamilia(c.familia)}
                </span>
                {c.nota && <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.nota}</p>}
              </div>
              <button type="button" onClick={() => handleRemove(c.compatibilidadId)} disabled={loading} className="shrink-0 text-xs text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {referenciasDisponibles.length > 0 ? (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Referencia compatible</label>
            <select
              value={compatibleId}
              onChange={(e) => setCompatibleId(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Selecciona...</option>
              {referenciasDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referencia} — {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Nota (opcional)</label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <button type="submit" disabled={loading || !compatibleId} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Agregar
          </button>
          {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">No hay mas referencias disponibles para vincular. Crea una nueva referencia si hace falta.</p>
      )}
    </div>
  );
}
