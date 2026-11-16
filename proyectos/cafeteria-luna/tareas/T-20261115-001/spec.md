# T-20261115-001 · Esqueleto de la página, navegación, portada y sección Reservar
Tipo: tarea      Toca interfaz: sí      Texto visible para el usuario: sí

Cubre de `brain/spec.md`: CA-01.1, CA-01.2, CA-01.3 y CA-04.1 (y la parte de botón de CA-04.2 a
CA-04.4: la URL ya existe desde T-20261114-002; aquí se usa en los dos botones).

## Contexto (qué dice el brain que importa aquí)
- **D-04**: `index.html` tiene la estructura estática (landmarks, navegación, encabezados de sección,
  textos fijos). `src/main.ts` lee `src/data/business.ts` y monta cada sección con funciones
  `datos → HTMLElement` que usan solo `textContent`/`setAttribute` (**nunca** `innerHTML` con datos).
  Sin JavaScript se ve la estructura pero no los datos (aceptado).
- **D-00**: el nombre, el eslogan, el número y el mensaje de WhatsApp viven **solo** en
  `src/data/business.ts` (valores ficticios). `hero.ts` y `reserve.ts` los reciben como parámetros,
  no los importan ni los copian. Excepción ya existente: el nombre "Cafetería Luna" es la marca fijada
  en `vision.md` (no es un hueco) y ya está estático en `<title>`; también puede ir estático en la
  cabecera y el pie.
- **D-05 / T-20261114-002**: la URL de reserva la construye `buildWhatsAppUrl(number, message)`
  (`src/lib/whatsapp.ts`). `main.ts` la calcula **una vez** con `business.whatsapp` y la pasa a portada
  y Reservar, así los dos botones apuntan exactamente a la misma URL.
- **D-01**: cada sección es un módulo `camelCase.ts` en `src/sections/` que devuelve un `HTMLElement`.
- **D-02**: CSS plano mobile-first; el bloque "Tokens CSS" de `diseno.md` va **tal cual** en
  `src/styles/tokens.css`; `main.css` solo usa `var(--…)` (nada de colores ni tamaños a mano,
  `estandares/estilo-codigo.md`).
- **D-03**: Vitest + jsdom; pruebas junto al código. jsdom no calcula layout: lo que depende del
  pintado real (que quepa sin scroll a 375 px, alto táctil) se comprueba a mano y queda en el rastro
  (igual que D-03 hace con Lighthouse).
- **arquitectura.md → Rutas**: anclas `#inicio`, `#menu`, `#horario`, `#reservar`, en ese orden;
  cabecera **sticky** con navegación Menú · Horario y ubicación · Reservar (CA-01.3); pie con nombre
  y aviso de datos de ejemplo mientras rija D-00. Enlaces externos con `target="_blank"` +
  `rel="noopener noreferrer"` y nombre accesible que indique el propósito.
- **diseno.md**: botón variante `whatsapp` (fondo `--color-whatsapp`, texto `--color-on-whatsapp`,
  `min-height: 48px`, `--radius-pill`, peso 700, icono de chat decorativo a la izquierda con
  `aria-hidden`, ancho completo en móvil); cabecera sticky (`--header-height`, fondo `--color-surface`,
  borde inferior `--color-border`, nombre en Fraunces 700, enlaces `ghost` de 44 px de alto, sin scroll
  horizontal a 375 px: si no caben, la nav pasa a una segunda fila); `scroll-margin-top` en las
  secciones para que el ancla no quede tapada; enlace "Saltar al contenido" visible al recibir foco;
  portada con `min-height: calc(100svh - <alto de cabecera>)` que muestra nombre, eslogan y botón sin
  scroll; foco `outline: 3px solid var(--color-focus); outline-offset: 3px` (nunca sobre `primary`);
  transiciones ≤ 150 ms desactivadas con `prefers-reduced-motion: reduce`; secciones alternando fondos
  `bg`/`surface`; pie con `--color-footer-bg`/`--color-footer-text`, texto `--text-sm`.
- **vision.md**: tuteo, frases cortas, tono cercano y cálido. `locale` es `es-MX` (evitar "vosotros").
- **Estado del código (main = worktree)**: `index.html` mínimo (solo `<head>` y el `<script>`),
  `src/main.ts` solo importa los CSS, `tokens.css` y `main.css` vacíos, `src/data/business.ts` y
  `src/lib/whatsapp.ts` ya integrados. No existe `src/sections/`. `src/project.test.ts` (de
  T-20261114-001) tiene dos pruebas que fijaban el estado **anterior** y que esta tarea vuelve
  obsoletas a propósito: "CA-4: index.html has no section content yet" y la parte de "CA-5" que exige
  `tokens.css`/`main.css` sin reglas. Deben sustituirse (ver CA-13); no es desactivar pruebas para
  pasar puertas, es que describían otra fase.

