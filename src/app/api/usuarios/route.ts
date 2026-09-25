import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora, leerDb } from "@/lib/db";
import { usuarioSchema } from "@/lib/schemas";

export async function GET() {
  const db = await leerDb();
  const usuarios = db.usuarios.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  return NextResponse.json({ usuarios });
}

export async function POST(request: Request) {
  const parsed = usuarioSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const usuario = await mutarDb((db) => {
    const now = ahora();
    const nuevoUsuario = { id: nuevoId(), nombre: parsed.data.nombre, email: parsed.data.email ?? null, createdAt: now, updatedAt: now };
    db.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  });

  return NextResponse.json({ ok: true, usuario });
}
