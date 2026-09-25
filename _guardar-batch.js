// Recibe un lote de {url, base64} (guardado en _tmp_batch.json por el paso anterior),
// decodifica cada uno, lo guarda en data/uploads/maple-armor/<fuente>/ y actualiza db.json.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "data", "uploads");
const BATCH_PATH = path.join(__dirname, "_tmp_batch.json");

const CARPETA_POR_FUENTE = {
  "Maple Armor Canada": "maple-armor-canada",
  "Maple Armor China - catalogo Products (publico)": "maple-armor-china-products",
  "Maple Armor China": "maple-armor-china-resource-center",
  "UL Solutions (Product iQ)": "ul-product-iq",
  "Jade Bird corporativo (jbufa.com)": "jade-bird-corporativo",
  "Jade Bird Fire (Baike / repositorio interno)": "jade-bird-baike",
  Distribuidores: "distribuidores",
  "Fabricantes y marketplaces secundarios": "marketplaces-secundarios",
};

function sanitizeFilename(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function nombreArchivoPara(doc) {
  const extMatch = doc.urlOrigen.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "pdf";
  const base = doc.codigo ? `${doc.codigo}-${doc.titulo}` : doc.titulo;
  return `${sanitizeFilename(base).slice(0, 120)}.${ext}`;
}

function main() {
  const batch = JSON.parse(fs.readFileSync(BATCH_PATH, "utf8"));
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const fuentesPorId = new Map(db.fuentes.map((f) => [f.id, f]));

  let guardados = 0;
  const errores = [];

  for (const item of batch) {
    const doc = db.documentos.find((d) => d.urlOrigen === item.url);
    if (!doc) {
      errores.push(`No se encontro documento con urlOrigen ${item.url}`);
      continue;
    }
    if (doc.archivoPath) continue; // ya guardado en una corrida anterior

    const fuente = doc.fuenteId ? fuentesPorId.get(doc.fuenteId) : null;
    const carpeta = fuente ? (CARPETA_POR_FUENTE[fuente.nombre] ?? sanitizeFilename(fuente.nombre)) : "sin-fuente";
    const destinoDir = path.join(UPLOADS_DIR, "maple-armor", carpeta);
    fs.mkdirSync(destinoDir, { recursive: true });

    const nombreArchivo = nombreArchivoPara(doc);
    const archivoPath = `maple-armor/${carpeta}/${nombreArchivo}`;
    const destinoAbs = path.join(UPLOADS_DIR, archivoPath);

    const buffer = Buffer.from(item.base64, "base64");
    fs.writeFileSync(destinoAbs, buffer);

    doc.archivoPath = archivoPath;
    doc.archivoNombre = nombreArchivo;
    doc.updatedAt = new Date().toISOString();
    guardados++;
    console.log(`OK ${(buffer.length / 1024).toFixed(0)}KB -> ${archivoPath}`);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  console.log(`Guardados en este lote: ${guardados}`);
  if (errores.length) console.log("Errores:", errores);
}

main();
