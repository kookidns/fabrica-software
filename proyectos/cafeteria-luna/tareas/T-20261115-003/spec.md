# T-20261115-003 · Sección Horario y ubicación con mapa y "Cómo llegar"
Tipo: tarea      Toca interfaz: sí      Texto visible para el usuario: sí

Cubre de `brain/spec.md`: CA-03.1, CA-03.2, CA-03.3 y CA-03.4. Los datos (horario, dirección,
coordenadas) siguen siendo los **ficticios** de `business.ts` (D-00): que coincidan con los reales es un
hueco abierto y no se resuelve aquí.

## Contexto (qué dice el brain que importa aquí)
- **D-05**: integraciones sin claves. Mapa = `<iframe>` de **OpenStreetMap** (`export/embed.html` con
  `bbox` y `marker`) con `loading="lazy"`; "Cómo llegar" =
  `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`. Descartados explícitamente: iframe de
  Google Maps (cookies de terceros), URI `geo:`. Las coordenadas son datos del negocio y viven en
  `business.ts` (`coordinates: { lat, lng }`; hoy `19.4326, -99.1332`).
- **D-00**: horario, dirección y coordenadas viven **solo** en `src/data/business.ts`. `location.ts` y
  `maps.ts` los reciben por parámetro; ninguno importa `business` ni copia valores. `business.test.ts`
  ya garantiza: 7 días lunes→domingo en orden, ≥ 1 cerrado sin `open`/`close`, horas `HH:MM` 24 h con
  `open < close`, dirección no vacía, coordenadas finitas y en rango.
- **D-04**: `index.html` ya tiene `section#horario` con `<h2 id="horario-titulo">Horario y
  ubicación</h2>`; `main.ts` monta el contenido **tras ese `<h2>`** con una función `datos → HTMLElement`
  que usa solo `createElement`/`textContent`/`setAttribute` (nunca `innerHTML`). **No hace falta tocar
  `index.html`**: el aviso del pie ya dice que horario y dirección son de ejemplo.
- **D-09**: `mount()` busca todos los contenedores y **construye todo lo que puede fallar antes de
  pintar** (o se pinta la página entera o nada); los grupos internos son `<div>` con `<h3>`, sin
  `<section>` extra; los estilos de cada sección nueva van en su propio archivo importado en `main.ts`
  después de los anteriores; rejilla de 2 columnas desde 768 px con `repeat(2, minmax(0, 1fr))` y
  `align-items: start`. `renderMenu` importa su helper puro (`formatPrice`); aquí `renderLocation`
  importa los helpers puros de `maps.ts` del mismo modo.
- **D-08**: `main.css` mide 317 líneas (guía ~200) y su división es de la tarea 006: **no se toca
  `main.css`**; todo lo nuevo, incluida la variante de botón de contorno, va en `src/styles/location.css`.
- **arquitectura.md → Reglas**: enlaces externos con `target="_blank"` + `rel="noopener noreferrer"` y
  nombre accesible que indique el propósito (mismo patrón que el botón de WhatsApp en `reserve.ts`:
  `aria-label` = texto visible + " (se abre en una pestaña nueva)", WCAG 2.5.3). Sin cookies propias ni
  analítica. Mapa diferido para Lighthouse móvil ≥ 90.
- **arquitectura.md → Zonas sensibles**: "Cualquier recurso de terceros nuevo (iframes, scripts, fuentes
  externas)" es zona sensible por privacidad y rendimiento. Esta tarea añade el **primer recurso de
  terceros** del sitio (el iframe de OSM).
- **diseno.md**: botón `secondary` (contorno) = fondo transparente, texto y borde `--color-primary`,
  hover fondo `--color-surface`, para "Cómo llegar". Tarjeta (`surface-raised`, borde `border`,
  `radius-md`, `space-5`, `shadow-sm`) para el bloque de horario. `--color-error` = "cerrado" (nunca
  como único indicador: siempre con el texto "Cerrado"). Desde 768 px, 2 columnas (horario | mapa).
  Mapa con `width: 100%`, relación **4:3 en móvil y 16:9 desde 768 px**, `loading="lazy"` y `title`
  accesible. Sin scroll horizontal a 375 px (`min-width: 0`, `overflow-wrap: anywhere`).
