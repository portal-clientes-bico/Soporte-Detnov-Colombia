import "server-only";
import { ahora, nuevoId, type Db, type Tarea } from "@/lib/db";

/**
 * Cuando una tarea esta COMPLETADA y tiene hallazgos escritos, los publica como un Hallazgo de
 * tipo HALLAZGO ("Hallazgo / aprendizaje"): conocimiento confirmado que entra al contexto del
 * ChatBot (ver getContextoChatbot en queries.ts). Si la tarea ya habia generado su hallazgo, lo
 * actualiza en lugar de crear otro. No hace nada si la tarea no esta completada o no tiene
 * hallazgos. Devuelve "creado", "actualizado" o null.
 */
export function sincronizarHallazgoDeTarea(db: Db, tarea: Tarea): "creado" | "actualizado" | null {
  const texto = tarea.hallazgos?.trim();
  if (tarea.estado !== "COMPLETADA" || !texto) return null;

  const now = ahora();
  const existente = tarea.hallazgoId ? db.hallazgos.find((h) => h.id === tarea.hallazgoId) : undefined;
  if (existente) {
    existente.titulo = tarea.titulo;
    existente.contenido = texto;
    existente.productoId = tarea.productoId;
    existente.updatedAt = now;
    return "actualizado";
  }

  const id = nuevoId();
  db.hallazgos.push({
    id,
    marcaId: tarea.marcaId,
    productoId: tarea.productoId,
    tipo: "HALLAZGO",
    estado: "RESUELTO",
    titulo: tarea.titulo,
    contenido: texto,
    tareaId: tarea.id,
    createdAt: now,
    updatedAt: now,
  });
  tarea.hallazgoId = id;
  return "creado";
}
