import Link from "next/link";
import { getInstructivosDeMarca, getMarcaPorSlug } from "@/lib/queries";
import { INSTRUCTIVO_ESTADO_VALUES, INSTRUCTIVO_ESTADOS, INSTRUCTIVO_TIPO_VALUES, INSTRUCTIVO_TIPOS } from "@/lib/tipos";
import type { SoporteInstructivoEstado, SoporteInstructivoTipo } from "@/lib/db";
import NuevoInstructivoForm from "./nuevo-instructivo-form";
import { estadoInstructivoBadge } from "./estilos";

const selectClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { dateStyle: "medium" });
}

export default async function InstructivosPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string; estado?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const tipoFiltro = sp.tipo && INSTRUCTIVO_TIPO_VALUES.includes(sp.tipo as SoporteInstructivoTipo) ? (sp.tipo as SoporteInstructivoTipo) : undefined;
  const estadoFiltro = sp.estado && INSTRUCTIVO_ESTADO_VALUES.includes(sp.estado as SoporteInstructivoEstado) ? (sp.estado as SoporteInstructivoEstado) : undefined;
  const q = sp.q?.trim() || undefined;

  const instructivos = await getInstructivosDeMarca(marca.id, { tipo: tipoFiltro, estado: estadoFiltro, q });
  const publicados = instructivos.filter((i) => i.estado === "PUBLICADO").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-zinc-700 dark:text-zinc-300">
          Preguntas frecuentes de los clientes con su respuesta paso a paso (texto, imagenes y videos de YouTube). Los registros{" "}
          <span className="font-medium">Publicados</span> se ven sin clave en el sitio de ayuda para clientes.
        </p>
        <Link href={`/ayuda/${slug}`} target="_blank" className="self-start text-zinc-900 underline dark:text-zinc-50">
          Abrir sitio de ayuda para clientes ↗
        </Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex flex-wrap items-end gap-3" action={`/${slug}/instructivos`}>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Buscar</label>
            <input name="q" defaultValue={q ?? ""} placeholder="Palabras clave..." className={selectClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Tipo</label>
            <select name="tipo" defaultValue={tipoFiltro ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {INSTRUCTIVO_TIPO_VALUES.map((t) => (
                <option key={t} value={t}>
                  {INSTRUCTIVO_TIPOS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Estado</label>
            <select name="estado" defaultValue={estadoFiltro ?? ""} className={selectClass}>
              <option value="">Todos</option>
              {INSTRUCTIVO_ESTADO_VALUES.map((e) => (
                <option key={e} value={e}>
                  {INSTRUCTIVO_ESTADOS[e]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Filtrar
          </button>
          {(tipoFiltro || estadoFiltro || q) && (
            <Link href={`/${slug}/instructivos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
              Limpiar
            </Link>
          )}
        </form>
        <NuevoInstructivoForm marcaId={marca.id} slug={slug} />
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {instructivos.length} registro{instructivos.length === 1 ? "" : "s"} · {publicados} publicado{publicados === 1 ? "" : "s"}
      </p>

      {instructivos.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay registros{tipoFiltro || estadoFiltro || q ? " con estos filtros" : " todavia. Crea el primero con \"+ Nuevo registro\""}.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {instructivos.map((i) => {
            const imagenes = i.bloques.filter((b) => b.tipo === "IMAGEN").length;
            const videos = i.bloques.filter((b) => b.tipo === "VIDEO").length;
            return (
              <li key={i.id}>
                <Link
                  href={`/${slug}/instructivos/${i.id}`}
                  className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${estadoInstructivoBadge[i.estado]}`}>{INSTRUCTIVO_ESTADOS[i.estado]}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{INSTRUCTIVO_TIPOS[i.tipo]}</span>
                    {i.productos.map((p) => (
                      <span key={p.id} className="rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        {p.referencia}
                      </span>
                    ))}
                  </div>
                  <span className="font-medium">{i.titulo}</span>
                  {i.resumen && <span className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{i.resumen}</span>}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {i.bloques.length} bloque{i.bloques.length === 1 ? "" : "s"}
                    {imagenes > 0 && ` · ${imagenes} imagen${imagenes === 1 ? "" : "es"}`}
                    {videos > 0 && ` · ${videos} video${videos === 1 ? "" : "s"}`} · Actualizado {formatFecha(i.updatedAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
