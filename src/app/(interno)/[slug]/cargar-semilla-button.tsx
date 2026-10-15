"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CargarSemillaButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setMensaje(null);
    setAdvertencias([]);
    const res = await fetch(`/api/marcas/${encodeURIComponent(slug)}/semilla`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudieron cargar los datos iniciales");
      return;
    }
    setMensaje(
      `Cargados: ${data.fuentes} fuentes, ${data.productos} productos, ${data.compatibilidades} compatibilidades, ${data.documentos} documentos, ${data.hallazgos} hallazgos.`,
    );
    setAdvertencias(data.advertencias ?? []);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? "Cargando..." : "Cargar / actualizar datos iniciales"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {mensaje && <p className="text-sm text-emerald-700 dark:text-emerald-400">{mensaje}</p>}
      {advertencias.length > 0 && (
        <div className="text-xs text-amber-700 dark:text-amber-400">
          <p className="font-medium">Advertencias:</p>
          <ul className="list-inside list-disc">
            {advertencias.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