- **Contrastes** (los nuevos, calculados con la fórmula de `diseno.md`): "Cerrado" en `error` #B3261E
  sobre `surface-raised` #FFFFFF = **6.54:1** (AA). Botón de contorno: texto `primary` sobre `bg`
  7.70:1 y, en hover, sobre `surface` 6.95:1 (filas 9 y 10). `#horario` es la 3.ª sección (impar), así
  que su fondo es `--color-bg`.
- **Estado del código (main = worktree)**: no existen `src/lib/maps.ts`, `src/sections/location.ts` ni
  `src/styles/location.css`. `main.ts` importa `tokens.css`, `main.css`, `menu.css` y monta portada,
  menú y Reservar. Existe `.btn` en `main.css` (48 px de alto, pill, foco global); no existe
  `.btn--secondary`.

## Decisiones de esta spec (a registrar en `decisiones.md` al cerrar, si el aprobador las acepta)
1. **Construcción de URLs** (en `src/lib/maps.ts`, funciones puras sin DOM):
   - Cada coordenada se serializa con `toFixed(6)` (≈ 0,1 m de precisión): sin notación exponencial
     (`1e-7`) ni ruido de coma flotante (`19.427599999999998`).
   - `buildMapEmbedUrl(lat, lng)` →
     `https://www.openstreetmap.org/export/embed.html?bbox=<lng−d>,<lat−d>,<lng+d>,<lat+d>&layer=mapnik&marker=<lat>,<lng>`
     con `d = 0.005` grados (≈ 1 km de lado: nivel de calle). Orden del `bbox` de OSM:
     oeste, sur, este, norte (`minLng,minLat,maxLng,maxLat`); el `marker` va `lat,lng`.
   - `buildDirectionsUrl(lat, lng)` → `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
   - Se pueden construir con `URL`/`URLSearchParams` (que codifica la coma como `%2C`) o con plantilla;
     las pruebas **parsean la URL** y comparan los parámetros decodificados, no la cadena literal.
   - Coordenada no finita o fuera de rango (lat ∉ [−90, 90], lng ∉ [−180, 180]) → `throw new Error`
     (fallo visible, como `formatPrice`; `mount()` lo detecta antes de pintar, D-09).
2. **Atributos del iframe** (fijos, sin excepciones):
   - `title="Mapa con la ubicación de la cafetería"` (sin el nombre del negocio, que es dato de D-00).
   - `loading="lazy"`.
   - `referrerpolicy="strict-origin-when-cross-origin"`: OSM solo recibe el origen del sitio, nunca ruta
     ni query. No se usa `no-referrer` porque la política de uso de OpenStreetMap exige un Referer
     válido y quitarlo arriesga que el mapa no cargue; para una landing de una sola página el origen no
     revela nada adicional.
   - `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`: el mapa
     de OSM es Leaflet (necesita scripts); `allow-same-origin` es seguro aquí porque el iframe es de
     **otro origen** (openstreetmap.org), así que no puede tocar nuestra página ni salir del sandbox;
     `allow-popups*` permite que los enlaces de atribución/"ver mapa más grande" de OSM abran una
     pestaña normal. **Prohibidos**: `allow-top-navigation*` (el mapa no puede llevarse la página),
     `allow-forms`, `allow-modals`, `allow-downloads`, `allow-pointer-lock`.
   - **Sin** atributo `allow` (ni geolocalización ni nada), sin `allowfullscreen`, sin `srcdoc`, sin
     `frameborder` (obsoleto; el borde se quita con CSS).
   - Si en la comprobación manual el mapa no se pinta con ese `sandbox`, el constructor **no** amplía
     permisos ni quita el `sandbox` por su cuenta: lo anota en `build-rondaN.md` y la tarea vuelve a
     spec con `NECESITA_HUMANO`.
3. **Enlace "Cómo llegar"**: `<a class="btn btn--secondary">` con `href` = `buildDirectionsUrl`,
   `target="_blank"`, `rel="noopener noreferrer"` y
   `aria-label="Cómo llegar (se abre en una pestaña nueva)"`. Guardia como en `createReserveButton`:
   si el `href` no empieza por `https://www.google.com/maps/search/?` → `Error`; idem para el `src` del
   iframe con `https://www.openstreetmap.org/export/embed.html?` (bloquea `javascript:` y otros
   esquemas aunque alguien cambie `maps.ts`).