## Objetivo
Que la página tenga su esqueleto semántico completo (cabecera sticky con navegación, `<main>` con
las cuatro secciones, pie), una portada que muestre de inmediato el nombre, el eslogan y el botón
"Reservar mesa por WhatsApp", y una sección Reservar con un texto breve y el mismo botón; todo con los
tokens de `diseno.md`. Menú y Horario quedan como secciones con su `<h2>` y sin contenido (tareas 004
y 005).

## Textos visibles (exactos)
| Dónde | Texto |
|---|---|
| Enlace de salto (visible al enfocarlo) | `Saltar al contenido` |
| Marca en la cabecera (enlace a `#inicio`) | `Cafetería Luna` |
| Navegación | `Menú` · `Horario y ubicación` · `Reservar` |
| `<h2>` de las secciones | `Menú` · `Horario y ubicación` · `Reservar` |
| Portada `<h1>` y eslogan | `business.name` y `business.slogan` (de los datos, no se escriben a mano) |
| Botón (portada y Reservar) | `Reservar mesa por WhatsApp` |
| Nombre accesible del botón (`aria-label`) | `Reservar mesa por WhatsApp (se abre en una pestaña nueva)` |
| Texto de la sección Reservar | `¿Quieres asegurar tu mesa? Escríbenos por WhatsApp con la fecha, la hora y cuántas personas vienen. Te respondemos para confirmarla.` |
| Pie | `Cafetería Luna` y el aviso `Página de demostración: el eslogan, el menú, los precios, el horario, la dirección y el número de WhatsApp son datos de ejemplo.` |

## Criterios de aceptación
### Esqueleto (`index.html`; pruebas que cargan `index.html` en jsdom)
- **CA-1** — Dado `index.html`, cuando se carga, entonces conserva el `<head>` actual (`lang="es"`,
  `<title>Cafetería Luna</title>`, charset UTF-8, viewport y `<script type="module" src="/src/main.ts">`)
  y los hijos del `<body>` (sin contar el `<script>`) son, en este orden, exactamente un `<header>`,
  un `<main id="contenido">` y un `<footer>`.
- **CA-2** — Dado `<main>`, cuando se recorren sus hijos `<section>`, entonces son exactamente cuatro,
  en este orden, con `id` `inicio`, `menu`, `horario` y `reservar`; `#menu`, `#horario` y `#reservar`
  contienen cada una un `<h2>` estático con el texto `Menú`, `Horario y ubicación` y `Reservar`
  respectivamente, y cada sección tiene `aria-labelledby` que apunta al `id` de su encabezado
  (`#inicio` apunta al `<h1>` que crea `hero.ts`, ver CA-7). En `index.html` no hay ningún `<h1>`
  (lo pone la portada con los datos).
- **CA-3** — Dado el `<header>`, cuando se lee, entonces contiene: (a) como **primer elemento
  enfocable del `<body>`** un enlace `Saltar al contenido` con `href="#contenido"`; (b) un enlace con
  el texto `Cafetería Luna` y `href="#inicio"` (no es un encabezado); (c) un `<nav>` con
  `aria-label="Principal"` que contiene exactamente tres enlaces, en este orden, con texto `Menú`,
  `Horario y ubicación`, `Reservar` y `href` `#menu`, `#horario`, `#reservar`.
- **CA-4** — Dado cada enlace interno del documento (`href` que empieza por `#`), cuando se resuelve
  su destino, entonces existe en el documento un elemento con ese `id` (ningún ancla rota).
- **CA-5** — Dado el `<footer>`, cuando se lee, entonces contiene el texto `Cafetería Luna` y el aviso
  exacto de la tabla "Textos visibles" (D-00).

### Botón de reserva (`src/sections/reserve.ts`; pruebas en `src/sections/reserve.test.ts`)
- **CA-6** — Dada `createReserveButton(url)` exportada desde `reserve.ts`, cuando se llama con una URL
  `https://wa.me/…`, entonces devuelve un `<a>` con: `href` igual a esa URL; texto visible exacto
  `Reservar mesa por WhatsApp`; `aria-label` exacto
  `Reservar mesa por WhatsApp (se abre en una pestaña nueva)` (empieza por el texto visible);
  `target="_blank"`; `rel` que contiene `noopener` y `noreferrer`; un icono `<svg>` decorativo creado
  con la API DOM, con `aria-hidden="true"` y `focusable="false"`, colocado antes del texto; y la clase
  de la variante `whatsapp` del botón. Si la URL no empieza por `https://wa.me/` (p. ej.
  `javascript:alert(1)` o `""`), lanza un `Error` en lugar de crear el enlace.

