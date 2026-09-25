import { NextResponse } from "next/server";
import { aplicarSemilla } from "@/lib/semilla";
import { MAPLE_ARMOR_SEMILLA } from "@/lib/semillas/maple-armor";

const SEMILLAS: Record<string, typeof MAPLE_ARMOR_SEMILLA> = {
  [MAPLE_ARMOR_SEMILLA.slug]: MAPLE_ARMOR_SEMILLA,
};

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const semilla = SEMILLAS[slug];
  if (!semilla) {
    return NextResponse.json({ error: "No hay datos iniciales definidos para esta marca" }, { status: 404 });
  }

  try {
    const resultado = await aplicarSemilla(semilla);
    return NextResponse.json({ ok: true, ...resultado });
  } catch (error) {
    console.error("Error aplicando semilla:", error);
    return NextResponse.json({ error: "No se pudieron cargar los datos iniciales. Intenta de nuevo." }, { status: 500 });
  }
}
