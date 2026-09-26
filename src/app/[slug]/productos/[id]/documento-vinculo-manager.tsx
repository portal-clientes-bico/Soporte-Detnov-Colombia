"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENTO_TIPOS } from "@/lib/tipos";

interface DocumentoDisponible {
  id: string;
  titulo: string;
  tipo: keyof typeof DOCUMENTO_TIPOS;
}

export default function DocumentoVinculoManager({ productoId, documentosDisponibles }: { productoId: string; documentosDisponibles: DocumentoDisponible[] }) {
  const router = useRouter();
  const [documentoId, setDocumentoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!documentoId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/documentos/${encodeURIComponent(documentoId)}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo vincular el documento");
      return;
    }
    setDocumentoId("");
    router.refresh();
  }

  if (documentosDisponibles.length === 0) {
    return <p className="text-xs text-zinc-500 dark:text-zinc-400">No hay otros documentos de la marca para vincular.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-xs text-zinc-500 dark:text-zinc-400">Vincular documento existente</label>
        <select
          value={documentoId}
          onChange={(e) => setDocumentoId(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">Selecciona...</option>
          {documentosDisponibles.map((d) => (
            <option key={d.id} value={d.id}>
              {d.titulo} ({DOCUMENTO_TIPOS[d.tipo]})
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={loading || !documentoId} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800">
        Vincular
      </button>
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
