"use client";

import { useEffect, useState } from "react";
import { guardarUsuarioActual, olvidarUsuarioActual, type UsuarioActual } from "@/lib/usuario-actual";

/** Muestra quien tiene la sesion iniciada (viene de la cookie, leida en el servidor) y permite
 * cerrarla. Tambien deja el id/nombre en localStorage, que es de donde el modulo de Preguntas
 * prellena "quien pregunta" / "quien responde". */
export default function UsuarioActualBar({ usuario }: { usuario: UsuarioActual }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    guardarUsuarioActual(usuario);
  }, [usuario.id, usuario.nombre]);

  async function cerrarSesion() {
    setSaliendo(true);
    await fetch("/api/usuarios/logout", { method: "POST" }).catch(() => null);
    olvidarUsuarioActual();
    window.location.assign("/login");
  }

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      <span>👤 {usuario.nombre}</span>
      <button type="button" onClick={cerrarSesion} disabled={saliendo} className="underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-zinc-50">
        {saliendo ? "cerrando..." : "cerrar sesion"}
      </button>
    </div>
  );
}
