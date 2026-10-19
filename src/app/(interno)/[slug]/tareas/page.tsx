import Link from "next/link";
import { getMarcaPorSlug, getReferenciasDeMarca, getTareasDeMarca, getUsuarios } from "@/lib/queries";
import { sesionActual } from "@/lib/sesion-actual";
import { TAREA_ESTADO_VALUES, TAREA_ESTADOS, TAREA_PRIORIDAD_VALUES, TAREA_PRIORIDADES } from "@/lib/tipos";
import type { SoporteTareaEstado, SoporteTareaPrioridad } from "@/lib/db";
import TareasManager, { NuevaTareaForm } from "./tareas-manager";

const selectClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default async function TareasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ estado?: string; prioridad?: string; producto?: string; asignado?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const estado = sp.estado && TAREA_ESTADO_VALUES.includes(sp.estado as SoporteTareaEstado) ? (sp.estado as SoporteTareaEstado) : undefined;
  const prioridad = sp.prioridad && TAREA_PRIORIDAD_VALUES.includes(sp.prioridad as SoporteTareaPrioridad) ? (sp.prioridad as SoporteTareaPrioridad) : undefined;
  const productoId = sp.producto || undefined;
  const asignadoAUsuarioId = sp.asignado || undefined;
  const hayFiltros = !!(estado || prioridad || productoId || asignadoAUsuarioId);

  const [tareas, todas, referencias, usuarios, sesion] = await Promise.all([
    getTareasDeMarca(marca.id, { estado, prioridad, productoId, asignadoAUsuarioId }),
    getTareasDeMarca(marca.id),
    getReferenciasDeMarca(marca.id),
    getUsuarios(),
    sesionActual(),
  ]);
  const abiertas = todas.filter((t) => t.estado !== "COMPLETADA").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex flex-wrap items-end gap-3" action={`/${slug}/tareas`}>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Estado</label>
            <select name="estado" defaultValue={estado ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {TAREA_ESTADO_VALUES.map((e) => (
                <option key={e} value={e}>
                  {TAREA_ESTADOS[e]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Prioridad</label>
            <select name="prioridad" defaultValue={prioridad ?? ""} className={selectClass}>
              <option value="">Todas</option>
              {TAREA_PRIORIDAD_VALUES.map((p) => (
                <option key={p} value={p}>
                  {TAREA_PRIORIDADES[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Producto</label>
            <select name="producto" defaultValue={productoId ?? ""} className={`${selectClass} max-w-56`}>
              <option value="">Todos</option>
              {referencias.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referencia}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Asignado a</label>
            <select name="asignado" defaultValue={asignadoAUsuarioId ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Filtrar
          </button>
          {hayFiltros && (
            <Link href={`/${slug}/tareas`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      <NuevaTareaForm marcaId={marca.id} referencias={referencias} usuarios={usuarios} usuarioActual={sesion?.nombre ?? null} />

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {todas.length} tarea{todas.length === 1 ? "" : "s"} · {abiertas} abierta{abiertas === 1 ? "" : "s"}
        {hayFiltros && ` · mostrando ${tareas.length}`}
      </p>

      <TareasManager tareas={tareas} referencias={referencias} usuarios={usuarios} hayFiltros={hayFiltros} />
    </div>
  );
}
