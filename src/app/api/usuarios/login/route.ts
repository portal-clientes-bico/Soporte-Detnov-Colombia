import { NextResponse } from "next/server";
import { leerDb } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { verificarPassword } from "@/lib/password";
import { COOKIE_SESION, crearTokenSesion, opcionesCookieSesion, sesionConfigurada } from "@/lib/sesion";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  if (!sesionConfigurada()) {
    return NextResponse.json({ error: "El servidor no tiene configurado SESSION_SECRET; no se puede iniciar sesion" }, { status: 500 });
  }

  const emailNormalizado = parsed.data.email.trim().toLowerCase();
  const db = await leerDb();
  const usuario = db.usuarios.find((u) => (u.email ?? "").trim().toLowerCase() === emailNormalizado);

  // Mensaje generico a proposito: no revelar si el email existe o si fallo la contrasena.
  if (!usuario || !verificarPassword(parsed.data.password, usuario.passwordHash)) {
    return NextResponse.json({ error: "Correo o contrasena incorrectos" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  res.cookies.set(COOKIE_SESION, crearTokenSesion(usuario), opcionesCookieSesion());
  return res;
}
