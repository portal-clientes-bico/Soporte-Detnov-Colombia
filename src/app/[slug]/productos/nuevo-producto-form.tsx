"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FAMILIA_PRODUCTO_VALUES, PRODUCTO_ESTADO_VALUES, PRODUCTO_ESTADOS, labelFamilia } from "@/lib/tipos";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function NuevoProductoForm({ marcaId, slug }: { marcaId: string; slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [nombre, setNombre] = useState("");
  const [familia, setFamilia] = useState<string>(FAMILIA_PRODUCTO_VALUES[0]);
  const [generacion, setGeneracion] = useState("");
  const [estado, setEstado] = useState<string>("PENDIENTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        + Nuevo producto
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, referencia, nombre, familia, generacion, estado }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el producto");
      return;
    }
    router.push(`/${slug}/productos/${encodeURIComponent(data.id)}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nuevo producto</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="referencia" className="block text-sm text-zinc-600 dark:text-zinc-400">
            Producto (numero de parte)
          </label>
          <input id="referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="nombre" className="block text-sm text-zinc-600 dark:text-zinc-400">
            Nombre
          </label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} className={inputClass} />
        </div>
        <div>
          <label htmlFor="familia" className="block text-sm text-zinc-600 dark:text-zinc-400">
            Familia
          </label>
          <select id="familia" value={familia} onChange={(e) => setFamilia(e.target.value)} className={inputClass}>
            {FAMILIA_PRODUCTO_VALUES.map((f) => (
              <option key={f} value={f}>
                {labelFamilia(f)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm text-zinc-600 dark:text-zinc-400">
            Estado
          </label>
          <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
            {PRODUCTO_ESTADO_VALUES.map((e2) => (
              <option key={e2} value={e2}>
                {PRODUCTO_ESTADOS[e2].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="generacion" className="block text-sm text-zinc-600 dark:text-zinc-400">
            Generacion (opcional)
          </label>
          <input id="generacion" value={generacion} onChange={(e) => setGeneracion(e.target.value)} placeholder="Series 2, MA Gen 2..." className={inputClass} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Creando..." : "Crear producto"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
