import Link from "next/link";
import { getHallazgosDeMarca, getMarcaPorSlug, getPreguntasDeMarca, getResumenProductos } from "@/lib/queries";
import { HALLAZGO_TIPOS, PREGUNTA_PRIORIDADES, PRODUCTO_ESTADOS, labelFamilia } from "@/lib/tipos";
import type { SoporteProductoEstado } from "@/lib/db";
import CargarSemillaButton from "./cargar-semilla-button";

const TIENE_SEMILLA = new Set(["maple-armor"]);

export default async function MarcaResumenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const [resumen, hallazgosAbiertos, preguntasAbiertas] = await Promise.all([
    getResumenProductos(marca.id),
    getHallazgosDeMarca(marca.id, { estado: "ABIERTO" }),
    getPreguntasDeMarca(marca.id, { estado: "ABIERTA" }),
  ]);

  const totalProductos = resumen.porFamilia.reduce((sum, f) => sum + f.total, 0);

  return (
    <div className="flex flex-col gap-6">
      {TIENE_SEMILLA.has(slug) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Esta marca tiene datos iniciales cargados en codigo a partir de la investigacion documental. Es seguro
            volver a aplicarlos: no borra lo que agregues a mano y actualiza las filas que ya existan.
          </p>
          <div className="mt-3">
            <CargarSemillaButton slug={slug} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold">{totalProductos}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Productos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold">{resumen.generaciones.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Generaciones distintas</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold">{hallazgosAbiertos.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Hallazgos abiertos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-semibold">{preguntasAbiertas.length}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Preguntas abiertas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 font-medium">Por familia</p>
          {resumen.porFamilia.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin productos registrados.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {resumen.porFamilia
                .sort((a, b) => b.total - a.total)
                .map((f) => (
                  <li key={f.familia} className="flex items-center justify-between">
                    <Link href={`/${slug}/productos?familia=${f.familia}`} className="text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50">
                      {labelFamilia(f.familia)}
                    </Link>
                    <span className="text-zinc-500 dark:text-zinc-400">{f.total}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 font-medium">Por estado</p>
          {resumen.porEstado.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin productos registrados.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {resumen.porEstado
                .sort((a, b) => b.total - a.total)
                .map((estado) => (
                  <li key={estado.estado} className="flex items-center justify-between">
                    <Link href={`/${slug}/productos?estado=${estado.estado}`} className="text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50">
                      {PRODUCTO_ESTADOS[estado.estado as SoporteProductoEstado]?.label ?? estado.estado}
                    </Link>
                    <span className="text-zinc-500 dark:text-zinc-400">{estado.total}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium">Hallazgos abiertos</p>
          <Link href={`/${slug}/hallazgos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Ver todos
          </Link>
        </div>
        {hallazgosAbiertos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay hallazgos abiertos.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {hallazgosAbiertos.slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-start justify-between gap-3">
                <span className="text-zinc-700 dark:text-zinc-300">{h.titulo}</span>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {HALLAZGO_TIPOS[h.tipo].label}
                </span>
              </li>
            ))}
            {hallazgosAbiertos.length > 8 && <li className="text-xs text-zinc-500 dark:text-zinc-400">y {hallazgosAbiertos.length - 8} mas...</li>}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium">Preguntas abiertas</p>
          <Link href={`/${slug}/preguntas`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Ver todas
          </Link>
        </div>
        {preguntasAbiertas.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay preguntas abiertas.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {preguntasAbiertas.slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-zinc-700 dark:text-zinc-300">{p.titulo}</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Preguntó {p.autor}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {PREGUNTA_PRIORIDADES[p.prioridad]}
                </span>
              </li>
            ))}
            {preguntasAbiertas.length > 8 && <li className="text-xs text-zinc-500 dark:text-zinc-400">y {preguntasAbiertas.length - 8} mas...</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
