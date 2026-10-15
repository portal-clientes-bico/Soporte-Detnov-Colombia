import { NextResponse } from "next/server";
import { COOKIE_SESION, opcionesCookieSesion } from "@/lib/sesion";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", opcionesCookieSesion(0));
  return res;
}
