import { NextResponse } from "next/server";
import { preguntaArchivoCamposSchema } from "@/lib/schemas";
import { ArchivoValidationError } from "@/lib/storage";
import { adjuntarArchivoAPregunta, PreguntaNoEncontradaError } from "@/lib/preguntas-archivos";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  const notas = formData.get("notas");
  const parsed = preguntaArchivoCamposSchema.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    notas: typeof notas === "string" && notas ? notas : undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: `Datos invalidos: ${parsed.error.issues[0]?.message}` }, { status: 400 });

  const archivo = formData.get("file");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Selecciona un archivo" }, { status: 400 });
  }

  try {
    const documentoId = await adjuntarArchivoAPregunta(id, archivo, { ...parsed.data, confianza: "CONFIRMADO" });
    return NextResponse.json({ ok: true, documentoId });
  } catch (error) {
    if (error instanceof PreguntaNoEncontradaError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof ArchivoValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error subiendo archivo de pregunta:", error);
    return NextResponse.json({ error: "No se pudo subir el archivo. Intenta de nuevo." }, { status: 500 });
  }
}
