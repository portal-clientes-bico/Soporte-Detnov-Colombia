"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DesvincularDocumentoButton({ documentoId, productoId }: { documentoId: string; productoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/documentos/${documentoId}/productos/${productoId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className="shrink-0 text-xs text-red-600 underline hover:text-red-800 disabled:opacity-60 dark:text-red-400">
      Desvincular
    </button>
  );
}
