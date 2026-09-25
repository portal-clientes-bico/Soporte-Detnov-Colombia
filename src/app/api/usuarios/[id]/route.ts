import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { usuarioPatchSchema } from "@/lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = usuarioPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const usuario = await mutarDb((db) => {
    const existente = db.usuarios.find((u) => u.id === id);
    if (!existente) return null;
    Object.assign(existente, parsed.data);
    existente.updatedAt = ahora();
    const { passwordHash: _omit, ...sinPassword } = existente;
    return sinPassword;
  });

  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true, usuario });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await mutarDb((db) => {
    const existe = db.usuarios.some((u) => u.id === id);
    if (!existe) return false;
    db.usuarios = db.usuarios.filter((u) => u.id !== id);
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
