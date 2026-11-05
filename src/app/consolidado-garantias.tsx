import Link from "next/link";
import type { getConsolidadoGarantias } from "@/lib/queries";
import { GARANTIA_ESTADOS, GARANTIA_ESTADO_VALUES } from "@/lib/tipos";
import { GARANTIA_ESTADO_BADGE, textoDias } from "./garantia-estilos";

type Consolidado = Awaited<ReturnType<typeof getConsolidadoGarantias>>;

/** Tabla de garantias por marca y estado (pagina central y consolidado). Cada numero lleva a la
 * lista de esa marca ya filtrada por ese estado. */
export default function ResumenGarantias({ porMarca }: { porMarca: Consolidado["porMarca"] }) {
  if (porMarca.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Aún no hay garantías registradas.</p>;
  const totales = GARANTIA_ESTADO_VALUES.map((e) => porMarca.reduce((n, m) => n + (m.porEstado[e] ?? 0), 0));

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[48rem] text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Marca</th>
            <th className="px-3 py-2 text-right font-medium">Abiertas</th>
            {GARANTIA_ESTADO_VALUES.map((e) => (
              <th key={e} className="px-2 py-2 text-right font-medium">
                <span className={`rounded-full px-1.5 py-0.5 whitespace-nowrap ${GARANTIA_ESTADO_BADGE[e]}`}>{GARANTIA_ESTADOS[e]}</span>
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Más antigua abierta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {porMarca.map((m) => (
            <tr key={m.marcaId}>
              <td className="px-3 py-2">
                <Link href={`/${m.marcaSlug}/garantias`} className="font-medium hover:underline">
                  {m.marcaNombre}
                </Link>
              </td>
              <td className="px-3 py-2 text-right font-semibold">{m.abiertas}</td>
              {GARANTIA_ESTADO_VALUES.map((e) => (
                <td key={e} className="px-2 py-2 text-right">
                  {m.porEstado[e] ? (
                    <Link href={`/${m.marcaSlug}/garantias?estado=${e}`} className="hover:underline">
                      {m.porEstado[e]}
                    </Link>
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-600">0</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-right">{m.abiertas ? textoDias(m.masAntigua) : "—"}</td>
            </tr>
          ))}
        </tbody>
        {porMarca.length > 1 && (
          <tfoot className="border-t border-zinc-300 font-semibold dark:border-zinc-700">
            <tr>
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right">{porMarca.reduce((n, m) => n + m.abiertas, 0)}</td>
              {totales.map((t, i) => (
                <td key={i} className="px-2 py-2 text-right">
                  {t}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
