// Genera los vectores de embedding (busqueda semantica local, ver src/lib/embeddings.ts) para
// todos los documentos que ya tengan texto extraido (documento.textoExtraidoEn) pero aun no
// tengan embeddingsGeneradasEn, y los guarda en data/uploads-embeddings/<id>.json.
// Seguro de re-ejecutar: salta los que ya estan procesados. Usa --forzar para recalcular todos
// (por ejemplo, si se cambia el modelo).
const fs = require("fs");
const path = require("path");
const { pipeline } = require("@huggingface/transformers");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const TEXTO_DIR = path.join(__dirname, "..", "data", "uploads-texto");
const EMBEDDINGS_DIR = path.join(__dirname, "..", "data", "uploads-embeddings");
const FORZAR = process.argv.includes("--forzar");

const MODELO = "Xenova/multilingual-e5-small";
const MAX_CHARS_POR_PASAJE = 1800;

function ahora() {
  return new Date().toISOString();
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true });

  const candidatos = db.documentos.filter((d) => d.textoExtraidoEn && (FORZAR || !d.embeddingsGeneradasEn));

  console.log(`Documentos a procesar: ${candidatos.length}${FORZAR ? " (--forzar: recalculando todos)" : ""}`);
  if (candidatos.length === 0) return;

  console.log("Cargando modelo de embeddings (la primera vez descarga unos MB)...");
  const extractor = await pipeline("feature-extraction", MODELO);
  console.log("Modelo cargado.\n");

  let exitosos = 0;
  let sinTexto = 0;
  let fallidos = 0;

  for (const doc of candidatos) {
    const rutaTexto = path.join(TEXTO_DIR, `${doc.id}.json`);
    let extraido;
    try {
      extraido = JSON.parse(fs.readFileSync(rutaTexto, "utf8"));
    } catch {
      console.log("SIN ARCHIVO DE TEXTO (raro, revisar):", doc.titulo);
      sinTexto++;
      continue;
    }
    if (!extraido.paginas || extraido.paginas.length === 0) {
      sinTexto++;
      continue;
    }

    try {
      const textos = extraido.paginas.map((p) => `passage: ${p.texto.slice(0, MAX_CHARS_POR_PASAJE)}`);
      const salida = await extractor(textos, { pooling: "mean", normalize: true });
      const vectores = salida.tolist();
      const generadoEn = ahora();
      fs.writeFileSync(
        path.join(EMBEDDINGS_DIR, `${doc.id}.json`),
        JSON.stringify({ documentoId: doc.id, modelo: MODELO, generadoEn, vectores }),
        "utf8",
      );
      doc.embeddingsGeneradasEn = generadoEn;
      exitosos++;
      console.log("OK:", doc.titulo, `(${extraido.paginas.length} paginas)`);
    } catch (error) {
      console.log("ERROR:", doc.titulo, "->", String(error).slice(0, 150));
      fallidos++;
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  console.log("\nResumen:");
  console.log("  Con embeddings generados:", exitosos);
  console.log("  Sin texto extraido (saltados):", sinTexto);
  console.log("  Con error:", fallidos);
}

main().catch((error) => {
  console.error("Error inesperado:", error);
  process.exit(1);
});
