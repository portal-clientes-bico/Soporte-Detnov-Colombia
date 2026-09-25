import Link from "next/link";
import { getMarcaPorSlug, getPreguntasDeMarca, getReferenciasDeMarca } from "@/lib/queries";
import { PREGUNTA_ASIGNADOS, PREGUNTA_ASIGNADO_VALUES, PREGUNTA_ESTADO_VALUES, PREGUNTA_ESTADOS, PREGUNTA_PRIORIDAD_VALUES, PREGUNTA_PRIORIDADES } from "@/lib/tipos";
import type { SoportePreguntaAsignado, SoportePreguntaEstado, SoportePreguntaPrioridad } from "@/lib/db";
import PreguntasManager from "./preguntas-manager";

export default async function PreguntasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ prioridad?: string; estado?: string; asignadoA?: string; referencia?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const prioridadFiltro = sp.prioridad && PREGUNTA_PRIORIDAD_VALUES.includes(sp.prioridad as SoportePreguntaPrioridad) ? (sp.prioridad as SoportePreguntaPrioridad) : undefined;
  const estadoFiltro = sp.estado && PREGUNTA_ESTADO_VALUES.includes(sp.estado as SoportePreguntaEstado) ? (sp.estado as SoportePreguntaEstado) : undefined;
  const asignadoFiltro = sp.asignadoA && PREGUNTA_ASIGNADO_VALUES.includes(sp.asignadoA as SoportePreguntaAsignado) ? (sp.asignadoA as SoportePreguntaAsignado) : undefined;

  const [preguntas, referencias] = await Promise.all([
    getPreguntasDeMarca(marca.id, { prioridad: prioridadFiltro, estado: estadoFiltro, asignadoA: asignadoFiltro }),
    getReferenciasDeMarca(marca.id),
  ]);

  const preguntasFiltradas = sp.referencia ? preguntas.filter((p) => p.productos.some((r) => r.referencia === sp.referencia)) : preguntas;

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-wrap items-end gap-3" action={`/${slug}/preguntas`}>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Prioridad</label>
          <select name="prioridad" defaultValue={prioridadFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todas</option>
            {PREGUNTA_PRIORIDAD_VALUES.map((p) => (
              <option key={p} value={p}>
                {PREGUNTA_PRIORIDADES[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Estado</label>
          <select name="estado" defaultValue={estadoFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todos</option>
            {PREGUNTA_ESTADO_VALUES.map((e) => (
              <option key={e} value={e}>
                {PREGUNTA_ESTADOS[e]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Asignada a</label>
          <select name="asignadoA" defaultValue={asignadoFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todas</option>
            {PREGUNTA_ASIGNADO_VALUES.map((a) => (
              <option key={a} value={a}>
                {PREGUNTA_ASIGNADOS[a]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Filtrar
        </button>
        {(prioridadFiltro || estadoFiltro || asignadoFiltro || sp.referencia) && (
          <Link href={`/${slug}/preguntas`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Limpiar
          </Link>
        )}
        {sp.referencia && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Filtrando por referencia: <span className="font-medium">{sp.referencia}</span>
          </span>
        )}
      </form>

      <PreguntasManager marcaId={marca.id} preguntas={preguntasFiltradas} referencias={referencias} slug={slug} />
    </div>
  );
}
