"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getProductoDetalle } from "@/lib/queries";
import { FAMILIA_PRODUCTO_VALUES, PRODUCTO_ESTADO_VALUES, PRODUCTO_ESTADOS, especificacionesATexto, labelFamilia, labelGeneracion, parseEspecificaciones } from "@/lib/tipos";

type Producto = NonNullable<Awaited<ReturnType<typeof getProductoDetalle>>>;

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function ProductoEditor({ producto, slug }: { producto: Producto; slug: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [referencia, setReferencia] = useState(producto.referencia);
  const [nombre, setNombre] = useState(producto.nombre);
  const [familia, setFamilia] = useState(producto.familia);
  const [generacion, setGeneracion] = useState(producto.generacion ?? "");
  const [estado, setEstado] = useState(producto.estado);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? "");
  const [notas, setNotas] = useState(producto.notas ?? "");
  const [sustituyeA, setSustituyeA] = useState(producto.sustituyeA ?? "");
  const [sustituidaPor, setSustituidaPor] = useState(producto.sustituidaPor ?? "");
  const [especificacionesTexto, setEspecificacionesTexto] = useState(especificacionesATexto(parseEspecificaciones(producto.especificaciones)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/productos/${producto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referencia, nombre, familia, generacion, estado, descripcion, notas, sustituyeA, sustituidaPor, especificacionesTexto }),
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
    if (!confirm(`¿Borrar el producto ${producto.referencia}? Se perderan sus vinculos y hallazgos asociados.`)) return;
    setLoading(true);
    const res = await fetch(`/api/productos/${producto.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar el producto");
      return;
    }
    router.push(`/${slug}/productos`);
    router.refresh();
  }

  if (!editando) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 text-sm">
            {producto.descripcion && <p className="text-zinc-700 dark:text-zinc-300">{producto.descripcion}</p>}
            {producto.notas && (
              <p className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Notas: </span>
                {producto.notas}
              </p>
            )}
            {producto.generacion && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Generacion: <span className="text-zinc-700 dark:text-zinc-300">{labelGeneracion(producto.generacion)}</span>
              </p>
            )}
            {producto.sustituyeA && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Sustituye a: <span className="text-zinc-700 dark:text-zinc-300">{producto.sustituyeA}</span>
              </p>
            )}
            {producto.sustituidaPor && (
              <p className="text-zinc-500 dark:text-zinc-400">
                Sustituida por: <span className="text-zinc-700 dark:text-zinc-300">{producto.sustituidaPor}</span>
              </p>
            )}
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
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Producto</label>
          <input value={referencia} onChange={(e) => setReferencia(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Familia</label>
          <select value={familia} onChange={(e) => setFamilia(e.target.value as typeof familia)} className={inputClass}>
            {FAMILIA_PRODUCTO_VALUES.map((f) => (
              <option key={f} value={f}>
                {labelFamilia(f)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} className={inputClass}>
            {PRODUCTO_ESTADO_VALUES.map((es) => (
              <option key={es} value={es}>
                {PRODUCTO_ESTADOS[es].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Generacion</label>
          <input value={generacion} onChange={(e) => setGeneracion(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Sustituye a</label>
          <input value={sustituyeA} onChange={(e) => setSustituyeA(e.target.value)} placeholder="producto" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Sustituida por</label>
          <input value={sustituidaPor} onChange={(e) => setSustituidaPor(e.target.value)} placeholder="producto" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Descripcion</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Notas</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Especificaciones — una por linea: <code>GRUPO | nombre | valor</code>
        </label>
        <textarea
          value={especificacionesTexto}
          onChange={(e) => setEspecificacionesTexto(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder={"ELECTRICO | Tension nominal | 24 VDC\nCOMUNICACION | SLC | 1"}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditando(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
