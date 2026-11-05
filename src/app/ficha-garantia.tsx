import type { getGarantia } from "@/lib/queries";
import { GARANTIA_ESTADOS, GARANTIA_RESOLUCIONES } from "@/lib/tipos";
import TextoEnriquecido from "./texto-enriquecido";

type GarantiaDetalle = NonNullable<Awaited<ReturnType<typeof getGarantia>>>;

function dia(d: string | null): string {
  if (!d) return "—";
  const [a, m, x] = d.split("-").map(Number);
  return new Date(a, m - 1, x).toLocaleDateString("es-CO", { dateStyle: "medium" });
}

export function fechaHora(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }) : "—";
}

function Dato({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm">{valor || "—"}</dd>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid-page rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 print:rounded-none print:border-x-0 print:border-b-0 print:px-0">
      <h2 className="mb-2 font-medium">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Ficha completa del ticket (solo lectura): la usan el detalle interno y el formato imprimible
 * para el fabricante. Las imagenes y enlaces del texto enriquecido se muestran tal cual.
 */
export default function FichaGarantia({ g, paraFabricante = false }: { g: GarantiaDetalle; paraFabricante?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Bloque titulo="Cliente">
        <dl className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
          <Dato label="Cliente" valor={g.clienteNombre} />
          <Dato label="NIT / identificación" valor={g.clienteNit} />
          <Dato label="Ciudad" valor={g.clienteCiudad} />
          <Dato label="Contacto" valor={g.clienteContacto} />
          <Dato label="Teléfono" valor={g.clienteTelefono} />
          <Dato label="Correo" valor={g.clienteEmail} />
          <Dato label="Obra / proyecto" valor={g.proyecto} />
          <Dato label="Factura de venta" valor={g.facturaVenta} />
          <Dato label="Compra / instalación" valor={`${dia(g.fechaCompra)} / ${dia(g.fechaInstalacion)}`} />
        </dl>
      </Bloque>

      <Bloque titulo={`Productos y seriales (${g.unidades} unidad${g.unidades === 1 ? "" : "es"})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-1 pr-3 font-medium">#</th>
                <th className="py-1 pr-3 font-medium">Referencia</th>
                <th className="py-1 pr-3 font-medium">Serial</th>
                <th className="py-1 pr-3 font-medium">Cant.</th>
                <th className="py-1 pr-3 font-medium">Lote / fecha fab.</th>
                <th className="py-1 font-medium">Falla de la unidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {g.items.map((i, k) => (
                <tr key={i.id} className="align-top">
                  <td className="py-1 pr-3 text-zinc-500">{k + 1}</td>
                  <td className="py-1 pr-3 font-medium">{i.referencia}</td>
                  <td className="py-1 pr-3 font-mono">{i.serial}</td>
                  <td className="py-1 pr-3">{i.cantidad}</td>
                  <td className="py-1 pr-3">{i.lote ?? "—"}</td>
                  <td className="py-1">{i.falla ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>

      <Bloque titulo="Condición de falla">
        <TextoEnriquecido texto={g.descripcionFalla} className="text-sm" />
      </Bloque>

      {g.diagnostico && (
        <Bloque titulo="Diagnóstico y pruebas realizadas">
          <TextoEnriquecido texto={g.diagnostico} className="text-sm" />
        </Bloque>
      )}

      {(!paraFabricante || g.rmaFabricante || g.guiaEnvio) && (
        <Bloque titulo="Fabricante">
          <dl className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
            <Dato label="RMA / caso del fabricante" valor={g.rmaFabricante} />
            <Dato label="Transportadora y guía" valor={g.guiaEnvio} />
            <Dato label="Enviada al fabricante" valor={fechaHora(g.enviadaEn)} />
          </dl>
        </Bloque>
      )}

      {!paraFabricante && (g.resolucion || g.resolucionNotas) && (
        <Bloque titulo="Resolución">
          <dl className="grid gap-3 sm:grid-cols-3">
            <Dato label="Tipo" valor={g.resolucion ? GARANTIA_RESOLUCIONES[g.resolucion] : null} />
            <Dato label="Estado" valor={GARANTIA_ESTADOS[g.estado]} />
            <Dato label="Resuelta" valor={fechaHora(g.resueltaEn)} />
          </dl>
          {g.resolucionNotas && <TextoEnriquecido texto={g.resolucionNotas} className="mt-2 text-sm" />}
        </Bloque>
      )}
    </div>
  );
}
