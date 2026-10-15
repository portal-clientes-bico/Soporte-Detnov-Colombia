import { getFuentesDeMarca, getMarcaPorSlug } from "@/lib/queries";
import FuentesManager from "./fuentes-manager";

export default async function FuentesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const fuentes = await getFuentesDeMarca(marca.id);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Fuentes de informacion ordenadas por prioridad (1 = mas confiable). Ante una discrepancia entre dos
        fuentes, prevalece la de mayor prioridad, pero se registra la discrepancia en Hallazgos.
      </p>
      <FuentesManager marcaId={marca.id} fuentes={fuentes} />
    </div>
  );
}
