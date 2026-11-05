"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { getReferenciasDeMarca, getUsuarios } from "@/lib/queries";
import { GARANTIA_RESOLUCIONES, GARANTIA_RESOLUCION_VALUES, TAREA_PRIORIDADES, TAREA_PRIORIDAD_VALUES } from "@/lib/tipos";
import type { Garantia } from "@/lib/db";
import EditorTexto from "../../../editor-texto";

type Referencia = Awaited<ReturnType<typeof getReferenciasDeMarca>>[number];
type Usuario = Awaited<ReturnType<typeof getUsuarios>>[number];

export const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
const labelClass = "block text-sm text-zinc-600 dark:text-zinc-400";

interface FilaItem {
  id?: string;
  referencia: string;
  serial: string;
  cantidad: string;
  lote: string;
  falla: string;
}

const filaVacia = (): FilaItem => ({ referencia: "", serial: "", cantidad: "1", lote: "", falla: "" });

/** Campos de texto del formulario (todo como string; vacio = sin dato). */
type Valores = Record<
  | "titulo"
  | "prioridad"
  | "asignadoAUsuarioId"
  | "clienteNombre"
  | "clienteNit"
  | "clienteContacto"
  | "clienteTelefono"
  | "clienteEmail"
  | "clienteCiudad"
  | "proyecto"
  | "facturaVenta"
  | "fechaCompra"
  | "fechaInstalacion"
  | "descripcionFalla"
  | "diagnostico"
  | "rmaFabricante"
  | "guiaEnvio"
  | "resolucion"
  | "resolucionNotas",
  string
>;

function valoresIniciales(g: Garantia | null): Valores {
  return {
    titulo: g?.titulo ?? "",
    prioridad: g?.prioridad ?? "MEDIA",
    asignadoAUsuarioId: g?.asignadoAUsuarioId ?? "",
    clienteNombre: g?.clienteNombre ?? "",
    clienteNit: g?.clienteNit ?? "",
    clienteContacto: g?.clienteContacto ?? "",
    clienteTelefono: g?.clienteTelefono ?? "",
    clienteEmail: g?.clienteEmail ?? "",
    clienteCiudad: g?.clienteCiudad ?? "",
    proyecto: g?.proyecto ?? "",
    facturaVenta: g?.facturaVenta ?? "",
    fechaCompra: g?.fechaCompra ?? "",
    fechaInstalacion: g?.fechaInstalacion ?? "",
    descripcionFalla: g?.descripcionFalla ?? "",
    diagnostico: g?.diagnostico ?? "",
    rmaFabricante: g?.rmaFabricante ?? "",
    guiaEnvio: g?.guiaEnvio ?? "",
    resolucion: g?.resolucion ?? "",
    resolucionNotas: g?.resolucionNotas ?? "",
  };
}

/**
 * Formulario del ticket de garantia, para crearlo (garantia = null) o editarlo. El estado no se
 * cambia aqui sino en la bitacora, para que cada cambio quede registrado con fecha y autor.
 */
