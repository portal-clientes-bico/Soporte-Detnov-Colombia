"use client";

import { useRouter } from "next/navigation";
import type { IdiomaVista } from "@/lib/db";
import { COOKIE_IDIOMA, IDIOMAS, IDIOMA_VALUES } from "@/lib/idioma";

/** Icono de idioma del encabezado: guarda la eleccion en una cookie (un año) y recarga los
 * datos del servidor para que las preguntas se muestren en ese idioma. */
export default function SelectorIdioma({ idioma }: { idioma: IdiomaVista }) {
  const router = useRouter();

  function elegir(nuevo: IdiomaVista) {
    if (nuevo === idioma) return;
    document.cookie = `${COOKIE_IDIOMA}=${nuevo}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs" title="Idioma de las preguntas / Question language / 问题语言">
      <span aria-hidden="true">🌐</span>
      {IDIOMA_VALUES.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => elegir(i)}
          aria-pressed={i === idioma}
          title={IDIOMAS[i].nombre}
          className={`rounded-full px-2 py-0.5 ${
            i === idioma
              ? "bg-zinc-900 font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          }`}
        >
          {IDIOMAS[i].corto}
        </button>
      ))}
    </div>
  );
}
