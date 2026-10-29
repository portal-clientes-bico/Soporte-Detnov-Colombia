import type { Metadata } from "next";
import Link from "next/link";
import { mutarDb, type Documento, type IdiomaVista, type Producto } from "@/lib/db";
import { leerPreguntaPorToken } from "@/lib/enlace-externo";
import { IDIOMAS, IDIOMA_VALUES, normalizarIdioma } from "@/lib/idioma";
import { huellaPregunta, requiereTraduccion, traduccionVigente, traducirPregunta } from "@/lib/traduccion-preguntas";
import BanderaIdioma from "../../../bandera-idioma";
import FormulariosExterno from "./formularios";
import { TEXTOS_EXTERNO } from "./textos";

export const metadata: Metadata = {
  title: "Detnov Colombia — Support question",
  // Enlace privado: que no lo indexen buscadores.
  robots: { index: false, follow: false },
};

// Puede traducir la pregunta con Claude la primera vez que se abre en un idioma.
export const maxDuration = 120;

/**
 * Pagina publica (sin usuario ni contrasena) para que funcionarios de la fabrica vean una
 * pregunta, la respondan y adjunten documentos. El token del enlace es la autorizacion. El
 * idioma por defecto es ingles; las banderas cambian a español o chino (?lang=).
 */
export default async function ResponderPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { token } = await params;
  const { lang } = await searchParams;
  const idioma: IdiomaVista = lang ? normalizarIdioma(lang) : "en";
  const textos = TEXTOS_EXTERNO[idioma];

  const encontrado = await leerPreguntaPorToken(token);
  if (!encontrado) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          {TEXTOS_EXTERNO.en.noValido}
          <br />
          {TEXTOS_EXTERNO.es.noValido}
          <br />
          {TEXTOS_EXTERNO.zh.noValido}
        </p>
      </main>
    );
  }
  const { db, pregunta } = encontrado;

  // Traduccion al idioma de la pagina (se guarda: la siguiente visita no la vuelve a pagar).
  let vista = traduccionVigente(pregunta, idioma);
  if (!vista && requiereTraduccion(pregunta, idioma)) {
    try {
      const nueva = await traducirPregunta(pregunta, idioma);
      vista = nueva;
      await mutarDb((dbm) => {
        const p = dbm.preguntas.find((x) => x.id === pregunta.id);
        if (p && huellaPregunta(p) === nueva.huella) p.traducciones = { ...p.traducciones, [idioma]: nueva };
      });
    } catch (error) {
      console.error("No se pudo traducir la pregunta del enlace externo:", error);
    }
  }

  const marca = db.marcas.find((m) => m.id === pregunta.marcaId);
  const productos = db.preguntaProductos
    .filter((pp) => pp.preguntaId === pregunta.id)
    .map((pp) => db.productos.find((p) => p.id === pp.productoId))
    .filter((p): p is Producto => !!p)
    .sort((a, b) => a.referencia.localeCompare(b.referencia));
  const documentos = db.preguntaDocumentos
    .filter((pd) => pd.preguntaId === pregunta.id)
    .map((pd) => db.documentos.find((d) => d.id === pd.documentoId))
    .filter((d): d is Documento => !!d)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const titulo = vista?.titulo ?? pregunta.titulo;
  const contenido = vista?.contenido ?? pregunta.contenido;
  const respuesta = vista?.respuesta ?? pregunta.respuesta;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Detnov Colombia · {textos.titulo}</p>
          <h1 className="mt-1 text-2xl font-semibold">{titulo}</h1>
        </div>
        <nav className="flex items-center gap-1" aria-label="Language">
          {IDIOMA_VALUES.map((i) => (
            <Link
              key={i}
              href={`?lang=${i}`}
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
      </header>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{textos.intro}</p>

      <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {marca && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{textos.marca}: {marca.nombre}</span>}
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">{textos.estado[pregunta.estado]}</span>
          {vista && <span className="text-sky-700 dark:text-sky-400">🌐 {textos.traduccion}</span>}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{textos.pregunta}</p>
          <p className="mt-1 text-sm whitespace-pre-line text-zinc-800 dark:text-zinc-200">{contenido}</p>
        </div>
        {productos.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{textos.productos}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {productos.map((p) => (
                <span key={p.id} title={p.nombre} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {p.referencia}
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
              <p>{pregunta.contenido}</p>
              {pregunta.respuesta && <p>{pregunta.respuesta}</p>}
            </div>
          </details>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{textos.respuestas}</h2>
        {respuesta ? (
          <div className="rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800/60">
            {pregunta.respondedor && (
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {textos.respondida} {pregunta.respondedor}
              </p>
            )}
            <p className="mt-1 whitespace-pre-line text-zinc-800 dark:text-zinc-200">{respuesta}</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{textos.sinRespuesta}</p>
        )}
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
        <FormulariosExterno token={token} textos={textos} />
      )}
    </main>
  );
}
