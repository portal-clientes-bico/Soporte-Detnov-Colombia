import type { BloqueInstructivo } from "@/lib/db";

/**
 * Muestra los bloques de un instructivo tal como los ve el cliente. Sin hooks, para poder
 * usarse igual en el sitio publico (/ayuda, server component) y en la vista previa del editor
 * interno (client component).
 */
export default function InstructivoContenido({ bloques }: { bloques: BloqueInstructivo[] }) {
  if (bloques.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Este instructivo aun no tiene contenido.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {bloques.map((bloque, i) => {
        if (bloque.tipo === "TEXTO") {
          return (
            <p key={i} className="whitespace-pre-line text-[15px] leading-7 text-zinc-800 dark:text-zinc-200">
              {bloque.texto}
            </p>
          );
        }
        if (bloque.tipo === "IMAGEN") {
          return (
            <figure key={i} className="flex flex-col gap-2">
              <a href={`/api/archivos/${bloque.archivoPath}`} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagen servida por /api/archivos, sin optimizador */}
                <img
                  src={`/api/archivos/${bloque.archivoPath}`}
                  alt={bloque.pie ?? bloque.archivoNombre}
                  loading="lazy"
                  className="max-h-[560px] w-auto max-w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                />
              </a>
              {bloque.pie && <figcaption className="text-sm text-zinc-500 dark:text-zinc-400">{bloque.pie}</figcaption>}
            </figure>
          );
        }
        return (
          <figure key={i} className="flex flex-col gap-2">
            <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-zinc-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${bloque.youtubeId}`}
                title={bloque.pie ?? "Video de YouTube"}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
            {bloque.pie && <figcaption className="text-sm text-zinc-500 dark:text-zinc-400">{bloque.pie}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}
