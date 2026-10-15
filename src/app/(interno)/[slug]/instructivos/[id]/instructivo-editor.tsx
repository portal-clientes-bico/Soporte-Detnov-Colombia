"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BloqueInstructivo } from "@/lib/db";
import type { getInstructivo, getReferenciasDeMarca } from "@/lib/queries";
import { extraerYoutubeId, IMAGEN_MAX_BYTES, IMAGEN_TIPOS_PERMITIDOS, INSTRUCTIVO_ESTADOS, INSTRUCTIVO_TIPOS, INSTRUCTIVO_TIPO_VALUES } from "@/lib/tipos";
import InstructivoContenido from "../../../../instructivo-contenido";
import { estadoInstructivoBadge } from "../estilos";

type Instructivo = NonNullable<Awaited<ReturnType<typeof getInstructivo>>>;
type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
const botonSecundario =
  "rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";
const botonIcono =
  "rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";

/** Clave estable por bloque para React (los bloques no tienen id propio en la base). */
type BloqueEditable = BloqueInstructivo & { _key: string };
let contadorClaves = 0;
const conClave = (b: BloqueInstructivo): BloqueEditable => ({ ...b, _key: `b${++contadorClaves}` });
const sinClave = ({ _key, ...b }: BloqueEditable): BloqueInstructivo => b as BloqueInstructivo;

const NOMBRE_BLOQUE: Record<BloqueInstructivo["tipo"], string> = { TEXTO: "Texto", IMAGEN: "Imagen", VIDEO: "Video de YouTube" };