### Portada (`src/sections/hero.ts`; pruebas en `src/sections/hero.test.ts`)
- **CA-7** — Dada la función de portada (p. ej. `renderHero({ name, slogan }, reserveUrl)`), cuando se
  llama con datos de prueba, entonces devuelve un elemento cuyo **primer** hijo es un `<h1>` con el
  `name` recibido (y el `id` al que apunta `aria-labelledby` de `#inicio`), seguido de un `<p>` con el
  `slogan` y después el botón de CA-6 con `href === reserveUrl`; no hay ningún otro contenido antes
  del botón.
- **CA-8** — Dado un `name` o `slogan` que contiene HTML (p. ej. `<img src=x onerror=alert(1)>`), cuando
  se pinta la portada, entonces aparece como texto literal y no se crea ningún elemento `<img>`
  (prueba de que se usa `textContent`).

### Sección Reservar (`src/sections/reserve.ts`; pruebas en `src/sections/reserve.test.ts`)
- **CA-9** — Dada la función de la sección Reservar (p. ej. `renderReserve(reserveUrl)`), cuando se
  llama, entonces devuelve un elemento con un `<p>` con el texto exacto de la tabla "Textos visibles"
  seguido del botón de CA-6 con `href === reserveUrl`.

### Montaje (`src/main.ts`; pruebas en `src/main.test.ts`)
- **CA-10** — Dado el `<body>` de `index.html` cargado en jsdom, cuando se ejecuta el montaje de
  `main.ts`, entonces: `#inicio` contiene el `<h1>` con `business.name` y el eslogan
  `business.slogan`; `#reservar` contiene, después de su `<h2>`, el texto de Reservar y el botón; la
  página tiene **exactamente un** `<h1>`; y hay **exactamente dos** enlaces `Reservar mesa por WhatsApp`
  (uno en `#inicio`, otro en `#reservar`), ambos con `href` idéntico a
  `buildWhatsAppUrl(business.whatsapp.number, business.whatsapp.message)` (que empieza por
  `https://wa.me/520000000000?text=` y cuyo texto decodificado menciona fecha, hora y personas).
- **CA-11** — Dado un documento al que le falta un contenedor de montaje (p. ej. sin `#reservar`),
  cuando se ejecuta el montaje, entonces lanza un `Error` cuyo mensaje nombra el selector que falta
  (fallo visible en vez de una página a medias en silencio).
- **CA-12** — Dado el código fuente de `src/main.ts`, `src/sections/hero.ts` y
  `src/sections/reserve.ts`, cuando una prueba lo lee, entonces no contiene `innerHTML`,
  `outerHTML` ni `insertAdjacentHTML`; y `hero.ts`/`reserve.ts` no contienen el eslogan, el número
  (`520000000000`) ni el mensaje de WhatsApp ni importan `business` (los datos llegan por parámetro,
  D-00).

### Estilos (`src/styles/*.css`; pruebas que leen los archivos)
- **CA-13** — Dado `src/project.test.ts`, cuando se actualiza, entonces "CA-4" pasa a comprobar el
  esqueleto nuevo (o se elimina en favor de CA-1/CA-2 de esta tarea) y "CA-5" sigue comprobando que
  existen `src/main.ts`, `tokens.css` y `main.css` pero ya **no** exige que estén vacíos; el resto de
  pruebas de ese archivo (CA-1, CA-2, CA-3, CA-6, CA-7) no se modifica y pasa.
- **CA-14** — Dado `src/styles/tokens.css`, cuando una prueba lo lee, entonces declara en `:root`
  todas las custom properties del bloque "Tokens CSS" de `diseno.md` con sus valores exactos (como
  mínimo comprobados: los 18 `--color-*`, `--font-heading`, `--font-body`, `--text-xs`…`--text-3xl`,
  `--space-1`…`--space-8`, `--tap-min: 44px` y `--header-height: 56px`) y un bloque
  `@media (min-width: 768px)` que redefine `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`,
  `--text-3xl`, `--gutter` y `--header-height: 64px`.
