# T-20261115-004 · Build ronda 1 (constructor)

- Rama: `fabrica/T-20261115-004` (base `main` = 18d695b) · Carpeta: `proyectos/cafeteria-luna/.worktrees/T-20261115-004`
- Commit: **26de4a8** `T-20261115-004: dividir main.css (header, buttons, hero, reserve, footer), min-width 44 px en .nav-link y .btn, pruebas de accesibilidad y de guardias de location.ts, comentario MapLibre`
- Pruebas: **274** en 17 archivos, todas en verde (antes eran 164). Los 4 archivos nuevos suman 112 casos: 110 son nuevos y 2 se movieron de `location.test.ts` a `buttons.test.ts` (a11y 11, split 87, buttons 6, guards 8).
- Puertas: lint ok · typecheck ok · test ok · build ok
- Lighthouse móvil (3 ejecuciones): mediana de **rendimiento 100** y de **accesibilidad 100**
- Sin dependencias nuevas: `package.json` y `package-lock.json` no cambian. En el worktree solo se ejecutó `npm ci` para instalar las que ya estaban fijadas.

## Archivos cambiados
Coinciden exactamente con la lista del plan:
- **Cambian**:
  - `src/main.ts`: solo cinco `import "./styles/…";` añadidos.
  - `src/sections/location.ts`: solo el comentario de la línea 24 (una línea de comentario sale y entran dos).
  - `src/styles/main.css`: de 316 a 99 líneas.
  - `src/styles/location.css`
  - `src/styles/styles.test.ts`: un caso (CA-13 a).
  - `src/styles/location.test.ts`: sale un `describe` (CA-13 b).
- **Nuevos**:
  - estilos: `src/styles/header.css` (109 líneas), `buttons.css` (78), `hero.css` (37), `reserve.css` (7), `footer.css` (30);
  - pruebas: `src/a11y.test.ts`, `src/styles/split.test.ts`, `src/styles/buttons.test.ts`, `src/sections/location.guards.test.ts`.
