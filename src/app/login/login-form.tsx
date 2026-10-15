"use client";

import { useState } from "react";
import { guardarUsuarioActual } from "@/lib/usuario-actual";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function LoginForm({ destino, primeraCuenta }: { destino: string; primeraCuenta: boolean }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(primeraCuenta ? "/api/usuarios" : "/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(primeraCuenta ? { nombre, email, password } : { email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "No se pudo iniciar sesion");
      return;
    }
    guardarUsuarioActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    // Recarga completa para que el servidor vea la cookie de sesion recien emitida.
    window.location.assign(destino);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <p className="text-base font-semibold">{primeraCuenta ? "Crear la primera cuenta" : "Iniciar sesion"}</p>
      {primeraCuenta && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Todavia no hay usuarios con contrasena. Esta cuenta podra crear las demas desde Usuarios.
        </p>
      )}
      {primeraCuenta && (
        <div>
          <label className="block text-xs text-zinc-600 dark:text-zinc-400">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus className={inputClass} />
        </div>
      )}
      <div>
        <label className="block text-xs text-zinc-600 dark:text-zinc-400">Correo electronico</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus={!primeraCuenta} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs text-zinc-600 dark:text-zinc-400">Contrasena</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={primeraCuenta ? 4 : undefined}
          className={inputClass}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? "Ingresando..." : primeraCuenta ? "Crear cuenta e ingresar" : "Ingresar"}
      </button>
    </form>
  );
}
