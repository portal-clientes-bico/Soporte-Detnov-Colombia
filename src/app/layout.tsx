import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base de conocimiento técnico Detnov Colombia",
  description: "Herramienta de soporte tecnico y biblioteca de documentacion.",
};

/** Layout raiz neutro: solo html/body. El encabezado de la herramienta interna vive en
 * (interno)/layout.tsx y el del sitio publico de ayuda en (publico)/layout.tsx, para que los
 * clientes no vean los enlaces internos (Usuarios, sesion, etc.). */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">{children}</body>
    </html>
  );
}
