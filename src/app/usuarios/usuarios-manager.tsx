"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { getUsuarios } from "@/lib/queries";
import { guardarUsuarioActual, leerUsuarioActual } from "@/lib/usuario-actual";

type Usuario = Awaited<ReturnType<typeof getUsuarios>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

function valoresIniciales() {
  return { nombre: "", email: "" };
}

function UsuarioCampos({ valores, onChange }: { valores: { nombre: string; email: string }; onChange: (campo: string, valor: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Nombre</label>
        <input value={valores.nombre} onChange={(e) => onChange("nombre", e.target.value)} required minLength={1} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Email (opcional)</label>
        <input type="email" value={valores.email} onChange={(e) => onChange("email", e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

function NuevoUsuarioForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState(valoresIniciales());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nuevo usuario
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el usuario");
      return;
    }
    setValores(valoresIniciales());
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nuevo usuario</p>
      <UsuarioCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear usuario"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function UsuarioCard({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ nombre: usuario.nombre, email: usuario.email ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esActual, setEsActual] = useState(false);

  useEffect(() => {
    setEsActual(leerUsuarioActual()?.id === usuario.id);
  }, [usuario.id]);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
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
    if (esActual) guardarUsuarioActual({ id: usuario.id, nombre: valores.nombre });
    setEditando(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Borrar el usuario "${usuario.nombre}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/usuarios/${usuario.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar el usuario");
      return;
    }
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <UsuarioCampos valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
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
          <p className="font-medium">{usuario.nombre}</p>
          {esActual && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Tu</span>}
        </div>
        {usuario.email && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{usuario.email}</p>}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
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

export default function UsuariosManager({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <div className="flex flex-col gap-4">
      {usuarios.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Aun no hay usuarios registrados.</p> : usuarios.map((u) => <UsuarioCard key={u.id} usuario={u} />)}
      <NuevoUsuarioForm />
    </div>
  );
}
