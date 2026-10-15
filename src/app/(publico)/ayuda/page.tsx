import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getMarcasAyuda } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Centro de ayuda | Soporte técnico Detnov Colombia",
  description: "Elige la marca de tu equipo para encontrar instructivos y guías de diagnóstico de fallas.",
};

/** Puerta de entrada del sitio publico: el cliente elige la marca en la que necesita soporte. */
export default async function AyudaInicioPage() {
  // Sin esto Next la prerenderiza en el build y la lista de marcas quedaria congelada.
  await connection();
  const marcas = await getMarcasAyuda();

  return (
    <>
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl items-baseline justify-between gap-4">
          <Link href="/ayuda" className="text-base font-semibold">
            Centro de ayuda
          </Link>
          <span className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">Instructivos y diagnóstico de fallas</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold">¿Con qué marca necesitas soporte?</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Elige la marca de tu equipo para ver sus instructivos y guías de diagnóstico de fallas.</p>
          </div>

          {marcas.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Aún no hay marcas disponibles.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {marcas.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/ayuda/${m.slug}`}
                    className="flex h-full flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-lg font-semibold">{m.nombre}</span>
                      <span aria-hidden="true" className="text-zinc-400">
                        →
                      </span>
                    </span>
                    {m.descripcion && <span className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{m.descripcion}</span>}
                    <span className="mt-auto text-xs text-zinc-500 dark:text-zinc-400">
                      {m.publicados === 0
                        ? "Instructivos próximamente"
                        : `${m.publicados} instructivo${m.publicados === 1 ? "" : "s"} disponible${m.publicados === 1 ? "" : "s"}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
