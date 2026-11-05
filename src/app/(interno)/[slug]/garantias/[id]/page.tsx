import Link from "next/link";
import { notFound } from "next/navigation";
import { getGarantia, getMarcaPorSlug, getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import { GARANTIA_ESTADOS, TAREA_PRIORIDADES } from "@/lib/tipos";
import { GARANTIA_ESTADO_BADGE, GARANTIA_PRIORIDAD_BADGE, textoDias } from "../../../../garantia-estilos";
import FichaGarantia, { fechaHora } from "../../../../ficha-garantia";
import TextoEnriquecido from "../../../../texto-enriquecido";
import { BorrarGarantia, FichaEditable, NuevoEvento } from "./acciones";

export default async function GarantiaPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;
  const [g, referencias, usuarios] = await Promise.all([getGarantia(marca.id, id), getReferenciasDeMarca(marca.id), getUsuarios()]);
  if (!g) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/${slug}/garantias`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            ← Garantías
          </Link>
          <p className="mt-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">{g.numero}</p>
          <h1 className="text-xl font-semibold">{g.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 ${GARANTIA_ESTADO_BADGE[g.estado]}`}>{GARANTIA_ESTADOS[g.estado]}</span>
            <span className={`rounded-full px-2 py-0.5 ${GARANTIA_PRIORIDAD_BADGE[g.prioridad]}`}>Prioridad {TAREA_PRIORIDADES[g.prioridad]}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Creada {fechaHora(g.createdAt)} {g.creadoPorNombre ? `por ${g.creadoPorNombre}` : ""} · {g.abierta ? "abierta hace" : "estuvo abierta"} {textoDias(g.diasAbierta)}
              {g.diasEnFabricante !== null && ` · ${textoDias(g.diasEnFabricante)} esperando al fabricante`}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">· Responsable: {g.asignadoANombre ?? "sin asignar"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <a
            href={`/reporte/${slug}/garantias/${g.id}`}
            target="_blank"
            rel="noopener"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            🖨️ Formato para el fabricante (PDF)
          </a>
          <BorrarGarantia garantiaId={g.id} numero={g.numero} slug={slug} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <FichaEditable slug={slug} garantia={g} referencias={referencias} usuarios={usuarios}>
          <FichaGarantia g={g} />
        </FichaEditable>

        <aside className="flex flex-col gap-3">
          <h2 className="font-medium">Bitácora</h2>
          <NuevoEvento garantiaId={g.id} estadoActual={g.estado} />
          <ol className="flex flex-col gap-2">
            {[...g.eventos].reverse().map((e) => (
              <li
                key={e.id}
                className={`rounded-lg border-l-4 p-2 text-sm ${e.tipo === "ESTADO" ? "border-sky-400 bg-sky-50/60 dark:bg-sky-950/20" : "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/60"}`}
              >
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{e.autor}</span>
                  <span>{fechaHora(e.fecha)}</span>
                </div>
                {e.tipo === "ESTADO" && e.estadoNuevo && (
                  <p className="mt-1 text-xs">
                    {e.estadoAnterior ? `${GARANTIA_ESTADOS[e.estadoAnterior]} → ` : "Creada en "}
                    <span className={`rounded-full px-1.5 py-0.5 ${GARANTIA_ESTADO_BADGE[e.estadoNuevo]}`}>{GARANTIA_ESTADOS[e.estadoNuevo]}</span>
                  </p>
                )}
                {e.texto && <TextoEnriquecido texto={e.texto} className="mt-1 text-zinc-700 dark:text-zinc-300" />}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
