import Link from "next/link";
import { getConsolidadoGarantias, getMarcas } from "@/lib/queries";
import { GARANTIA_ESTADOS, GARANTIA_ESTADO_VALUES } from "@/lib/tipos";
import type { SoporteGarantiaEstado } from "@/lib/db";
import ListaGarantias from "../../lista-garantias";
import ResumenGarantias from "../../consolidado-garantias";

const selectClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

/** Consolidado de garantias de todas las marcas, con filtros. */
export default async function ConsolidadoGarantiasPage({ searchParams }: { searchParams: Promise<{ marca?: string; estado?: string; q?: string }> }) {
  const sp = await searchParams;
  const estadoParam = sp.estado ?? "ABIERTAS";
  const estado = GARANTIA_ESTADO_VALUES.includes(estadoParam as SoporteGarantiaEstado) ? (estadoParam as SoporteGarantiaEstado) : undefined;
  const marcas = await getMarcas();
  const marcaId = marcas.find((m) => m.slug === sp.marca)?.id;
  const { porMarca, tickets } = await getConsolidadoGarantias({ marcaId, estado, soloAbiertas: estadoParam === "ABIERTAS", texto: sp.q || undefined });
  const hayFiltros = estadoParam !== "ABIERTAS" || !!(sp.marca || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Marcas
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Garantías — consolidado</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Todas las solicitudes de garantía de todas las marcas.</p>
      </div>

      <ResumenGarantias porMarca={porMarca} />

      <form className="flex flex-wrap items-end gap-3" action="/garantias">
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Marca</label>
          <select name="marca" defaultValue={sp.marca ?? ""} className={selectClass}>
            <option value="">Todas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
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
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Buscar</label>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="N.º, cliente, serial, RMA..." className={`${selectClass} w-56`} />
        </div>
        <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Filtrar
        </button>
        {hayFiltros && (
          <Link href="/garantias" className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Limpiar
          </Link>
        )}
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">{tickets.length} garantía(s)</p>
      <ListaGarantias garantias={tickets} conMarca vacio="No hay garantías con esos filtros." />
    </div>
  );
}
