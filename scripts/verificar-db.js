const fs = require("fs");
const db = JSON.parse(fs.readFileSync("data/db.json", "utf8"));
console.log("marcas:", db.marcas.length);
console.log("fuentes:", db.fuentes.length);
console.log("productos:", db.productos.length);
console.log("compatibilidades:", db.compatibilidades.length);
console.log("documentos:", db.documentos.length);
console.log("documentoProductos:", db.documentoProductos.length);
console.log("hallazgos:", db.hallazgos.length);

const prodIds = new Set(db.productos.map((p) => p.id));
const docIds = new Set(db.documentos.map((d) => d.id));
const fuenteIds = new Set(db.fuentes.map((f) => f.id));
let huerfanos = 0;
for (const dp of db.documentoProductos) {
  if (!prodIds.has(dp.productoId) || !docIds.has(dp.documentoId)) {
    console.log("HUERFANO:", dp);
    huerfanos++;
  }
}
let sinFuente = 0;
for (const d of db.documentos) {
  if (!fuenteIds.has(d.fuenteId)) { console.log("DOC SIN FUENTE:", d.id); sinFuente++; }
}
console.log("documentoProductos huerfanos:", huerfanos);
console.log("documentos sin fuente valida:", sinFuente);

// referencias duplicadas
const refCount = {};
for (const p of db.productos) {
  const key = p.marcaId + "|" + p.referencia;
  refCount[key] = (refCount[key] || 0) + 1;
}
const dups = Object.entries(refCount).filter(([, c]) => c > 1);
console.log("referencias de producto duplicadas:", dups.length, dups);

// archivos referenciados existen en disco
let faltantes = 0;
for (const d of db.documentos) {
  if (d.archivoPath) {
    const p = "data/uploads/" + d.archivoPath;
    if (!fs.existsSync(p)) { console.log("ARCHIVO FALTANTE:", p); faltantes++; }
  }
}
console.log("archivos faltantes en disco:", faltantes);

const nuevaFuente = db.fuentes.find((f) => f.nombre.startsWith("Información recibida"));
const nuevosDocs = db.documentos.filter((d) => d.fuenteId === nuevaFuente.id);
console.log("\ndocumentos de la nueva fuente:", nuevosDocs.length);