- **CA-15** — Dado `src/styles/main.css`, cuando una prueba lo lee (sin comentarios), entonces: no
  contiene literales de color (`#` hexadecimal, `rgb(`, `rgba(`, `hsl(`); la regla de la cabecera
  tiene `position: sticky` y `top: 0`; las secciones tienen `scroll-margin-top` basado en
  `var(--header-height)`; hay una regla `:focus-visible` que usa `var(--color-focus)`; y hay un bloque
  `@media (prefers-reduced-motion: reduce)`.

### Comprobación manual (jsdom no pinta; se deja en `build-rondaN.md`)
- **CA-16** — Dado `npm run dev` en un viewport de **375×667** (DevTools), cuando se carga la página,
  entonces: (a) se ven el nombre, el eslogan y el botón `Reservar mesa por WhatsApp` sin hacer scroll
  (CA-01.1, CA-01.2); (b) no hay scroll horizontal y la cabecera no se corta; (c) al pulsar cada
  enlace de la navegación la página llega a su sección y el `<h2>` queda visible, no tapado por la
  cabecera sticky, que sigue arriba (CA-01.3); (d) los enlaces de la navegación y los botones miden
  al menos 44 px de alto y los botones ocupan el ancho del contenedor; (e) con el teclado, `Tab`
  muestra primero "Saltar al contenido" y el foco se ve con el anillo azul en todos los enlaces; (f)
  el botón abre `wa.me` en una pestaña nueva con el mensaje pre-rellenado legible. El constructor
  anota el resultado de cada punto (y una captura si puede) en `build-rondaN.md`.

### Puertas
- **CA-17** — Dada la carpeta de trabajo, cuando se ejecuta `node scripts/verificar.mjs
  proyectos/cafeteria-luna/.worktrees/T-20261115-001` desde la raíz de la fábrica, entonces `lint`,
  `typecheck`, `test` y `build` salen `ok` (ninguna `omitida`), y las pruebas de
  `src/data/business.test.ts` y `src/lib/whatsapp.test.ts` pasan sin modificarse.

## Plan
1. **TDD — estructura**: en un `src/page.test.ts` (o similar) escribir CA-1 a CA-5 leyendo
   `index.html` como hace `project.test.ts`; actualizar en `src/project.test.ts` solo "CA-4" y "CA-5"
   (CA-13). Fallan.
2. Escribir el esqueleto en `index.html`: `<header>` (salto, marca, `<nav aria-label="Principal">`),
   `<main id="contenido">` con `section#inicio` (vacía, `aria-labelledby="inicio-titulo"`),
   `section#menu`, `section#horario` y `section#reservar` con su `<h2 id="…-titulo">` estático, y
   `<footer>` con nombre y aviso. Sin `<h1>`. Mantener el `<head>` intacto.
3. **TDD — botón y secciones**: `src/sections/reserve.test.ts` (CA-6, CA-9) y
   `src/sections/hero.test.ts` (CA-7, CA-8). Implementar `src/sections/reserve.ts`
   (`createReserveButton(url)` con validación `https://wa.me/`, icono SVG con `createElementNS`, y
   `renderReserve(url)`) y `src/sections/hero.ts` (`renderHero({ name, slogan }, url)`, que reutiliza
   `createReserveButton` importándolo de `reserve.ts`: un solo sitio construye el botón).
4. **TDD — montaje**: `src/main.test.ts` (CA-10, CA-11, CA-12). Sugerencia: `main.ts` exporta una
   función `mount(doc: Document)` que busca `#inicio` y `#reservar` (Error con el selector si falta),
   calcula `buildWhatsAppUrl(business.whatsapp.number, business.whatsapp.message)` una vez y añade
   `renderHero(...)` a `#inicio` y `renderReserve(...)` tras el `<h2>` de `#reservar`; al final del
   módulo se llama con `document`. Ojo: si el montaje se ejecuta al importar, la prueba debe cargar el
   `<body>` de `index.html` en `document` **antes** de `await import("./main")` (y `vi.resetModules()`
   entre casos). Se mantienen los imports de CSS en el orden actual.
5. **TDD — estilos**: pruebas de CA-14 y CA-15; copiar el bloque "Tokens CSS" de `diseno.md` tal cual
   en `tokens.css`; escribir en `main.css` (mobile-first, solo `var(--…)`): base (`body` con
   `--font-body`, `--color-bg`, `--leading-body`; títulos con `--font-heading`), contenedor
   (`--container-max`, `--gutter`), enlace de salto oculto hasta el foco, cabecera sticky (si la nav no
   cabe en una fila a 375 px pasa a una segunda; entonces `scroll-margin-top` y el `min-height` de la
   portada deben descontar el alto real, p. ej. `calc(var(--header-height) + var(--tap-min))` en móvil
   y `var(--header-height)` desde 768 px), enlaces `ghost` de 44 px, secciones alternando `bg`/`surface`
   con `padding-block` `--space-7`/`--space-8`, portada a alto de pantalla, botón base + variante
   `whatsapp` (hover ~10 % más oscuro sin color a mano, p. ej. `filter: brightness(.9)` o
   `color-mix` con tokens), ancho completo en móvil, `:focus-visible` con el anillo de `diseno.md`
   (en el pie, anillo en `--color-secondary`), pie, y `prefers-reduced-motion`.
