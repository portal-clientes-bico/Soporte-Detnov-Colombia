import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMarcaPorSlug, getPreguntasDeMarca } from "@/lib/queries";
import { sesionActual } from "@/lib/sesion-actual";
import { textoTraducido } from "@/lib/hilo";
import { IDIOMA_VALUES, TEXTOS_PREGUNTA } from "@/lib/idioma";
import { asegurarTraducciones, traduccionVigente } from "@/lib/traduccion-preguntas";
import { DOCUMENTO_TIPOS, ORGANIZACIONES, PREGUNTA_ESTADOS, PREGUNTA_ESTADO_VALUES, PREGUNTA_PRIORIDADES, PREGUNTA_PRIORIDAD_VALUES, slugify } from "@/lib/tipos";
import type { IdiomaVista, SoportePreguntaEstado, SoportePreguntaPrioridad, TraduccionPregunta } from "@/lib/db";
import HiloMensajes from "../../../hilo-mensajes";
import TextoEnriquecido from "../../../texto-enriquecido";
import Imprimir from "./imprimir";

// La primera vez que se pide, traduce al ingles y al chino las preguntas que no tengan
// traduccion guardada (las siguientes veces ya no).
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type Filtros = { prioridad?: string; estado?: string; asignadoAUsuarioId?: string; referencia?: string };
type Pregunta = Awaited<ReturnType<typeof getPreguntasDeMarca>>[number];

const ETIQUETA_IDIOMA: Record<IdiomaVista, string> = { es: "Español", en: "English", zh: "中文" };
const FUENTE_IDIOMA: Record<IdiomaVista, string> = {
  es: "",
  en: "",
  // Para que el PDF use una fuente china del sistema (Windows, Mac, Android/Linux).
  zh: "[font-family:'Microsoft_YaHei','PingFang_SC','Noto_Sans_SC','Noto_Sans_CJK_SC',sans-serif]",
};

function fecha(iso: string | null, locale = "es-CO"): string {
  return iso ? new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }) : "";
}

function leerFiltros(sp: Filtros) {
  const prioridad = sp.prioridad && PREGUNTA_PRIORIDAD_VALUES.includes(sp.prioridad as SoportePreguntaPrioridad) ? (sp.prioridad as SoportePreguntaPrioridad) : undefined;
  const estado = sp.estado && PREGUNTA_ESTADO_VALUES.includes(sp.estado as SoportePreguntaEstado) ? (sp.estado as SoportePreguntaEstado) : undefined;
  return { prioridad, estado, asignadoAUsuarioId: sp.asignadoAUsuarioId || undefined, referencia: sp.referencia || undefined };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // El navegador propone este titulo como nombre del archivo al "Guardar como PDF".
  return { title: `reporte-preguntas-${slugify(slug)}-${new Date().toISOString().slice(0, 10)}`, robots: { index: false, follow: false } };
}

/**
 * Reporte de preguntas listo para guardar como PDF desde el navegador (abre solo el cuadro de
 * imprimir). Incluye las mismas preguntas que la lista con los filtros aplicados y, en cada una,
 * la pregunta y su hilo en español, ingles y chino, con sus imagenes y enlaces (en el PDF que
 * genera el navegador los enlaces quedan activos).
 */
