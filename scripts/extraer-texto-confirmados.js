// Extrae el texto de todos los documentos con confianza CONFIRMADO que aun no lo tengan
// (documento.textoExtraidoEn === null), y lo guarda en data/uploads-texto/<id>.json.
// Seguro de re-ejecutar: salta los que ya estan procesados. Usa --forzar para reprocesar
// todos de nuevo (por ejemplo, si se mejora el extractor).
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "..", "data", "uploads");
const TEXTO_DIR = path.join(__dirname, "..", "data", "uploads-texto");
const FORZAR = process.argv.includes("--forzar");

function ahora() {
  return new Date().toISOString();
}

async function extraerPdf(rutaCompleta) {
  const buf = fs.readFileSync(rutaCompleta);
  const parser = new PDFParse({ data: buf });
  try {
    const resultado = await parser.getText();
    return (resultado.pages ?? [])
      .map((p) => ({ numero: p.num, texto: (p.text ?? "").trim() }))
      .filter((p) => p.texto.length > 0);
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  fs.mkdirSync(TEXTO_DIR, { recursive: true });

  const candidatos = db.documentos.filter(
    (d) => d.confianza === "CONFIRMADO" && d.archivoPath && d.archivoPath.toLowerCase().endsWith(".pdf") && (FORZAR || !d.textoExtraidoEn),
  );

  console.log(`Documentos a procesar: ${candidatos.length}${FORZAR ? " (--forzar: reprocesando todos)" : ""}`);

  let exitosos = 0;
  let vacios = 0;
  let fallidos = 0;

  for (const doc of candidatos) {
    const rutaCompleta = path.join(UPLOADS_DIR, doc.archivoPath);
    try {
      const paginas = await extraerPdf(rutaCompleta);
      if (paginas.length === 0) {
        console.log("SIN TEXTO (posible PDF escaneado):", doc.titulo);
        vacios++;
        continue;
      }
      const extraidoEn = ahora();
      fs.writeFileSync(
        path.join(TEXTO_DIR, `${doc.id}.json`),
        JSON.stringify({ documentoId: doc.id, extraidoEn, paginas }, null, 1),
        "utf8",
      );
      doc.textoExtraidoEn = extraidoEn;
      exitosos++;
    } catch (error) {
      console.log("ERROR:", doc.titulo, "->", String(error).slice(0, 150));
      fallidos++;
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  console.log("\nResumen:");
  console.log("  Extraidos con exito:", exitosos);
  console.log("  Sin texto (posibles escaneados):", vacios);
  console.log("  Con error:", fallidos);
}

main();
