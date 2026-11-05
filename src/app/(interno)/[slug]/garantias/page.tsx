import Link from "next/link";
import { getGarantiasDeMarca, getMarcaPorSlug, getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import { GARANTIA_ESTADOS, GARANTIA_ESTADO_VALUES, TAREA_PRIORIDADES, TAREA_PRIORIDAD_VALUES } from "@/lib/tipos";
import type { SoporteGarantiaEstado, SoporteTareaPrioridad } from "@/lib/db";
import ListaGarantias from "../../../lista-garantias";

const selectClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default async function GarantiasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ estado?: string; prioridad?: string; producto?: string; asignado?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  // "ABIERTAS" (por defecto) = todo lo pendiente; "TODAS" = sin filtro de estado.
  const estadoParam = sp.estado ?? "ABIERTAS";
  const estado = GARANTIA_ESTADO_VALUES.includes(estadoParam as SoporteGarantiaEstado) ? (estadoParam as SoporteGarantiaEstado) : undefined;
  const prioridad = sp.prioridad && TAREA_PRIORIDAD_VALUES.includes(sp.prioridad as SoporteTareaPrioridad) ? (sp.prioridad as SoporteTareaPrioridad) : undefined;
  const filtro = {
    estado,
    soloAbiertas: estadoParam === "ABIERTAS",
    prioridad,
    productoId: sp.producto || undefined,
    asignadoAUsuarioId: sp.asignado || undefined,
    texto: sp.q || undefined,
  };
  const hayFiltros = estadoParam !== "ABIERTAS" || !!(prioridad || sp.producto || sp.asignado || sp.q);

  const [garantias, todas, referencias, usuarios] = await Promise.all([
    getGarantiasDeMarca(marca.id, filtro),
    getGarantiasDeMarca(marca.id),
    getReferenciasDeMarca(marca.id),
    getUsuarios(),
  ]);
  const abiertas = todas.filter((g) => g.abierta).length;
  const esperandoFabricante = todas.filter((g) => g.diasEnFabricante !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex flex-wrap items-end gap-3" action={`/${slug}/garantias`}>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Estado</label>
            <select name="estado" defaultValue={estadoParam} className={selectClass}>
              <option value="ABIERTAS">Abiertas</option>
              <option value="TODAS">Todas</option>
              {GARANTIA_ESTADO_VALUES.map((e) => (
                <option key={e} value={e}>
                  {GARANTIA_ESTADOS[e]}
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
            <select name="producto" defaultValue={sp.producto ?? ""} className={`${selectClass} max-w-48`}>
              <option value="">Todos</option>
              {referencias.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referencia}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Responsable</label>
            <select name="asignado" defaultValue={sp.asignado ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Buscar</label>
            <input name="q" defaultValue={sp.q ?? ""} placeholder="N.º, cliente, serial, RMA..." className={`${selectClass} w-52`} />
          </div>
          <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Filtrar
          </button>
          {hayFiltros && (
            <Link href={`/${slug}/garantias`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
              Limpiar
            </Link>
          )}
        </form>
        <Link
          href={`/${slug}/garantias/nueva`}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          + Nueva garantía
        </Link>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {todas.length} garantía{todas.length === 1 ? "" : "s"} · {abiertas} abierta{abiertas === 1 ? "" : "s"} · {esperandoFabricante} esperando respuesta del fabricante · mostrando{" "}
        {garantias.length}
      </p>

      <ListaGarantias garantias={garantias} vacio={hayFiltros ? "No hay garantías con esos filtros." : "Aún no hay garantías abiertas en esta marca."} />
    </div>
  );
}
