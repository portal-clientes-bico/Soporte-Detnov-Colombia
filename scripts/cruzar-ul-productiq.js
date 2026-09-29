// Corrida unica: captura completa (con "More..." desplegado) de los 41 documentos UL Product iQ
// encontrados el 2026-09-29 buscando "maple armor" en productiq.ulprospector.com. Crea/actualiza
// un Documento tipo LISTADO_UL por cada File Number (13 en total: 4 ya existian con listas
// truncadas, 9 son nuevos) y vincula cada producto real cuyo referencia aparece exacta en algun
// expediente "UL Certified" -- esto es lo que despues lee la columna "UL" de la tabla de
// productos (ver getProductosDeMarca en src/lib/queries.ts).
//
// Uso: node scripts/cruzar-ul-productiq.js [--dry-run]
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const SERVIDOR = "http://localhost:3100";
const FUENTE_UL_ID = "seed__fuente__53db13b4-38d1-4f93-89e2-4725603a74dd__UL%20Solutions%20(Product%20iQ)";

// Un registro por documento (CCN.FileNumber) listado en la busqueda "maple armor". "modelos" es
// el texto crudo de la pagina, con el modal "More..." ya desplegado cuando existia.
const REGISTROS_UL = [
  { doc: "ULSZ.S35539", categoria: "Audible-signal Appliances", fileNumber: "S35539", modelos: "FW951, FW900R, FW900W, FW901R, FW901W, FW972MR, FW972MW, FW972MR-N, FW972MW-N, FW2921-24S, FW2921-24M, FW2921-24L, WBB, FW2901R, FW2901W, FW971R, FW971W, FW971GR, FW971GW, FW973AR, FW973AW, FW973AGR, FW973AGW, FW2963R, FW2963W, FW2961R, FW2961W, FW2973R, FW2973W, FW2971R, FW2971W, FW962R, FW962W, FW962GR, FW962GW, FW963AR, FW963AW, FW963AGR, FW963AGW" },
  { doc: "UUKC.S35539", categoria: "Signaling Appliances and Equipment for the Hearing Impaired", fileNumber: "S35539", modelos: "FW971GR, FW971GW, FW900R, FW900W, FW901R, FW901W, FW951, FW963AR, FW963AW, FW963AGR, FW963AGW, FW983AR, FW983AW, FW983AGR, FW983AGW, FW2981W, FW2981R, FW2961W, FW2961R, FW2901R, FW2901W" },
  { doc: "UVAV.S35539", categoria: "Visual-signal Appliances for Fire-protective Signaling Systems", fileNumber: "S35539", modelos: "FW900R, FW900W, FW901R, FW901W, FW951, FW2961W, FW2961R, FW2901W, FW2901R, FW2971W, FW2971R, FW2963W, FW2963R, FW962R, FW962W, FW962GR, FW962GW, FW963AR, FW963AW, FW963AGR, FW982R, FW982W, FW982GR, FW982GW, FW983AR, FW983AW, FW983AGR, FW983AGW, FW963AGW" },
  { doc: "UROX.S35835", categoria: "Smoke Detectors for Fire Alarm Systems", fileNumber: "S35835", modelos: "FW562-A, FW562-B, FW562-C, FW512, FW502, FW2501, FW2502, FW2511, FW2509, FW2508, FW2531" },
  { doc: "UQGS.S35835", categoria: "Heat-automatic Fire Detectors", fileNumber: "S35835", modelos: "FW500, FW501, FW2509, FW2501, FW2502, FW2508, FW2531" },
  { doc: "UQGS.S35836", categoria: "Heat-automatic Fire Detectors", fileNumber: "S35836", modelos: "FW521, FW2521, FW2521T" },
  { doc: "UQGS7.S35835", categoria: "Heat-automatic Fire Detectors Certified for Canada", fileNumber: "S35835", modelos: "FW412, FW411, FW500, FW501, FW2509, FW2501, FW2502, FW2508, FW2531" },
  { doc: "UQGS7.S35836", categoria: "Heat-automatic Fire Detectors Certified for Canada", fileNumber: "S35836", modelos: "FW521, FW2521, FW2521T" },
  { doc: "FTBR.E517978", categoria: "Emergency Lighting and Power Equipment", fileNumber: "E517978", modelos: "MES-P-120/347, RO-Z1302U, EL-2W-120/347, BES-P-120/347, RO-Z2136U-N, MEST-P-120/347, RO-Z2172U-N, RO-Z2250U-N, RO-Z1101U, BES-P-120/347, BEST-P-120/347, RO-Z1301U, RO-Z1102U, RO-Z2408U2, BEST-P-120/347" },
  { doc: "FTBR7.E517978", categoria: "Emergency Lighting and Power Equipment Certified for Canada", fileNumber: "E517978", modelos: "BEST-P-120/347, BEST-P-120/347, BES-P-120/347, RO-Z1101U, RO-Z1302U, RO-Z2172U-N, RO-Z2136U-N, BES-P-120/347, MEST-P-120/347, EL-2W-120/347, RO-Z1301U, RO-Z2250U-N, RO-Z2408U2, MES-P-120/347, RO-Z1102U" },
  { doc: "QQJQ2.E529787", categoria: "Power Supplies for Use with Audio/Video, Information and Communication Technology Equipment - Component", fileNumber: "E529787", modelos: "FW151-PS" },
  { doc: "QQJQ8.E529787", categoria: "Power Supplies for Use with Audio/Video, Information and Communication Technology Equipment Certified for Canada - Component", fileNumber: "E529787", modelos: "FW151-PS" },
  { doc: "QQJQ2.E539047", categoria: "Power Supplies for Use with Audio/Video, Information and Communication Technology Equipment - Component", fileNumber: "E539047", modelos: "FW2391, FW2392" },
  { doc: "QQJQ8.E539047", categoria: "Power Supplies for Use with Audio/Video, Information and Communication Technology Equipment Certified for Canada - Component", fileNumber: "E539047", modelos: "FW2391, FW2392" },
  { doc: "USQT.S36858", categoria: "Extinguishing System Attachments", fileNumber: "S36858", modelos: "MA-WFS-8, MA-WFS-6, MA-WFS-4, MA-WFS-3, MA-WFS-2, MA-WFS-2.5" },
  { doc: "USQT7.S36858", categoria: "Extinguishing System Attachments Certified for Canada", fileNumber: "S36858", modelos: "MA-WFS-2, MA-WFS-2.5, MA-WFS-3, MA-WFS-4, MA-WFS-6, MA-WFS-8" },
  { doc: "UOJZ.S35910", categoria: "Control Units, System", fileNumber: "S35910", modelos: "FW2331, FW2201, FW397, FW2361, FW190, FW201, FW201B, FW201C, FW201S, FW201SC, FW337, FW327, FW2321-1, FW347, FW106, FW106C, FW106S, FW106SC, FW2105, FW391, FW2321, FW2852, FW357, FW357A, FW190S, FW2301, FW105, FW301, FW852, FW195, FW202, FW390, FW261A, FW338, FW2261, FW2203, FW2194L, FW2107, FW2252-8, FW2252-6, FW2252-4, FW2252-3, FW2107C, FW2252-7, FW2252-1, FW2391, FW2252-5, FW2107M, FW2194M, FW2252-8-S2L, FW2252-8-RGY, FW2252-8-2RY, FW2252-8-2S2L, FW2252-DMMY, FW2252-4-3S3L, FW2252-CORE, FW109, FW2251, FW2105C, FW2202, FW2385, FW2292, FW2242, FW2253, BB10-4G, FW2243, FW2199, FW2241-1, FW2191N, FW2242-1, FW2365" },
  { doc: "UOJZ7.S35910", categoria: "Control Units, System Certified for Canada", fileNumber: "S35910", modelos: "FW2331, FW2201, FW397, FW2361, FW190, FW201, FW201B, FW201C, FW201S, FW201SC, FW337, FW327, FW2321-1, FW347, FW106, FW106C, FW106S, FW106SC, FW2105, FW391, FW2321, FW2852, FW357, FW357A, FW190S, FW2301, FW105, FW301, FW852, FW195, FW202, FW390, FW261A, FW338, FW2261, FW2203, FW2194L, FW2107, FW2252-8, FW2252-6, FW2252-4, FW2252-3, FW2107C, FW2252-7, FW2252-1, FW2391, FW2252-5, FW2107M, FW2194M, FW2252-8-S2L, FW2252-8-RGY, FW2312, FW2252-8-2RY, FW2252-8-2S2L, FW2252-DMMY, FW2252-4-3S3L, FW2252-CORE" },
  { doc: "UOXX.S35947", categoria: "Control Unit Accessories, System", fileNumber: "S35947", modelos: "FW841, FW434, FW435, FW831, FW859, FW121, FW121C, FW122R, FW122CR, FW122W, FW122CW, FW123, FW123C, FW821, FW821H, PBA-FW357-THT, FW811, FW811H, FW800, FW801, FW2851, FW2851H, FW193A, FW193AC, FW201A, F201D, F201DC, FW2831, FW201D, FW201DC, FW2821, FW2821H, FW422, FW561-RI, FW811M, FW851, FW129, FW129C, FW2811, FW2811H, FW421, FW812, FW191, FW192R, FW192W, FW192CR, FW192CW, FW193, FW193C, FW131, FW302, FW390N, FW194, FW302-1, FW2131, FW2822, FW151-MB, FW151-MIC, FW451-P, FW151-TB, FW864A, FW2423-22K, FW2423-10K, FW151-BS, FW151-DK, FW151-ZS, FW151-PS, FW151-AP, FW151, FW863, FW151-EC, FW2423-3.9K, FW864, FW451-W, FW451-S, FW151-DB, FW2121, FW2129-H5, FW2129-H3, FW2261L, FW2195-H1, FW2129-H2, FW2195-H2, FW2252-4S4L, FW2129-H1, FW2195-H3, FW2195-H5, FW2204L, FW2204, FW2812, FW2845, FW2811M, FW2561-RI, FW2841, FW2881H, FW2823, FW2121H" },
  { doc: "UOXX7.S35947", categoria: "Control Unit Accessories, System Certified for Canada", fileNumber: "S35947", modelos: "FW841, FW434, FW435, FW831, FW859, FW121, FW121C, FW122R, FW122CR, FW122W, FW122CW, FW123, FW123C, FW821, FW821H, PBA-FW357-THT, FW811, FW811H, FW800, FW801, FW2851, FW2851H, FW193A, FW193AC, FW201A, F201D, F201DC, FW2831, FW201D, FW201DC, FW2821, FW2821H, FW422, FW561-RI, FW811M, FW851, FW129, FW129C, FW2811, FW2811H, FW421, FW812, FW191, FW192R, FW192W, FW192CR, FW192CW, FW193, FW193C, FW131, FW302, FW390N, FW194, FW302-1, FW2131, FW2822, FW151-MB, FW151-MIC, FW451-P, FW151-TB, FW864A, FW2423-22K, FW2423-10K, FW151-BS, FW151-DK, FW151-ZS, FW151-PS, FW151-AP, FW151, FW863, FW151-EC, FW2423-3.9K, FW864, FW451-W, FW451-S, FW151-DB, FW2121, FW2129-H5, FW2129-H3, FW2261L, FW2195-H1, FW2129-H2, FW2195-H2, FW2252-4S4L, FW2129-H1, FW2195-H3, FW2195-H5, FW2204L, FW2204, FW2812, FW2845, FW2811M, FW2561-RI, FW2841, FW2823" },
  { doc: "UQKE.S35835", categoria: "Heat-automatic Fire Detector Accessories", fileNumber: "S35835", modelos: "FW411, FW412" },
  { doc: "BAZR2.MH67124", categoria: "Valve Regulated or Vented Batteries with Aqueous Electrolytes - Component", fileNumber: "MH67124", modelos: "12V12Ah, 12V18Ah, 12V55Ah, 12V42Ah, 12V35Ah, 12V26Ah, 12V7Ah, 12V5Ah, 6V12Ah, 6V7Ah, 6V5Ah" },
  { doc: "UOXX7.S35854", categoria: "Control Unit Accessories, System Certified for Canada", fileNumber: "S35854", modelos: "FW2732, FW2701" },
  { doc: "SYZV.S35910", categoria: "Control Units, Releasing Device", fileNumber: "S35910", modelos: "FW2261, FW2252-4, FW2194L, FW2252-1, FW2252-8, FW2107C, FW2191-06, FW2252-7, FW2252-6, FW2252-5, FW2252-3, FW2391, FW2107, FW2203, FW2194M, FW2107M, FW2252-CORE, FW2252-8-2S2L, FW2252-8-2RY, FW2252-DMMY, FW2252-4-3S3L, FW2252-8-S2L, FW2252-8-RGY" },
  { doc: "SYZV7.S35910", categoria: "Control Units, Releasing Device Certified for Canada", fileNumber: "S35910", modelos: "FW2261, FW2252-4, FW2194L, FW2252-1, FW2252-8, FW2107C, FW2191-06, FW2252-7, FW2252-6, FW2252-5, FW2252-3, FW2391, FW2107, FW2203, FW2194M, FW2107M, FW2252-CORE, FW2252-8-2S2L, FW2252-8-2RY, FW2252-DMMY, FW2252-4-3S3L, FW2252-8-S2L, FW2252-8-RGY" },
  { doc: "SYSW7.S35947", categoria: "Accessories, Releasing Device Certified for Canada", fileNumber: "S35947", modelos: "FW2822, FW2733, FW2734" },
  { doc: "SYSW.S35947", categoria: "Accessories, Releasing Device", fileNumber: "S35947", modelos: "FW2822, FW2733, FW2734" },
  { doc: "UQKE.S36872", categoria: "Heat-automatic Fire Detector Accessories", fileNumber: "S36872", modelos: "FW2561-RI, FW2411" },
  { doc: "UQGS7.S36872", categoria: "Heat-automatic Fire Detectors Certified for Canada", fileNumber: "S36872", modelos: "FW2561-RI Remote Indicator, FW2411 Handheld programmer" },
  { doc: "UOQY.S35947", categoria: "Emergency Communication and Relocation Equipment", fileNumber: "S35947", modelos: "FW151-PS, FW864A, FW2423-3.9K, FW151-AP, FW151-MIC, FW151-DK, FW451-S, FW151, FW151-DB, FW863, FW451-P, FW151-ZS, FW2423-10K, FW151-MB, FW2423-22K, FW151-TB, FW864, FW151-BS, FW151-EC, FW451-W" },
  { doc: "ULSZ.S35835", categoria: "Audible-signal Appliances", fileNumber: "S35835", modelos: "FW2509, FW2508" },
  { doc: "URRQ.S36872", categoria: "Smoke-automatic Fire Detector Accessories", fileNumber: "S36872", modelos: "FW2561-RI, FW2411" },
  { doc: "URRQ7.S36872", categoria: "Smoke-automatic Fire Detector Accessories Certified for Canada", fileNumber: "S36872", modelos: "FW2561-RI, FW2411" },
  { doc: "UNIU.S35854", categoria: "Boxes, Noncoded", fileNumber: "S35854", modelos: "FW752C, FW2721, FW2723, FW721C(NC), FW752, FW722C, FW721C, FW751, FW723, FW2722, FW700, FW2701, FW722C(NC), FW2731, FW721, FW721(NC), FW722(NC), FW2732, FW722, FW751C, FW2724, FW2726, FW2725" },
  { doc: "UNIU7.S35854", categoria: "Boxes, Noncoded Certified for Canada", fileNumber: "S35854", modelos: "FW752C, FW752, FW751, FW751C" },
  { doc: "ULSZ7.S35539", categoria: "Audible-signal Appliances Certified for Canada", fileNumber: "S35539", modelos: "WBB, FW972MW-N, FW972MR-N, FW972MW, FW972MR, FW2971W, FW2971R, FW971R, FW971W, FW971GR, FW971GW, FW973AR, FW973AW, FW973AGR, FW973AGW, FW2961W, FW962R, FW962W, FW962GR, FW962GW, FW963AR, FW963AW, FW963AGR, FW963AGW, FW900W, FW2921-24L, FW2921-24M, FW2921-24S, FW2961R, FW951, FW900R, FW2901W, FW901W, FW2901R, FW901R, FW2963R, FW2973W, FW2963W, FW2973R" },
  { doc: "ULSZ7.S35835", categoria: "Audible-signal Appliances Certified for Canada", fileNumber: "S35835", modelos: "FW2509" },
  { doc: "UEES.S35539", categoria: "Visual-signal Appliances", fileNumber: "S35539", modelos: "" },
  { doc: "UEES7.S35539", categoria: "Visual-signal Appliances Certified for Canada", fileNumber: "S35539", modelos: "FW962R, FW962GW, FW962GR, FW2963W, FW2963R, FW2961W, FW2961R, FW963AGW, FW2981W, FW983AW, FW983AR, FW983AGW, FW983AGR, FW982W, FW982R, FW962W, FW982GR, FW963AGR, FW2981R, FW951, FW901W, FW901R, FW900W, FW900R, FW2901W, FW2901R, FW963AW, FW963AR, FW982GW" },
  { doc: "ENGG.S37017", categoria: "EN 54 Part 11: Manual Call Points", fileNumber: "S37017", modelos: "FW2728, FW2728P" },
];

