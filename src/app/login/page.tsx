import { redirect } from "next/navigation";
import { leerDb } from "@/lib/db";
import { sesionActual } from "@/lib/sesion-actual";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

/** Solo se aceptan rutas internas relativas ("/algo"), nunca "//otro-sitio" ni URLs absolutas. */
function destinoSeguro(next: string | string[] | undefined): string {
  const valor = Array.isArray(next) ? next[0] : next;
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return "/";
  return valor;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const destino = destinoSeguro((await searchParams).next);
  if (await sesionActual()) redirect(destino);

  const db = await leerDb();
  const primeraCuenta = !db.usuarios.some((u) => !!u.passwordHash);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Base de conocimiento técnico Detnov Colombia</p>
        <LoginForm destino={destino} primeraCuenta={primeraCuenta} />
      </div>
    </main>
  );
}
