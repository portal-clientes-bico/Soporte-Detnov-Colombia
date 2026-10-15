import type { Metadata } from "next";
import Link from "next/link";
import { getInstructivosPublicados, getMarcaPorSlug, getProductosConInstructivosPublicados } from "@/lib/queries";
import { INSTRUCTIVO_TIPO_VALUES, INSTRUCTIVO_TIPOS } from "@/lib/tipos";
import type { SoporteInstructivoTipo } from "@/lib/db";

const campoClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  return { title: marca ? `Centro de ayuda ${marca.nombre}` : "Centro de ayuda", description: "Instructivos y diagnóstico de fallas." };
}

export default async function AyudaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; producto?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const tipo = sp.tipo && INSTRUCTIVO_TIPO_VALUES.includes(sp.tipo as SoporteInstructivoTipo) ? (sp.tipo as SoporteInstructivoTipo) : undefined;
  const q = sp.q?.trim() || undefined;
  const productoId = sp.producto || undefined;

  const [instructivos, productos] = await Promise.all([
    getInstructivosPublicados(marca.id, { tipo, q, productoId }),
    getProductosConInstructivosPublicados(marca.id),
  ]);
  const hayFiltros = !!(tipo || q || productoId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">¿En qué te podemos ayudar?</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Busca tu pregunta o el problema que tienes con tu equipo {marca.nombre}.</p>
      </div>

      <form action={`/ayuda/${slug}`} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="sr-only">
            Buscar
          </label>
          <input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder="Ej: reiniciar panel, falla a tierra..." className={campoClass} />
        </div>
        <select name="tipo" defaultValue={tipo ?? ""} aria-label="Tipo" className={`${campoClass} sm:w-48`}>
          <option value="">Todos los tipos</option>
          {INSTRUCTIVO_TIPO_VALUES.map((t) => (
            <option key={t} value={t}>
              {INSTRUCTIVO_TIPOS[t]}
            </option>
          ))}
        </select>
        {productos.length > 0 && (
          <select name="producto" defaultValue={productoId ?? ""} aria-label="Producto" className={`${campoClass} sm:w-48`}>
            <option value="">Todos los productos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.referencia}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          Buscar
        </button>
      </form>

      {hayFiltros && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {instructivos.length} resultado{instructivos.length === 1 ? "" : "s"} ·{" "}
          <Link href={`/ayuda/${slug}`} className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Ver todos
          </Link>
        </p>
      )}

      {instructivos.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {hayFiltros ? "No encontramos instructivos con esa búsqueda. Prueba con otras palabras." : "Pronto encontrarás aquí instructivos y guías de diagnóstico."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {instructivos.map((i) => (
            <li key={i.id}>
              <Link
                href={`/ayuda/${slug}/${i.id}`}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {INSTRUCTIVO_TIPOS[i.tipo]}
                  {i.productos.length > 0 && ` · ${i.productos.map((p) => p.referencia).join(", ")}`}
                </span>
                <span className="font-medium">{i.titulo}</span>
                {i.resumen && <span className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{i.resumen}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
