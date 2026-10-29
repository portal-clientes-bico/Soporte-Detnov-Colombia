import { NextResponse } from "next/server";
import { z } from "zod";
import { leerDb, mutarDb, type Pregunta, type TraduccionPregunta } from "@/lib/db";
import { IDIOMA_VALUES } from "@/lib/idioma";
import { huellaPregunta, traduccionVigente, traducirPregunta } from "@/lib/traduccion-preguntas";

// Cada traduccion es una llamada a la API de Claude; un lote puede tardar.
export const maxDuration = 300;

const MAX_POR_LOTE = 20;
const EN_PARALELO = 4;

const schema = z.object({
  idioma: z.enum(IDIOMA_VALUES as [string, ...string[]]),
  ids: z.array(z.string().min(1)).min(1).max(MAX_POR_LOTE),
});

/** Traduce (y guarda) las preguntas indicadas al idioma de vista que aun no tengan una
 * traduccion vigente. Las ya traducidas no se vuelven a pagar. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });
  const idioma = parsed.data.idioma as (typeof IDIOMA_VALUES)[number];

  const db = await leerDb();
  const pendientes = parsed.data.ids
    .map((id) => db.preguntas.find((p) => p.id === id))
    .filter((p): p is Pregunta => !!p && !traduccionVigente(p, idioma));

  const traducidas: { id: string; huella: string; traduccion: TraduccionPregunta }[] = [];
  const errores: string[] = [];
  for (let i = 0; i < pendientes.length; i += EN_PARALELO) {
    const grupo = pendientes.slice(i, i + EN_PARALELO);
    const resultados = await Promise.allSettled(grupo.map((p) => traducirPregunta(p, idioma)));
    resultados.forEach((r, j) => {
      if (r.status === "fulfilled") traducidas.push({ id: grupo[j].id, huella: r.value.huella, traduccion: r.value });
      else errores.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
    });
  }

  if (traducidas.length > 0) {
    await mutarDb((dbm) => {
      for (const t of traducidas) {
        const pregunta = dbm.preguntas.find((p) => p.id === t.id);
        // Si alguien edito la pregunta mientras se traducia, esta traduccion ya no aplica.
        if (!pregunta || huellaPregunta(pregunta) !== t.huella) continue;
        pregunta.traducciones = { ...pregunta.traducciones, [idioma]: t.traduccion };
      }
    });
  }

  if (errores.length > 0 && traducidas.length === 0) {
    return NextResponse.json({ error: errores[0] }, { status: 502 });
  }
  return NextResponse.json({ ok: true, traducidas: traducidas.length, errores });
}