4. **Marcado del horario**: `<table>` sin `<thead>`, una fila por día con `<th scope="row">` (día) y
   `<td>` (horas), nombrada con `aria-labelledby` apuntando a su `<h3>` "Horario". Día abierto:
   `"<open> a <close>"` (p. ej. `08:00 a 20:00`, formato 24 h tal cual está en los datos; se lee bien en
   voz). Día cerrado: `Cerrado`, con clase propia para el color `--color-error`.
5. **Variante `.btn--secondary` en `src/styles/location.css`** (único uso hoy; no se agranda
   `main.css`, D-08). Cuando la tarea 006 divida `main.css`, puede moverse a un archivo de botones.
6. **Zonas sensibles**: se propone añadir `src/lib/maps.ts` y `src/sections/location.ts` a
   `brain/zonas-sensibles.txt` (recurso de terceros, según `arquitectura.md`). Esta spec **no** edita
   ese archivo; lo decide el humano al aprobar el cierre.

## Objetivo
Que la sección "Horario y ubicación" muestre el horario de los 7 días (con los cierres como "Cerrado"),
la dirección completa en `<address>`, un mapa de OpenStreetMap con marcador en las coordenadas de
`business.ts` (diferido, con `title`, `referrerpolicy` y `sandbox` restrictivos) y un botón "Cómo
llegar" que abre Google Maps en esas coordenadas en una pestaña nueva; en una columna a 375 px sin
scroll horizontal y en dos columnas (horario | ubicación) desde 768 px.

## Textos visibles (exactos)
| Dónde | Texto |
|---|---|
| `<h3>` del bloque de horario | `Horario` |
| `<th>` de cada fila | `day` de los datos (no se escribe a mano) |
| `<td>` de un día abierto | `` `${open} a ${close}` `` de los datos (hoy, p. ej., `08:00 a 20:00`) |
| `<td>` de un día cerrado | `Cerrado` |
| `<h3>` del bloque de ubicación | `Dirección` |
| `<address>` | `address` de los datos |
| `title` del iframe (lo anuncia el lector de pantalla) | `Mapa con la ubicación de la cafetería` |
| Enlace | `Cómo llegar` (visible) · `Cómo llegar (se abre en una pestaña nueva)` (`aria-label`) |

El `<h2>` `Horario y ubicación` ya existe en `index.html` y no cambia.

## Criterios de aceptación
### URLs de mapas (`src/lib/maps.ts`; pruebas en `src/lib/maps.test.ts`)
- **CA-1** — Dado `buildMapEmbedUrl(19.4326, -99.1332)`, cuando se parsea el resultado con `new URL()`,
  entonces: protocolo `https:`, host `www.openstreetmap.org`, ruta `/export/embed.html`; `layer` =
  `mapnik`; `marker` = `19.432600,-99.133200`; `bbox` = `-99.138200,19.427600,-99.128200,19.437600`
  (oeste, sur, este, norte con `d = 0.005`); y no hay más parámetros que `bbox`, `layer` y `marker`.
  El marcador queda dentro del `bbox` (CA-03.3).
