// Copia los instructivos de data/db.json (local) a la base de Postgres de la nube, AGREGANDO
// a lo que ya existe alla (a diferencia de migrar-a-nube.js, que reemplaza la base completa).
//
// - Solo copia instructivos de la marca indicada (--marca=, por defecto maple-armor) y, si se
//   pasa --estado=PUBLICADO, solo los de ese estado.
// - marcaId y productoIds se re-mapean por slug de marca y referencia de producto, por si los
//   ids de la nube no coinciden con los locales. Un producto que no exista en la nube se omite.
// - Seguro de re-ejecutar: se salta cualquier instructivo cuyo id o titulo ya exista en la nube.
// - No sube imagenes: si un instructivo tiene bloques IMAGEN, se avisa y se salta (sus
//   archivos viven en data/uploads y habria que subirlos a Vercel Blob primero).
//
// Requiere POSTGRES_URL en el entorno (ej. en .env.local).
// Uso: node --env-file=.env.local scripts/subir-instructivos-a-nube.js [--dry-run] [--marca=maple-armor] [--estado=PUBLICADO]
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const arg = (nombre) => process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split("=")[1];
const DRY_RUN = process.argv.includes("--dry-run");
const MARCA = arg("marca") ?? "maple-armor";
const ESTADO = arg("estado");

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error("Falta POSTGRES_URL (agregalo a .env.local y usa node --env-file=.env.local ...).");
    process.exit(1);
  }

  const local = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const marcaLocal = local.marcas.find((m) => m.slug === MARCA);
  if (!marcaLocal) throw new Error(`No existe la marca "${MARCA}" en data/db.json`);
  const refLocal = new Map(local.productos.map((p) => [p.id, p.referencia]));
  const candidatos = (local.instructivos ?? []).filter((i) => i.marcaId === marcaLocal.id && (!ESTADO || i.estado === ESTADO));

  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const cliente = await pool.connect();
  try {
    await cliente.query("begin");
    // Mismo lock de fila que mutarDb (src/lib/db.ts): nadie mas escribe mientras tanto.
    const { rows } = await cliente.query("select datos from soporte_db where id = 1 for update");
    if (rows.length === 0) throw new Error("La base de la nube esta vacia (no hay fila soporte_db id=1).");
    const nube = rows[0].datos;
    nube.instructivos = nube.instructivos ?? [];

    const marcaNube = nube.marcas.find((m) => m.slug === MARCA);
    if (!marcaNube) throw new Error(`No existe la marca "${MARCA}" en la nube`);
    const productoNube = new Map(nube.productos.filter((p) => p.marcaId === marcaNube.id).map((p) => [p.referencia, p.id]));
    const idsNube = new Set(nube.instructivos.map((i) => i.id));
    const titulosNube = new Set(nube.instructivos.filter((i) => i.marcaId === marcaNube.id).map((i) => i.titulo));

    let agregados = 0;
    for (const i of candidatos) {
      if (idsNube.has(i.id) || titulosNube.has(i.titulo)) {
        console.log(`  ya existe, se salta: ${i.titulo}`);
        continue;
      }
      if (i.bloques.some((b) => b.tipo === "IMAGEN")) {
        console.log(`  tiene imagenes locales, se salta: ${i.titulo}`);
        continue;
      }
      const productoIds = [];
      for (const pid of i.productoIds) {
        const ref = refLocal.get(pid);
        const idNube = ref && productoNube.get(ref);
        if (idNube) productoIds.push(idNube);
        else console.log(`  aviso: producto ${ref ?? pid} no existe en la nube (${i.titulo})`);
      }
      nube.instructivos.push({ ...i, marcaId: marcaNube.id, productoIds });
      agregados++;
      console.log(`  + [${i.estado}] ${i.titulo}`);
    }

    if (DRY_RUN || agregados === 0) {
      await cliente.query("rollback");
      console.log(DRY_RUN ? `Simulacion: se agregarian ${agregados} instructivos.` : "Nada que agregar.");
      return;
    }
    await cliente.query("update soporte_db set datos = $1, actualizado_en = now() where id = 1", [JSON.stringify(nube)]);
    await cliente.query("commit");
    console.log(`Listo: ${agregados} instructivos agregados a la nube (total alla: ${nube.instructivos.length}).`);
  } catch (error) {
    await cliente.query("rollback").catch(() => {});
    throw error;
  } finally {
    cliente.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