export default async function ReportePreguntasPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Filtros> }) {
  const { slug } = await params;
  if (!(await sesionActual())) redirect(`/login?next=${encodeURIComponent(`/reporte/${slug}/preguntas`)}`);
  const marca = await getMarcaPorSlug(slug);
  if (!marca) redirect("/");

  const filtros = leerFiltros(await searchParams);
  const todas = await getPreguntasDeMarca(marca.id, filtros);
  const preguntas = filtros.referencia ? todas.filter((p) => p.productos.some((r) => r.referencia === filtros.referencia)) : todas;

  // Traducciones vigentes (o recien hechas) por idioma. En español solo se traduce lo que viene
  // en chino; el resto ya esta en español (ver requiereTraduccion).
  const traducciones = new Map<IdiomaVista, Map<string, TraduccionPregunta>>();
  for (const idioma of IDIOMA_VALUES) traducciones.set(idioma, await asegurarTraducciones(preguntas, idioma, preguntas.length));

  const asignado = filtros.asignadoAUsuarioId ? preguntas.find((p) => p.asignadoAUsuarioId === filtros.asignadoAUsuarioId)?.asignadoNombre : null;
  const filtrosTexto = [
    filtros.estado && `Estado: ${PREGUNTA_ESTADOS[filtros.estado]}`,
    filtros.prioridad && `Prioridad: ${PREGUNTA_PRIORIDADES[filtros.prioridad]}`,
    filtros.asignadoAUsuarioId && `Asignado a: ${asignado ?? "—"}`,
    filtros.referencia && `Producto: ${filtros.referencia}`,
  ].filter(Boolean);

  return (
    <div className="solo-claro mx-auto w-full max-w-4xl px-6 py-8 text-zinc-900 [color-scheme:light] print:max-w-none print:p-0 [print-color-adjust:exact]">
      <Imprimir total={preguntas.length} volver={`/${slug}/preguntas`} />

      <header className="mb-6 border-b border-zinc-300 pb-3">
        <h1 className="text-2xl font-semibold">Reporte de preguntas — {marca.nombre}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Generado el {fecha(new Date().toISOString())} · {preguntas.length} pregunta(s) · {filtrosTexto.length ? filtrosTexto.join(" · ") : "Sin filtros"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Cada pregunta se presenta en español, English y 中文. Las traducciones son automáticas.</p>
      </header>

      {preguntas.length === 0 && <p className="text-zinc-600">No hay preguntas con los filtros elegidos.</p>}

      {PREGUNTA_ESTADO_VALUES.map((estado) => {
        const delEstado = preguntas.filter((p) => p.estado === estado);
        if (delEstado.length === 0) return null;
        return (
          <section key={estado} className="mb-8">
            <h2 className="mb-3 border-b-2 border-zinc-400 pb-1 text-xl font-semibold">
              {PREGUNTA_ESTADOS[estado]} ({delEstado.length})
            </h2>
            {PREGUNTA_PRIORIDAD_VALUES.map((prioridad) => {
              const items = delEstado.filter((p) => p.prioridad === prioridad);
              if (items.length === 0) return null;
              return (
                <div key={prioridad} className="mb-6">
                  <h3 className="mb-3 text-base font-semibold text-zinc-700">
                    Prioridad {PREGUNTA_PRIORIDADES[prioridad]} ({items.length})
                  </h3>
                  <div className="flex flex-col gap-6">
                    {items.map((p) => (
                      <BloquePregunta key={p.id} p={p} traducciones={traducciones} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function BloquePregunta({ p, traducciones }: { p: Pregunta; traducciones: Map<IdiomaVista, Map<string, TraduccionPregunta>> }) {
  const metadata = [
    `Preguntó ${p.autor}`,
    `Creada ${fecha(p.createdAt)}`,
    p.asignadoNombre ? `Asignado a ${p.asignadoNombre}` : "Sin asignar",
    p.organizacion ? ORGANIZACIONES[p.organizacion] : null,
    p.fechaCierre ? `Cerrada ${fecha(p.fechaCierre)}` : null,
  ].filter(Boolean);

  return (
    <article className="rounded-lg border border-zinc-300 p-4 print:rounded-none print:border-x-0 print:border-b-0 print:px-0">
      <div className="break-inside-avoid">
        <h4 className="text-lg font-semibold">{p.titulo}</h4>
        <p className="mt-0.5 text-xs text-zinc-600">{metadata.join(" · ")}</p>
        {p.productos.length > 0 && (
          <p className="mt-1 text-xs">
            <span className="font-medium">Productos:</span> {p.productos.map((r) => r.referencia).join(", ")}
          </p>
        )}
        {p.archivos.length > 0 && (
          <p className="mt-1 text-xs">
            <span className="font-medium">Documentos:</span>{" "}
            {p.archivos.map((d, i) => {
              const url = d.archivoPath ? `/api/archivos/${d.archivoPath}` : d.urlOrigen;
              const texto = `${d.titulo} (${DOCUMENTO_TIPOS[d.tipo]})`;
              return (
                <span key={d.id}>
                  {i > 0 && "; "}
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">
                      {texto}
                    </a>
                  ) : (
                    texto
                  )}
                </span>
              );
            })}
          </p>
        )}
      </div>

      {IDIOMA_VALUES.map((idioma) => {
        const t = traducciones.get(idioma)?.get(p.id) ?? traduccionVigente(p, idioma);
        const textos = TEXTOS_PREGUNTA[idioma];
        const locale = idioma === "zh" ? "zh-CN" : idioma === "en" ? "en-US" : "es-CO";
        // Sin traduccion = se muestra el original (en español casi siempre ya es el original).
        const sinTraducir = !t && idioma !== "es";
        return (
          <div key={idioma} lang={idioma === "zh" ? "zh-Hans" : idioma} className={`mt-4 border-l-4 border-zinc-300 pl-3 ${FUENTE_IDIOMA[idioma]}`}>
            <p className="break-after-avoid text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {ETIQUETA_IDIOMA[idioma]} · {idioma.toUpperCase()}
              {sinTraducir && <span className="ml-2 font-normal normal-case text-amber-700">(sin traducción disponible: texto original)</span>}
            </p>
            <p className="mt-1 font-medium">{t?.titulo ?? p.titulo}</p>
            <TextoEnriquecido texto={t?.contenido ?? p.contenido} className="mt-1 text-sm" />
            <p className="mt-3 mb-1 text-xs font-semibold text-zinc-600">{textos.hiloTitulo}</p>
            <HiloMensajes mensajes={p.mensajes} textos={textos.hilo} traducido={t ? (m) => textoTraducido(t, m) : undefined} locale={locale} />
          </div>
        );
      })}
    </article>
  );
}