- **CA-2** — Dado `buildDirectionsUrl(19.4326, -99.1332)`, cuando se parsea, entonces: protocolo
  `https:`, host `www.google.com`, ruta `/maps/search/`; `api` = `1`; `query` = `19.432600,-99.133200`;
  y no hay más parámetros (CA-03.4).
- **CA-3** — Dadas coordenadas con muchos decimales o diminutas (p. ej. `(0.0000001, -0.0000001)` y
  `(19.123456789, -99.987654321)`), cuando se construyen ambas URLs, entonces ninguna contiene `e` en
  los números (notación exponencial) ni espacios, y cada coordenada de `marker`, `bbox` y `query` cumple
  `/^-?\d+\.\d{6}$/` (p. ej. `19.123457,-99.987654`).
- **CA-4** — Dado `lat` `NaN`, `Infinity`, `91` o `-91`, o `lng` `NaN`, `181` o `-181`, cuando se llama a
  cualquiera de las dos funciones, entonces lanza `Error`. Los bordes `(90, 180)` y `(-90, -180)` son
  válidos.
- **CA-5** — Dado el código fuente de `maps.ts`, cuando una prueba lo lee, entonces contiene
  `https://www.openstreetmap.org/export/embed.html` y `https://www.google.com/maps/search/`, no importa
  `business`, no usa `document` ni `window`, y no contiene las coordenadas de `business.ts`
  (`19.4326`, `-99.1332`).

### Sección (`src/sections/location.ts`; pruebas en `src/sections/location.test.ts`)
Datos de prueba propios (no los de `business.ts`), p. ej. 7 días con **dos** cerrados (`Lunes` y
`Domingo`), una dirección y unas coordenadas distintas de las de `business.ts`.
- **CA-6** — Dada `renderLocation({ hours, address, coordinates })`, cuando se llama, entonces devuelve
  un elemento con exactamente dos `<h3>`, en este orden: `Horario` y `Dirección`; ningún `<h1>`, `<h2>`
  ni `<section>`.
- **CA-7** — Dado el mismo resultado, cuando se recorre la `<table>`, entonces tiene exactamente **7**
  filas, **en el orden de los datos**; cada fila tiene un `<th scope="row">` con el texto `day` y un
  `<td>`: `` `${open} a ${close}` `` si el día abre (p. ej. `08:00 a 20:00`) o exactamente `Cerrado` si
  `closed: true` (los dos días cerrados de prueba lo muestran; ninguno muestra horas). La tabla tiene
  `aria-labelledby` igual al `id` del `<h3>` `Horario` (CA-03.1).
- **CA-8** — Dado el mismo resultado, cuando se busca la dirección, entonces hay exactamente un
  `<address>` y su `textContent` es exactamente `address` (CA-03.2).
- **CA-9** — Dado el mismo resultado, cuando se busca el mapa, entonces hay exactamente un `<iframe>` y:
  `src` === `buildMapEmbedUrl(lat, lng)` de las coordenadas de prueba; `title` ===
  `Mapa con la ubicación de la cafetería`; `loading` === `lazy`; `referrerpolicy` ===
  `strict-origin-when-cross-origin`; el atributo `sandbox` (leído con `getAttribute` y separado por
  espacios) contiene **exactamente** `allow-scripts`, `allow-same-origin`, `allow-popups` y
  `allow-popups-to-escape-sandbox`, ni uno más; y no tiene los atributos `allow`, `allowfullscreen`,
  `srcdoc` ni `frameborder` (CA-03.3).
- **CA-10** — Dado el mismo resultado, cuando se busca el enlace, entonces hay exactamente un `<a>` con
  texto `Cómo llegar` y: `href` === `buildDirectionsUrl(lat, lng)`; `target` === `_blank`; `rel` ===
  `noopener noreferrer`; `aria-label` === `Cómo llegar (se abre en una pestaña nueva)` (empieza por el
  texto visible); clases `btn` y `btn--secondary`; y va **después** del iframe en el orden del documento
  (`compareDocumentPosition`) (CA-03.4).
