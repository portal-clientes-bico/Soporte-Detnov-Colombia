import type { Metadata } from "next";
import Link from "next/link";
import { leerDb, type Documento, type IdiomaVista, type Producto } from "@/lib/db";
import { preguntaPorToken, preguntasDelEnlace } from "@/lib/enlace-externo";
import { IDIOMAS, IDIOMA_VALUES, TEXTOS_PREGUNTA, normalizarIdioma } from "@/lib/idioma";
import { mensajesDe, textoTraducido } from "@/lib/hilo";
import { PREGUNTA_PRIORIDAD_VALUES } from "@/lib/tipos";
import HiloMensajes from "../../../hilo-mensajes";
import TextoEnriquecido from "../../../texto-enriquecido";
import { asegurarTraducciones } from "@/lib/traduccion-preguntas";
import BanderaIdioma from "../../../bandera-idioma";
import FormulariosExterno from "./formularios";
import { TEXTOS_EXTERNO } from "./textos";

export const metadata: Metadata = {
  title: "Detnov Colombia — Support question",
  // Enlace privado: que no lo indexen buscadores.
  robots: { index: false, follow: false },
};

// Puede traducir las preguntas con Claude la primera vez que se abren en un idioma.
export const maxDuration = 120;

// Mismos tonos que la vista interna de Preguntas.
const PRIORIDAD_BADGE: Record<string, string> = {
  ALTA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  MEDIA: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  BAJA: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

function href(idioma: IdiomaVista, preguntaId: string | null): string {
  return `?lang=${idioma}${preguntaId ? `&p=${encodeURIComponent(preguntaId)}` : ""}`;
}

/**
 * Pagina publica (sin usuario ni contrasena) para que funcionarios de la fabrica vean una
 * pregunta, la respondan y adjunten documentos. El token del enlace es la autorizacion: da
 * acceso a su pregunta y, desde el menu superior, a las demas preguntas no resueltas de la
 * misma marca (?p=<id>). El idioma por defecto es ingles; las banderas cambian a español o
 * chino (?lang=).
 */
export default async function ResponderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string; p?: string }>;
}) {
  const { token } = await params;
  const { lang, p } = await searchParams;
  const idioma: IdiomaVista = lang ? normalizarIdioma(lang) : "en";
  const textos = TEXTOS_EXTERNO[idioma];

  const db = await leerDb();
  const base = preguntaPorToken(db, token);
  // Solo se ven preguntas abiertas: la pedida (?p=), la del enlace o, si esa ya se cerro, la
  // primera abierta de la marca.
  const menu = base ? preguntasDelEnlace(db, base) : [];
  const pregunta = menu.find((x) => x.id === p) ?? menu.find((x) => x.id === base?.id) ?? menu[0] ?? null;
  if (!base || !pregunta) {
    const clave = base ? "sinAbiertas" : "noValido";
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          {TEXTOS_EXTERNO.en[clave]}
          <br />
          {TEXTOS_EXTERNO.es[clave]}
          <br />
          {TEXTOS_EXTERNO.zh[clave]}
        </p>
      </main>
    );
  }

  // Traduccion al idioma de la pagina de la pregunta abierta y de los titulos del menu (se
  // guardan: las siguientes visitas no las vuelven a pagar).
  const traducciones = await asegurarTraducciones([pregunta, ...menu.filter((x) => x.id !== pregunta.id)], idioma);
  const vista = traducciones.get(pregunta.id) ?? null;
  const tituloDe = (x: { id: string; titulo: string }) => traducciones.get(x.id)?.titulo ?? x.titulo;

  const marca = db.marcas.find((m) => m.id === pregunta.marcaId);
  const productos = db.preguntaProductos
    .filter((pp) => pp.preguntaId === pregunta.id)
    .map((pp) => db.productos.find((x) => x.id === pp.productoId))
    .filter((x): x is Producto => !!x)
    .sort((a, b) => a.referencia.localeCompare(b.referencia));
  const documentos = db.preguntaDocumentos
    .filter((pd) => pd.preguntaId === pregunta.id)
    .map((pd) => db.documentos.find((d) => d.id === pd.documentoId))
    .filter((d): d is Documento => !!d)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const contenido = vista?.contenido ?? pregunta.contenido;
  const mensajes = mensajesDe(pregunta);
  const locale = idioma === "zh" ? "zh-CN" : idioma === "en" ? "en-US" : "es-CO";
  const pActual = pregunta.id === base.id ? null : pregunta.id;
  const abiertas = menu.filter((x) => x.estado === "ABIERTA").length;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold">
            Detnov Colombia <span className="font-normal text-zinc-500 dark:text-zinc-400">· {marca?.nombre ?? textos.titulo}</span>
          </p>
          <nav className="flex items-center gap-1" aria-label="Language">
            {IDIOMA_VALUES.map((i) => (
              <Link
                key={i}
                href={href(i, pActual)}
                aria-current={i === idioma ? "true" : undefined}
                title={IDIOMAS[i].nombre}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                  i === idioma
                    ? "border-zinc-900 bg-white font-medium text-zinc-900 dark:border-zinc-50 dark:bg-zinc-800 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 opacity-70 hover:opacity-100 dark:text-zinc-400"
                }`}
              >
                <BanderaIdioma idioma={i} className="h-3 w-[18px] rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
                {IDIOMAS[i].corto}
              </Link>
            ))}
          </nav>
        </div>
        <details className="group mx-auto w-full max-w-5xl px-4 pb-3 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium select-none marker:content-none">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span>
            {textos.menu}
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">{abiertas}</span>
          </summary>
          <div className="mt-2 flex max-h-80 flex-col gap-3 overflow-y-auto">
            {PREGUNTA_PRIORIDAD_VALUES.map((prioridad) => {
              const grupo = menu.filter((x) => x.prioridad === prioridad);
              if (grupo.length === 0) return null;
              return (
                <div key={prioridad}>
                  <p className="mb-1 flex items-center gap-2 px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span className={`rounded-full px-2 py-0.5 ${PRIORIDAD_BADGE[prioridad]}`}>
                      {TEXTOS_PREGUNTA[idioma].prioridad}: {TEXTOS_PREGUNTA[idioma].prioridades[prioridad]}
                    </span>
                    <span>{grupo.length}</span>
                  </p>
                  <ul className="flex flex-col gap-1">
                    {grupo.map((x) => {
                      const actual = x.id === pregunta.id;
                      return (
                        <li key={x.id}>
                          <Link
                            href={href(idioma, x.id === base.id ? null : x.id)}
                            aria-current={actual ? "page" : undefined}
                            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                              actual ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span className="min-w-0 truncate">{tituloDe(x)}</span>
                            <span className="shrink-0 text-xs opacity-70">{x.respuesta ? textos.conRespuesta : textos.sinRespuestaCorto}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </details>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{textos.titulo}</p>
          <h1 className="mt-1 text-2xl font-semibold">{tituloDe(pregunta)}</h1>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">{textos.intro}</p>

        <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {marca && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{textos.marca}: {marca.nombre}</span>}
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">{textos.estado[pregunta.estado]}</span>
            <span className={`rounded-full px-2 py-0.5 ${PRIORIDAD_BADGE[pregunta.prioridad]}`}>
              {TEXTOS_PREGUNTA[idioma].prioridad}: {TEXTOS_PREGUNTA[idioma].prioridades[pregunta.prioridad]}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {textos.creada} {new Date(pregunta.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}
            </span>
            {vista && <span className="text-sky-700 dark:text-sky-400">🌐 {textos.traduccion}</span>}
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{textos.pregunta}</p>
            <TextoEnriquecido texto={contenido} className="mt-1 text-sm text-zinc-800 dark:text-zinc-200" />
          </div>
          {productos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{textos.productos}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {productos.map((x) => (
                  <span key={x.id} title={x.nombre} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {x.referencia}
                  </span>
                ))}
              </div>
            </div>
          )}
          {vista && (
            <details className="text-xs text-zinc-500 dark:text-zinc-400">
              <summary className="cursor-pointer underline">{textos.verOriginal}</summary>
              <div className="mt-2 flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 whitespace-pre-line dark:bg-zinc-800/60">
                <p className="font-medium">{pregunta.titulo}</p>
                <TextoEnriquecido texto={pregunta.contenido} />
                {mensajes.map((m) => (
                  <TextoEnriquecido key={m.id} texto={`${m.autor}: ${m.texto}`} />
                ))}
              </div>
            </details>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{textos.respuestas}</h2>
          <HiloMensajes
            mensajes={mensajes}
            textos={TEXTOS_PREGUNTA[idioma].hilo}
            traducido={(m) => textoTraducido(vista, m)}
            locale={locale}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{textos.documentos}</h2>
          {documentos.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{textos.sinDocumentos}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {documentos.map((d) => (
                <li key={d.id} className="text-sm">
                  {d.archivoPath ? (
                    <a href={`/api/archivos/${d.archivoPath}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
                      📎 {d.titulo}
                    </a>
                  ) : (
                    <span>📎 {d.titulo}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {pregunta.estado === "CERRADA" ? (
          <p className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">{textos.cerrada}</p>
        ) : (
          <FormulariosExterno key={pregunta.id} token={token} preguntaId={pregunta.id} textos={textos} />
        )}
      </main>
    </div>
  );
}
