# T-20261115-003 · Build ronda 1 (constructor)

Rama `fabrica/T-20261115-003` · worktree `proyectos/cafeteria-luna/.worktrees/T-20261115-003`
Commit: **`1b9526a60e51a2fd0509c4c7664c05f792f386c6`** (`1b9526a`), sobre `966e8e0`. Worktree limpio tras el commit.

## Archivos cambiados
| Archivo | Cambio |
|---|---|
| `src/lib/maps.ts` | **Nuevo**. `buildMapEmbedUrl(lat, lng)` y `buildDirectionsUrl(lat, lng)`, puras, con guarda común de finitud/rango, `toFixed(6)` y `d = 0.005`. Construidas con `URLSearchParams` (la coma sale como `%2C`). |
| `src/lib/maps.test.ts` | **Nuevo**. CA-1 a CA-5 (28 pruebas). |
| `src/sections/location.ts` | **Nuevo**. `renderLocation({ hours, address, coordinates })` → `div.location` con tarjeta de horario (`<table>` + `th[scope=row]`/`td`, `span.hours__closed`) y bloque de ubicación (`<address>`, `div.location__map > iframe`, `a.btn.btn--secondary`). Guardias de prefijo antes de asignar `src`/`href`. Solo `createElement`/`textContent`/`setAttribute`. |
| `src/sections/location.test.ts` | **Nuevo**. CA-6 a CA-13 (20 pruebas). |
| `src/styles/location.css` | **Nuevo**. Mobile-first: tarjeta, tabla, "Cerrado", dirección, mapa 4:3 → 16:9, `.btn--secondary`, 2 columnas desde 768 px. Solo `var(--…)`. |
| `src/styles/location.test.ts` | **Nuevo**. CA-19 (11 pruebas). Va en archivo propio para no tocar `styles.test.ts`. |
| `src/main.ts` | `requireElement(doc, "#horario h2")` junto a los demás; `renderLocation(...)` se construye antes de pintar; `locationHeading.after(location)` en la fase de pintado; `import "./styles/location.css"` tras `menu.css`. |
| `src/main.test.ts` | Solo añadidos: una línea de import (`buildDirectionsUrl`, `buildMapEmbedUrl`) y 4 `describe` nuevos al final (CA-14 a CA-17). 86 inserciones, 0 borrados. |

No cambian: `index.html`, `business.ts`, `whatsapp.ts`, `formatPrice.ts`, `hero.ts`, `reserve.ts`, `menu.ts`, `main.css`, `menu.css`, `tokens.css`, `package*.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`.

## CA → prueba (rojo → verde)
Rojo comprobado antes de escribir el código de cada bloque; verde tras implementarlo.