- **CA-11** — Dada una dirección o un `day` que contienen `<img src=x onerror=alert(1)>`, cuando se pinta
  la sección, entonces el texto aparece literal en `<address>`/`<th>` y no se crea ningún `<img>`.
- **CA-12** — Dadas coordenadas inválidas (p. ej. `lat: NaN`), cuando se llama a `renderLocation`,
  entonces lanza `Error` (el error de `maps.ts` se propaga, no se pinta un mapa roto).
- **CA-13** — Dado el código fuente de `location.ts`, cuando una prueba lo lee, entonces no contiene
  `innerHTML`, `outerHTML`, `insertAdjacentHTML` ni `srcdoc`; importa de `../lib/maps`; no importa el
  valor `business` (solo tipos con `import type`); no contiene `business.address`, ninguno de los `day`
  de `business.hours` ni las coordenadas de `business.ts`; y no construye URLs propias (no contiene
  `api=1`, `bbox` ni `marker=`: eso vive solo en `maps.ts`).

### Montaje (`src/main.ts`; pruebas nuevas en `src/main.test.ts`)
- **CA-14** — Dado el `<body>` de `index.html` cargado en jsdom, cuando se ejecuta el montaje, entonces el
  elemento que sigue al `<h2>` de `#horario` es la sección de ubicación: su tabla tiene una fila por
  cada entrada de `business.hours` con el `day` y `Cerrado` u `open a close` (hoy `Lunes` → `Cerrado`,
  `Martes` → `08:00 a 20:00`); su `<address>` es `business.address`; el `src` del iframe es
  `buildMapEmbedUrl(business.coordinates.lat, business.coordinates.lng)` y el `href` de "Cómo llegar"
  es `buildDirectionsUrl(...)` con las mismas coordenadas. La página sigue con exactamente un `<h1>`,
  `#horario` con exactamente un `<h2>`, y exactamente un `<iframe>` en todo el documento.
- **CA-15** — Dado un documento sin `#horario h2`, cuando se ejecuta `mount(doc)`, entonces lanza un
  `Error` cuyo mensaje nombra ese selector **y** no se ha pintado nada (ni `<h1>`, ni
  `a.btn--whatsapp`, ni `<dl>` del menú, ni `<iframe>`).
- **CA-16** — Dado `business.coordinates.lat` = `NaN` (con `vi.doMock("./data/business")`, como en
  T-20261115-002 CA-10), cuando se importa `main.ts`, entonces la importación rechaza con `Error` y la
  página queda sin pintar (ni `<h1>`, ni botón de WhatsApp, ni `<dl>`, ni `<iframe>`): la sección se
  construye **antes** de pintar (D-09).
- **CA-17** — Dado `src/main.ts`, cuando se lee, entonces importa `./styles/location.css` **después** de
  `./styles/menu.css` (que a su vez va después de `./styles/main.css`).
- **CA-18** — Dadas las pruebas existentes (`src/main.test.ts`, `src/page.test.ts`,
  `src/project.test.ts`, `src/styles/styles.test.ts`, `src/sections/*.test.ts`,
  `src/data/business.test.ts`, `src/lib/*.test.ts`), cuando se ejecuta `npm run test`, entonces pasan
  **sin modificar** ninguna (solo se añaden casos y archivos nuevos).

