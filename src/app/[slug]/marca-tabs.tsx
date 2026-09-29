"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarcaTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}`;

  const tabs = [
    { href: `${base}/preguntas`, label: "Preguntas" },
    { href: `${base}/productos`, label: "Productos" },
    { href: `${base}/documentos`, label: "Documentos" },
    { href: `${base}/traducciones`, label: "Traducciones" },
    { href: `${base}/fuentes`, label: "Fuentes" },
    { href: `${base}/hallazgos`, label: "Hallazgos" },
    { href: `${base}/chatbot`, label: "ChatBot" },
  ];

  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-1 border-b border-zinc-200 pb-2 text-sm dark:border-zinc-800">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
