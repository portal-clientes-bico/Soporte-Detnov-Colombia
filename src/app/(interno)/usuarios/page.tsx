import Link from "next/link";
import { getUsuarios } from "@/lib/queries";
import UsuariosManager from "./usuarios-manager";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          Volver a marcas
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Usuarios</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Personas que usan esta herramienta (nombre y email). Se usan para identificarte al entrar y para prellenar
          quien pregunta / quien responde en el modulo de Preguntas.
        </p>
      </div>

      <UsuariosManager usuarios={usuarios} />
    </div>
  );
}
