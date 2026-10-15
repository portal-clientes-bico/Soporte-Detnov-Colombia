import { getMarcaPorSlug, getTraduccionesDeMarca } from "@/lib/queries";
import TraduccionesManager from "./traducciones-manager";

export default async function TraduccionesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;

  const entradas = await getTraduccionesDeMarca(marca.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Traducciones</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Control de que documentos en ingles ya tienen su version en español, y en que estado de revision esta cada una (
          <span className="font-medium">Borrador</span>, <span className="font-medium">En Revisión</span>, <span className="font-medium">Aprobado</span>).
        </p>
      </div>
      <TraduccionesManager entradas={entradas} />
    </div>
  );
}