### Estilos (`src/styles/location.css`; pruebas que leen el archivo sin comentarios)
- **CA-19** — Dado `src/styles/location.css`, cuando una prueba lo lee, entonces:
  (a) no contiene literales de color (`#` hexadecimal, `rgb(`, `rgba(`, `hsl(`, `hsla(`);
  (b) la regla del bloque de horario usa `var(--color-surface-raised)`, `var(--color-border)`,
  `var(--radius-md)`, `var(--shadow-sm)` y `var(--space-5)`;
  (c) la regla del texto "Cerrado" usa `var(--color-error)`;
  (d) la regla de `<address>` tiene `font-style: normal` y `overflow-wrap: anywhere` (o `break-word`);
  (e) el contenedor del mapa tiene `aspect-ratio: 4 / 3` y la regla del iframe tiene `width: 100%` y
  `border: 0` (o `none`);
  (f) `.btn--secondary` tiene `background: transparent` (o `background-color`), `color:
  var(--color-primary)` y borde con `var(--color-primary)`; `.btn--secondary:hover` usa
  `var(--color-surface)`;
  (g) hay un bloque `@media (min-width: 768px)` con: el contenedor de la sección en dos columnas
  (`repeat(2, minmax(0, 1fr))` o `1fr 1fr`) y `gap: var(--space-6)`, y el contenedor del mapa con
  `aspect-ratio: 16 / 9`.
- **CA-20** — Dado el diff de la tarea, cuando se revisa, entonces `src/styles/main.css`,
  `src/styles/menu.css` y `src/styles/tokens.css` no cambian.

### Comprobación manual (jsdom no pinta ni carga iframes; se deja en `build-rondaN.md`)
- **CA-21** — Dado `npm run dev` a **375×667** (DevTools), cuando se navega a `#horario`, entonces:
  (a) se ven, una debajo de otra, la tarjeta "Horario" (7 días, `Lunes` con `Cerrado` en rojo), la
  dirección completa, el mapa 4:3 con el **marcador** en las coordenadas de ejemplo y el botón de
  contorno "Cómo llegar"; (b) no hay scroll horizontal (`document.documentElement.scrollWidth <= 375`);
  (c) la consola no muestra errores de `sandbox` que impidan pintar el mapa (si los hay, ver decisión
  2: no se amplían permisos); (d) pulsar "Cómo llegar" abre Google Maps en una **pestaña nueva** en
  esas coordenadas, y el enlace de atribución de OSM dentro del mapa también abre pestaña nueva sin
  sustituir la página; (e) en la pestaña Network, con la página recién cargada arriba del todo, anotar
  si la petición a `openstreetmap.org` se difiere hasta acercarse a la sección (lazy); (f) con el
  teclado, el foco llega a "Cómo llegar" con el anillo visible y el Tab sale del mapa sin quedarse
  atrapado; (g) a **768 px** o más: horario a la izquierda y dirección + mapa 16:9 + botón a la
  derecha. El constructor anota cada punto (y capturas si puede) en `build-rondaN.md`.

### Puertas
- **CA-22** — Dada la carpeta de trabajo, cuando se ejecuta `node scripts/verificar.mjs
  proyectos/cafeteria-luna/.worktrees/T-20261115-003` desde la raíz de la fábrica, entonces `lint`,
  `typecheck`, `test` y `build` salen `ok` (ninguna `omitida`).

## Plan
1. **TDD — URLs**: `src/lib/maps.test.ts` (CA-1 a CA-5). Implementar `src/lib/maps.ts`:
   `buildMapEmbedUrl(lat: number, lng: number): string` y `buildDirectionsUrl(lat: number, lng:
   number): string`, con una guarda común de rango/finitud, una función interna de serialización
   (`toFixed(6)`) y la constante `d = 0.005`. Las pruebas parsean con `new URL()` y leen
   `searchParams.get(...)`.
2. **TDD — sección**: `src/sections/location.test.ts` (CA-6 a CA-13). Implementar
   `src/sections/location.ts`:
   `renderLocation(location: Pick<Business, "hours" | "address" | "coordinates">): HTMLElement`
   (tipos con `import type`). Estructura: `div.location` →
   `div.location__hours` (tarjeta: `h3.location__title#horario-semana-titulo` "Horario" +
   `table.hours[aria-labelledby]` → `tbody` → `tr` → `th[scope=row]` + `td`, con
   `span.hours__closed` "Cerrado" en los días cerrados) y
   `div.location__place` (`h3.location__title` "Dirección" + `address.location__address` +
   `div.location__map` → `iframe` + `a.btn.btn--secondary` "Cómo llegar"). Atributos del iframe y del
   enlace según "Decisiones de esta spec" 2 y 3, todos con `setAttribute`; guardias de prefijo antes de
   asignarlos.
