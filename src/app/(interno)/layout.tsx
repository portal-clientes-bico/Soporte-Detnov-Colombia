import Link from "next/link";
import { redirect } from "next/navigation";
import UsuarioActualBar from "./usuario-actual-bar";
import { sesionActual } from "@/lib/sesion-actual";

// Mismo criterio que en db.ts/storage.ts para elegir backend: si hay POSTGRES_URL, esta
// corriendo publicado en la nube (Postgres + Vercel Blob), no en disco local.
const CORRIENDO_EN_LA_NUBE = !!process.env.POSTGRES_URL;

export default async function InternoLayout({ children }: { children: React.ReactNode }) {
  // src/proxy.ts ya redirige sin sesion; esto es una segunda barrera por si el proxy no corre.
  const sesion = await sesionActual();
  if (!sesion) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <a href="/" className="shrink-0 text-sm font-semibold">
            Base de conocimiento técnico Detnov Colombia{" "}
            <span className="font-normal text-zinc-500">({CORRIENDO_EN_LA_NUBE ? "nube" : "local"})</span>
          </a>
          <p className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">
            {CORRIENDO_EN_LA_NUBE ? (
              <>Alojado en Vercel — base de datos en Postgres, archivos en Vercel Blob</>
            ) : (
              <>
                Corre solo en tu computador — los datos viven en <code>data/db.json</code>
              </>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/usuarios" className="text-xs text-zinc-500 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Usuarios
            </Link>
            <UsuarioActualBar usuario={{ id: sesion.id, nombre: sesion.nombre }} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
