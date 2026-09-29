import Link from "next/link";
import { getMarcaPorSlug, getProductosDeMarca, getResumenProductos, type ProductoConConteo } from "@/lib/queries";
import { FAMILIA_PRODUCTO_VALUES, PRODUCTO_ESTADOS, PRODUCTO_ESTADO_VALUES, labelFamilia, labelGeneracion, ordenGeneracion } from "@/lib/tipos";
import type { SoporteProductoEstado } from "@/lib/db";
import NuevoProductoForm from "./nuevo-producto-form";

/** El glifo unicode "▶" se renderiza en algunos navegadores/fuentes con su propio color de
 * emoji, ignorando el CSS "color". Un SVG con fill="currentColor" si respeta el color de
 * texto heredado (ver el mismo problema en preguntas-manager.tsx). */
function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M5 3l6 5-6 5V3z" />
    </svg>
  );
}

const estadoBadgeClass: Record<SoporteProductoEstado, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  NUEVO: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  DESCONTINUADO: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  RENOMBRADO: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  INTERNO: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400",
};

function TablaProductos({ slug, productos }: { slug: string; productos: ProductoConConteo[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
        <tr>
          <th className="px-3 py-2">Producto</th>
          <th className="px-3 py-2">Nombre</th>
          <th className="px-3 py-2">Estado</th>
          <th className="px-3 py-2">UL</th>
          <th className="px-3 py-2">Lista de precios BICO</th>
          <th className="px-3 py-2 text-right">Docs</th>
          <th className="px-3 py-2 text-right">Hallazgos</th>
          <th className="px-3 py-2 text-right">Preguntas</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
            <td className="px-3 py-2">
              <Link href={`/${slug}/productos/${encodeURIComponent(p.id)}`} className="font-medium text-zinc-900 underline hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300">
                {p.referencia}
              </Link>
            </td>
            <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{p.nombre}</td>
            <td className="px-3 py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${estadoBadgeClass[p.estado]}`}>{PRODUCTO_ESTADOS[p.estado].label}</span>
            </td>
            <td className="px-3 py-2">
              {p.ulListado ? (
                <span
                  title="Aparece listado en un expediente de UL Product iQ"
                  className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                >
                  UL
                </span>
              ) : (
                <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
              )}
            </td>
            <td className="px-3 py-2">
              {p.precioListaBico ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ {p.precioListaBico}
                </span>
              ) : (
                <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
              )}
            </td>
            <td className="px-3 py-2 text-right text-zinc-500 dark:text-zinc-400">{p._count.documentos}</td>
            <td className="px-3 py-2 text-right text-zinc-500 dark:text-zinc-400">{p._count.hallazgos}</td>
            <td className="px-3 py-2 text-right text-zinc-500 dark:text-zinc-400">{p._count.preguntas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function ProductosPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; familia?: string; estado?: string; generacion?: string }>;
}) {
  const { slug } = await params;
  const { q, familia, estado, generacion } = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const familiaFiltro = familia && FAMILIA_PRODUCTO_VALUES.includes(familia as (typeof FAMILIA_PRODUCTO_VALUES)[number]) ? familia : undefined;
  const estadoFiltro = estado && PRODUCTO_ESTADO_VALUES.includes(estado as SoporteProductoEstado) ? (estado as SoporteProductoEstado) : undefined;

  const [productos, resumen] = await Promise.all([
    getProductosDeMarca(marca.id, { q, familia: familiaFiltro, estado: estadoFiltro, generacion }),
    getResumenProductos(marca.id),
  ]);

  const porGeneracion = new Map<string | null, Map<string, ProductoConConteo[]>>();
  for (const p of productos) {
    const gen = p.generacion;
    if (!porGeneracion.has(gen)) porGeneracion.set(gen, new Map());
    const porFamilia = porGeneracion.get(gen)!;
    if (!porFamilia.has(p.familia)) porFamilia.set(p.familia, []);
    porFamilia.get(p.familia)!.push(p);
  }
  const generacionesOrdenadas = [...porGeneracion.keys()].sort((a, b) => ordenGeneracion(a) - ordenGeneracion(b));

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-wrap items-end gap-3" action={`/${slug}/productos`}>
        <div>
          <label htmlFor="q" className="block text-xs text-zinc-500 dark:text-zinc-400">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Producto, nombre..."
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="familia" className="block text-xs text-zinc-500 dark:text-zinc-400">
            Familia
          </label>
          <select
            id="familia"
            name="familia"
            defaultValue={familiaFiltro ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">Todas</option>
            {FAMILIA_PRODUCTO_VALUES.map((f) => (
              <option key={f} value={f}>
                {labelFamilia(f)} ({resumen.porFamilia.find((r) => r.familia === f)?.total ?? 0})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estado" className="block text-xs text-zinc-500 dark:text-zinc-400">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={estadoFiltro ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">Todos</option>
            {PRODUCTO_ESTADO_VALUES.map((e) => (
              <option key={e} value={e}>
                {PRODUCTO_ESTADOS[e].label}
              </option>
            ))}
          </select>
        </div>
        {resumen.generaciones.length > 0 && (
          <div>
            <label htmlFor="generacion" className="block text-xs text-zinc-500 dark:text-zinc-400">
              Generacion
            </label>
            <select
              id="generacion"
              name="generacion"
              defaultValue={generacion ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Todas</option>
              {[...resumen.generaciones]
                .sort((a, b) => ordenGeneracion(a) - ordenGeneracion(b))
                .map((g) => (
                  <option key={g} value={g}>
                    {labelGeneracion(g)}
                  </option>
                ))}
            </select>
          </div>
        )}
        <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Filtrar
        </button>
        {(q || familiaFiltro || estadoFiltro || generacion) && (
          <Link href={`/${slug}/productos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Limpiar
          </Link>
        )}
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {productos.length} producto{productos.length === 1 ? "" : "s"}
      </p>

      {productos.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Ningún producto coincide con el filtro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {generacionesOrdenadas.map((gen) => {
            const porFamilia = porGeneracion.get(gen)!;
            const familiasOrdenadas = [...porFamilia.keys()].sort((a, b) => labelFamilia(a).localeCompare(labelFamilia(b)));
            const totalGeneracion = [...porFamilia.values()].reduce((sum, arr) => sum + arr.length, 0);
            return (
              <details key={gen ?? "sin-clasificar"} open className="group rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 select-none marker:content-none">
                  <span className="flex items-center gap-2 text-base font-semibold">
                    <span className="inline-block text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
                      <Chevron />
                    </span>
                    {labelGeneracion(gen)}
                  </span>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{totalGeneracion}</span>
                </summary>
                <div className="flex flex-col gap-3 p-4 pt-0">
                  {familiasOrdenadas.map((fam) => {
                    const items = porFamilia.get(fam)!.sort((a, b) => a.referencia.localeCompare(b.referencia));
                    return (
                      <details key={fam} open className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 select-none marker:content-none">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <span className="inline-block text-zinc-900 transition-transform group-open:rotate-90 dark:text-zinc-50">
                              <Chevron />
                            </span>
                            {labelFamilia(fam)}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{items.length}</span>
                        </summary>
                        <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
                          <TablaProductos slug={slug} productos={items} />
                        </div>
                      </details>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}

      <div className="max-w-xl">
        <NuevoProductoForm marcaId={marca.id} slug={slug} />
      </div>
    </div>
  );
}
