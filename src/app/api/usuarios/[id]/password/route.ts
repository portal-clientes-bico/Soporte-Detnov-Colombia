import { NextResponse } from "next/server";
import { mutarDb, ahora } from "@/lib/db";
import { usuarioPasswordSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/password";

/** Establece o reemplaza la contrasena de un usuario. Accion separada del PATCH general
 * para que editar nombre/email nunca pueda tocar (ni borrar) la contrasena por accidente. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = usuarioPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const ok = await mutarDb((db) => {
    const existente = db.usuarios.find((u) => u.id === id);
    if (!existente) return false;
    existente.passwordHash = hashPassword(parsed.data.password);
    existente.updatedAt = ahora();
    return true;
  });

  if (!ok) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
