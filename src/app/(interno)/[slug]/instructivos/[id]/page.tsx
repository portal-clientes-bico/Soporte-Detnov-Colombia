import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructivo, getMarcaPorSlug, getReferenciasDeMarca } from "@/lib/queries";
import InstructivoEditor from "./instructivo-editor";

export default async function InstructivoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const [instructivo, referencias] = await Promise.all([getInstructivo(marca.id, id), getReferenciasDeMarca(marca.id)]);
  if (!instructivo) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/${slug}/instructivos`} className="self-start text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
        ← Instructivos y Diagnóstico de Fallas
      </Link>
      {/* key: si el registro cambia en el servidor (ej. tras guardar), el editor arranca de nuevo con esos datos. */}
      <InstructivoEditor key={instructivo.updatedAt} instructivo={instructivo} referencias={referencias} slug={slug} />
    </div>
  );
}
