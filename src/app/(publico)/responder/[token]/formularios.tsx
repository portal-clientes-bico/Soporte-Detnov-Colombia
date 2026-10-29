"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ARCHIVO_MAX_BYTES } from "@/lib/tipos";
import type { TextosExterno } from "./textos";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
const botonClass =
  "self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300";

// El nombre se recuerda en este navegador para no pedirlo en cada respuesta o adjunto.
const CLAVE_NOMBRE = "responder-nombre";

function useNombre(): [string, (v: string) => void] {
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    try {
      setNombre(localStorage.getItem(CLAVE_NOMBRE) ?? "");
    } catch {}
  }, []);
  function guardar(v: string) {
    setNombre(v);
    try {
      localStorage.setItem(CLAVE_NOMBRE, v);
    } catch {}
  }
  return [nombre, guardar];
}

export default function FormulariosExterno({ token, preguntaId, textos }: { token: string; preguntaId: string; textos: TextosExterno }) {
  const router = useRouter();
  const [nombre, setNombre] = useNombre();
  const [respuesta, setRespuesta] = useState("");
  const [tipo, setTipo] = useState<"RESPUESTA" | "CONTRAPREGUNTA">("RESPUESTA");
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [enviando, setEnviando] = useState<"respuesta" | "archivo" | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function enviarRespuesta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim()) return setMensaje({ ok: false, texto: textos.faltaNombre });
    setEnviando("respuesta");
    setMensaje(null);
    const res = await fetch(`/api/externo/${encodeURIComponent(token)}/respuesta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, respuesta, tipo, preguntaId }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) ?? {};
    setEnviando(null);
    if (!res?.ok) return setMensaje({ ok: false, texto: `${textos.error}: ${data.error ?? ""}` });
    setRespuesta("");
    setTipo("RESPUESTA");
    setMensaje({ ok: true, texto: textos.enviada });
    router.refresh();
  }

  async function subirArchivo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim()) return setMensaje({ ok: false, texto: textos.faltaNombre });
    if (!archivo) return;
    if (archivo.size > ARCHIVO_MAX_BYTES) {
      return setMensaje({ ok: false, texto: `${textos.error}: max ${ARCHIVO_MAX_BYTES / (1024 * 1024)} MB` });
    }
    setEnviando("archivo");
    setMensaje(null);
    const formData = new FormData();
    formData.set("nombre", nombre);
    formData.set("preguntaId", preguntaId);
    formData.set("titulo", titulo || archivo.name);
    formData.set("file", archivo);
    const res = await fetch(`/api/externo/${encodeURIComponent(token)}/archivos`, { method: "POST", body: formData }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) ?? {};
    setEnviando(null);
    if (!res?.ok) return setMensaje({ ok: false, texto: `${textos.error}: ${data.error ?? ""}` });
    setTitulo("");
    setArchivo(null);
    setInputKey((k) => k + 1);
    setMensaje({ ok: true, texto: textos.subido });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{textos.nombre}</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} className={inputClass} />
      </div>

      <form onSubmit={enviarRespuesta} className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium">{textos.nuevaRespuesta}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={tipo === "RESPUESTA"} onChange={() => setTipo("RESPUESTA")} /> {textos.tipoRespuesta}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={tipo === "CONTRAPREGUNTA"} onChange={() => setTipo("CONTRAPREGUNTA")} /> {textos.tipoContrapregunta}
          </label>
        </div>
        <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} required minLength={2} rows={6} placeholder={textos.respuesta} className={inputClass} />
        <button type="submit" disabled={enviando !== null} className={botonClass}>
          {enviando === "respuesta" ? textos.enviando : textos.enviar}
        </button>
      </form>

      <form onSubmit={subirArchivo} className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium">{textos.adjuntar}</p>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={textos.tituloArchivo} maxLength={250} className={inputClass} />
        <input
          key={inputKey}
          type="file"
          required
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700"
        />
        <button type="submit" disabled={enviando !== null || !archivo} className={botonClass}>
          {enviando === "archivo" ? textos.subiendo : textos.subir}
        </button>
      </form>

      {mensaje && <p className={`text-sm ${mensaje.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{mensaje.texto}</p>}
    </div>
  );
}
