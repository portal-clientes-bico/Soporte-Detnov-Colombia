/** Colores de estado y prioridad de las garantias (lista por marca, detalle y consolidado). */
export const GARANTIA_ESTADO_BADGE: Record<string, string> = {
  BORRADOR: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENVIADA: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  EN_REVISION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  INFO_SOLICITADA: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  APROBADA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  RECHAZADA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  CERRADA: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
};

export const GARANTIA_PRIORIDAD_BADGE: Record<string, string> = {
  ALTA: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  MEDIA: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  BAJA: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

export function textoDias(n: number): string {
  return n === 0 ? "hoy" : n === 1 ? "1 día" : `${n} días`;
}
