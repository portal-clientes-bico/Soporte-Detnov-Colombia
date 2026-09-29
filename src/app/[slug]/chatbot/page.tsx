import { getHistorialChatbot, getMarcaPorSlug, getUsoChatbot } from "@/lib/queries";
import ChatbotManager from "./chatbot-manager";

export default async function ChatbotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = await getMarcaPorSlug(slug);
  if (!marca) return null;
  const [usoInicial, historialInicial] = await Promise.all([getUsoChatbot(), getHistorialChatbot(marca.id)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">ChatBot</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Asistente de consulta para {marca.nombre}.</p>
      </div>
      <ChatbotManager slug={slug} usoInicial={usoInicial} historialInicial={historialInicial} />
    </div>
  );
}
