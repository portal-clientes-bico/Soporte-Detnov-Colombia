import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarcaPorSlug } from "@/lib/queries";
import MarcaTabs from "./marca-tabs";

export default async function MarcaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Marcas
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{marca.nombre}</h1>
        {marca.descripcion && <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{marca.descripcion}</p>}
      </div>

      <MarcaTabs slug={slug} />

      {children}
    </div>
  );
}
