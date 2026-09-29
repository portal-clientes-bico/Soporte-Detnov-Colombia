// Corrida unica: captura de los 11 resultados (10 certificados unicos, uno duplicado en 2
// categorias) encontrados el 2026-09-29 buscando "maple armor" en approvalguide.com (FM
// Approvals). Crea un Documento tipo CERTIFICADO por cada certificado, con fuente "FM Approvals
// (Approval Guide)", y vincula cada producto real cuyo referencia aparece exacta (o por prefijo
// para el registro de la Serie FW962*/FW971*/FW982*) en la descripcion del certificado.
//
// Uso: node scripts/cruzar-fm-approvals.js [--dry-run]
// CRUZAR_SERVIDOR/CRUZAR_DB_PATH/CRUZAR_FUENTE_FM_ID permiten apuntar a otro servidor (ej.
// produccion) leyendo un snapshot de esa base en vez de data/db.json local -- necesario para que
// el chequeo de idempotencia no se base en el estado local (que ya tiene esta migracion corrida),
// y para usar el id de Fuente real de ese servidor (la Fuente se crea por separado en cada uno).
const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.CRUZAR_DB_PATH ? path.resolve(process.env.CRUZAR_DB_PATH) : path.join(__dirname, "..", "data", "db.json");
const SERVIDOR = process.env.CRUZAR_SERVIDOR || "http://localhost:3100";
const FUENTE_FM_ID = process.env.CRUZAR_FUENTE_FM_ID || "300c845a-4043-4a64-958b-e1ee0f0d4b8e";

const REGISTROS_FM = [
  {
    titulo: "Video Image Fire Detector Model VFD/SFH-MA-DG06",
    certNumero: "FM25US0104",
    categoria: "Alarm Signal Initiating Devices, Fire Detection, Video Image Activated",
    pais: "Canada",
    modelos: "VFD/SFH-MA-DG06",
  },
  { titulo: "Model MA-WFS", certNumero: null, categoria: "Waterflow Detectors, Vane Type", pais: "China", modelos: "MA-WFS-2, MA-WFS-2.5, MA-WFS-3, MA-WFS-4, MA-WFS-6, MA-WFS-8" },
  { titulo: "Model MA-WFS-CT", certNumero: null, categoria: "Waterflow Detectors, Vane Type", pais: "China", modelos: "MA-WFS-CT" },
  { titulo: "MA-OSY-1 Sprinkler Supervisory Switch", certNumero: "FM24FPUS0057", categoria: "Sprinkler System Supervision, Standard Security", pais: "China", modelos: "MA-OSY-1" },
  { titulo: "Model FW521 (heat detector, base FW500)", certNumero: null, categoria: "Alarm Signal Initiating Devices, Fire Detection, Heat-Actuated", pais: "Canada", modelos: "FW521, FW500" },
  { titulo: "Model FW511 (smoke detector, base FW500/FW501, panel FW106)", certNumero: null, categoria: "Alarm Signal Initiating Devices, Smoke Detectors", pais: "Canada", modelos: "FW511, FW500, FW501, FW106" },
  { titulo: "FW2601 Aspirating Smoke Detector", certNumero: "FM24US0267", categoria: "Alarm Signal Initiating Devices, Smoke Detectors / VEWFD Systems", pais: "Canada", modelos: "FW2601, FW2601-P1, FW2601-P2, FW2601-P4" },
  { titulo: "FW751 - Manual Stations", certNumero: null, categoria: "Alarm Signal Initiating Devices, Manual Stations", pais: "Canada", modelos: "FW751" },
  {
    titulo: "Series FW962*, FW971*, and FW982* (bases FW900/FW901, sync FW951, paneles FW106/FW106C)",
    certNumero: null,
    categoria: "Notification Appliances",
    pais: "Canada",
    modelos: "FW900, FW901, FW951, FW106, FW106C",
    prefijos: ["FW962", "FW971", "FW982"],
  },
  { titulo: "Model FW106 (FireWatcher: FW106, AMI FW201, ALU FW327, NOU FW337, ROU FW347, XNU FW357, PCU FW397, FW811, FW821, FW851)", certNumero: null, categoria: "Local Protective Signaling, Fire", pais: "Canada", modelos: "FW106, FW201, FW327, FW337, FW347, FW357, FW397, FW811, FW821, FW851" },
];