3. **TDD — montaje**: añadir a `src/main.test.ts` casos nuevos (CA-14 a CA-17) sin tocar los existentes.
   En `src/main.ts`: `requireElement(doc, "#horario h2")` junto a los demás (antes de pintar);
   `const location = renderLocation({ hours: business.hours, address: business.address, coordinates:
   business.coordinates })` junto a la construcción del menú (antes de pintar); `horarioHeading.after(location)`
   en la fase de pintado; `import "./styles/location.css";` tras el de `menu.css`.
4. **TDD — estilos**: pruebas de CA-19 (en un `src/styles/location.test.ts` o un `describe` nuevo en
   `styles.test.ts`). Escribir `src/styles/location.css` mobile-first: `.location` en `display: grid`
   con `gap: var(--space-5)`; tarjeta de horario según `diseno.md`; `.location__title` con
   `--text-xl`, peso 600 y `margin-bottom: var(--space-4)` (igual que `.menu__title`); tabla
   `width: 100%`, `border-collapse: collapse`, `th` a la izquierda con peso normal/500, `td` alineado a
   la derecha con `white-space: nowrap`, filas con `padding-block: var(--space-3)` y separador
   decorativo en `--color-border`; `.hours__closed` en `--color-error` y peso 700; `address` con
   `font-style: normal`, `overflow-wrap: anywhere` y `margin-bottom: var(--space-4)`; `.location__map`
   con `aspect-ratio: 4 / 3`, `overflow: hidden`, `border-radius: var(--radius-md)` y borde decorativo;
   iframe `display: block; width: 100%; height: 100%; border: 0`; `.btn--secondary` (transparente,
   `color` y `border-color` `--color-primary`, hover fondo `--color-surface`, `width: 100%` en móvil,
   `margin-top: var(--space-4)`); `@media (min-width: 768px)` con `.location { grid-template-columns:
   repeat(2, minmax(0, 1fr)); gap: var(--space-6); align-items: start; }`, `.location__map {
   aspect-ratio: 16 / 9; }` y `.btn--secondary { width: auto; }`.
5. Comprobación manual CA-21 y anotarla en `build-rondaN.md`.
6. `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-003` hasta que las
   cuatro puertas pasen (CA-22).

Archivos que cambian: `src/main.ts`, `src/main.test.ts` (solo casos añadidos) y, si se eligen ahí las
pruebas de CSS, `src/styles/styles.test.ts` (solo un `describe` añadido). Nuevos: `src/lib/maps.ts`,
`src/lib/maps.test.ts`, `src/sections/location.ts`, `src/sections/location.test.ts`,
`src/styles/location.css` (y opcionalmente `src/styles/location.test.ts`). **No deben cambiar**:
`index.html`, `src/data/business.ts`, `src/lib/whatsapp.ts`, `src/lib/formatPrice.ts`,
`src/sections/hero.ts`, `src/sections/reserve.ts`, `src/sections/menu.ts`, `src/styles/main.css`,
`src/styles/menu.css`, `src/styles/tokens.css`, `package.json`, `package-lock.json`, `vite.config.ts`,
`tsconfig.json`, `eslint.config.js`.

## Fuera de alcance
- Horario, dirección y coordenadas **reales** (huecos abiertos, D-00). No se toca `business.ts`.
- Indicador "Abierto ahora / Cerrado ahora", resaltar el día de hoy, horarios partidos o festivos
  (hueco existente de festivos).
- Formato de 12 h (`8:00 a. m.`) o con `Intl.DateTimeFormat`: se muestran las horas tal cual en 24 h.
- Que tocar el propio mapa abra la app de mapas (CA-03.4 queda cubierto por "Cómo llegar"); enlace
  extra "Ver mapa más grande" fuera del iframe.
