import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstructivoPublicado, getMarcaPorSlug } from "@/lib/queries";
import { INSTRUCTIVO_TIPOS } from "@/lib/tipos";
import InstructivoContenido from "../../../../instructivo-contenido";
import CompartirWhatsapp from "../../../../compartir-whatsapp";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }): Promise<Metadata> {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  const instructivo = marca ? await getInstructivoPublicado(marca.id, id) : null;
  if (!marca || !instructivo) return { title: "Centro de ayuda" };
  return { title: `${instructivo.titulo} | Centro de ayuda ${marca.nombre}`, description: instructivo.resumen ?? undefined };
}

export default async function AyudaInstructivoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) notFound();
  // Un registro En elaboracion responde igual que uno inexistente: el cliente no debe saber que existe.
  const instructivo = await getInstructivoPublicado(marca.id, id);
  if (!instructivo) notFound();

  return (
    <article className="flex flex-col gap-5">
      <Link href={`/ayuda/${slug}`} className="self-start text-sm text-zinc-500 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
        ← Todos los instructivos
      </Link>
      <header className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{INSTRUCTIVO_TIPOS[instructivo.tipo]}</span>
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{instructivo.titulo}</h1>
        {instructivo.resumen && <p className="text-zinc-600 dark:text-zinc-400">{instructivo.resumen}</p>}
        <div>
          <CompartirWhatsapp titulo={instructivo.titulo} ruta={`/ayuda/${slug}/${instructivo.id}`} />
        </div>
        {instructivo.productos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {instructivo.productos.map((p) => (
              <span key={p.id} title={p.nombre} className="rounded-full border border-zinc-300 bg-white px-2.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {p.referencia}
              </span>
            ))}
          </div>
        )}
      </header>
      <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <InstructivoContenido bloques={instructivo.bloques} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Última actualización: {new Date(instructivo.updatedAt).toLocaleDateString("es-CO", { dateStyle: "long" })}
        </p>
        <CompartirWhatsapp titulo={instructivo.titulo} ruta={`/ayuda/${slug}/${instructivo.id}`} />
      </div>
    </article>
  );
}