function tokenizar(modelos) {
  return modelos
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const marca = db.marcas.find((m) => m.slug === "maple-armor");
  const productos = db.productos.filter((p) => p.marcaId === marca.id);
  const porReferencia = new Map(productos.map((p) => [p.referencia.toUpperCase(), p]));

  const matchPorProducto = new Map(); // productoId -> Set(titulo)
  for (const reg of REGISTROS_FM) {
    const tokens = new Set(tokenizar(reg.modelos).map((t) => t.toUpperCase()));
    for (const [refUpper, producto] of porReferencia) {
      const matchExacto = tokens.has(refUpper);
      const matchPrefijo = reg.prefijos && reg.prefijos.some((pref) => refUpper.startsWith(pref.toUpperCase()));
      if (matchExacto || matchPrefijo) {
        if (!matchPorProducto.has(producto.id)) matchPorProducto.set(producto.id, new Set());
        matchPorProducto.get(producto.id).add(reg.titulo);
      }
    }
  }

  console.log(`Productos con match FM Approvals: ${matchPorProducto.size} / ${productos.length}`);
  const filas = [...matchPorProducto.entries()]
    .map(([id, titulos]) => ({ referencia: productos.find((p) => p.id === id).referencia, titulos: [...titulos].join(" | ") }))
    .sort((a, b) => a.referencia.localeCompare(b.referencia));
  for (const f of filas) console.log(` - ${f.referencia} -> ${f.titulos}`);

  if (dryRun) {
    console.log("\n--dry-run: no se escribio nada.");
    return;
  }

  // 1) Idempotencia: si ya existe un Documento CERTIFICADO de esta fuente con este titulo, se
  // reutiliza en vez de crear uno nuevo (evita el problema de duplicados visto con UL).
  const dbAntes = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const existentesPorTitulo = new Map(
    dbAntes.documentos.filter((d) => d.marcaId === marca.id && d.tipo === "CERTIFICADO" && d.fuenteId === FUENTE_FM_ID).map((d) => [d.titulo, d.id]),
  );

  const documentoIdPorTitulo = new Map();
  for (const reg of REGISTROS_FM) {
    if (existentesPorTitulo.has(reg.titulo)) {
      documentoIdPorTitulo.set(reg.titulo, existentesPorTitulo.get(reg.titulo));
      console.log(`  [ya existia] ${reg.titulo}`);
      continue;
    }
    const notas = `Capturado desde FM Approvals (Approval Guide) el 2026-09-29. Pais de listado: ${reg.pais}. Modelos/referencias mencionados: ${reg.modelos}.`;
    const formData = new FormData();
    formData.set("marcaId", marca.id);
    formData.set("tipo", "CERTIFICADO");
    formData.set("titulo", reg.titulo);
    if (reg.certNumero) formData.set("codigo", reg.certNumero);
    formData.set("idioma", "EN");
    formData.set("fuenteId", FUENTE_FM_ID);
    formData.set("urlOrigen", "https://www.approvalguide.com/search?searchParams=all=bWFwbGUlMjBhcm1vcg==");
    formData.set("confianza", "CONFIRMADO");
    formData.set("notas", notas);
    const res = await fetch(`${SERVIDOR}/api/documentos`, { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`  [ERROR creando] ${reg.titulo}: ${data.error ?? res.status}`);
      continue;
    }
    console.log(`  [creado] ${reg.titulo} -> ${data.id}`);
    documentoIdPorTitulo.set(reg.titulo, data.id);
  }

  // 2) Vincular productos.
  let vinculos = 0;
  let yaExistian = 0;
  const dbActual = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  for (const [productoId, titulos] of matchPorProducto) {
    for (const titulo of titulos) {
      const documentoId = documentoIdPorTitulo.get(titulo);
      if (!documentoId) continue;
      const yaVinculado = dbActual.documentoProductos.some((dp) => dp.documentoId === documentoId && dp.productoId === productoId);
      if (yaVinculado) {
        yaExistian++;
        continue;
      }
      const res = await fetch(`${SERVIDOR}/api/documentos/${encodeURIComponent(documentoId)}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId }),
      });
      if (!res.ok) console.error(`  [ERROR vinculando] producto=${productoId} documento=${documentoId}: ${res.status}`);
      else vinculos++;
    }
  }
  console.log(`\nVinculos nuevos: ${vinculos} | ya existian: ${yaExistian}`);
}

main().catch((error) => {
  console.error("Fallo el cruce:", error);
  process.exit(1);
});
