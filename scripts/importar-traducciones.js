// Corrida unica: sube los archivos ya traducidos al español que existen en
// "Traducciones Maple Armor" (carpeta del Escritorio, fuera del repo) y los asocia, en estado
// Borrador, a su documento en ingles correspondiente (traduccionDeId). Requiere el servidor
// local corriendo (npm run dev, puerto 3100).
//
// Matching: por "codigo" (ej. "DOC-12105", "DOC-FW2105-UM") para datasheets/manuales, con
// preferencia estricta por coincidencia EXACTA antes que por prefijo (evita confundir
// DOC-12107 con DOC-12107M, ver OVERRIDES_MANUALES para los 2 casos que ni asi calzan). Los
// archivos de "Curso ES" no tienen codigo: matchean por titulo contra documentos ya existentes
// de tipo entrenamiento (PRESENTACION/INSTRUCTIVO).
//
// Seguro de re-ejecutar: si un documento ya tiene una traduccion con ese mismo archivoNombre,
// se salta.
//
// Uso: node scripts/importar-traducciones.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const CARPETA_BASE = "C:/Users/mlope/OneDrive/Escritorio/Traducciones Maple Armor";
const SERVIDOR = "http://localhost:3100";

// Archivos cuyo nombre no sigue el patron "DOC-XXXX" de forma reconocible por regex, resueltos
// a mano contra data/db.json (ver notas en el plan / mensajes de esta sesion).
const OVERRIDES_MANUALES = {
  "DOC-FW434FW435-DS-R1.1 - ES.docx": "FW434/FW435-DS-R1.1", // codigo real usa "/" no "-"
  "ds_ASD-2601-1-1 - ES.docx": "DS-5034-1", // la nota del doc EN confirma: "el nombre de archivo 'ASD-2601-1-1' no lo reflejaba"
};

// Los archivos de "Curso ES" no tienen codigo: matchean por titulo exacto del documento EN.
const CURSO_POR_TITULO = {
  "2. Series 2 Product Overview - ES.pptx": "Series 2 Product Overview",
  "3. Panel Operation - ES.pptx": "Panel Operation",
  "4. Panel Programming - ES.pptx": "Panel Programming",
  "4. Ejercicio - Programacion del panel.pdf": "Exercise - Panel Programming",
  "5. Module 5 - Configurator Installation - ES.pptx": "Module 5 - Configurator Installation",
  "6. Exercise 2 - Project Configuration Download - ES.pptx": "Exercise #2 - Project Configuration & Download",
  "6. Module 6 7 - Project Configuration - Upload - Download - ES.pptx": "Module 6 & 7 - Project Configuration, Upload/Download",
  "Module 10 - Logic Programming - ES.pptx": "Module 10 - Logic Programming",
  "Module 8 - Zone Mapping Exercise 3 - ES.pptx": "Module 8 - Zone Mapping & Exercise #3",
};

function listar(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listar(full));
    else out.push(full);
  }
  return out;
}