6. Comprobación manual CA-16 a 375×667 y anotarla en `build-rondaN.md`.
7. `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-001` hasta que las
   cuatro puertas pasen (CA-17).

Archivos que cambian: `index.html`, `src/main.ts`, `src/styles/tokens.css`, `src/styles/main.css`,
`src/project.test.ts` (solo CA-4/CA-5). Nuevos: `src/sections/hero.ts`, `src/sections/reserve.ts`,
sus `*.test.ts`, `src/main.test.ts` y la prueba de estructura de página. No deben cambiar
`src/data/business.ts`, `src/lib/whatsapp.ts`, `package.json`, `package-lock.json` ni la
configuración (`vite.config.ts`, `tsconfig.json`, `eslint.config.js`).

## Fuera de alcance
- Contenido de Menú (`menu.ts`, `formatPrice.ts`: tarea 004) y de Horario y ubicación (`location.ts`,
  `maps.ts`, mapa, "Cómo llegar": tarea 005). Aquí esas secciones solo llevan su `<h2>`.
- **Carga de Google Fonts** (Fraunces y DM Sans): es un recurso de terceros, zona sensible por
  privacidad y rendimiento, y la entrada no lo pide. Se usan las pilas `--font-heading`/`--font-body`
  de los tokens (con sus fallbacks). Pregunta añadida a `brain/huecos.md`.
- Dirección corta en el pie: `business.ts` solo tiene la dirección completa y no hay módulo de pie;
  se deja para la tarea 005 (dirección) o 006.
- Resaltado de la sección activa en la navegación (subrayado de 3 px; necesita JS de scroll) y los
  motivos decorativos de luna creciente en `<h2>` y pie: pulido posterior (tarea 006 o nueva).
- Lighthouse, auditoría completa de 44×44 px y de encabezados en toda la página (tarea 006).
- Texto definitivo del mensaje de WhatsApp, eslogan y número reales (`huecos.md`, D-00). No se tocan
  `business.ts` ni `whatsapp.ts`.
- `<meta name="description">`, favicon, imágenes de portada, modo oscuro (no aplica, `diseno.md`).
- Dependencias nuevas (no hacen falta).

## Riesgos / zonas sensibles que toca
- **Riesgo ALTO** (`zonas-sensibles.txt`): modifica `index.html` y `src/main.ts` (si fallan, página en
  blanco) y crea `src/sections/hero.ts` y `src/sections/reserve.ts` (los botones de reserva: el embudo
  de conversión). Requiere **aprobación humana** en el cierre.
- Embudo de reserva: los dos botones deben usar la URL de `buildWhatsAppUrl` sin reconstruirla ni
  recodificarla (doble codificación = mensaje ilegible). CA-10 lo fija; la validación `https://wa.me/`
  de CA-6 impide que un `href` peligroso (`javascript:`) llegue al DOM.
- XSS: datos solo con `textContent`/`setAttribute`; el icono SVG con `createElementNS`, nunca con
  cadenas HTML (CA-8, CA-12).
- Nombre accesible: el `aria-label` debe **empezar** por el texto visible (WCAG 2.5.3, "label in
  name"); si se cambia el texto del botón, cambiar los dos a la vez.
- Cabecera sticky en móvil: si la nav pasa a dos filas, el alto real supera `--header-height` (56 px)
  y las anclas quedarían tapadas o la portada pediría scroll; comprobarlo en CA-16 (c) y (a).
- Foco: el anillo nunca se dibuja sobre `--color-primary` (contraste 1:1) ni con `--color-secondary`
  sobre fondos claros (`diseno.md`).
- Pruebas obsoletas: solo se cambian "CA-4" y "CA-5" de `project.test.ts`, y solo en lo que la nueva
  fase invalida; cualquier otro cambio en pruebas existentes es motivo de rechazo.
- Mensaje de WhatsApp con campos vacíos al final (sugerencia del aprobador de T-20261114-002):
  revisar en CA-16 (f) cómo se ve; si se ve mal, se anota para el humano, no se cambia `business.ts`
  en esta tarea.
