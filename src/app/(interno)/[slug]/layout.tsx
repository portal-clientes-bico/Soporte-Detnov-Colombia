import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarcaPorSlug } from "@/lib/queries";
import MarcaTabs from "./marca-tabs";
import EditarMarca from "./editar-marca";

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
        <EditarMarca slug={slug} nombre={marca.nombre} descripcion={marca.descripcion} />
      </div>

      <MarcaTabs slug={slug} />

      {children}
    </div>
  );
}
