import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { getUsuarios } from "@/lib/queries";
import { usuarioConPasswordSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const usuarios = await getUsuarios();
  return NextResponse.json({ usuarios });
}

export async function POST(request: Request) {
  const parsed = usuarioConPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const emailNormalizado = parsed.data.email.trim().toLowerCase();

  const resultado = await mutarDb((db) => {
    const yaExiste = db.usuarios.some((u) => (u.email ?? "").trim().toLowerCase() === emailNormalizado);
    if (yaExiste) return { status: 409 as const, error: "Ya existe un usuario con ese email" };

    const now = ahora();
    const nuevoUsuario = {
      id: nuevoId(),
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      organizacion: parsed.data.organizacion,
      createdAt: now,
      updatedAt: now,
    };
    db.usuarios.push(nuevoUsuario);
    const { passwordHash: _omit, ...usuarioSinPassword } = nuevoUsuario;
    return { status: 200 as const, usuario: usuarioSinPassword };
  });

  if ("error" in resultado) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  return NextResponse.json({ ok: true, usuario: resultado.usuario });
}
