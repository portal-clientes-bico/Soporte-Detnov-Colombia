import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/db";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".txt": "text/plain",
};

// Ver la nota equivalente en storage.ts sobre resolucion automatica de credenciales.
const USAR_BLOB = !!process.env.BLOB_STORE_ID || !!process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  // Evita salir de la carpeta de subidas (../ traversal).
  const safeSegments = segments.filter((s) => s !== ".." && s !== ".");
  if (safeSegments.length !== segments.length) {
    return NextResponse.json({ error: "Ruta invalida" }, { status: 400 });
  }

  const ext = path.extname(safeSegments[safeSegments.length - 1] ?? "").toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  if (USAR_BLOB) {
    try {
      const { head } = await import("@vercel/blob");
      const info = await head(`uploads/${safeSegments.join("/")}`);
      const respuesta = await fetch(info.url);
      if (!respuesta.ok) throw new Error("blob fetch failed");
      return new NextResponse(respuesta.body, { headers: { "Content-Type": contentType } });
    } catch {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }
  }

  const filePath = path.join(UPLOADS_DIR, ...safeSegments);
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: "Ruta invalida" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": contentType } });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
