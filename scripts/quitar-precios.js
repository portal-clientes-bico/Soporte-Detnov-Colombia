// Corrida unica: quita los valores de precio de los productos y deja solo el campo
// precioAsignado (true/false). Un producto queda con precioAsignado = true si tenia alguna
// especificacion de precio (grupo COMERCIAL cuyo nombre contiene "precio"). Tambien quita el
// monto de ejemplo que citaba el hallazgo sobre la moneda de la lista de precios.
//
// Antes de escribir guarda un respaldo completo de la base en data/ (carpeta que no va a git).
// Seguro de re-ejecutar: si ya no quedan precios, no cambia nada.
//
// Uso:
//   node scripts/quitar-precios.js [--dry-run]                         (data/db.json local)
//   node --env-file=.env.produccion.local scripts/quitar-precios.js --nube [--dry-run]
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const DRY_RUN = process.argv.includes("--dry-run");
const NUBE = process.argv.includes("--nube");

const ES_PRECIO = (e) => e.grupo === "COMERCIAL" && /precio/i.test(e.nombre);
const HALLAZGO_VIEJO = "Los valores (ej. USD 558.39 para el panel FW2105) son consistentes";
const HALLAZGO_NUEVO = "Los valores son consistentes";

function quitarPrecios(db) {
  let conPrecio = 0;
  let especificacionesQuitadas = 0;
  for (const p of db.productos) {
    const precios = (p.especificaciones ?? []).filter(ES_PRECIO);
    const tenia = precios.length > 0 || p.precioAsignado === true;
    if (precios.length > 0) {
      p.especificaciones = p.especificaciones.filter((e) => !ES_PRECIO(e));
      especificacionesQuitadas += precios.length;
    }
    p.precioAsignado = tenia;
    if (tenia) conPrecio++;
  }
  let hallazgos = 0;
  for (const h of db.hallazgos) {
    if (h.contenido.includes(HALLAZGO_VIEJO)) {
      h.contenido = h.contenido.replace(HALLAZGO_VIEJO, HALLAZGO_NUEVO);
      hallazgos++;
    }
  }
  return { productos: db.productos.length, conPrecio, especificacionesQuitadas, hallazgos };
}

function respaldo(db, origen) {
  const archivo = path.join(DATA_DIR, `respaldo-${origen}-antes-de-quitar-precios-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(archivo, JSON.stringify(db, null, 2), "utf8");
  return archivo;
}

async function local() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const copia = JSON.parse(JSON.stringify(db));
  const r = quitarPrecios(db);
  console.log("Local:", r);
  if (DRY_RUN) return console.log("Simulacion: no se escribio nada.");
  console.log("Respaldo:", respaldo(copia, "local"));
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DB_PATH);
  console.log("Listo: data/db.json actualizado.");
}

async function nube() {
  if (!process.env.POSTGRES_URL) throw new Error("Falta POSTGRES_URL (usa --env-file=.env.produccion.local).");
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const cliente = await pool.connect();
  try {
    await cliente.query("begin");
    // Mismo lock de fila que mutarDb (src/lib/db.ts).
    const { rows } = await cliente.query("select datos from soporte_db where id = 1 for update");
    const db = rows[0].datos;
    const copia = JSON.parse(JSON.stringify(db));
    const r = quitarPrecios(db);
    console.log("Nube:", r);
    if (DRY_RUN) {
      await cliente.query("rollback");
      return console.log("Simulacion: no se escribio nada.");
    }
    console.log("Respaldo:", respaldo(copia, "nube"));
    await cliente.query("update soporte_db set datos = $1, actualizado_en = now() where id = 1", [JSON.stringify(db)]);
    await cliente.query("commit");
    console.log("Listo: base de la nube actualizada.");
  } catch (error) {
    await cliente.query("rollback").catch(() => {});
    throw error;
  } finally {
    cliente.release();
    await pool.end();
  }
}

(NUBE ? nube() : local()).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
