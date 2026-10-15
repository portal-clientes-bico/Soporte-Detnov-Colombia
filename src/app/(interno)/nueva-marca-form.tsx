"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function NuevaMarcaForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/marcas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la marca");
      return;
    }
    router.push(`/${data.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nueva marca</p>
      <div>
        <label htmlFor="nombre" className="block text-sm text-zinc-600 dark:text-zinc-400">
          Nombre
        </label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} className={inputClass} />
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-sm text-zinc-600 dark:text-zinc-400">
          Descripcion (opcional)
        </label>
        <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className={inputClass} />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? "Creando..." : "Crear marca"}
      </button>
    </form>
  );
}
