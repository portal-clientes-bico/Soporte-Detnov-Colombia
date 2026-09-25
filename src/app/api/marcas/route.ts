import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { slugify } from "@/lib/tipos";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().trim().min(2).max(100),
  descripcion: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const slug = slugify(parsed.data.nombre);
  if (!slug) return NextResponse.json({ error: "El nombre debe tener letras o numeros" }, { status: 400 });

  const resultado = await mutarDb((db) => {
    if (db.marcas.some((m) => m.slug === slug)) {
      return { error: "Ya existe una marca con ese nombre" as const };
    }
    const now = ahora();
    db.marcas.push({
      id: nuevoId(),
      slug,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return { slug };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: 409 });
  return NextResponse.json({ ok: true, slug: resultado.slug });
}
