"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { leerUsuarioActual, guardarUsuarioActual, olvidarUsuarioActual, type UsuarioActual } from "@/lib/usuario-actual";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function UsuarioActualBar() {
  const router = useRouter();
  const [actual, setActual] = useState<UsuarioActual | null>(null);
  const [cargado, setCargado] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState<"ingresar" | "crear">("ingresar");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [emailNuevo, setEmailNuevo] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const guardado = leerUsuarioActual();
    setActual(guardado);
    setCargado(true);
    if (!guardado) setModalAbierto(true);
  }, []);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo iniciar sesion");
      return;
    }
    guardarUsuarioActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setEmail("");
    setPassword("");
    setModalAbierto(false);
    router.refresh();
  }

  async function crearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo, email: emailNuevo, password: passwordNuevo }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la cuenta");
      return;
    }
    guardarUsuarioActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setNombreNuevo("");
    setEmailNuevo("");
    setPasswordNuevo("");
    setModalAbierto(false);
    router.refresh();
  }

  function cerrarSesion() {
    olvidarUsuarioActual();
    setActual(null);
    setModalAbierto(true);
  }

  function abrirModal(m: "ingresar" | "crear") {
    setError(null);
    setModo(m);
    setModalAbierto(true);
  }

  if (!cargado) return null;

  return (
    <>
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {actual ? (
          <>
            <span>👤 {actual.nombre}</span>
            <button type="button" onClick={cerrarSesion} className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
              cerrar sesion
            </button>
          </>
        ) : (
          <button type="button" onClick={() => abrirModal("ingresar")} className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Iniciar sesion
          </button>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-1 text-base font-semibold">{modo === "ingresar" ? "Iniciar sesion" : "Crear cuenta"}</p>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Tu nombre se usa para prellenar quien pregunta / quien responde en el modulo de Preguntas.
            </p>

            <div className="mb-3 flex gap-4 text-xs">
              <button type="button" onClick={() => abrirModal("ingresar")} className={modo === "ingresar" ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}>
                Ya tengo cuenta
              </button>
              <button type="button" onClick={() => abrirModal("crear")} className={modo === "crear" ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}>
                Soy nuevo
              </button>
            </div>

            {modo === "ingresar" ? (
              <form onSubmit={ingresar} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Correo electronico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Contrasena</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
                </div>
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>
                  {actual && (
                    <button type="button" onClick={() => setModalAbierto(false)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={crearCuenta} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Nombre</label>
                  <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} required minLength={1} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Correo electronico</label>
                  <input type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Contrasena</label>
                  <input type="password" value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} required minLength={4} className={inputClass} />
                </div>
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    {loading ? "Creando..." : "Crear cuenta y continuar"}
                  </button>
                  {actual && (
                    <button type="button" onClick={() => setModalAbierto(false)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