| CA | Prueba(s) | Rojo | Verde |
|---|---|---|---|
| CA-1 | `src/lib/maps.test.ts` › "CA-1: buildMapEmbedUrl builds the OpenStreetMap embed URL" (host/ruta, `layer`/`marker`/`bbox` exactos, solo 3 parámetros, marcador dentro del `bbox`) | ✔ (módulo `./maps` inexistente: la suite no carga) | ✔ |
| CA-2 | `maps.test.ts` › "CA-2: buildDirectionsUrl builds the Google Maps search URL" | ✔ (ídem) | ✔ |
| CA-3 | `maps.test.ts` › "CA-3: coordinates are serialized with exactly six decimals" (`(1e-7, -1e-7)`, `(19.123456789, -99.987654321)`, redondeo a `19.123457,-99.987654`) | ✔ (ídem) | ✔ |
| CA-4 | `maps.test.ts` › "CA-4: invalid coordinates throw" (7 casos inválidos × 2 funciones + bordes `(90,180)`/`(-90,-180)` válidos) | ✔ (ídem) | ✔ |
| CA-5 | `maps.test.ts` › "CA-5: maps.ts source" (URLs base, sin `business`, sin coordenadas, sin `document`/`window`) | ✔ (ídem) | ✔ |
| CA-6 | `src/sections/location.test.ts` › "CA-6: renderLocation returns the Horario and Dirección blocks" | ✔ (módulo `./location` inexistente) | ✔ |
| CA-7 | `location.test.ts` › "CA-7: the hours table" (7 filas en orden, `th[scope=row]` + `td`, `Lunes`/`Domingo` = `Cerrado`, `aria-labelledby` = id del `<h3>`) | ✔ (ídem) | ✔ |
| CA-8 | `location.test.ts` › "CA-8: the address" | ✔ (ídem) | ✔ |
| CA-9 | `location.test.ts` › "CA-9: the OpenStreetMap iframe" (`src`, `title`, `loading`, `referrerpolicy` y `sandbox` vía `getAttribute`; exactamente 4 tokens; sin `allow`/`allowfullscreen`/`srcdoc`/`frameborder`) | ✔ (ídem) | ✔ |
| CA-10 | `location.test.ts` › "CA-10: the Cómo llegar link" (`href`, `target`, `rel`, `aria-label`, clases, después del iframe con `compareDocumentPosition`) | ✔ (ídem) | ✔ |
| CA-11 | `location.test.ts` › "CA-11: address and day names are painted as text" | ✔ (ídem) | ✔ |
| CA-12 | `location.test.ts` › "CA-12: invalid coordinates throw" (`lat: NaN`, `lng: 181`) | ✔ (ídem) | ✔ |
| CA-13 | `location.test.ts` › "CA-13: location.ts source" (sin APIs de HTML ni `srcdoc`; importa `../lib/maps`; de `data/business` solo `import type`; sin datos del negocio; sin `api=1`/`bbox`/`marker=`) | ✔ (ídem) | ✔ |
| CA-14 | `src/main.test.ts` › "T-20261115-003 CA-14: mounting fills #horario after its <h2>" | ✔ (fallo de aserción: no había nada tras el `<h2>`) | ✔ |
| CA-15 | `main.test.ts` › "T-20261115-003 CA-15: a missing #horario h2 fails before painting" | ✔ (no lanzaba) | ✔ |
| CA-16 | `main.test.ts` › "T-20261115-003 CA-16: invalid coordinates fail before painting" (`vi.doMock` con `lat: NaN`) | ✔ (la importación no rechazaba) | ✔ |
| CA-17 | `main.test.ts` › "T-20261115-003 CA-17: main.ts imports location.css after menu.css" | ✔ (sin import) | ✔ |
| CA-18 | Suite completa: las 101 pruebas previas pasan sin modificar ninguna (en `main.test.ts` solo se añadió un import y casos nuevos al final) | n/a | ✔ |
| CA-19 | `src/styles/location.test.ts` › "CA-19 (a)" … "CA-19 (g)" (11 pruebas) | ✔ 10/11 rojas contra un `location.css` vacío. (a) "sin literales de color" pasaba en vacío por ser negativa; la verifiqué inyectando temporalmente `.x { color: #fff; }` → roja, y lo retiré | ✔ |
| CA-20 | `git show --stat HEAD`: `main.css`, `menu.css` y `tokens.css` no aparecen en el diff | n/a | ✔ |
| CA-21 | Comprobación manual (ver abajo) | n/a | ✔ con observaciones |
| CA-22 | `node scripts/verificar.mjs proyectos\cafeteria-luna\.worktrees\T-20261115-003` | n/a | ✔ |

## Puertas (CA-22)
```
✔ lint       ok
✔ typecheck  ok
✔ test       ok   (13 archivos, 164 pruebas: 101 previas + 63 nuevas)
✔ build      ok   (dist/assets/index-*.css 8.31 kB, index-*.js 7.47 kB)
```
Nota: `npm ci` avisó de que el `postinstall` de `esbuild` quedó bloqueado por la política `allowScripts`; el build funciona igual (binario de plataforma ya presente). No se tocó nada al respecto.

## CA-21 · Comprobación manual
**Cómo se hizo**: `vite preview` del build (`npm run build` de las puertas) en `127.0.0.1:4317`, en dos navegadores:
1. El navegador integrado de la app de escritorio de Claude, a 375×667. El panel estaba oculto durante parte de la prueba, así que algunas capturas no se pudieron hacer ahí.
2. Chrome local en modo headless, controlado por CDP con un script en el scratchpad: viewport 375×667 móvil y después 768×1024; sesiones adjuntas también al iframe de OSM y a su worker para leer su consola.

Ambos se cerraron al terminar; el servidor de preview se paró y los perfiles temporales de Chrome se borraron.
Capturas en `tareas/T-20261115-003/capturas-ronda1/`.

