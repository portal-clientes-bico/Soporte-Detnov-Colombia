import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocumentosDeMarca, getMarcaPorSlug, getProductoDetalle, getReferenciasDeMarca } from "@/lib/queries";
import { DOCUMENTO_TIPOS, HALLAZGO_TIPOS, PREGUNTA_ESTADOS, PREGUNTA_PRIORIDADES, labelFamilia, labelGrupoEspecificacion, parseEspecificaciones } from "@/lib/tipos";
import ProductoEditor from "./producto-editor";
import CompatibilidadManager from "./compatibilidad-manager";
import DocumentoVinculoManager from "./documento-vinculo-manager";
import DesvincularDocumentoButton from "./desvincular-documento-button";

export default async function ProductoDetallePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const producto = await getProductoDetalle(marca.id, id);
  if (!producto) notFound();

  const [todasLasReferencias, todosLosDocumentos] = await Promise.all([getReferenciasDeMarca(marca.id), getDocumentosDeMarca(marca.id)]);

  const especificaciones = parseEspecificaciones(producto.especificaciones);
  const especificacionesPorGrupo = new Map<string, typeof especificaciones>();
  for (const e of especificaciones) {
    const lista = especificacionesPorGrupo.get(e.grupo) ?? [];
    lista.push(e);
    especificacionesPorGrupo.set(e.grupo, lista);
  }

  const documentosVinculadosIds = new Set(producto.documentos.map((d) => d.documento.id));
  const documentosDisponibles = todosLosDocumentos.filter((d) => !documentosVinculadosIds.has(d.id));
  const referenciasDisponibles = todasLasReferencias.filter((r) => r.id !== producto.id && !producto.compatibles.some((c) => c.id === r.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/${slug}/productos`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Volver a productos
        </Link>
        <h2 className="mt-1 text-xl font-semibold">{producto.referencia}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {producto.nombre} — {labelFamilia(producto.familia)}
        </p>
      </div>

      <ProductoEditor producto={producto} slug={slug} />

      {especificaciones.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 font-medium">Especificaciones</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...especificacionesPorGrupo.entries()].map(([grupo, items]) => (
              <div key={grupo}>
                <p className="mb-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{labelGrupoEspecificacion(grupo)}</p>
                <dl className="flex flex-col gap-0.5 text-sm">
                  {items.map((e, i) => (
                    <div key={i} className="flex justify-between gap-3">
                      <dt className="text-zinc-500 dark:text-zinc-400">{e.nombre}</dt>
                      <dd className="text-right">{e.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 font-medium">Documentos vinculados</p>
        {producto.documentos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin documentos vinculados.</p>
        ) : (
          <ul className="mb-3 flex flex-col gap-2">
            {producto.documentos.map(({ documento }) => (
              <li key={documento.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <Link href={`/${slug}/documentos?q=${encodeURIComponent(documento.titulo)}`} className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
                    {documento.titulo}
                  </Link>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {DOCUMENTO_TIPOS[documento.tipo]}
                    {documento.revision ? ` · ${documento.revision}` : ""}
                    {documento.fechaEmision ? ` · ${documento.fechaEmision}` : ""}
                  </span>
                </div>
                <DesvincularDocumentoButton documentoId={documento.id} productoId={producto.id} />
              </li>
            ))}
          </ul>
        )}
        <DocumentoVinculoManager productoId={producto.id} documentosDisponibles={documentosDisponibles} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 font-medium">Compatibilidad</p>
        <CompatibilidadManager productoId={producto.id} compatibles={producto.compatibles} referenciasDisponibles={referenciasDisponibles} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">Hallazgos de este producto</p>
          <Link href={`/${slug}/hallazgos?referencia=${producto.referencia}`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Gestionar en Hallazgos
          </Link>
        </div>
        {producto.hallazgos.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin hallazgos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {producto.hallazgos.map((h) => (
              <li key={h.id} className="flex items-start justify-between gap-3">
                <div>
                  <p>{h.titulo}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{h.contenido}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {HALLAZGO_TIPOS[h.tipo].label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">Preguntas de este producto</p>
          <Link href={`/${slug}/preguntas?referencia=${producto.referencia}`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Gestionar en Preguntas
          </Link>
        </div>
        {producto.preguntas.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin preguntas registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {producto.preguntas.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3">
                <div>
                  <p>{p.titulo}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Preguntó {p.autor} {p.respuesta ? `· Respondió ${p.respondedor}` : "· Sin responder"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Prioridad {PREGUNTA_PRIORIDADES[p.prioridad]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.estado === "ABIERTA"
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                        : p.estado === "BORRADOR"
                          ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {PREGUNTA_ESTADOS[p.estado]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
