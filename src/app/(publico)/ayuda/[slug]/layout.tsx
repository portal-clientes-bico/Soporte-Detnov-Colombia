import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarcaPorSlug } from "@/lib/queries";

export default async function AyudaMarcaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) notFound();

  return (
    <>
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl items-baseline justify-between gap-4">
          <Link href={`/ayuda/${slug}`} className="text-base font-semibold">
            Centro de ayuda {marca.nombre}
          </Link>
          <span className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">Instructivos y diagnóstico de fallas</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