| Punto | Resultado |
|---|---|
| (a) Contenido a 375 px | ✔ Una columna: tarjeta "Horario" (7 días; `Lunes` → **Cerrado** en rojo, `rgb(179, 38, 30)` = `--color-error`, peso 700), dirección completa, mapa y botón de contorno "Cómo llegar" (343×48 px, texto y borde `--color-primary`, fondo transparente). **El mapa se pinta dentro del iframe con el `sandbox` de la spec**: teselas de `tile.openstreetmap.org/15/…` cargadas y marcador verde sobre el Zócalo (19.4326, −99.1332). El iframe mide 341×255.25 px, es decir 4:3 (`a-375-horario.png`, `a-375-mapa.png`). |
| (b) Scroll horizontal | ✔ `document.documentElement.scrollWidth` = **375** (en los dos navegadores). |
| (c) Consola | ✔ Ningún error de `sandbox` ni del mapa, ni en la página, ni en el iframe, ni en el worker de OSM. Único error: `favicon.ico` 404 en la página principal, previo a esta tarea (el proyecto no tiene favicon). El navegador integrado no registró ningún mensaje de consola. **No hizo falta ampliar permisos.** |
| (d) Pestañas nuevas | ✔ Clic en "Cómo llegar": se abre una pestaña nueva con `https://www.google.com/maps/search/?api=1&query=19.432600%2C-99.133200` y la página sigue en `http://127.0.0.1:4317/`. Clic en un enlace de la barra de atribución del mapa (cayó en "Reportar un problema"): se abre una pestaña nueva con `https://www.openstreetmap.org/fixthemap?lat=19.43260&lon=-99.13320&zoom=15` y la página no se sustituye. No probé uno por uno los otros enlaces de la barra ("© Colaboradores de OpenStreetMap", "Hacer una donación", "Términos"); están en la misma barra y bajo el mismo `sandbox`. |
| (e) Carga diferida | ⚠ Los dos navegadores dan resultados distintos. **Navegador integrado**: con la página recién cargada arriba del todo (iframe a 2033 px del borde superior), ninguna petición a `openstreetmap.org`; aparece al bajar hasta el mapa. **Chrome headless**: `export/embed.html` se pide al cargar, con el iframe 1366 px por debajo del borde de la pantalla. Es el umbral de distancia de Chrome para `loading="lazy"` en iframes, que depende del tipo de conexión. Las teselas solo se piden al acercarse al mapa. Conclusión: `lazy` funciona, pero no garantiza que quien no baje nunca contacte con OSM. Es relevante para la fachada "clic para cargar" (fuera de alcance; tarea 006). |
| (f) Teclado | ✔ Orden de Tab desde arriba: saltar al contenido → marca → Menú → Horario y ubicación → Reservar → WhatsApp (portada) → **7 paradas dentro del mapa** (controles y enlaces de OSM) → **Cómo llegar**, con `:focus-visible` y anillo `3px solid rgb(31, 78, 140)` (`--color-focus`) con `outline-offset: 3px` (`f-375-foco-como-llegar.png`). Shift+Tab desde "Cómo llegar" entra en el mapa y sale hacia el botón de WhatsApp; Tab vuelve a atravesarlo y sale a "Cómo llegar": **no hay trampa de foco**. Observación para UX: son 7 paradas de Tab dentro del mapa. |
| (g) 768 px | ✔ Dos columnas: horario a la izquierda (x = 24, 344 px de ancho) y, a la derecha (x = 400), dirección, mapa 344×194 (16:9) y botón "Cómo llegar" de ancho automático (149 px). `scrollWidth` = 768 (`g-768-horario.png`). Observación: en esta captura el marcador queda visible pero desplazado hacia abajo del centro, cerca de la barra de atribución. A 375 px está centrado. No determiné si es algo del embed de OSM con 16:9 o del momento de la captura headless; queda para el revisor de UI. |

Hallazgo técnico: el embed de OpenStreetMap ya no usa Leaflet, como suponía la spec, sino **MapLibre GL** (un `<canvas class="maplibregl-canvas">` con WebGL y un worker `blob:`). Funciona con `allow-scripts allow-same-origin` (el worker `blob:` necesita el origen propio del iframe). La justificación del `sandbox` en la decisión 2 de la spec sigue valiendo; solo cambia el nombre de la librería.

## Decisiones nuevas
1. **El embed de OSM es MapLibre GL, no Leaflet**: lo verifiqué en el navegador. El `sandbox` de la spec basta: `allow-scripts` es necesario y `allow-same-origin` permite su worker `blob:`. Propongo corregir "Leaflet" por "MapLibre GL (WebGL + worker)" al registrar la decisión 2 de la spec.
2. **Pruebas de CSS de la sección en `src/styles/location.test.ts`**, en archivo propio. `styles.test.ts` no se toca y cada sección nueva lleva su prueba de estilos junto a su `.css`.
3. **`.btn--secondary` solo redefine `border-color`**: hereda `border: 2px solid transparent` de `.btn`, igual que `.btn--whatsapp` hereda la forma. Vive en `location.css` (D-08) hasta que la tarea 006 divida `main.css`.
4. **`location.ts` exporta `type Location = Pick<Business, "hours" | "address" | "coordinates">`**, el tipo del parámetro de `renderLocation`.
5. **Las dos URLs se construyen antes de crear ningún elemento**, al principio de `renderPlace`. Unas coordenadas inválidas lanzan sin efectos parciales, en la línea de D-09.
6. **Borde decorativo de 1 px en `--color-border` alrededor del mapa** (`.location__map`, con `overflow: hidden` y `radius-md`). Es solo decorativo y no porta información (regla de `diseno.md`).
7. Pendiente para el humano, sin cambios: la propuesta de la spec de añadir `src/lib/maps.ts` y `src/sections/location.ts` a `brain/zonas-sensibles.txt` (decisión 6 de la spec). No edité ese archivo.
