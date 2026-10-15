"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/**
 * Encabezado de la marca con boton "Editar" para cambiar nombre y descripcion. El slug (la
 * direccion /<marca> y /ayuda/<marca>) no cambia, asi los enlaces ya compartidos siguen
 * funcionando.
 */
export default function EditarMarca({ slug, nombre, descripcion }: { slug: string; nombre: string; descripcion: string | null }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ nombre, descripcion: descripcion ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setValores({ nombre, descripcion: descripcion ?? "" });
    setError(null);
    setEditando(true);
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/marcas/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar la marca");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  if (!editando) {
    return (
      <div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{nombre}</h1>
          <button
            type="button"
            onClick={abrir}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Editar marca
          </button>
        </div>
        {descripcion && <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{descripcion}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="mt-2 flex max-w-3xl flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <label htmlFor="marca-nombre" className="block text-sm text-zinc-600 dark:text-zinc-400">
          Nombre
        </label>
        <input
          id="marca-nombre"
          autoFocus
          value={valores.nombre}
          onChange={(e) => setValores({ ...valores, nombre: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="marca-descripcion" className="block text-sm text-zinc-600 dark:text-zinc-400">
          Descripción / comentarios
        </label>
        <textarea
          id="marca-descripcion"
          value={valores.descripcion}
          onChange={(e) => setValores({ ...valores, descripcion: e.target.value })}
          rows={4}
          maxLength={2000}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Se muestra en el menú de marcas del sitio de ayuda para clientes.</p>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditando(false)} className="rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
