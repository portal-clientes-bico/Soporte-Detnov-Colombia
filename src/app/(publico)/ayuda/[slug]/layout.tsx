import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarcaPorSlug, getMarcasAyuda } from "@/lib/queries";

export default async function AyudaMarcaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [marca, marcas] = await Promise.all([getMarcaPorSlug(slug), getMarcasAyuda()]);
  if (!marca) notFound();
  const otras = marcas.filter((m) => m.slug !== slug);

  return (
    <>
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <Link href={`/ayuda/${slug}`} className="text-base font-semibold">
            Centro de ayuda {marca.nombre}
          </Link>
          {/* Selector de marca sin JavaScript (details/summary): lleva a la ayuda de otra marca o al menu de marcas. */}
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">
              Cambiar de marca <span className="inline-block transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="absolute right-0 z-20 mt-2 flex w-56 flex-col rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {otras.map((m) => (
                <Link key={m.slug} href={`/ayuda/${m.slug}`} className="px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  {m.nombre}
                </Link>
              ))}
              <Link
                href="/ayuda"
                className={`px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${otras.length > 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""}`}
              >
                Ver todas las marcas
              </Link>
            </div>
          </details>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
