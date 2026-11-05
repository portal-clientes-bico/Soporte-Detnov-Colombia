# Base de conocimiento técnico Detnov Colombia (herramienta local)

Base de conocimiento y biblioteca de documentacion tecnica, pensada para correr **solo en tu
computador**. No depende de ningun servidor externo, base de datos en la nube ni cuenta de
staff: abres una URL en `localhost` y trabajas.

## Como se guardan los datos

- Todo vive en un unico archivo: **`data/db.json`**. Ahi estan marcas, referencias, documentos,
  fuentes, compatibilidades y hallazgos.
- Los archivos que subas (PDF, Excel, imagenes...) se guardan en **`data/uploads/<marca>/`**.
- No hay nada que instalar aparte de las dependencias de Node: no se usa Postgres, SQLite ni
  ningun servicio en la nube. Para respaldar todo, copia la carpeta `data/`.

## Primer uso

```bash
npm install
npm run dev
```

Abre [http://localhost:3100](http://localhost:3100) (el puerto esta fijado en `package.json`
para no chocar con otros proyectos que uses en el 3000).

1. Crea la marca **"Maple Armor"** desde la pantalla de inicio.
2. Entra a la marca y pulsa **"Cargar / actualizar datos iniciales"**. Esto carga toda la
   investigacion ya compilada: fuentes, referencias, documentos (muchos con enlace de
   descarga real y verificado) y hallazgos. Es seguro repetirlo mas adelante: actualiza lo que
   ya exista sin borrar lo que hayas agregado a mano.

## Que hay cargado de partida

Los datos vienen de dos rondas de investigacion directa (navegando los sitios reales, no solo el
documento maestro original):

- **Maple Armor Canada**: 25 datasheets con enlace de descarga real.
- **Maple Armor China — catalogo "Products"**: mas de 35 datasheets con enlace de descarga real
  y sin restriccion (distinto del "Resource Center", que exige un codigo de canje).
- **UL Product iQ**: expedientes S35910, S35947, S35539 y S35854.
- **Jade Bird**: sitio corporativo (jbufa.com) y su repositorio interno (pendiente de recuperar).
- Correcciones documentadas donde la investigacion inicial se equivoco (ver la pestana
  Hallazgos, tipo "Discrepancia" y "Hallazgo").

## Estructura del proyecto

```
src/lib/db.ts            Almacen de datos (lee/escribe data/db.json)
src/lib/queries.ts        Lecturas (equivalente a "queries" de una base de datos)
src/lib/schemas.ts        Validacion (zod) de los formularios
src/lib/storage.ts         Guardar/borrar archivos subidos en data/uploads/
src/lib/semilla.ts         Motor que aplica los datos iniciales (idempotente)
src/lib/semillas/          Los datos iniciales de cada marca, escritos en codigo
src/app/(interno)/...      Herramienta interna: marcas, usuarios y src/app/(interno)/[slug]/... (Resumen,
                           Preguntas, Instructivos, Productos, Documentos, Fuentes, Hallazgos...)
src/app/(publico)/ayuda/   Sitio publico de ayuda para clientes (sin clave)
src/app/api/...            Rutas API que usan las paginas
```

## Agregar otra marca

Desde la pantalla de inicio, "Nueva marca". Si quieres precargarle datos iniciales como los de
Maple Armor, crea un archivo en `src/lib/semillas/` con la misma forma que
`src/lib/semillas/maple-armor.ts` y agregalo al mapa `SEMILLAS` en
`src/app/api/marcas/[slug]/semilla/route.ts`.

## Instructivos y Diagnostico de Fallas

Pestana de cada marca para registrar preguntas frecuentes de los clientes con su respuesta paso a
paso (bloques de texto, imagenes subidas y videos de YouTube embebidos). Cada registro esta
**En elaboracion** o **Publicado**. Solo los publicados se ven en el sitio publico de ayuda,
`/ayuda/<marca>` (ej. `/ayuda/maple-armor`), que no pide clave ni muestra los enlaces internos.

## Garantias

Pestana **Garantias** de cada marca para trasladar al fabricante las solicitudes de garantia.
Cada ticket lleva un consecutivo (`GAR-AAAA-0001`), prioridad, responsable, datos del cliente
(NIT, contacto, obra, factura y fechas de compra/instalacion) y las unidades reclamadas con
referencia, serial, cantidad, lote y falla de cada una. Al pegar varios seriales en una casilla
se crea una fila por serial. La condicion de falla, el diagnostico y la resolucion son texto
enriquecido: se pegan capturas/fotos y enlaces a videos.

- **Flujo**: Borrador → Enviada al fabricante → En revision → (Informacion solicitada) →
  Aprobada / Rechazada → Cerrada. Cada cambio de estado y cada comentario queda en la
  **bitacora** con fecha y autor.
- Datos del fabricante: numero de RMA y guia de envio; tipo de resolucion (reemplazo,
  reparacion, nota credito, sin falla, fuera de garantia) y notas.
- **Formato para el fabricante (PDF)**: ficha imprimible del ticket (sin la bitacora interna),
  con imagenes y enlaces activos, para "Guardar como PDF" y enviarla.
- Filtros por estado, prioridad, producto y responsable, y busqueda por numero, cliente,
  serial o RMA. Se muestran los dias abierta y los dias esperando al fabricante.
- **Consolidado**: la pagina central resume las garantias de todas las marcas por estado y
  lista las abiertas mas antiguas; `/garantias` tiene el consolidado completo con filtros.

## Notas

- **Acceso**: toda la herramienta interna (paginas y rutas `/api/*`) exige iniciar sesion en
  `/login`. La sesion es una cookie httpOnly firmada con `SESSION_SECRET` (ver `.env.example`;
  obligatoria en Vercel, en local se genera sola en `data/.session-secret`) y dura 7 dias. Solo
  quedan publicos `/ayuda/**`, la descarga de archivos (`GET /api/archivos/**`, por donde se
  sirven las imagenes de los instructivos) y el propio login. Si no existe ningun usuario con
  contrasena, `/login` ofrece crear la primera cuenta; despues, los usuarios nuevos solo se
  crean con una sesion iniciada. La regla vive en `src/proxy.ts`.
- El limite de tamano por archivo subido es 50 MB (`ARCHIVO_MAX_BYTES` en `src/lib/tipos.ts`).
