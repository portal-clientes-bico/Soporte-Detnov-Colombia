/** Mientras se arma el reporte: la primera vez puede tardar porque traduce las preguntas que
 * aun no tienen traduccion al ingles o al chino. */
export default function Cargando() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center text-zinc-600">
      <p className="text-lg font-medium text-zinc-900">Preparando el reporte...</p>
      <p className="mt-2 text-sm">Si hay preguntas sin traducir al inglés o al chino, se traducen ahora. Puede tardar unos minutos la primera vez.</p>
    </div>
  );
}
