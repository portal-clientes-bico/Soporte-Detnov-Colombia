/** Sitio publico de ayuda para clientes: sin clave y sin los enlaces de la herramienta
 * interna. Solo muestra instructivos en estado PUBLICADO (ver getInstructivosPublicados). */
export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {children}
      <footer className="border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500 sm:px-6 dark:border-zinc-800 dark:text-zinc-400">
        Soporte técnico Detnov Colombia
      </footer>
    </div>
  );
}