- Comprobar en un **teléfono real** que "Cómo llegar" abre la app de Google Maps/Apple Maps: queda con
  la comprobación de wa.me en la tarea 006.
- Ajustar el `bbox` cerca de los polos o del antimeridiano (no aplica a una cafetería en CDMX).
- Content-Security-Policy: no existe hoy; si se añade en el futuro deberá permitir
  `frame-src https://www.openstreetmap.org`.
- Fachada de "clic para cargar el mapa" (mejor privacidad/rendimiento): solo si Lighthouse móvil baja
  de 90 en la tarea 006.
- División de `main.css`, luna decorativa de los `<h2>` y auditoría Lighthouse/44 px de toda la página
  (tarea 006). Carga de Google Fonts (hueco abierto). Dependencias nuevas (no hacen falta).

## Riesgos / zonas sensibles que toca
- **Riesgo ALTO**: modifica `src/main.ts` (`zonas-sensibles.txt`) y añade el **primer recurso de
  terceros** (iframe de openstreetmap.org), que `arquitectura.md` declara zona sensible. Requiere
  **aprobación humana** en el cierre. Nota: `zonas-sensibles.txt` no lista `maps.ts` ni `location.ts`
  (ver decisión 6); el riesgo ALTO ya lo dispara `main.ts`.
- **Privacidad**: al cargar el iframe, el navegador del visitante contacta con openstreetmap.org (IP,
  user agent, origen del sitio por el `referrerpolicy`). Es lo aceptado en D-05 frente a Google Maps;
  `loading="lazy"` evita la petición a quien no baja hasta la sección. "Cómo llegar" solo lleva a
  Google cuando el usuario pulsa.
- **Seguridad del iframe**: el `sandbox` impide que el mapa navegue la página principal, envíe
  formularios o abra diálogos; `allow-same-origin` solo es peligroso junto a `allow-scripts` cuando el
  iframe es del **mismo** origen que la página, y aquí no lo es. Sin atributo `allow`, no puede pedir
  geolocalización ni cámara. Guardias de prefijo en `src`/`href` (CA-9, CA-10) y nada de `innerHTML`
  (CA-11, CA-13).
- **El mapa puede no cargar** por el `sandbox` o el `referrerpolicy` (no se ve en jsdom): por eso CA-21
  lo comprueba a mano y la decisión 2 prohíbe ampliar permisos sin humano.
- **Datos engañosos**: un orden de `bbox` invertido o `lat`/`lng` cruzados ponen el marcador en otro
  sitio (p. ej. en el océano) sin que falle nada visible; CA-1 y CA-2 fijan el orden exacto y CA-14
  comprueba que las coordenadas vienen de `business.ts`.
- **Orden de montaje**: `#horario h2` y `renderLocation` deben resolverse **antes** de pintar, o un fallo
  dejaría la portada y el menú pintados y el resto vacío (CA-15, CA-16).
- **Rendimiento**: el iframe de OSM carga Leaflet y teselas; `loading="lazy"` y la relación de aspecto
  fija (sin salto de maquetación) lo mitigan. Lighthouse se mide en la tarea 006.
- **Layout a 375 px**: dirección larga o tabla sin `min-width: 0` en la rejilla pueden desbordar; el
  iframe debe tener `width: 100%` (CA-19, CA-21).
- **Encabezados**: los `<h3>` van dentro de `#horario` bajo su `<h2>`; no añadir `<h2>`, `<h1>` ni
  `<section>` (CA-6, CA-14).
- **Pruebas**: jsdom no carga iframes ni hace red (las pruebas no tocan openstreetmap.org); leer
  `sandbox`/`referrerpolicy` con `getAttribute`, no con las propiedades DOM (`iframe.sandbox`,
  `iframe.referrerPolicy`), cuyo soporte en jsdom es incompleto.