export default function GarantiaForm({
  slug,
  marcaId,
  garantia,
  referencias,
  usuarios,
  onCancelar,
}: {
  slug: string;
  marcaId: string;
  garantia: Garantia | null;
  referencias: Referencia[];
  usuarios: Usuario[];
  onCancelar?: () => void;
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Valores>(() => valoresIniciales(garantia));
  const [filas, setFilas] = useState<FilaItem[]>(() =>
    garantia?.items.length
      ? garantia.items.map((i) => ({ id: i.id, referencia: i.referencia, serial: i.serial, cantidad: String(i.cantidad), lote: i.lote ?? "", falla: i.falla ?? "" }))
      : [filaVacia()],
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editando = !!garantia;

  const set = (campo: keyof Valores) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValores((v) => ({ ...v, [campo]: e.target.value }));
  const setTexto = (campo: keyof Valores) => (texto: string) => setValores((v) => ({ ...v, [campo]: texto }));
  const setFila = (i: number, campo: keyof FilaItem, valor: string) => setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));

  /** La referencia escrita se asocia al producto del catalogo si coincide exactamente. */
  const productoDe = (referencia: string) => referencias.find((r) => r.referencia.toLowerCase() === referencia.trim().toLowerCase())?.id ?? null;

  /** Varios seriales pegados (uno por linea) en una fila se reparten en filas de la misma referencia. */
  function pegarSeriales(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const lineas = e.clipboardData
      .getData("text/plain")
      .split(/[\r\n\t,;]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lineas.length < 2) return;
    e.preventDefault();
    setFilas((fs) => {
      const base = fs[i];
      const nuevas = lineas.map((serial, k) => ({ ...base, id: k === 0 ? base.id : undefined, serial, cantidad: "1" }));
      return [...fs.slice(0, i), ...nuevas, ...fs.slice(i + 1)];
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const items = filas
      .filter((f) => f.referencia.trim() || f.serial.trim())
      .map((f) => ({ id: f.id, productoId: productoDe(f.referencia), referencia: f.referencia, serial: f.serial, cantidad: Number(f.cantidad) || 1, lote: f.lote, falla: f.falla }));
    const cuerpo = { ...valores, resolucion: valores.resolucion || null, items, ...(editando ? {} : { marcaId }) };
    const res = await fetch(editando ? `/api/garantias/${encodeURIComponent(garantia.id)}` : "/api/garantias", {
      method: editando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) ?? {};
    setGuardando(false);
    if (!res?.ok) return setError(data.error ?? "No se pudo guardar");
    if (editando) {
      onCancelar?.();
      router.refresh();
    } else router.push(`/${slug}/garantias/${data.id}`);
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-6">
      <Seccion titulo="Ticket">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className={labelClass}>Título</label>
            <input value={valores.titulo} onChange={set("titulo")} required minLength={3} maxLength={250} placeholder="Ej. Panel FW2105 no enciende tras descarga eléctrica" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prioridad</label>
            <select value={valores.prioridad} onChange={set("prioridad")} className={inputClass}>
              {TAREA_PRIORIDAD_VALUES.map((p) => (
                <option key={p} value={p}>
                  {TAREA_PRIORIDADES[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Responsable</label>
            <select value={valores.asignadoAUsuarioId} onChange={set("asignadoAUsuarioId")} className={inputClass}>
              <option value="">Sin asignar</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Cliente">
        <div className="grid gap-3 sm:grid-cols-3">
          <Campo label="Cliente" valor={valores.clienteNombre} onChange={set("clienteNombre")} required className="sm:col-span-2" />
          <Campo label="NIT / identificación" valor={valores.clienteNit} onChange={set("clienteNit")} />
          <Campo label="Persona de contacto" valor={valores.clienteContacto} onChange={set("clienteContacto")} />
          <Campo label="Teléfono" valor={valores.clienteTelefono} onChange={set("clienteTelefono")} />
          <Campo label="Correo" valor={valores.clienteEmail} onChange={set("clienteEmail")} type="email" />
          <Campo label="Ciudad" valor={valores.clienteCiudad} onChange={set("clienteCiudad")} />
          <Campo label="Obra / proyecto" valor={valores.proyecto} onChange={set("proyecto")} className="sm:col-span-2" />
          <Campo label="Factura de venta" valor={valores.facturaVenta} onChange={set("facturaVenta")} />
          <Campo label="Fecha de compra" valor={valores.fechaCompra} onChange={set("fechaCompra")} type="date" />
          <Campo label="Fecha de instalación" valor={valores.fechaInstalacion} onChange={set("fechaInstalacion")} type="date" />
        </div>
      </Seccion>

      <Seccion titulo="Productos y seriales" ayuda="Una fila por unidad. Puedes pegar varios seriales (uno por línea) en la casilla de serial y se crea una fila por cada uno.">
        <datalist id="referencias-garantia">
          {referencias.map((r) => (
            <option key={r.id} value={r.referencia}>
              {r.nombre}
            </option>
          ))}
        </datalist>
        <div className="flex flex-col gap-2">
          {filas.map((f, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-zinc-200 p-2 sm:grid-cols-[1.2fr_1.2fr_0.5fr_0.9fr_auto] dark:border-zinc-800">
              <div>
                <input list="referencias-garantia" value={f.referencia} onChange={(e) => setFila(i, "referencia", e.target.value)} placeholder="Referencia (ej. FW2105)" className={inputClass} />
                {f.referencia.trim() && !productoDe(f.referencia) && <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">No está en el catálogo de la marca</p>}
              </div>
              <input value={f.serial} onChange={(e) => setFila(i, "serial", e.target.value)} onPaste={(e) => pegarSeriales(i, e)} placeholder="Serial" className={inputClass} />
              <input type="number" min={1} value={f.cantidad} onChange={(e) => setFila(i, "cantidad", e.target.value)} title="Cantidad" className={inputClass} />
              <input value={f.lote} onChange={(e) => setFila(i, "lote", e.target.value)} placeholder="Lote / fecha fab." className={inputClass} />
              <button
                type="button"
                onClick={() => setFilas((fs) => (fs.length > 1 ? fs.filter((_, j) => j !== i) : [filaVacia()]))}
                className="self-start rounded-lg px-2 py-2 text-sm text-zinc-400 hover:text-red-600"
                title="Quitar unidad"
              >
                ×
              </button>
              <input value={f.falla} onChange={(e) => setFila(i, "falla", e.target.value)} placeholder="Falla de esta unidad (opcional)" className={`${inputClass} sm:col-span-5`} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-sm">
          <button type="button" onClick={() => setFilas((fs) => [...fs, filaVacia()])} className="text-sky-700 underline hover:text-sky-900 dark:text-sky-400">
            + Agregar unidad
          </button>
          <button
            type="button"
            onClick={() => setFilas((fs) => [...fs, { ...fs[fs.length - 1], id: undefined, serial: "" }])}
            className="text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Repetir la última referencia
          </button>
        </div>
      </Seccion>

      <Seccion titulo="Condición de falla" ayuda="Describe qué pasa, cuándo y en qué condiciones. Pega capturas o fotos y enlaces a videos (YouTube, Drive...).">
        <EditorTexto value={valores.descripcionFalla} onChange={setTexto("descripcionFalla")} required rows={6} className={inputClass} placeholder="Ej. El panel reinicia cada vez que se activa la sirena del lazo 2..." />
      </Seccion>

      <Seccion titulo="Diagnóstico y pruebas realizadas" ayuda="Lo que ya se probó antes de escalar al fabricante (opcional).">
        <EditorTexto value={valores.diagnostico} onChange={setTexto("diagnostico")} rows={4} className={inputClass} />
      </Seccion>

      {editando && (
        <>
          <Seccion titulo="Fabricante">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Número de RMA / caso del fabricante" valor={valores.rmaFabricante} onChange={set("rmaFabricante")} />
              <Campo label="Transportadora y guía de envío" valor={valores.guiaEnvio} onChange={set("guiaEnvio")} />
            </div>
          </Seccion>

          <Seccion titulo="Resolución">
            <div className="flex flex-col gap-3">
              <div className="max-w-xs">
                <label className={labelClass}>Tipo de resolución</label>
                <select value={valores.resolucion} onChange={set("resolucion")} className={inputClass}>
                  <option value="">Sin resolución todavía</option>
                  {GARANTIA_RESOLUCION_VALUES.map((r) => (
                    <option key={r} value={r}>
                      {GARANTIA_RESOLUCIONES[r]}
                    </option>
                  ))}
                </select>
              </div>
              <EditorTexto value={valores.resolucionNotas} onChange={setTexto("resolucionNotas")} rows={3} className={inputClass} placeholder="Respuesta del fabricante, unidades reemplazadas, notas..." />
            </div>
          </Seccion>
        </>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={guardando} className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear garantía"}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="font-medium">{titulo}</h2>
        {ayuda && <p className="text-xs text-zinc-500 dark:text-zinc-400">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  valor,
  onChange,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input type={type} value={valor} onChange={onChange} required={required} className={inputClass} />
    </div>
  );
}
