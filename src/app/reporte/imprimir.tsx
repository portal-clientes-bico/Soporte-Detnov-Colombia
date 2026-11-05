"use client";

import { useEffect, useRef, useState } from "react";

/** Espera a que carguen las imagenes del reporte (si no, salen en blanco en el PDF). */
async function imagenesCargadas(): Promise<void> {
  const pendientes = Array.from(document.images).filter((img) => !img.complete);
  await Promise.all(
    pendientes.map(
      (img) =>
        new Promise<void>((listo) => {
          img.addEventListener("load", () => listo(), { once: true });
          img.addEventListener("error", () => listo(), { once: true });
        }),
    ),
  );
}

/**
 * Barra del reporte (no sale en el PDF): abre el cuadro de imprimir una sola vez al cargar,
 * ya con las imagenes listas, y deja un boton para volver a abrirlo. En el cuadro se elige
 * "Guardar como PDF" como impresora.
 */
export default function Imprimir({ total, volver }: { total: number; volver: string }) {
  const [listo, setListo] = useState(false);
  const yaAbrio = useRef(false);

  useEffect(() => {
    // Las imagenes son "lazy": en el reporte se cargan todas de una vez.
    document.querySelectorAll("img[loading=lazy]").forEach((img) => img.setAttribute("loading", "eager"));
    imagenesCargadas().then(() => {
      setListo(true);
      if (!yaAbrio.current && total > 0) {
        yaAbrio.current = true;
        window.print();
      }
    });
  }, [total]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        disabled={!listo}
        className="rounded-full bg-zinc-900 px-4 py-1.5 font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {listo ? "Guardar como PDF" : "Cargando imágenes..."}
      </button>
      <span className="text-zinc-600">En el cuadro de imprimir elige «Guardar como PDF» como destino. Los enlaces quedan activos en el PDF.</span>
      <a href={volver} className="ml-auto text-zinc-500 underline hover:text-zinc-900">
        Volver
      </a>
    </div>
  );
}
