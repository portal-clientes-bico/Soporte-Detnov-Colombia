import Link from "next/link";
import { getMarcaPorSlug, getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import GarantiaForm from "../garantia-form";

export default async function NuevaGarantiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;
  const [referencias, usuarios] = await Promise.all([getReferenciasDeMarca(marca.id), getUsuarios()]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={`/${slug}/garantias`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Garantías
        </Link>
        <h1 className="mt-1 text-xl font-semibold">Nueva solicitud de garantía</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Se crea en Borrador. Cuando esté completa, cámbiala a «Enviada al fabricante» desde la bitácora.</p>
      </div>
      <GarantiaForm slug={slug} marcaId={marca.id} garantia={null} referencias={referencias} usuarios={usuarios} />
    </div>
  );
}
