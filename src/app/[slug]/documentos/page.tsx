import Link from "next/link";
import { getDocumentosDeMarca, getFuentesDeMarca, getMarcaPorSlug, getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import { CONFIANZA_VALUES, DOCUMENTO_TIPO_VALUES, DOCUMENTO_TIPOS, IDIOMAS, IDIOMA_VALUES } from "@/lib/tipos";
import type { SoporteConfianza, SoporteDocumentoTipo, SoporteIdioma } from "@/lib/db";
import DocumentosManager from "./documentos-manager";

export default async function DocumentosPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; idioma?: string; confianza?: string; fuenteId?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const tipoFiltro = sp.tipo && DOCUMENTO_TIPO_VALUES.includes(sp.tipo as SoporteDocumentoTipo) ? (sp.tipo as SoporteDocumentoTipo) : undefined;
  const idiomaFiltro = sp.idioma && IDIOMA_VALUES.includes(sp.idioma as SoporteIdioma) ? (sp.idioma as SoporteIdioma) : undefined;
  const confianzaFiltro = sp.confianza && CONFIANZA_VALUES.includes(sp.confianza as SoporteConfianza) ? (sp.confianza as SoporteConfianza) : undefined;

  const [documentos, fuentes, referencias, usuarios] = await Promise.all([
    getDocumentosDeMarca(marca.id, { q: sp.q, tipo: tipoFiltro, idioma: idiomaFiltro, confianza: confianzaFiltro, fuenteId: sp.fuenteId }),
    getFuentesDeMarca(marca.id),
    getReferenciasDeMarca(marca.id),
    getUsuarios(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-wrap items-end gap-3" action={`/${slug}/documentos`}>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Buscar</label>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Titulo, codigo, producto..."
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Tipo</label>
          <select name="tipo" defaultValue={tipoFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todos</option>
            {DOCUMENTO_TIPO_VALUES.map((t) => (
              <option key={t} value={t}>
                {DOCUMENTO_TIPOS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Idioma</label>
          <select name="idioma" defaultValue={idiomaFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todos</option>
            {IDIOMA_VALUES.map((i) => (
              <option key={i} value={i}>
                {IDIOMAS[i]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400">Confianza</label>
          <select name="confianza" defaultValue={confianzaFiltro ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
            <option value="">Todas</option>
            {CONFIANZA_VALUES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {fuentes.length > 0 && (
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400">Fuente</label>
            <select name="fuenteId" defaultValue={sp.fuenteId ?? ""} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="">Todas</option>
              {fuentes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Filtrar
        </button>
        {(sp.q || tipoFiltro || idiomaFiltro || confianzaFiltro || sp.fuenteId) && (
          <Link href={`/${slug}/documentos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Limpiar
          </Link>
        )}
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {documentos.length} documento{documentos.length === 1 ? "" : "s"}
      </p>

      <DocumentosManager marcaId={marca.id} documentos={documentos} fuentes={fuentes} referencias={referencias} usuarios={usuarios} />
    </div>
  );
}
