"use client";

import { useRouter } from "next/navigation";
import type { IdiomaVista } from "@/lib/db";
import { COOKIE_IDIOMA, IDIOMAS, IDIOMA_VALUES, valorCookieIdioma } from "@/lib/idioma";
import BanderaIdioma from "../bandera-idioma";

/** Banderas del encabezado: la persona ve el contenido en su idioma por defecto (Usuarios) y
 * con un clic lo cambia a otro. La eleccion se guarda en una cookie atada a su usuario. */
export default function SelectorIdioma({ idioma, idiomaPorDefecto, usuarioId }: { idioma: IdiomaVista; idiomaPorDefecto: IdiomaVista; usuarioId: string }) {
  const router = useRouter();

  function elegir(nuevo: IdiomaVista) {
    if (nuevo === idioma) return;
    document.cookie = `${COOKIE_IDIOMA}=${valorCookieIdioma(usuarioId, nuevo)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Idioma / Language / 语言">
      {IDIOMA_VALUES.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => elegir(i)}
          aria-pressed={i === idioma}
          title={`${IDIOMAS[i].nombre}${i === idiomaPorDefecto ? " (idioma por defecto)" : ""}`}
          className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs ${
            i === idioma
              ? "border-zinc-900 bg-zinc-100 font-medium text-zinc-900 dark:border-zinc-50 dark:bg-zinc-800 dark:text-zinc-50"
              : "border-transparent text-zinc-500 opacity-60 hover:opacity-100 dark:text-zinc-400"
          }`}
        >
          <BanderaIdioma idioma={i} className="h-3 w-[18px] rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
          <span>{IDIOMAS[i].corto}</span>
        </button>
      ))}
    </div>
  );
}
