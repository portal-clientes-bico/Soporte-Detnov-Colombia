import { NextResponse } from "next/server";
import { getContextoChatbot, getMarcaPorSlug } from "@/lib/queries";
import { chatbotPreguntaSchema } from "@/lib/schemas";
import { ChatbotApiError, ChatbotConfigError, preguntarChatbot } from "@/lib/chatbot";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = chatbotPreguntaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const marca = await getMarcaPorSlug(slug);
  if (!marca) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  const contexto = await getContextoChatbot(marca.id);

  try {
    const respuesta = await preguntarChatbot(parsed.data.pregunta, marca.nombre, contexto);
    return NextResponse.json({ ok: true, respuesta });
  } catch (error) {
    if (error instanceof ChatbotConfigError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof ChatbotApiError) return NextResponse.json({ error: error.message }, { status: 502 });
    console.error("Error inesperado en el chatbot:", error);
    return NextResponse.json({ error: "Error inesperado al consultar el ChatBot. Intenta de nuevo." }, { status: 500 });
  }
}
