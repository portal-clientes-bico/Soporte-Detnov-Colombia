import { NextResponse } from "next/server";
import { mutarDb } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ compatId: string }> }) {
  const { compatId } = await params;
  await mutarDb((db) => {
    db.compatibilidades = db.compatibilidades.filter((c) => c.id !== compatId);
  });
  return NextResponse.json({ ok: true });
}