function SelectorProductos({ referencias, seleccionados, onToggle }: { referencias: Referencia[]; seleccionados: string[]; onToggle: (id: string) => void }) {
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();
  const filtradas = q ? referencias.filter((r) => r.referencia.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q)) : referencias;
  const elegidas = referencias.filter((r) => seleccionados.includes(r.id));

  return (
    <div className="flex flex-col gap-1.5">
      {elegidas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {elegidas.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onToggle(r.id)}
              title="Quitar"
              className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-800 hover:bg-red-100 hover:text-red-800 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-red-900/40"
            >
              {r.referencia} ×
            </button>
          ))}
        </div>
      )}
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..." className={inputClass} />
      <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
        {filtradas.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin coincidencias.</p>
        ) : (
          filtradas.map((r) => (
            <label key={r.id} className="flex items-start gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={seleccionados.includes(r.id)} onChange={() => onToggle(r.id)} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">{r.referencia}</span> <span className="text-zinc-500 dark:text-zinc-400">— {r.nombre}</span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function AgregarVideo({ onAgregar, onCancelar }: { onAgregar: (youtubeId: string) => void; onCancelar: () => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function agregar() {
    const id = extraerYoutubeId(url);
    if (!id) {
      setError("No reconozco ese enlace. Pega la direccion del video de YouTube (youtube.com/watch?v=... o youtu.be/...).");
      return;
    }
    onAgregar(id);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <label className="text-sm text-zinc-600 dark:text-zinc-400">Enlace del video de YouTube</label>
      <div className="flex gap-2">
        <input
          autoFocus
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputClass}
        />
        <button type="button" onClick={agregar} className={botonSecundario}>
          Agregar
        </button>
        <button type="button" onClick={onCancelar} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function EditorBloque({
  bloque,
  indice,
  total,
  onCambiar,
  onMover,
  onQuitar,
}: {
  bloque: BloqueEditable;
  indice: number;
  total: number;
  onCambiar: (b: BloqueEditable) => void;
  onMover: (delta: -1 | 1) => void;
  onQuitar: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {indice + 1}. {NOMBRE_BLOQUE[bloque.tipo]}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMover(-1)} disabled={indice === 0} className={botonIcono} title="Subir">
            ↑
          </button>
          <button type="button" onClick={() => onMover(1)} disabled={indice === total - 1} className={botonIcono} title="Bajar">
            ↓
          </button>
          <button type="button" onClick={onQuitar} className={`${botonIcono} hover:text-red-700 dark:hover:text-red-400`} title="Quitar bloque">
            Quitar
          </button>
        </div>
      </div>

      {bloque.tipo === "TEXTO" && (
        <textarea
          value={bloque.texto}
          onChange={(e) => onCambiar({ ...bloque, texto: e.target.value })}
          rows={Math.min(14, Math.max(3, bloque.texto.split("\n").length + 1))}
          placeholder="Escribe la explicacion o el paso. Los saltos de linea se respetan."
          className={inputClass}
        />
      )}

      {bloque.tipo === "IMAGEN" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen servida por /api/archivos */}
          <img
            src={`/api/archivos/${bloque.archivoPath}`}
            alt={bloque.archivoNombre}
            className="max-h-48 w-auto max-w-full rounded-lg border border-zinc-200 sm:max-w-xs dark:border-zinc-800"
          />
          <div className="flex flex-1 flex-col gap-1">
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{bloque.archivoNombre}</span>
            <input
              value={bloque.pie ?? ""}
              onChange={(e) => onCambiar({ ...bloque, pie: e.target.value || null })}
              placeholder="Pie de imagen (opcional)"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {bloque.tipo === "VIDEO" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura publica de YouTube */}
          <img
            src={`https://i.ytimg.com/vi/${bloque.youtubeId}/mqdefault.jpg`}
            alt="Miniatura del video"
            className="w-full rounded-lg border border-zinc-200 sm:w-60 dark:border-zinc-800"
          />
          <div className="flex flex-1 flex-col gap-1">
            <a href={`https://www.youtube.com/watch?v=${bloque.youtubeId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 underline dark:text-zinc-400">
              youtube.com/watch?v={bloque.youtubeId} ↗
            </a>
            <input
              value={bloque.pie ?? ""}
              onChange={(e) => onCambiar({ ...bloque, pie: e.target.value || null })}
              placeholder="Descripcion del video (opcional)"
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstructivoEditor({ instructivo, referencias, slug }: { instructivo: Instructivo; referencias: Referencia[]; slug: string }) {
  const router = useRouter();
  const [tipo, setTipo] = useState(instructivo.tipo);
  const [titulo, setTitulo] = useState(instructivo.titulo);
  const [resumen, setResumen] = useState(instructivo.resumen ?? "");
  const [productoIds, setProductoIds] = useState(instructivo.productoIds);
  const [bloques, setBloques] = useState<BloqueEditable[]>(() => instructivo.bloques.map(conClave));
  const [agregandoVideo, setAgregandoVideo] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [sinGuardar, setSinGuardar] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const inputImagen = useRef<HTMLInputElement>(null);

  const publicado = instructivo.estado === "PUBLICADO";
  const urlPublica = `/ayuda/${slug}/${instructivo.id}`;

  // Avisa antes de salir de la pagina con cambios sin guardar.
  useEffect(() => {
    if (!sinGuardar) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sinGuardar]);

  function marcarCambio<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSinGuardar(true);
      setMensaje(null);
    };
  }

  const cambiarBloques = marcarCambio(setBloques);

  async function subirImagenes(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    setSubiendo(true);
    setMensaje(null);
    const nuevos: BloqueEditable[] = [];
    for (const archivo of Array.from(archivos)) {
      if (!IMAGEN_TIPOS_PERMITIDOS.includes(archivo.type)) {
        setMensaje({ tipo: "error", texto: `${archivo.name}: solo se aceptan imagenes PNG, JPG o WEBP.` });
        continue;
      }
      if (archivo.size > IMAGEN_MAX_BYTES) {
        setMensaje({ tipo: "error", texto: `${archivo.name}: supera ${IMAGEN_MAX_BYTES / (1024 * 1024)}MB.` });
        continue;
      }
      const fd = new FormData();
      fd.append("file", archivo);
      const res = await fetch(`/api/instructivos/${instructivo.id}/imagenes`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: `${archivo.name}: ${data.error ?? "no se pudo subir"}` });
        continue;
      }
      nuevos.push(conClave({ tipo: "IMAGEN", archivoPath: data.archivoPath, archivoNombre: data.archivoNombre, pie: null }));
    }
    if (nuevos.length > 0) cambiarBloques([...bloques, ...nuevos]);
    setSubiendo(false);
    if (inputImagen.current) inputImagen.current.value = "";
  }

  async function guardar(estado?: "EN_ELABORACION" | "PUBLICADO") {
    if (estado === "PUBLICADO" && bloques.length === 0) {
      setMensaje({ tipo: "error", texto: "Agrega al menos un bloque de respuesta antes de publicar." });
      return;
    }
    if (bloques.some((b) => b.tipo === "TEXTO" && !b.texto.trim())) {
      setMensaje({ tipo: "error", texto: "Hay un bloque de texto vacio: escribelo o quitalo antes de guardar." });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    const res = await fetch(`/api/instructivos/${instructivo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, titulo, resumen, productoIds, bloques: bloques.map(sinClave), ...(estado ? { estado } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    setGuardando(false);
    if (!res.ok) {
      setMensaje({ tipo: "error", texto: data.error ?? "No se pudo guardar" });
      return;
    }
    setSinGuardar(false);
    // router.refresh() trae el registro actualizado; el key del editor (updatedAt) lo reinicia.
    router.refresh();
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar "${instructivo.titulo}"? Se borran tambien sus imagenes. No se puede deshacer.`)) return;
    setGuardando(true);
    const res = await fetch(`/api/instructivos/${instructivo.id}`, { method: "DELETE" });
    if (!res.ok) {
      setGuardando(false);
      setMensaje({ tipo: "error", texto: "No se pudo eliminar" });
      return;
    }
    setSinGuardar(false);
    router.push(`/${slug}/instructivos`);
    router.refresh();
  }

  function moverBloque(indice: number, delta: -1 | 1) {
    const copia = [...bloques];
    const [b] = copia.splice(indice, 1);
    copia.splice(indice + delta, 0, b);
    cambiarBloques(copia);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de estado y acciones */}
      <div className="sticky top-0 z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoInstructivoBadge[instructivo.estado]}`}>{INSTRUCTIVO_ESTADOS[instructivo.estado]}</span>
          {publicado ? (
            <a href={urlPublica} target="_blank" rel="noopener noreferrer" className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Ver como cliente ↗
            </a>
          ) : (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Los clientes aun no lo ven.</span>
          )}
          {sinGuardar && <span className="text-xs font-medium text-amber-700 dark:text-amber-400">• Cambios sin guardar</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setVistaPrevia((v) => !v)} className={botonSecundario}>
            {vistaPrevia ? "Volver a editar" : "Vista previa"}
          </button>
          <button type="button" onClick={() => guardar()} disabled={guardando || subiendo || !sinGuardar} className={botonSecundario}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          {publicado ? (
            <button type="button" onClick={() => guardar("EN_ELABORACION")} disabled={guardando || subiendo} className={botonSecundario}>
              Despublicar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => guardar("PUBLICADO")}
              disabled={guardando || subiendo}
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              Guardar y publicar
            </button>
          )}
        </div>
      </div>

      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>{mensaje.texto}</p>
      )}

      {vistaPrevia ? (
        <article className="flex max-w-3xl flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{INSTRUCTIVO_TIPOS[tipo]}</span>
          <h2 className="text-2xl font-semibold">{titulo}</h2>
          {resumen && <p className="text-zinc-600 dark:text-zinc-400">{resumen}</p>}
          <InstructivoContenido bloques={bloques.map(sinClave)} />
        </article>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">Pregunta del cliente</label>
              <input value={titulo} onChange={(e) => marcarCambio(setTitulo)(e.target.value)} className={`${inputClass} text-base font-medium`} />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">Resumen (opcional)</label>
              <textarea
                value={resumen}
                onChange={(e) => marcarCambio(setResumen)(e.target.value)}
                rows={2}
                placeholder="Descripcion breve del problema o sintoma, se muestra en el listado del sitio de ayuda."
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Respuesta</h3>
              {bloques.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Arma la respuesta agregando bloques de texto, imagenes y videos en el orden en que el cliente debe seguirlos.</p>
              )}
              {bloques.map((b, i) => (
                <EditorBloque
                  key={b._key}
                  bloque={b}
                  indice={i}
                  total={bloques.length}
                  onCambiar={(nuevo) => cambiarBloques(bloques.map((x) => (x._key === b._key ? nuevo : x)))}
                  onMover={(delta) => moverBloque(i, delta)}
                  onQuitar={() => cambiarBloques(bloques.filter((x) => x._key !== b._key))}
                />
              ))}

              {agregandoVideo && (
                <AgregarVideo
                  onAgregar={(youtubeId) => {
                    cambiarBloques([...bloques, conClave({ tipo: "VIDEO", youtubeId, pie: null })]);
                    setAgregandoVideo(false);
                  }}
                  onCancelar={() => setAgregandoVideo(false)}
                />
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => cambiarBloques([...bloques, conClave({ tipo: "TEXTO", texto: "" })])} className={botonSecundario}>
                  + Texto
                </button>
                <button type="button" onClick={() => inputImagen.current?.click()} disabled={subiendo} className={botonSecundario}>
                  {subiendo ? "Subiendo imagen..." : "+ Imagen"}
                </button>
                <button type="button" onClick={() => setAgregandoVideo(true)} disabled={agregandoVideo} className={botonSecundario}>
                  + Video de YouTube
                </button>
                <input ref={inputImagen} type="file" accept={IMAGEN_TIPOS_PERMITIDOS.join(",")} multiple hidden onChange={(e) => subirImagenes(e.target.files)} />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">Tipo</label>
              <select value={tipo} onChange={(e) => marcarCambio(setTipo)(e.target.value as typeof tipo)} className={inputClass}>
                {INSTRUCTIVO_TIPO_VALUES.map((t) => (
                  <option key={t} value={t}>
                    {INSTRUCTIVO_TIPOS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">Productos a los que aplica</label>
              <SelectorProductos
                referencias={referencias}
                seleccionados={productoIds}
                onToggle={(id) => marcarCambio(setProductoIds)(productoIds.includes(id) ? productoIds.filter((x) => x !== id) : [...productoIds, id])}
              />
            </div>
            <div className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Creado {new Date(instructivo.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
              {instructivo.publicadoEn && (
                <>
                  <br />
                  Publicado por primera vez {new Date(instructivo.publicadoEn).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </>
              )}
            </div>
            <button type="button" onClick={eliminar} disabled={guardando} className="self-start text-sm text-red-600 underline hover:text-red-800 disabled:opacity-50 dark:text-red-400">
              Eliminar registro
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
