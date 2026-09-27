import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import UsuarioActualBar from "./usuario-actual-bar";

export const metadata: Metadata = {
  title: "Base de conocimiento técnico Detnov Colombia",
  description: "Herramienta de soporte tecnico y biblioteca de documentacion.",
};

// Mismo criterio que en db.ts/storage.ts para elegir backend: si hay POSTGRES_URL, esta
// corriendo publicado en la nube (Postgres + Vercel Blob), no en disco local.
const CORRIENDO_EN_LA_NUBE = !!process.env.POSTGRES_URL;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
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
                <UsuarioActualBar />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
