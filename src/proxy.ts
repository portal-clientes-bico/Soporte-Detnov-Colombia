import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/sesion";

/**
 * Control de acceso de la herramienta interna. Todo exige sesion (cookie firmada, ver
 * src/lib/sesion.ts) salvo:
 * - /ayuda/**: sitio publico de instructivos para clientes.
 * - /responder/<token> y /api/externo/<token>/**: enlace de una pregunta para la fabrica.
 * - GET /api/archivos/**: por ahi se sirven las imagenes de los instructivos publicados.
 * - /login, /api/usuarios/login y /api/usuarios/logout.
 * - POST /api/usuarios: el propio handler solo lo permite sin sesion para crear la primera
 *   cuenta cuando aun no hay ningun usuario con contrasena.
 * Sin sesion, las paginas redirigen a /login y las rutas /api responden 401.
 */
function esPublica(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const metodo = request.method;

  if (pathname === "/ayuda" || pathname.startsWith("/ayuda/")) return true;
  // Enlace externo de una pregunta para la fabrica: el token del enlace es la autorizacion
  // (lo valida cada pagina/handler; ver src/lib/enlace-externo.ts).
  if (pathname.startsWith("/responder/") || pathname.startsWith("/api/externo/")) return true;
  if (pathname === "/login") return true;
  if (pathname === "/api/usuarios/login" || pathname === "/api/usuarios/logout") return true;
  if (pathname === "/api/usuarios" && metodo === "POST") return true;
  if (pathname.startsWith("/api/archivos/") && (metodo === "GET" || metodo === "HEAD")) return true;
  return false;
}

export function proxy(request: NextRequest) {
  if (esPublica(request)) return NextResponse.next();

  const sesion = verificarTokenSesion(request.cookies.get(COOKIE_SESION)?.value);
  if (sesion) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  }

  const url = new URL("/login", request.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo menos los archivos estaticos de Next y los iconos/archivos sueltos de la raiz.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
