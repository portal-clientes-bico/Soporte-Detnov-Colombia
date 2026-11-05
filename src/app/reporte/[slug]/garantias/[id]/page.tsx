import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getGarantia, getMarcaPorSlug } from "@/lib/queries";
import { sesionActual } from "@/lib/sesion-actual";
import { GARANTIA_ESTADOS, TAREA_PRIORIDADES } from "@/lib/tipos";
import FichaGarantia, { fechaHora } from "../../../../ficha-garantia";
import Imprimir from "../../../imprimir";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }): Promise<Metadata> {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  const g = marca ? await getGarantia(marca.id, id) : null;
  // El navegador propone este titulo como nombre del archivo al "Guardar como PDF".
  return { title: g ? `${g.numero} - solicitud de garantia - ${marca?.nombre}` : "Garantia", robots: { index: false, follow: false } };
}

/**
 * Formato de solicitud de garantia para enviar al fabricante, listo para "Guardar como PDF":
 * datos del cliente, unidades con serial, condicion de falla y diagnostico (con imagenes y
 * enlaces activos). No incluye la bitacora interna ni la resolucion.
 */
export default async function FormatoGarantiaPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  if (!(await sesionActual())) redirect(`/login?next=${encodeURIComponent(`/reporte/${slug}/garantias/${id}`)}`);
  const marca = await getMarcaPorSlug(slug);
  if (!marca) notFound();
  const g = await getGarantia(marca.id, id);
  if (!g) notFound();

  return (
    <div className="solo-claro mx-auto w-full max-w-4xl px-6 py-8 text-zinc-900 [color-scheme:light] print:max-w-none print:p-0 [print-color-adjust:exact]">
      <Imprimir total={1} volver={`/${slug}/garantias/${g.id}`} />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-zinc-800 pb-3">
        <div>
          <p className="text-xs tracking-wide text-zinc-500 uppercase">Solicitud de garantía · Warranty claim</p>
          <h1 className="text-2xl font-semibold">{g.titulo}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {marca.nombre} · Detnov Colombia
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-mono text-lg font-semibold">{g.numero}</p>
          <p className="text-zinc-600">Fecha: {fechaHora(g.enviadaEn ?? g.createdAt)}</p>
          <p className="text-zinc-600">
            Prioridad: {TAREA_PRIORIDADES[g.prioridad]} · Estado: {GARANTIA_ESTADOS[g.estado]}
          </p>
        </div>
      </header>
      <FichaGarantia g={g} paraFabricante />
      <footer className="mt-8 border-t border-zinc-300 pt-3 text-xs text-zinc-500">
        Responsable en Detnov Colombia: {g.asignadoANombre ?? g.creadoPorNombre ?? "—"} · Generado el {fechaHora(new Date().toISOString())}
      </footer>
    </div>
  );
}