function normalizarCodigo(s) {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * En vez de recortar un "codigo" del nombre de archivo con un regex (fragil: un regex que
 * acepta un sufijo de 2-3 letras para casos como "-UM"/"-DS" tambien se come el arranque de
 * una palabra de la descripcion, ej. "-Add" de "Addressable" -- eso fue justo el bug que hizo
 * que DOC-12107M matcheara mal contra DOC-12107). En cambio: normalizar el nombre completo del
 * archivo y buscar, entre TODOS los codigo de documentos EN, cuales aparecen como substring
 * ahi -- y quedarse con el mas largo (mas especifico). Esto prefiere "DOC12107M" sobre
 * "DOC12107" solo porque es mas largo, sin necesidad de adivinar donde termina el codigo.
 */
function resolverMatch(enDocs, archivoAbsoluto) {
  const relativo = path.relative(CARPETA_BASE, archivoAbsoluto);
  const nombreArchivo = path.basename(archivoAbsoluto);

  if (relativo.includes("Curso ES")) {
    const titulo = CURSO_POR_TITULO[nombreArchivo];
    if (!titulo) return null;
    return enDocs.find((d) => d.titulo === titulo) ?? null;
  }

  const codigoOverride = OVERRIDES_MANUALES[nombreArchivo];
  if (codigoOverride) {
    return enDocs.find((d) => d.codigo === codigoOverride) ?? null;
  }

  const base = path.basename(archivoAbsoluto, path.extname(archivoAbsoluto));
  const normArchivo = normalizarCodigo(base);

  let mejores = [];
  let mejorLargo = 0;
  for (const d of enDocs) {
    if (!d.codigo) continue;
    const normCodigo = normalizarCodigo(d.codigo);
    if (!normCodigo || !normArchivo.includes(normCodigo)) continue;
    if (normCodigo.length > mejorLargo) {
      mejorLargo = normCodigo.length;
      mejores = [d];
    } else if (normCodigo.length === mejorLargo) {
      mejores.push(d);
    }
  }

  if (mejores.length <= 1) return mejores[0] ?? null;

  // Empate en longitud de codigo (ej. dos revisiones del mismo manual comparten el mismo
  // codigo): preferir la que NO este marcada como revision anterior.
  const vigentes = mejores.filter((d) => !/revision anterior/i.test(d.titulo));
  if (vigentes.length === 1) return vigentes[0];

  // Sigue ambiguo de verdad: devolver null para que quede como SIN MATCH y se revise a mano,
  // en vez de adivinar cual de los empatados es.
  return null;
}

const CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

async function subirTraduccion(db, original, archivoAbsoluto) {
  const nombreArchivo = path.basename(archivoAbsoluto);

  const yaExiste = db.documentos.some((d) => d.traduccionDeId === original.id && d.archivoNombre === nombreArchivo);
  if (yaExiste) {
    console.log(`  [saltado, ya existe] ${nombreArchivo}`);
    return "saltado";
  }

  const productoIds = db.documentoProductos.filter((dp) => dp.documentoId === original.id).map((dp) => dp.productoId);

  const formData = new FormData();
  formData.set("marcaId", original.marcaId);
  formData.set("tipo", original.tipo);
  formData.set("titulo", original.titulo);
  formData.set("codigo", original.codigo ?? "");
  formData.set("idioma", "ES");
  formData.set("confianza", "CONFIRMADO");
  formData.set("traduccionDeId", original.id);
  formData.set("estadoTraduccion", "BORRADOR");
  formData.set("notas", "Traduccion cargada masivamente desde la carpeta local de traducciones.");
  for (const productoId of productoIds) formData.append("productos", productoId);

  const buffer = fs.readFileSync(archivoAbsoluto);
  const contentType = CONTENT_TYPES[path.extname(archivoAbsoluto).toLowerCase()] ?? "application/octet-stream";
  const blob = new Blob([buffer], { type: contentType });
  formData.set("file", blob, nombreArchivo);

  const res = await fetch(`${SERVIDOR}/api/documentos`, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`  [ERROR] ${nombreArchivo}: ${data.error ?? res.status}`);
    return "error";
  }
  console.log(`  [ok] ${nombreArchivo} -> ${original.titulo} (${original.codigo ?? "sin codigo"})`);
  return "ok";
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const marca = db.marcas.find((m) => m.slug === "maple-armor");
  if (!marca) throw new Error("No se encontro la marca maple-armor");
  const enDocs = db.documentos.filter((d) => d.marcaId === marca.id && d.idioma === "EN");

  const archivos = listar(CARPETA_BASE);
  console.log(`Archivos encontrados: ${archivos.length}${dryRun ? " (--dry-run: solo muestra el matching, no sube nada)" : ""}`);

  if (dryRun) {
    let conMatch = 0;
    let sinMatch = 0;
    for (const archivo of archivos) {
      const match = resolverMatch(enDocs, archivo);
      const rel = path.relative(CARPETA_BASE, archivo);
      if (match) {
        console.log(`  [match] ${rel} -> ${match.titulo} | ${match.codigo ?? "sin codigo"} | ${match.id}`);
        conMatch++;
      } else {
        console.log(`  [SIN MATCH] ${rel}`);
        sinMatch++;
      }
    }
    console.log(`\nTotal: ${archivos.length} | con match: ${conMatch} | sin match: ${sinMatch}`);
    return;
  }

  let ok = 0;
  let saltados = 0;
  let sinMatch = 0;
  let errores = 0;

  for (const archivo of archivos) {
    const match = resolverMatch(enDocs, archivo);
    if (!match) {
      console.log(`  [SIN MATCH] ${path.relative(CARPETA_BASE, archivo)}`);
      sinMatch++;
      continue;
    }
    // Releer la db en cada iteracion para que la comprobacion "yaExiste" vea lo recien subido.
    const dbActual = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const resultado = await subirTraduccion(dbActual, match, archivo);
    if (resultado === "ok") ok++;
    else if (resultado === "saltado") saltados++;
    else errores++;
  }

  console.log(`\nListo. ok=${ok} saltados=${saltados} sinMatch=${sinMatch} errores=${errores} (total=${archivos.length})`);
}

main().catch((error) => {
  console.error("Fallo la importacion:", error);
  process.exit(1);
});
