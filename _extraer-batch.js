// Toma el archivo de salida grande que guarda la herramienta de navegador (formato
// [{type:"text", text: "..."}]) cuando el resultado de javascript_tool excede el limite
// en linea, y lo desenreda hasta llegar al array real [{url, base64}, ...], que escribe en
// _tmp_batch.json listo para _guardar-batch.js.
const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Uso: node _extraer-batch.js <ruta-al-archivo-de-salida>");
  process.exit(1);
}

let text = fs.readFileSync(inputPath, "utf8");

// Nivel 1: el archivo completo es JSON: [{type, text}]
let value = JSON.parse(text);
if (Array.isArray(value) && value[0] && typeof value[0].text === "string") {
  value = value[0].text;
}

// A partir de aqui puede haber una o mas capas de JSON.stringify anidado, mas un
// texto final de "(captured at origin ...)" pegado por el navegador.
for (let i = 0; i < 4 && typeof value === "string"; i++) {
  let candidate = value;
  const idx = candidate.indexOf("\n(captured at origin");
  if (idx !== -1) candidate = candidate.slice(0, idx);
  candidate = candidate.trim();
  try {
    value = JSON.parse(candidate);
  } catch {
    value = candidate;
    break;
  }
}

if (!Array.isArray(value)) {
  console.error("No se pudo desenredar a un array. Tipo final:", typeof value);
  process.exit(1);
}

const outPath = path.join(__dirname, "_tmp_batch.json");
fs.writeFileSync(outPath, JSON.stringify(value));
console.log(`OK: ${value.length} items -> ${outPath}`);
console.log(value.map((x) => `${x.url} (${x.base64 ? x.base64.length : "?"} chars base64)`).join("\n"));
