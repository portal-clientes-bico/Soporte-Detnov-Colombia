import Link from "next/link";
import { getMarcas } from "@/lib/queries";
import NuevaMarcaForm from "./nueva-marca-form";

export default async function HomePage() {
  const marcas = await getMarcas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Marcas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Base de conocimiento por marca: referencias, documentos (con fuente, version, fecha e idioma),
          fuentes de informacion y hallazgos de investigacion.
        </p>
      </div>

      {marcas.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aun no hay marcas. Crea una abajo, o si es tu primera vez, crea &quot;Maple Armor&quot; y luego usa el
          boton &quot;Cargar / actualizar datos iniciales&quot; dentro de la marca.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marcas.map((m) => (
            <Link
              key={m.id}
              href={`/${m.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{m.nombre}</p>
                {m.hallazgosAbiertos > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {m.hallazgosAbiertos} pendiente{m.hallazgosAbiertos === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {m.descripcion && <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{m.descripcion}</p>}
              <div className="mt-1 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{m.productos} referencias</span>
                <span>{m.documentos} documentos</span>
                <span>{m.fuentes} fuentes</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="max-w-md">
        <NuevaMarcaForm />
      </div>
    </div>
  );
}
