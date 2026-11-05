import Link from "next/link";
import type { getGarantiasDeMarca } from "@/lib/queries";
import { GARANTIA_ESTADOS, TAREA_PRIORIDADES } from "@/lib/tipos";
import { GARANTIA_ESTADO_BADGE, GARANTIA_PRIORIDAD_BADGE, textoDias } from "./garantia-estilos";

type GarantiaItem = Awaited<ReturnType<typeof getGarantiasDeMarca>>[number];

/** Tabla de tickets de garantia: la usan la pestana de cada marca y el consolidado (con la
 * columna Marca). */
export default function ListaGarantias({ garantias, vacio, conMarca = false }: { garantias: GarantiaItem[]; vacio: string; conMarca?: boolean }) {
  if (garantias.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">{vacio}</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium">N.º</th>
            {conMarca && <th className="px-3 py-2 font-medium">Marca</th>}
            <th className="px-3 py-2 font-medium">Garantía</th>
            <th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium">Productos</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Responsable</th>
            <th className="px-3 py-2 text-right font-medium">Días</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {garantias.map((g) => {
            const href = `/${g.marcaSlug}/garantias/${g.id}`;
            const referencias = [...new Set(g.items.map((i) => i.referencia))];
            return (
              <tr key={g.id} className="align-top hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link href={href} className="font-mono text-xs text-sky-700 underline dark:text-sky-400">
                    {g.numero}
                  </Link>
                </td>
                {conMarca && <td className="px-3 py-2 whitespace-nowrap">{g.marcaNombre}</td>}
                <td className="px-3 py-2">
                  <Link href={href} className="font-medium hover:underline">
                    {g.titulo}
                  </Link>
                  <div className="mt-0.5">
                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${GARANTIA_PRIORIDAD_BADGE[g.prioridad]}`}>{TAREA_PRIORIDADES[g.prioridad]}</span>
                    {g.rmaFabricante && <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">RMA {g.rmaFabricante}</span>}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {g.clienteNombre}
                  {g.proyecto && <div className="text-xs text-zinc-500 dark:text-zinc-400">{g.proyecto}</div>}
                </td>
                <td className="px-3 py-2">
                  {referencias.slice(0, 3).join(", ")}
                  {referencias.length > 3 && "…"}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {g.unidades} unidad{g.unidades === 1 ? "" : "es"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${GARANTIA_ESTADO_BADGE[g.estado]}`}>{GARANTIA_ESTADOS[g.estado]}</span>
                  {g.diasEnFabricante !== null && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{textoDias(g.diasEnFabricante)} en el fabricante</div>
                  )}
                </td>
                <td className="px-3 py-2">{g.asignadoANombre ?? <span className="text-zinc-400">Sin asignar</span>}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap" title={g.abierta ? "Días desde que se creó" : "Días que estuvo abierta"}>
                  {textoDias(g.diasAbierta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
