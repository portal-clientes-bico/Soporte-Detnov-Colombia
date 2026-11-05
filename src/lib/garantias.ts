import "server-only";
import type { Db, Garantia, ItemGarantia, SoporteGarantiaEstado } from "@/lib/db";
import { nuevoId } from "@/lib/db";

/** Siguiente consecutivo del año, unico en toda la herramienta: GAR-2026-0001. */
export function siguienteNumeroGarantia(db: Db, fecha: Date): string {
  const anio = fecha.getFullYear();
  const prefijo = `GAR-${anio}-`;
  const ultimo = db.garantias
    .map((g) => (g.numero.startsWith(prefijo) ? Number(g.numero.slice(prefijo.length)) : 0))
    .reduce((max, n) => (Number.isFinite(n) && n > max ? n : max), 0);
  return `${prefijo}${String(ultimo + 1).padStart(4, "0")}`;
}

/**
 * Aplica un cambio de estado y deja la entrada en la bitacora. Las fechas del flujo se llenan
 * la primera vez que se pasa por cada etapa (enviada, resuelta, cerrada) y se limpian si el
 * ticket se reabre a una etapa anterior.
 */
export function cambiarEstadoGarantia(g: Garantia, estado: SoporteGarantiaEstado, autor: string, texto: string, fecha: string): void {
  const anterior = g.estado;
  g.estado = estado;
  if (estado === "ENVIADA" && !g.enviadaEn) g.enviadaEn = fecha;
  if ((estado === "APROBADA" || estado === "RECHAZADA") && !g.resueltaEn) g.resueltaEn = fecha;
  if (estado === "CERRADA") g.cerradaEn = g.cerradaEn ?? fecha;
  else g.cerradaEn = null;
  if (estado === "BORRADOR" || estado === "ENVIADA" || estado === "EN_REVISION" || estado === "INFO_SOLICITADA") g.resueltaEn = null;
  if (estado === "BORRADOR") g.enviadaEn = null;
  g.eventos.push({ id: nuevoId(), fecha, autor, tipo: "ESTADO", estadoAnterior: anterior, estadoNuevo: estado, texto });
  g.updatedAt = fecha;
}

/** Dias calendario (hora de Colombia) entre dos fechas ISO. */
export function diasEntre(desdeIso: string, hasta: Date = new Date()): number {
  const dia = (d: Date) => Date.parse(d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }));
  return Math.max(0, Math.round((dia(hasta) - dia(new Date(desdeIso))) / 86_400_000));
}

/** Valida que los productos de las unidades sean de la marca y les asigna id (conserva el de
 * las que ya existian). Devuelve el mensaje de error si alguna no es valida. */
export function prepararItems(db: Db, marcaId: string, items: (Omit<ItemGarantia, "id"> & { id?: string })[]): ItemGarantia[] | string {
  const salida: ItemGarantia[] = [];
  for (const item of items) {
    if (item.productoId && !db.productos.some((p) => p.id === item.productoId && p.marcaId === marcaId)) return "Un producto no pertenece a esta marca";
    salida.push({ ...item, id: item.id || nuevoId() });
  }
  return salida;
}