- **CA-23**: `git diff --name-only main` está vacío para `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `index.html`, `src/data/business.ts`, `src/lib/*.ts`, `hero.ts`, `reserve.ts`, `menu.ts`, `tokens.css`, `menu.css` y el resto de archivos de prueba protegidos por CA-13.

**Movimiento puro comprobado aparte**: se comparó cada declaración de `main:src/styles/{main,location}.css` con los archivos nuevos, por contexto `@media`, selector y declaración. Hay 226 declaraciones antes y 228 después. Las únicas diferencias son las previstas:
- `+ .nav-link { min-width: var(--tap-min) }`
- `+ .btn { min-width: var(--tap-min) }`
- `.btn--secondary { margin-top: var(--space-4) }` pasa a `.location__place .btn--secondary { margin-top: var(--space-4) }`

El script es `scratchpad/t004-tools/css-diff.mjs`.

## CA → prueba → rojo/verde

En la columna de estado:
- **R→V**: la prueba falló antes de escribir el código y pasó después.
- **V previsto**: el comportamiento ya existía, como prevé el plan (paso 1: "lo previsible es que pase sin cambiar código"). En esos casos se demostró que la prueba **sí puede fallar** con una mutación temporal del código fuente, que se revirtió con `git checkout` y no está en el commit.

| CA | Prueba (archivo › describe › caso) | Estado |
|---|---|---|
| CA-1 | `src/a11y.test.ts` › "CA-1: one labelled heading per section" › 3 casos (aria-labelledby → h1/h2 dentro de la sección; un h1/h2 por sección; un único h1 en `#inicio`) | V previsto. Mutación `hero.ts` h1→h3: los 3 en rojo |
| CA-2 | `src/a11y.test.ts` › "CA-2: heading levels" › "starts at h1 and never skips a level going down" | V previsto. Mutación h3→h4 en `location.ts`: rojo |
| CA-3 | `src/a11y.test.ts` › "CA-3: images, graphics and the iframe" › 3 casos (img con alt, svg oculto o con nombre, iframe con title) | V previsto. Mutación (quitar `aria-hidden` y el `title` del iframe): 2 en rojo. El caso de `<img>` pasa sin elementos, como pide la spec |
| CA-4 | `src/a11y.test.ts` › "CA-4: WhatsApp buttons announce their purpose" › 3 casos (2 enlaces en inicio/reservar; aria-label = texto visible + WhatsApp + "(se abre en una pestaña nueva)"; svg aria-hidden) | V previsto. Mutación del sufijo y del `aria-hidden` en `reserve.ts`: 2 en rojo |
| CA-5 | `src/a11y.test.ts` › "CA-5: every focusable element…" › 1 caso | V previsto. Mutación de "Cómo llegar" sin la clase `btn`: rojo |
| CA-6 | `src/styles/split.test.ts` › "CA-6: 44 px tap targets…" › 7 casos (tokens ≥ 44 px a 375 y 768 px; min-height de `.skip-link`, `.brand`, `.nav-link` y `.btn`; min-width de `.nav-link` y `.btn`) | R→V (6 en rojo antes de la división; el de tokens ya pasaba) |
| CA-7 | `src/styles/split.test.ts` › "CA-7: only main:focus removes the outline" | V previsto (main ya cumplía). Mutación `outline: 0` en `header.css`: rojo |
| CA-8 | `src/styles/split.test.ts` › "CA-8: …" › 17 casos (9 archivos existen y miden ≤ 200 líneas; 8 sin literales de color) | R→V (`main.css` medía 316 líneas y los archivos nuevos no existían) |
| CA-9 | `src/styles/split.test.ts` › "CA-9: every selector of decision 1 lives in its file and context only" › 53 casos, uno por selector y contexto de la tabla, más 6 casos "contains only the selectors of decision 1" | R→V |
| CA-10 | `src/styles/split.test.ts` › "CA-10: the reduced-motion override…" › 2 casos (bloque `reduce` en `buttons.css` después de `translateY(1px)`; sin `.btn` en el `reduce` de `main.css`) | R→V |
| CA-11 | `src/styles/split.test.ts` › "CA-11: main.ts imports the style files once each, in cascade order" | R→V. El diff de `main.ts` solo añade imports (ver `git diff main -- src/main.ts`) |
| CA-12 | `src/styles/buttons.test.ts`: "CA-19 (f): .btn--secondary (outline button)" (2 casos movidos sin cambios, ahora leen `buttons.css`) · "CA-12 (a)" (ancho 100 % y `auto` a 768 px) · "CA-12 (b)" (sin `.btn--secondary` ni `:hover` exactos en `location.css`; `.location__place .btn--secondary { margin-top: var(--space-4) }`) | R→V (6 en rojo) |
| CA-13 | La suite completa pasa (274). Solo se tocaron los dos puntos permitidos: (a) en `styles.test.ts`, el caso "makes the header sticky at the top" lee `header.css`, con las mismas aserciones y un comentario; (b) el `describe` "CA-19 (f)" sale de `location.test.ts`. Los otros casos de `styles.test.ts` siguen leyendo `main.css` | (a) R→V |
| CA-14 | `src/sections/location.guards.test.ts` › "CA-14: the map guard rejects…" › 3 casos (`javascript:`, `http://`, dominio `.example.com`) | V previsto (la guardia ya existía). Mutación que desactiva las guardias: 3 en rojo |
| CA-15 | ídem › "CA-15: the directions guard rejects…" › 3 casos | V previsto. Misma mutación: 3 en rojo |
| CA-16 | ídem › "CA-16: the guards let legitimate URLs through untouched" | V previsto. Mutación con guardia demasiado estricta (prefijo + `bbox=`): rojo |
| CA-17 | ídem › "CA-17: the sandbox comment names MapLibre, not Leaflet" | R→V. El diff de `location.ts` solo toca líneas de comentario; `MAP_SANDBOX`, los prefijos y el código son idénticos. CA-9 de T-20261115-003 sigue en verde |

El mock de `../lib/maps` vive solo en `location.guards.test.ts`, con `vi.hoisted` y `mockReturnValue` en cada caso. `location.test.ts` no lo ve, y sus casos siguen en verde.

## Puertas (CA-23)
`node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-004`, desde la raíz de la fábrica:
```
✔ lint       ok
✔ typecheck  ok
✔ test       ok   (17 archivos, 274 pruebas)
✔ build      ok
```
No se desactivó ninguna regla ni se borró ninguna prueba, y no se usó `--no-verify`.

## Comprobación manual (CA-18 a CA-21)

### Entorno y método
- **Builds**:
  - "después": `npm run build` en el worktree y luego `npm run preview -- --port 4180 --strictPort`;
  - "antes": build de `main` (18d695b, hecho en el worktree antes de cualquier cambio y copiado fuera), servido con `vite preview --outDir <copia> --port 4181 --strictPort`.

  Ambos servidores se pararon al terminar (`taskkill /T`). Los puertos 4180 y 4181 quedaron libres y no queda ningún proceso de node ni de Chrome headless.
- **Navegador**: Chrome del sistema 157.0.8103.80 en modo headless, controlado con `puppeteer-core@23`, instalado en `scratchpad/t004-tools/`, fuera del worktree.
- **Emulación**: 375×667, `isMobile` y `hasTouch`, DPR 2 para CA-18 a CA-20 y DPR 1 para las comparaciones de CA-21. Escritorio a 1024×768.
- **Script**: `scratchpad/t004-tools/manual-checks.mjs`. Las mediciones en bruto están en `capturas-ronda1/mediciones-ronda1.json`.

### CA-18 · 375 px: sin scroll horizontal, sin texto cortado, anclas visibles — **cumple**
Las dos últimas columnas recorren todos los elementos del `body` (salvo el `.skip-link` oculto) en cada punto:
- "fuera": cuántos tienen el `getBoundingClientRect()` fuera de `[0, 375]`;
- "recortados": cuántos tienen `overflow` distinto de `visible` y `scrollWidth > clientWidth`.

| Punto | `scrollWidth` | scrollY | Fondo cabecera | Encabezado | Top del encabezado | Visible bajo la cabecera | Fuera | Recortados |
|---|---|---|---|---|---|---|---|---|
| arriba (cabecera de 2 filas) | 375 | 0 | 101 | — | — | — | 0 | 0 |
| `#inicio` | 375 | 1 | 101 | h1 "Cafetería Luna" | 299 | sí | 0 | 0 |
| `#menu` | 375 | 568 | 101 | h2 "Menú" | 148 | sí | 0 | 0 |
| `#horario` | 375 | 1264 | 101 | h2 "Horario y ubicación" | 148 | sí | 0 | 0 |
| horario: tabla, dirección y mapa | 375 | 1803 | 101 | — | — | — | 0 | 0 |
| `#reservar` | 375 | 2270 (fin de página) | 101 | h2 "Reservar" | 179 | sí | 0 | 0 |
| pie | 375 | 2270 | 101 | "Cafetería Luna" (pie) | 510 | sí | 0 | 0 |

- (a) `document.documentElement.scrollWidth` vale 375 en todos los puntos.
- (b) En las capturas no hay texto cortado ni solapado en la cabecera, la portada, las tarjetas del menú, la tabla de horario, la dirección, los botones ni el pie.
- (c) Cada ancla deja su encabezado entero visible por debajo del borde inferior de la cabecera sticky (101 px): queda 47 px por debajo en `#menu` y `#horario`, 78 px en `#reservar` (fin de página) y 198 px en `#inicio` (portada centrada).

Capturas: `ca18-375-arriba-cabecera.png`, `ca18-375-inicio.png`, `ca18-375-menu.png`, `ca18-375-horario.png`, `ca18-375-horario-tabla-dir.png`, `ca18-375-reservar.png`, `ca18-375-pie.png`, `ca18-375-pagina-completa.png`.

### CA-19 · zonas táctiles a 375 px — **cumple** (con la excepción conocida de la decisión 3)
Medidas con `getBoundingClientRect()` de cada `a[href], button`. El `.skip-link` se midió con el foco puesto.

| Elemento | Nombre accesible | Ancho (px) | Alto (px) | ≥ 44×44 |
|---|---|---|---|---|
| a.skip-link (con foco) | Saltar al contenido | 173.19 | 44 | sí |
| a.brand | Cafetería Luna | 137.09 | 56 | sí |
| a.nav-link | Menú | 55.34 | 44 | sí |
| a.nav-link | Horario y ubicación | 148.95 | 44 | sí |
| a.nav-link | Reservar | 74.25 | 44 | sí |
| a.btn.btn--whatsapp (portada) | Reservar mesa por WhatsApp (se abre en una pestaña nueva) | 343 | 48 | sí |
| a.btn.btn--secondary | Cómo llegar (se abre en una pestaña nueva) | 343 | 48 | sí |
| a.btn.btn--whatsapp (Reservar) | Reservar mesa por WhatsApp (se abre en una pestaña nueva) | 343 | 48 | sí |

**Excepción de la decisión 3 (no cuenta como fallo; pendiente de confirmación humana)**: los controles internos del iframe de OSM. El iframe mide 341×255 y el embed usa MapLibre. Se midieron dentro del documento del iframe:

| Control interno de OSM | Ancho (px) | Alto (px) |
|---|---|---|
| canvas "Mapa" (enfocable) | 341 | 255 |
| button "Acercar" (+) | 29 | 29 |
| button "Alejar" (−) | 29 | 29 |
| a "Reportar un problema" | 116.73 | 14 |
| a "Colaboradores de OpenStreetMap" | 183.45 | 14 |
| a "Hacer una donación" | 107.42 | 14 |
| a "Términos del sitio web y de la API" | 180.09 | 14 |

Ojo: los enlaces de atribución miden **14 px** de alto, no unos 30 px como dice la decisión 3 (ese valor coincide con los botones +/−, de 29 px). La alternativa táctil sigue siendo "Cómo llegar" (343×48).

Capturas: `ca19-375-skip-link-foco.png`, `ca19-375-mapa-controles.png`.

### CA-20 · solo teclado a 375 px — **cumple, con un hallazgo previo en la marca**
- **Orden con Tab** (15 pulsaciones):
  1. salto
  2. marca
  3. Menú
  4. Horario y ubicación
  5. Reservar
  6. WhatsApp de la portada
  7. **mapa**: 7 paradas dentro del iframe (canvas, +, −, Reportar un problema, Colaboradores de OSM, Hacer una donación, Términos)
  8. Cómo llegar
  9. WhatsApp de Reservar

  Es el orden de la spec. **Mayús+Tab** recorre exactamente el orden inverso hasta el salto. El foco entra en el mapa y sale por los dos lados, así que **no queda atrapado**.
- **Anillo**: todos nuestros elementos tienen `:focus-visible` con `solid 3px rgb(31, 78, 140)` (`--color-focus`) y `outline-offset` de 3 px. Ninguno queda bajo la cabecera sticky, y en todos `elementFromPoint` en el centro devuelve el propio elemento. Dentro del iframe, el estilo de foco es el de OSM (otro origen), que no se puede estilar ni medir desde aquí.
- **Salto**: aparece al recibir el foco (173×44). Al pulsar Enter, `document.activeElement` pasa a ser `main#contenido`, sin anillo (D-08), y el hash es `#contenido`. El siguiente Tab va al botón de WhatsApp de la portada, con el anillo visible.
- **Hallazgo (ya existía en `main`; no se corrige)**: el borde **superior** del anillo de `.brand` queda fuera de la ventana. La marca empieza en y = 0 y el contorno se dibuja entre 3 y 6 px por encima de ella. Los lados izquierdo, derecho e inferior sí se ven (`ca20-375-foco-marca.png`). Ocurre igual en `main`: CA-21 confirma que los estilos calculados de `.brand` son idénticos y que no hay diferencia de píxeles. Lo más probable es que pase lo mismo a 1024 px, porque la marca también empieza en y = 0, pero no se midió.

  Arreglarlo exige una declaración nueva, por ejemplo `.brand:focus-visible { outline-offset: -3px; }` o relleno vertical en la cabecera. Eso contradice la decisión 1 ("no cambia ninguna declaración salvo las de la decisión 2") y CA-21 (sin cambios visuales). Por eso no se aplica y se deja para decisión de spec/humano (ver "Desviaciones").

Capturas:
- `ca20-375-foco-salto.png`
- `ca20-375-foco-marca.png`
- `ca20-375-foco-nav-link-menu.png`
- `ca20-375-foco-btn-whatsapp-portada.png`
- `ca20-375-foco-btn-como-llegar.png`
- `ca20-375-foco-btn-whatsapp-reservar.png`
- `ca20-375-tras-salto-siguiente-tab.png`

### CA-21 · antes y después sin diferencias visuales — **cumple**
Se compararon las dos versiones con las mismas acciones, a **375 px** y a **1024 px**:
- 7 vistas de sección: cabecera, inicio, menú, horario, horario-dirección, reservar y pie;
- un barrido de la página entera en pasos de una pantalla (6 vistas a 375 px y 4 a 1024 px);
- **hover** y **foco por teclado** (Tab real) en el WhatsApp de la portada, en "Cómo llegar" y en el WhatsApp de Reservar.

Las comparaciones se hicieron así:
- **Píxeles**: se decodificaron en canvas y se comparó cada píxel RGBA. Resultado: **0 píxeles distintos en las 36 parejas** (19 a 375 px y 17 a 1024 px), todas del mismo tamaño.
- **Estilos calculados**: se comparó `getComputedStyle` de los 109 elementos, en todas sus propiedades. Las **únicas** diferencias son `min-width` y `min-inline-size`, que pasan de `0px`/`auto` a `44px` en los 3 `.nav-link` y los 3 `.btn`. Es la decisión 2, y no tiene efecto visible porque todos ya medían más de 44 px.
- **Mapa**: durante esta comparación se bloquearon las peticiones a terceros en las **dos** versiones, para que el mapa no pinte teselas distintas en cada carga. Por eso en estas capturas el iframe muestra el aviso de marco bloqueado de Chrome. Esta tarea no cambia el iframe, que en las capturas de CA-18 a CA-20 se ve cargado.
- Marcador a 768 px (hueco): solo se observó y no se tocó (fuera de alcance).

Capturas: `ca21-{antes,despues}-{375,1024}-{normal-*,barrido-NN,hover-*,foco-*}.png`, 72 archivos en total.

## CA-22 · Lighthouse móvil — **cumple** (mediana ≥ 90)
- **Opción A (CLI)**, lanzada desde `tareas/T-20261115-004/`, fuera del worktree:
  `npx --yes lighthouse@12 http://localhost:4180/ --only-categories=performance,accessibility --output=html --output=json --output-path=./lighthouse/ronda1-K --chrome-flags="--headless=new"`
  - con `CHROME_PATH` apuntando al Chrome del sistema;
  - el servidor era `npm run preview -- --port 4180 --strictPort` (puerto 4180 en lugar de 4173, según las instrucciones de esta ejecución).
- **Versiones**: Lighthouse **12.8.2** y Chrome **157.0.8103.80** (UA `HeadlessChrome/157.0.0.0`).
- **Configuración**, leída del JSON: `formFactor: mobile`, `throttlingMethod: simulate`, pantalla 412×823 con DPR 1.75. Es la configuración móvil por defecto, sin `--preset`.

| Ejecución | Rendimiento | Accesibilidad | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|
| ronda1-1 | 100 | 100 | 0.9 s | 0.9 s | 0 ms | 0 | 0.9 s |
| ronda1-2 | 100 | 100 | 0.9 s | 0.9 s | 0 ms | 0 | 0.9 s |
| ronda1-3 | 100 | 100 | 0.9 s | 0.9 s | 0 ms | 0 | 0.9 s |
| **Mediana** | **100** | **100** | | | | | |

- **Peticiones a `openstreetmap.org`**: **sí aparecen** en los 3 informes:
  - `export/embed.html?bbox=…`
  - dos recursos `assets/embed-*`
  - un worker `blob:https://www.openstreetmap.org/…`

  No se piden teselas. Es la limitación conocida de D-10: Chrome adelanta la carga del iframe diferido.
- **Auditorías por debajo de 0.9**, sin efecto en la puntuación: `render-blocking-resources`, `render-blocking-insight` y `network-dependency-tree-insight`, por la única hoja CSS. No hace falta ningún arreglo.
- **Aviso de Lighthouse**: al cerrar cada ejecución avisó de que no podía borrar su carpeta temporal (`EPERM` en `%TEMP%\lighthouse.*`). Los informes se escribieron antes y el código de salida fue 0.
- **Informes**: `lighthouse/ronda1-{1,2,3}.report.html` y `lighthouse/ronda1-{1,2,3}.report.json`.

## Decisiones nuevas
Ninguna que haya que registrar en el brain. Detalles de implementación, todos dentro de la spec:
- La prueba de CA-11 está en `split.test.ts`.
- CA-9 añade un caso por archivo que exige que cada archivo de la decisión 1 contenga **solo** sus selectores. Es una forma más estricta de comprobar que el movimiento es puro.
- Cada CSS nuevo lleva un comentario de cabecera como el de `main.css`. `main.css` y `buttons.css` explican dónde vive ahora cada cosa y por qué el bloque `reduce` va después de `.btn:active`.

## Desviaciones y puntos para el humano
1. **Anillo de foco de `.brand` recortado por arriba** (CA-20, ya existía en `main`). No se corrige porque exigiría una declaración nueva y un cambio visual, fuera de las decisiones 1 y 2. Propuesta para una spec o un hueco: `.brand:focus-visible { outline-offset: -3px; }` u otra solución que decida el diseño.
2. **La medida de la decisión 3 es inexacta**: los enlaces de atribución del iframe de OSM miden 14 px de alto, no unos 30 px; los botones +/− sí miden 29×29. Conviene corregir la cifra en `huecos.md` y `diseno.md` al registrar la excepción.
3. **Puerto de la vista previa**: 4180 con `--strictPort`, en lugar del 4173 por defecto de CA-22, según las instrucciones de esta ejecución. No afecta al resultado.
4. Siguen pendientes las comprobaciones humanas de la spec:
   - WhatsApp y "Cómo llegar" en un teléfono real;
   - aceptar o rechazar la excepción de la decisión 3;
   - aprobar el cierre (riesgo ALTO por `src/main.ts` y `src/sections/location.ts`).