// File numbers que ya existian como Documento LISTADO_UL antes de esta corrida (ver notas en
// data/db.json) -- se actualizan en vez de duplicarse.
const DOCUMENTOS_EXISTENTES = {
  S35910: "seed__documento__ul-s35910",
  S35947: "seed__documento__ul-s35947",
  S35539: "seed__documento__ul-s35539",
  S35854: "seed__documento__ul-s35854",
};

function tokenizar(modelos) {
  return modelos
    .split(/[,\s]+/)
    .map((t) => t.replace(/\(.*?\)$/, "").trim())
    .filter(Boolean);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const marca = db.marcas.find((m) => m.slug === "maple-armor");
  const productos = db.productos.filter((p) => p.marcaId === marca.id);
  const porReferencia = new Map(productos.map((p) => [p.referencia.toUpperCase(), p]));

  // Agrupa por fileNumber: categorias unicas + union de tokens de modelo.
  const porFileNumber = new Map();
  for (const reg of REGISTROS_UL) {
    if (!porFileNumber.has(reg.fileNumber)) porFileNumber.set(reg.fileNumber, { categorias: new Set(), tokens: new Set(), docs: [] });
    const entry = porFileNumber.get(reg.fileNumber);
    entry.categorias.add(
      reg.categoria
        .replace(/\s*Certified for Canada\s*/, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    entry.docs.push(reg.doc);
    for (const t of tokenizar(reg.modelos)) entry.tokens.add(t.toUpperCase());
  }

  console.log(`File Numbers unicos: ${porFileNumber.size}`);

  // Matching: producto -> lista de fileNumbers donde aparece.
  const matchPorProducto = new Map();
  for (const [fileNumber, entry] of porFileNumber) {
    for (const [refUpper, producto] of porReferencia) {
      if (entry.tokens.has(refUpper)) {
        if (!matchPorProducto.has(producto.id)) matchPorProducto.set(producto.id, new Set());
        matchPorProducto.get(producto.id).add(fileNumber);
      }
    }
  }
  console.log(`Productos con match: ${matchPorProducto.size} / ${productos.length} (antes: 19 via los 4 expedientes ya cargados)`);

  if (dryRun) {
    const filas = [...matchPorProducto.entries()]
      .map(([id, files]) => ({ referencia: productos.find((p) => p.id === id).referencia, files: [...files].join(", ") }))
      .sort((a, b) => a.referencia.localeCompare(b.referencia));
    for (const f of filas) console.log(` - ${f.referencia} -> ${f.files}`);
    console.log("\n--dry-run: no se escribio nada.");
    return;
  }

  // 1) Crear o actualizar el Documento LISTADO_UL por cada File Number.
  const documentoIdPorFileNumber = new Map();
  for (const [fileNumber, entry] of porFileNumber) {
    const categoriasTexto = [...entry.categorias].join(" / ");
    const notas = `Capturado completo desde UL Product iQ el 2026-09-29 (con "More..." desplegado). Documentos: ${entry.docs.join(", ")}. Todos con estado "UL Certified" al momento de la captura.`;
    const existenteId = DOCUMENTOS_EXISTENTES[fileNumber];
    if (existenteId) {
      const res = await fetch(`${SERVIDOR}/api/documentos/${encodeURIComponent(existenteId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notas, confianza: "CONFIRMADO" }),
      });
      if (!res.ok) console.error(`  [ERROR actualizando] ${fileNumber}: ${res.status}`);
      else console.log(`  [actualizado] ${fileNumber}`);
      documentoIdPorFileNumber.set(fileNumber, existenteId);
    } else {
      const formData = new FormData();
      formData.set("marcaId", marca.id);
      formData.set("tipo", "LISTADO_UL");
      formData.set("titulo", `UL Product iQ - ${fileNumber}, ${categoriasTexto}`);
      formData.set("codigo", fileNumber);
      formData.set("idioma", "EN");
      formData.set("fuenteId", FUENTE_UL_ID);
      formData.set("urlOrigen", "https://productiq.ulprospector.com/en/search?term=maple%20armor");
      formData.set("confianza", "CONFIRMADO");
      formData.set("notas", notas);
      const res = await fetch(`${SERVIDOR}/api/documentos`, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`  [ERROR creando] ${fileNumber}: ${data.error ?? res.status}`);
        continue;
      }
      console.log(`  [creado] ${fileNumber} -> ${data.id}`);
      documentoIdPorFileNumber.set(fileNumber, data.id);
    }
  }

  // 2) Vincular cada producto encontrado a cada Documento (File Number) donde aparece.
  let vinculos = 0;
  let yaExistian = 0;
  const dbActual = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  for (const [productoId, fileNumbers] of matchPorProducto) {
    for (const fileNumber of fileNumbers) {
      const documentoId = documentoIdPorFileNumber.get(fileNumber);
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
