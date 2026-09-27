// Corrida unica: sube la base de datos local (data/db.json) a Postgres y los archivos locales
// (data/uploads, data/uploads-texto, data/uploads-embeddings) a Vercel Blob, preservando las
// mismas rutas relativas que ya usa el codigo (archivoPath / <documentoId>.json) -- para que
// nada mas del proyecto tenga que cambiar.
//
// Requiere POSTGRES_URL y BLOB_READ_WRITE_TOKEN en el entorno (ej. en .env.local, cargado con
// --env-file). Seguro de re-ejecutar: cada subida sobreescribe el mismo destino.
//
// Uso: node --env-file=.env.local scripts/migrar-a-nube.js
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { put } = require("@vercel/blob");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const TEXTO_DIR = path.join(DATA_DIR, "uploads-texto");
const EMBEDDINGS_DIR = path.join(DATA_DIR, "uploads-embeddings");

function listarArchivosRecursivo(dir) {
  if (!fs.existsSync(dir)) return [];
  const resultado = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const rutaCompleta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) resultado.push(...listarArchivosRecursivo(rutaCompleta));
    else resultado.push(rutaCompleta);
  }
  return resultado;
}

async function migrarDb() {
  if (!process.env.POSTGRES_URL) {
    console.log("POSTGRES_URL no definido: se omite la migracion de la base de datos.");
    return;
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  await pool.query(
    `create table if not exists soporte_db (id smallint primary key, datos jsonb not null, actualizado_en timestamptz not null default now())`,
  );
  await pool.query(
    `insert into soporte_db (id, datos, actualizado_en) values (1, $1, now())
     on conflict (id) do update set datos = $1, actualizado_en = now()`,
    [JSON.stringify(db)],
  );
  await pool.end();
  console.log(
    `Base de datos migrada: ${db.marcas.length} marca(s), ${db.productos.length} producto(s), ${db.documentos.length} documento(s), ${db.preguntas.length} pregunta(s), ${db.usuarios.length} usuario(s).`,
  );
}

async function migrarArchivos(dirLocal, prefijoBlob, contentType) {
  // @vercel/blob resuelve credenciales solo: BLOB_STORE_ID + VERCEL_OIDC_TOKEN (conexiones
  // nuevas, sin token estatico) o BLOB_READ_WRITE_TOKEN (conexiones con token clasico).
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("BLOB_STORE_ID/BLOB_READ_WRITE_TOKEN no definidos: se omite la migracion de archivos.");
    return;
  }
  const archivos = listarArchivosRecursivo(dirLocal);
  console.log(`${prefijoBlob}: ${archivos.length} archivo(s) a subir.`);
  let subidos = 0;
  for (const archivoLocal of archivos) {
    const relativo = path.relative(dirLocal, archivoLocal).split(path.sep).join("/");
    const buffer = fs.readFileSync(archivoLocal);
    const opciones = { access: "public", addRandomSuffix: false };
    if (contentType) opciones.contentType = contentType;
    await put(`${prefijoBlob}/${relativo}`, buffer, opciones);
    subidos++;
    if (subidos % 20 === 0) console.log(`  ...${subidos}/${archivos.length}`);
  }
  console.log(`${prefijoBlob}: listo (${subidos} archivo(s)).`);
}

async function main() {
  await migrarDb();
  await migrarArchivos(UPLOADS_DIR, "uploads");
  await migrarArchivos(TEXTO_DIR, "uploads-texto", "application/json");
  await migrarArchivos(EMBEDDINGS_DIR, "uploads-embeddings", "application/json");
  console.log("\nMigracion completa.");
}

main().catch((error) => {
  console.error("Fallo la migracion:", error);
  process.exit(1);
});
