"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { getPreguntasDeMarca, getReferenciasDeMarca } from "@/lib/queries";
import { ARCHIVO_MAX_BYTES, DOCUMENTO_TIPO_VALUES, DOCUMENTO_TIPOS, PREGUNTA_ASIGNADOS, PREGUNTA_ASIGNADO_VALUES, PREGUNTA_PRIORIDADES, PREGUNTA_PRIORIDAD_VALUES } from "@/lib/tipos";
import { nombreUsuarioActual } from "@/lib/usuario-actual";

type Pregunta = Awaited<ReturnType<typeof getPreguntasDeMarca>>[number];
type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

const prioridadBadge: Record<string, string> = {
  ALTA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  MEDIA: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  BAJA: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

const asignadoBadge: Record<string, string> = {
  SIN_ASIGNAR: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  DISTRIBUIDOR: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  DETNOV: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  MAPLE_ARMOR: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
};

function SelectorReferencias({
  referencias,
  seleccionadas,
  onToggle,
}: {
  referencias: Referencia[];
  seleccionadas: string[];
  onToggle: (id: string) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();
  const filtradas = q ? referencias.filter((r) => r.referencia.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q)) : referencias;

  return (
    <div className="flex flex-col gap-1.5">
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar referencia..."
        className={inputClass}
      />
      <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 sm:grid-cols-3 dark:border-zinc-800">
        {filtradas.length === 0 ? (
          <p className="col-span-full text-xs text-zinc-500 dark:text-zinc-400">Sin coincidencias.</p>
        ) : (
          filtradas.map((r) => (
            <label key={r.id} className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={seleccionadas.includes(r.id)} onChange={() => onToggle(r.id)} />
              {r.referencia}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function VincularReferenciaBuscador({ referenciasDisponibles, onVincular, loading }: { referenciasDisponibles: Referencia[]; onVincular: (id: string) => void; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();
  const filtradas = q ? referenciasDisponibles.filter((r) => r.referencia.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q)) : referenciasDisponibles;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:hover:text-zinc-50">
        + vincular referencia
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar referencia..."
          className="w-40 rounded-lg border border-zinc-300 px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setBusqueda("");
          }}
          className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          Cerrar
        </button>
      </div>
      <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
        {filtradas.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin coincidencias.</p>
        ) : (
          filtradas.slice(0, 60).map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={loading}
              onClick={() => {
                onVincular(r.id);
                setBusqueda("");
              }}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {r.referencia}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function archivoUrl(archivoPath: string | null): string | null {
  return archivoPath ? `/api/archivos/${archivoPath}` : null;
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function valoresIniciales() {
  return { prioridad: "MEDIA", asignadoA: "SIN_ASIGNAR", titulo: "", contenido: "", autor: "" };
}

function CamposPregunta({
  valores,
  onChange,
}: {
  valores: { prioridad: string; asignadoA: string; titulo: string; contenido: string; autor: string };
  onChange: (campo: string, valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Prioridad</label>
          <select value={valores.prioridad} onChange={(e) => onChange("prioridad", e.target.value)} className={inputClass}>
            {PREGUNTA_PRIORIDAD_VALUES.map((p) => (
              <option key={p} value={p}>
                {PREGUNTA_PRIORIDADES[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Asignada a</label>
          <select value={valores.asignadoA} onChange={(e) => onChange("asignadoA", e.target.value)} className={inputClass}>
            {PREGUNTA_ASIGNADO_VALUES.map((a) => (
              <option key={a} value={a}>
                {PREGUNTA_ASIGNADOS[a]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">Quien pregunta</label>
          <input value={valores.autor} onChange={(e) => onChange("autor", e.target.value)} required minLength={1} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Titulo</label>
        <input value={valores.titulo} onChange={(e) => onChange("titulo", e.target.value)} required minLength={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">Pregunta</label>
        <textarea value={valores.contenido} onChange={(e) => onChange("contenido", e.target.value)} required rows={3} className={inputClass} />
      </div>
    </div>
  );
}

function NuevaPreguntaForm({ marcaId, referencias }: { marcaId: string; referencias: Referencia[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valores, setValores] = useState(valoresIniciales());
  const [productos, setProductos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nombre = nombreUsuarioActual();
    if (nombre) setValores((prev) => (prev.autor ? prev : { ...prev, autor: nombre }));
  }, []);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
        + Nueva pregunta
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/preguntas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcaId, ...valores, productos }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la pregunta");
      return;
    }
    setValores(valoresIniciales());
    setProductos([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium">Nueva pregunta</p>
      <CamposPregunta valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
      {referencias.length > 0 && (
        <div>
          <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">Referencias relacionadas</p>
          <SelectorReferencias
            referencias={referencias}
            seleccionadas={productos}
            onToggle={(id) => setProductos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Creando..." : "Crear pregunta"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function RespuestaPanel({ pregunta }: { pregunta: Pregunta }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [respondedor, setRespondedor] = useState(pregunta.respondedor ?? "");
  const [respuesta, setRespuesta] = useState(pregunta.respuesta ?? "");

  useEffect(() => {
    if (!pregunta.respondedor) {
      const nombre = nombreUsuarioActual();
      if (nombre) setRespondedor((prev) => prev || nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (!respondedor.trim() || !respuesta.trim()) {
      setError("Completa quien responde y la respuesta.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/preguntas/${pregunta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respondedor, respuesta }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo guardar la respuesta");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function declararResuelta() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/preguntas/${pregunta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "CERRADA" }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo cerrar la pregunta");
      return;
    }
    router.refresh();
  }

  if (!editando && pregunta.respuesta) {
    return (
      <div className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Respuesta de {pregunta.respondedor}</p>
          <div className="flex items-center gap-3">
            {pregunta.estado === "ABIERTA" && (
              <button
                type="button"
                onClick={declararResuelta}
                disabled={loading}
                className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {loading ? "Cerrando..." : "Declarar Resuelta"}
              </button>
            )}
            <button type="button" onClick={() => setEditando(true)} className="text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
              Editar respuesta
            </button>
          </div>
        </div>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">{pregunta.respuesta}</p>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{pregunta.respuesta ? "Editar respuesta" : "Responder"}</p>
      <input value={respondedor} onChange={(e) => setRespondedor(e.target.value)} placeholder="Quien responde" className={inputClass} />
      <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Respuesta" rows={2} className={inputClass} />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={guardar} disabled={loading} className="self-start rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {loading ? "Guardando..." : "Guardar respuesta"}
        </button>
        {pregunta.respuesta && (
          <button type="button" onClick={() => setEditando(false)} className="self-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

function ArchivosPanel({ pregunta }: { pregunta: Pregunta }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("OTRO");
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!archivo) {
      setError("Selecciona un archivo");
      return;
    }
    if (archivo.size > ARCHIVO_MAX_BYTES) {
      setError(`El archivo supera el maximo de ${ARCHIVO_MAX_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("tipo", tipo);
    formData.set("titulo", titulo || archivo.name);
    formData.set("file", archivo);
    const res = await fetch(`/api/preguntas/${pregunta.id}/archivos`, { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo subir el archivo");
      return;
    }
    setTipo("OTRO");
    setTitulo("");
    setArchivo(null);
    setInputKey((k) => k + 1);
    setOpen(false);
    router.refresh();
  }

  async function handleDesvincular(documentoId: string) {
    await fetch(`/api/preguntas/${pregunta.id}/archivos/${documentoId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {pregunta.archivos.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {pregunta.archivos.map((a) => {
            const url = archivoUrl(a.archivoPath);
            return (
              <li key={a.id} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
                    {a.titulo}
                  </a>
                ) : (
                  a.titulo
                )}
                <button type="button" onClick={() => handleDesvincular(a.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400" title="Quitar de esta pregunta (el archivo sigue en la biblioteca)">
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="self-start text-xs text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
          + Adjuntar archivo a la biblioteca
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
              {DOCUMENTO_TIPO_VALUES.map((t) => (
                <option key={t} value={t}>
                  {DOCUMENTO_TIPOS[t]}
                </option>
              ))}
            </select>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Titulo del archivo" className={inputClass} />
          </div>
          <input key={inputKey} type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700" />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="self-start rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
              {loading ? "Subiendo..." : "Subir a la biblioteca"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="self-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PreguntaCard({ pregunta, referencias }: { pregunta: Pregunta; referencias: Referencia[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ prioridad: pregunta.prioridad, asignadoA: pregunta.asignadoA, titulo: pregunta.titulo, contenido: pregunta.contenido, autor: pregunta.autor });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referenciasDisponibles = referencias.filter((r) => !pregunta.productos.some((v) => v.id === r.id));

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/preguntas/${pregunta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function toggleEstado() {
    setLoading(true);
    const nuevoEstado = pregunta.estado === "ABIERTA" ? "CERRADA" : "ABIERTA";
    await fetch(`/api/preguntas/${pregunta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Borrar la pregunta "${pregunta.titulo}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/preguntas/${pregunta.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo borrar la pregunta");
      return;
    }
    router.refresh();
  }

  async function handleVincular(productoId: string) {
    setLoading(true);
    await fetch(`/api/preguntas/${pregunta.id}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDesvincular(productoId: string) {
    setLoading(true);
    await fetch(`/api/preguntas/${pregunta.id}/productos/${productoId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <CamposPregunta valores={valores} onChange={(c, v) => setValores((prev) => ({ ...prev, [c]: v }))} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={loading} className="self-start rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="self-start text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 ${pregunta.estado === "CERRADA" ? "border-zinc-100 bg-zinc-50 opacity-80 dark:border-zinc-800/60 dark:bg-zinc-900/40" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs ${prioridadBadge[pregunta.prioridad]}`}>Prioridad {PREGUNTA_PRIORIDADES[pregunta.prioridad]}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${pregunta.estado === "ABIERTA" ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"}`}>
              {pregunta.estado === "ABIERTA" ? "Abierta" : "Cerrada"}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${asignadoBadge[pregunta.asignadoA]}`}>{PREGUNTA_ASIGNADOS[pregunta.asignadoA]}</span>
            <p className="font-medium">{pregunta.titulo}</p>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Preguntó {pregunta.autor} · {formatFechaHora(pregunta.createdAt)}
            {pregunta.fechaCierre ? ` · Cerrada ${formatFechaHora(pregunta.fechaCierre)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          <button type="button" onClick={toggleEstado} disabled={loading} className="text-zinc-500 underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-zinc-50">
            {pregunta.estado === "ABIERTA" ? "Cerrar pregunta" : "Reabrir"}
          </button>
          <button type="button" onClick={() => setEditando(true)} className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50">
            Editar
          </button>
          <button type="button" onClick={handleDelete} disabled={loading} className="text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
            Borrar
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300">{pregunta.contenido}</p>

      <RespuestaPanel pregunta={pregunta} />

      <div className="flex flex-wrap items-center gap-1.5">
        {pregunta.productos.map((r) => (
          <span key={r.id} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {r.referencia}
            <button type="button" onClick={() => handleDesvincular(r.id)} disabled={loading} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
              ×
            </button>
          </span>
        ))}
        {referenciasDisponibles.length > 0 && <VincularReferenciaBuscador referenciasDisponibles={referenciasDisponibles} onVincular={handleVincular} loading={loading} />}
      </div>

      <ArchivosPanel pregunta={pregunta} />

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function PreguntasManager({ marcaId, preguntas, referencias }: { marcaId: string; preguntas: Pregunta[]; referencias: Referencia[]; slug: string }) {
  return (
    <div className="flex flex-col gap-4">
      {preguntas.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Ninguna pregunta coincide con el filtro.</p>
      ) : (
        preguntas.map((p) => <PreguntaCard key={p.id} pregunta={p} referencias={referencias} />)
      )}
      <NuevaPreguntaForm marcaId={marcaId} referencias={referencias} />
    </div>
  );
}
