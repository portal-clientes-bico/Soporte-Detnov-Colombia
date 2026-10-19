"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { getReferenciasDeMarca, getTareasDeMarca, getUsuarios } from "@/lib/queries";
import { TAREA_ESTADOS, TAREA_ESTADO_VALUES, TAREA_PRIORIDADES, TAREA_PRIORIDAD_VALUES } from "@/lib/tipos";

type Tarea = Awaited<ReturnType<typeof getTareasDeMarca>>[number];
type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];
type Usuario = Awaited<ReturnType<typeof getUsuarios>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** Mismos tonos que las prioridades del modulo Preguntas. */
const prioridadBadge: Record<string, string> = {
  ALTA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  MEDIA: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  BAJA: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

const estadoBadge: Record<string, string> = {
  PENDIENTE: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  EN_PROGRESO: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  COMPLETADA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

/** Fecha local del navegador en formato AAAA-MM-DD (la del servidor puede estar en otra zona horaria). */
function hoyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatFecha(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

/** "Hoy" se calcula en el navegador despues de montar, para no desajustar el HTML del servidor. */
function useHoy(): string | null {
  const [hoy, setHoy] = useState<string | null>(null);
  useEffect(() => setHoy(hoyLocal()), []);
  return hoy;
}

interface Valores {
  titulo: string;
  descripcion: string;
  fecha: string;
  fechaPara: string;
  prioridad: string;
  productoId: string;
  asignadoAUsuarioId: string;
}

function CamposTarea({
  valores,
  onChange,
  referencias,
  usuarios,
  asignadoPor,
}: {
  valores: Valores;
  onChange: (v: Valores) => void;
  referencias: Referencia[];
  usuarios: Usuario[];
  /** Nombre de quien asigno la tarea (solo lectura: es el usuario conectado al crearla). */
  asignadoPor: string | null;
}) {
  const set = (campo: keyof Valores) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...valores, [campo]: e.target.value });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Título</label>
        <input value={valores.titulo} onChange={set("titulo")} required minLength={3} maxLength={250} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Descripción</label>
        <textarea value={valores.descripcion} onChange={set("descripcion")} rows={3} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Fecha</label>
          <input type="date" value={valores.fecha} onChange={set("fecha")} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Fecha para</label>
          <input type="date" value={valores.fechaPara} onChange={set("fechaPara")} min={valores.fecha || undefined} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Prioridad</label>
          <select value={valores.prioridad} onChange={set("prioridad")} className={inputClass}>
            {TAREA_PRIORIDAD_VALUES.map((p) => (
              <option key={p} value={p}>
                {TAREA_PRIORIDADES[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Producto relacionado</label>
          <select value={valores.productoId} onChange={set("productoId")} className={inputClass}>
            <option value="">Ninguno</option>
            {referencias.map((r) => (
              <option key={r.id} value={r.id}>
                {r.referencia} — {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Asignado por</label>
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">{asignadoPor ?? "—"}</p>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Asignado a</label>
          <select value={valores.asignadoAUsuarioId} onChange={set("asignadoAUsuarioId")} className={inputClass}>
            <option value="">Sin asignar</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function NuevaTareaForm({
  marcaId,
  referencias,
  usuarios,
  usuarioActual,
}: {
  marcaId: string;
  referencias: Referencia[];
  usuarios: Usuario[];
  usuarioActual: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState<Valores>({ titulo: "", descripcion: "", fecha: "", fechaPara: "", prioridad: "MEDIA", productoId: "", asignadoAUsuarioId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setValores({ titulo: "", descripcion: "", fecha: hoyLocal(), fechaPara: "", prioridad: "MEDIA", productoId: "", asignadoAUsuarioId: "" });
    setError(null);
    setOpen(true);
  }

  if (!open) {
    return (
      <button type="button" onClick={abrir} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nueva tarea
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, ...valores }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la tarea");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="font-medium">Nueva tarea</p>
      <CamposTarea valores={valores} onChange={setValores} referencias={referencias} usuarios={usuarios} asignadoPor={usuarioActual} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear tarea"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function TareaCard({ tarea, referencias, usuarios, hoy }: { tarea: Tarea; referencias: Referencia[]; usuarios: Usuario[]; hoy: string | null }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState<Valores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completada = tarea.estado === "COMPLETADA";
  const vencida = !!hoy && !completada && !!tarea.fechaPara && tarea.fechaPara < hoy;
  const venceHoy = !!hoy && !completada && tarea.fechaPara === hoy;

  async function patch(body: Partial<Valores> & { estado?: string }) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/tareas/${tarea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return false;
    }
    router.refresh();
    return true;
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la tarea "${tarea.titulo}"? No se puede deshacer.`)) return;
    setLoading(true);
    const res = await fetch(`/api/tareas/${tarea.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }
    router.refresh();
  }

  if (editando && valores) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await patch(valores)) setEditando(false);
        }}
        className="flex flex-col gap-3 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700"
      >
        <CamposTarea valores={valores} onChange={setValores} referencias={referencias} usuarios={usuarios} asignadoPor={tarea.asignadoPorNombre} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-4 ${
        vencida ? "border-red-300 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/20" : "border-zinc-200 dark:border-zinc-800"
      } ${completada ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${prioridadBadge[tarea.prioridad]}`}>{TAREA_PRIORIDADES[tarea.prioridad]}</span>
        <select
          value={tarea.estado}
          disabled={loading}
          onChange={(e) => patch({ estado: e.target.value })}
          aria-label="Estado"
          className={`rounded-full border-0 px-2 py-0.5 font-medium outline-none ${estadoBadge[tarea.estado]}`}
        >
          {TAREA_ESTADO_VALUES.map((e) => (
            <option key={e} value={e}>
              {TAREA_ESTADOS[e]}
            </option>
          ))}
        </select>
        {tarea.producto && (
          <span title={tarea.producto.nombre} className="rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {tarea.producto.referencia}
          </span>
        )}
        {vencida && <span className="rounded-full bg-red-600 px-2 py-0.5 font-medium text-white">Vencida</span>}
        {venceHoy && <span className="rounded-full bg-amber-500 px-2 py-0.5 font-medium text-white">Vence hoy</span>}
      </div>

      <p className={`font-medium ${completada ? "line-through" : ""}`}>{tarea.titulo}</p>
      {tarea.descripcion && <p className="whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{tarea.descripcion}</p>}
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Asignado a: <span className="font-medium text-zinc-900 dark:text-zinc-100">{tarea.asignadoANombre ?? "Sin asignar"}</span>
        {tarea.asignadoPorNombre && <> · Asignado por: {tarea.asignadoPorNombre}</>}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Fecha: {formatFecha(tarea.fecha)}
          {tarea.fechaPara && <> · Para: {formatFecha(tarea.fechaPara)}</>}
          {tarea.completadaEn && <> · Completada {new Date(tarea.completadaEn).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</>}
        </span>
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              setValores({
                titulo: tarea.titulo,
                descripcion: tarea.descripcion ?? "",
                fecha: tarea.fecha,
                fechaPara: tarea.fechaPara ?? "",
                prioridad: tarea.prioridad,
                productoId: tarea.productoId ?? "",
                asignadoAUsuarioId: tarea.asignadoAUsuarioId ?? "",
              });
              setError(null);
              setEditando(true);
            }}
            className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Editar
          </button>
          <button type="button" onClick={eliminar} disabled={loading} className="text-red-600 underline hover:text-red-800 dark:text-red-400">
            Eliminar
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function TareasManager({
  tareas,
  referencias,
  usuarios,
  hayFiltros,
}: {
  tareas: Tarea[];
  referencias: Referencia[];
  usuarios: Usuario[];
  hayFiltros: boolean;
}) {
  const hoy = useHoy();

  if (tareas.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {hayFiltros ? "No hay tareas con estos filtros." : 'No hay tareas todavía. Crea la primera con "+ Nueva tarea".'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tareas.map((t) => (
        <TareaCard key={`${t.id}-${t.updatedAt}`} tarea={t} referencias={referencias} usuarios={usuarios} hoy={hoy} />
      ))}
    </div>
  );
}
