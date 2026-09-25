# Soporte Tecnico Maple Armor (herramienta local)

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
src/app/[slug]/...         Paginas: Resumen, Referencias, Documentos, Fuentes, Hallazgos
src/app/api/...            Rutas API que usan las paginas
```

## Agregar otra marca

Desde la pantalla de inicio, "Nueva marca". Si quieres precargarle datos iniciales como los de
Maple Armor, crea un archivo en `src/lib/semillas/` con la misma forma que
`src/lib/semillas/maple-armor.ts` y agregalo al mapa `SEMILLAS` en
`src/app/api/marcas/[slug]/semilla/route.ts`.

## Notas

- Esta herramienta es de uso personal/local: no tiene login ni control de acceso. No la
  expongas en una red compartida sin agregar autenticacion.
- El limite de tamano por archivo subido es 50 MB (`ARCHIVO_MAX_BYTES` en `src/lib/tipos.ts`).
