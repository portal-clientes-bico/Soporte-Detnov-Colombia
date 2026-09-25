import Link from "next/link";
import { getHallazgosDeMarca, getMarcaPorSlug, getReferenciasDeMarca } from "@/lib/queries";
import { HALLAZGO_ESTADO_VALUES, HALLAZGO_ESTADOS, HALLAZGO_TIPOS, HALLAZGO_TIPO_VALUES } from "@/lib/tipos";
import type { SoporteHallazgoEstado, SoporteHallazgoTipo } from "@/lib/db";
import HallazgosManager from "./hallazgos-manager";

export default async function HallazgosPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string; estado?: string; referencia?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const tipoFiltro = sp.tipo && HALLAZGO_TIPO_VALUES.includes(sp.tipo as SoporteHallazgoTipo) ? (sp.tipo as SoporteHallazgoTipo) : undefined;
  const estadoFiltro = sp.estado && HALLAZGO_ESTADO_VALUES.includes(sp.estado as SoporteHallazgoEstado) ? (sp.estado as SoporteHallazgoEstado) : undefined;

  const [hallazgos, referencias] = await Promise.all([getHallazgosDeMarca(marca.id, { tipo: tipoFiltro, estado: estadoFiltro }), getReferenciasDeMarca(marca.id)]);

  const hallazgosFiltrados = sp.referencia ? hallazgos.filter((h) => h.producto?.referencia === sp.referencia) : hallazgos;

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-wrap items-end gap-3" action={`/${slug}/hallazgos`}>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Tipo</label>
          <select name="tipo" defaultValue={tipoFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todos</option>
            {HALLAZGO_TIPO_VALUES.map((t) => (
              <option key={t} value={t}>
                {HALLAZGO_TIPOS[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Estado</label>
          <select name="estado" defaultValue={estadoFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todos</option>
            {HALLAZGO_ESTADO_VALUES.map((e) => (
              <option key={e} value={e}>
                {HALLAZGO_ESTADOS[e]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Filtrar
        </button>
        {(tipoFiltro || estadoFiltro || sp.referencia) && (
          <Link href={`/${slug}/hallazgos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Limpiar
          </Link>
        )}
        {sp.referencia && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Filtrando por referencia: <span className="font-medium">{sp.referencia}</span>
          </span>
        )}
      </form>

      <HallazgosManager marcaId={marca.id} hallazgos={hallazgosFiltrados} referencias={referencias} slug={slug} />
    </div>
  );
}
