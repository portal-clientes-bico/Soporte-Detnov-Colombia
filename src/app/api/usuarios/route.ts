import { NextResponse } from "next/server";
import { mutarDb, nuevoId, ahora } from "@/lib/db";
import { getUsuarios } from "@/lib/queries";
import { usuarioConPasswordSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/password";
import { sesionActual } from "@/lib/sesion-actual";
import { COOKIE_SESION, crearTokenSesion, opcionesCookieSesion, sesionConfigurada } from "@/lib/sesion";

export async function GET() {
  const usuarios = await getUsuarios();
  return NextResponse.json({ usuarios });
}

export async function POST(request: Request) {
  const parsed = usuarioConPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const emailNormalizado = parsed.data.email.trim().toLowerCase();

  // src/proxy.ts deja pasar este POST sin sesion solo para poder crear la primera cuenta
  // cuando todavia no existe ningun usuario con contrasena. En cualquier otro caso, crear
  // usuarios exige una sesion iniciada.
  const sesion = await sesionActual();
  if (!sesion && !sesionConfigurada()) {
    return NextResponse.json({ error: "El servidor no tiene configurado SESSION_SECRET" }, { status: 500 });
  }

  const resultado = await mutarDb((db) => {
    const esPrimeraCuenta = !db.usuarios.some((u) => !!u.passwordHash);
    if (!sesion && !esPrimeraCuenta) return { status: 401 as const, error: "Debes iniciar sesion para crear usuarios" };

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
  const res = NextResponse.json({ ok: true, usuario: resultado.usuario });
  // Quien crea la primera cuenta queda con la sesion iniciada.
  if (!sesion) res.cookies.set(COOKIE_SESION, crearTokenSesion(resultado.usuario), opcionesCookieSesion());
  return res;
}
