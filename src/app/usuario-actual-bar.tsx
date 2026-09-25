"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { leerUsuarioActual, guardarUsuarioActual, type UsuarioActual } from "@/lib/usuario-actual";

interface UsuarioListado {
  id: string;
  nombre: string;
  email: string | null;
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function UsuarioActualBar({ usuarios }: { usuarios: UsuarioListado[] }) {
  const router = useRouter();
  const [actual, setActual] = useState<UsuarioActual | null>(null);
  const [cargado, setCargado] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState<"elegir" | "nuevo">(usuarios.length === 0 ? "nuevo" : "elegir");
  const [seleccionId, setSeleccionId] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [emailNuevo, setEmailNuevo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const guardado = leerUsuarioActual();
    setActual(guardado);
    setCargado(true);
    if (!guardado) setModalAbierto(true);
  }, []);

  function confirmarExistente() {
    const u = usuarios.find((x) => x.id === seleccionId);
    if (!u) return;
    guardarUsuarioActual({ id: u.id, nombre: u.nombre });
    setActual({ id: u.id, nombre: u.nombre });
    setModalAbierto(false);
  }

  async function crearYConfirmar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo, email: emailNuevo }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    guardarUsuarioActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setActual({ id: data.usuario.id, nombre: data.usuario.nombre });
    setNombreNuevo("");
    setEmailNuevo("");
    setModalAbierto(false);
    router.refresh();
  }

  if (!cargado) return null;

  return (
    <>
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {actual ? (
          <>
            <span>👤 {actual.nombre}</span>
            <button type="button" onClick={() => setModalAbierto(true)} className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
              cambiar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setModalAbierto(true)} className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Identificarme
          </button>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-1 text-base font-semibold">¿Quien eres?</p>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Se usa para prellenar quien pregunta / quien responde en el modulo de Preguntas. No es una contrasena ni un control de acceso.
            </p>

            {usuarios.length > 0 && (
              <div className="mb-3 flex gap-4 text-xs">
                <button type="button" onClick={() => setModo("elegir")} className={modo === "elegir" ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}>
                  Ya estoy en la lista
                </button>
                <button type="button" onClick={() => setModo("nuevo")} className={modo === "nuevo" ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}>
                  Soy nuevo
                </button>
              </div>
            )}

            {modo === "elegir" && usuarios.length > 0 ? (
              <div className="flex flex-col gap-3">
                <select value={seleccionId} onChange={(e) => setSeleccionId(e.target.value)} className={inputClass}>
                  <option value="">Selecciona tu nombre...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                      {u.email ? ` (${u.email})` : ""}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={confirmarExistente}
                    disabled={!seleccionId}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Continuar
                  </button>
                  {actual && (
                    <button type="button" onClick={() => setModalAbierto(false)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={crearYConfirmar} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Nombre</label>
                  <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} required minLength={1} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400">Email (opcional)</label>
                  <input type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} className={inputClass} />
                </div>
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    {loading ? "Guardando..." : "Crear y continuar"}
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
