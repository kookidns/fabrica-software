# T-20261117-001 · Ajustar la página al boceto aprobado (decoración SVG)
Tipo: tarea      Toca interfaz: sí      Texto visible para el usuario: no

Ronda: 1 · Entrada: `bandeja/008-ajustar-al-boceto-aprobado.md` (cubre CA-05.1, CA-05.4) · Rama: `fabrica/T-20261117-001` (base `main`)

## Contexto (qué dice el brain que importa aquí)
- **Objetivo visual:** `brain/boceto/aprobado-movil.png`, `aprobado-escritorio.png` y `aprobado.md` (v1, aprobado por el humano
  el 2026-11-16). Se mide estructura, orden, jerarquía, paleta y tono; no hay que igualar el píxel, y **los datos y textos del brain
  mandan sobre los del boceto** (precios "MXN 45 (ejemplo)", horarios "08:00 – 20:00 (ejemplo)", "Datos de ejemplo para la demo",
  "Aparta tu mesa…" y el eslogan del boceto son textos de ejemplo y **no entran**).
- **D-04:** los datos entran solo con `textContent`/`setAttribute`; nunca `innerHTML`. Los SVG se crean con `createElementNS`
  (patrón que ya usa `createChatIcon` en `reserve.ts`) o van estáticos en `index.html`.
- **D-02 / D-09 / D-11:** CSS plano, solo `var(--…)`, cada sección con su archivo de estilos, ningún archivo pasa de ~200 líneas,
  `main.ts` importa los estilos en un orden fijo (lo vigila `split.test.ts`, CA-11). `split.test.ts` (CA-9) fija qué selectores
  viven en `main.css`, `header.css`, `buttons.css`, `hero.css`, `reserve.css` y `footer.css`.
- **D-08 / D-11 / D-12:** zonas táctiles de 44 px (`--tap-min`), anillo de foco global, y solo tres reglas `:focus-visible`
  (global, pie y `.brand`, que usa `outline-offset: -3px`). Todo enfocable usa `skip-link`, `brand`, `nav-link` o `btn`.
- **D-10:** el mapa (iframe, `sandbox`, `referrerpolicy`, prefijos de URL, `src/lib/maps.ts`) **no se toca**.
- **D-03:** puertas `lint`, `typecheck`, `test`, `build`. D-11: Lighthouse móvil, mediana de 3 ejecuciones, ≥ 90 en rendimiento y
  accesibilidad (línea base 100/100 con fuentes del sistema).
- **diseno.md:** `secondary` (#E9C46A) es el "dorado luna" para la luna decorativa; no se usa como texto ni como borde informativo
  sobre fondos claros. Como relleno de un gráfico decorativo `aria-hidden` está permitido (WCAG 1.4.11 no aplica a lo decorativo).
  Sobre `footer-bg` tiene 9.75:1. `on-whatsapp` sobre `whatsapp` tiene 6.47:1. Pie: `footer-text` sobre `footer-bg` 13.66:1.
- **Hueco abierto (no bloquea):** fuentes Fraunces y DM Sans desde Google Fonts (`huecos.md`, 2026-11-15). El boceto dibuja títulos
  con una serif tipo Fraunces, pero **esta tarea no carga fuentes externas**: siguen los fallbacks del sistema de `tokens.css`.

### Diferencias boceto ↔ código actual que pide la entrada
| # | Boceto | Código actual (`main`) |
|---|---|---|
| 1 | Luna dorada junto al nombre en la cabecera | `.brand` solo con texto |
| 2 | Luna decorativa en la portada | Portada solo con h1, eslogan y botón |
| 3 | Escritorio: ilustración de taza junto al título | No existe |
| 4 | Icono de taza (Bebidas) y de pastel (Postres) en las tarjetas | h3 solo con texto |
| 5 | Línea de puntos entre producto y precio | Rejilla nombre/precio con separador sólido entre filas |
| 6 | Títulos de sección centrados con una línea a cada lado | h2 alineados a la izquierda, sin líneas |
| 7 | Icono de calendario (horario) y de ubicación (dirección) | h3 "Horario" y "Dirección" solo con texto |
| 8 | Logo de WhatsApp en los botones de reserva | Bocadillo genérico (`CHAT_ICON_PATH`) |
| 9 | Pie oscuro con la luna | Pie oscuro ya existe (`footer-bg`), sin luna |

## Objetivo
Acercar la página al boceto aprobado añadiendo **solo decoración**: los nueve gráficos/estilos de la tabla, como SVG ligeros y
decorativos hechos en el código (o pseudo-elementos CSS), con colores de los tokens. No cambia ningún texto, dato, enlace, nombre
accesible, orden de foco ni estructura de encabezados, y se mantienen AA, foco visible, 44 px y Lighthouse móvil ≥ 90.

## Criterios de aceptación

### Gráficos SVG (reglas comunes)
- **CA-1 — Módulo único de iconos.** Dado el nuevo `src/sections/icons.ts`, cuando se llama a su función pública con cada nombre
  `moon`, `cup`, `cake`, `calendar`, `pin`, `whatsapp` y `cup-art` (ilustración de escritorio), entonces devuelve un `SVGSVGElement`
  creado con `createElementNS("http://www.w3.org/2000/svg", …)` que:
  (a) tiene `aria-hidden="true"`, `focusable="false"` y `viewBox`;
  (b) no contiene `<title>`, `<desc>`, `<text>`, `<image>`, `<use>`, `<foreignObject>` ni `<script>`, ni atributos `href`,
  `xlink:href`, `style` u `on*`;
  (c) en todo su árbol, los atributos `fill` y `stroke` valen solo `currentColor` o `none` (cualquier otro color se pone desde CSS
  con `var(--…)`);
  (d) su `textContent` es la cadena vacía.
  Además, el código fuente de `icons.ts` no contiene literales de color (`#rgb`, `#rrggbb`, `rgb(`, `hsl(`), ni `innerHTML`,
  `outerHTML`, `insertAdjacentHTML` o `DOMParser`, y mide ≤ 200 líneas. Comprobable con `src/sections/icons.test.ts`.
- **CA-2 — Inventario en la página montada.** Dada la página montada como en `a11y.test.ts`, cuando se cuentan los `<svg>`,
  entonces hay **exactamente 10**: 1 en `.brand`, 2 en `#inicio` fuera del botón (luna y taza de escritorio), 2 en `#menu` (uno en
  cada h3), 2 en `#horario` (uno en cada h3), 1 en cada botón de WhatsApp y 1 en el `<footer>`; los 10 cumplen CA-1 (a)–(d). No hay
  ningún `<img>`, `<picture>` ni `<object>` nuevo, y ni `index.html` ni `src/**` (salvo tests) contienen `data:image`, `.png`,
  `.jpg`, `.webp`, `url(` en CSS ni la palabra `boceto`. `public/` no gana archivos. (Gráficos hechos en el código, nunca copiados
  del boceto.)

### Cabecera y portada
- **CA-3 — Luna en la cabecera.** Dado `index.html`, cuando se lee `header .brand`, entonces su primer hijo es un `<svg
  class="brand__icon">` estático (luna creciente) seguido del texto; `text(.brand)` sigue siendo exactamente "Cafetería Luna" y su
  `href` `#inicio` (page.test CA-3 pasa sin cambios). `header.css` gana solo la regla `.brand__icon` (tamaño en `em` o tokens,
  `flex: none`, `color: var(--color-secondary)`); las reglas `.brand`, `.brand:focus-visible` y el bloque `@media (min-width: 768px)`
  quedan idénticas (split.test CA-4 y CA-6 pasan sin cambios; D-12).
- **CA-4 — Luna en la portada.** Dado `renderHero(content, url)`, cuando se inspeccionan sus hijos, entonces hay un `<svg
  class="hero__moon">` antes del `<h1>`, y los hijos **que no son SVG** son exactamente `H1, P, A` en ese orden, con el mismo
  texto, `id="inicio-titulo"`, `href` y clase `btn--whatsapp` que hoy. `hero.test.ts` CA-7 se actualiza solo para ignorar los
  `svg[aria-hidden="true"]` al comprobar el orden; CA-8 (texto literal, sin `<img>`) pasa sin cambios. La luna se pinta con
  `var(--color-secondary)` desde `hero.css`.
- **CA-5 — Taza de escritorio.** Dado `renderHero`, cuando se monta, entonces incluye un `<svg class="hero__art">` (taza con
  platillo y vapor, y opcionalmente una luna u hojas) con colores solo de tokens (`--color-primary`, `--color-secondary`,
  `--color-surface`, `--color-border`, `--color-text-muted`) aplicados por clases desde `hero.css`. En `hero.css`, `.hero__art` tiene
  `display: none` a nivel base y se muestra en `@media (min-width: 768px)`, donde la portada pasa a dos columnas: texto (luna, h1,
  eslogan, botón) a la izquierda y la taza a la derecha. Con la evidencia (CA-16): a 375×812 la taza no se ve y el botón de WhatsApp
  queda entero dentro de la primera pantalla (CA-01.1/01.2); a 768 y 1024 px la taza se ve a la derecha del título y h1, eslogan y
  botón siguen en la primera pantalla.

### Menú
- **CA-6 — Iconos de taza y pastel.** Dado `renderMenu`, cuando se leen los grupos, entonces el `<h3>` de Bebidas empieza con el
  icono `cup` y el de Postres con `cake` (`class="menu__icon"`), y `h3.textContent` sigue siendo exactamente "Bebidas" y "Postres"
  (menu.test CA-5 y main.test pasan sin cambios). En `menu.css`, `.menu__title` alinea icono y texto en fila (`gap` con token) y
  `.menu__icon` usa `color: var(--color-primary)`.
- **CA-7 — Líneas de puntos entre producto y precio.** Dada una fila del menú, cuando se ve a 375, 768 y 1024 px, entonces entre el
  nombre y el precio hay una línea de puntos decorativa que rellena el hueco, hecha **solo con CSS** en `menu.css` (estilo `dotted`
  y color `var(--…)`; p. ej. un `::after` flexible del `dt`). El DOM no cambia: cada fila sigue siendo `div.menu__item > dt + dd`,
  sin elementos ni caracteres nuevos (`dt`/`dd` conservan su `textContent`). Se quita el separador sólido entre filas
  (`.menu__item + .menu__item { border-top }`), como en el boceto móvil. Con un nombre largo (CA-02.3) el nombre se parte en varias
  líneas, el precio sigue en una línea y dentro de la tarjeta; la línea de puntos puede acortarse o desaparecer. styles.test
  T-20261115-002 CA-13 pasa sin cambios.

### Títulos de sección
- **CA-8 — Líneas decorativas a los lados de los h2.** Dados los `h2` de `#menu`, `#horario` y `#reservar`, cuando se ven, entonces
  el texto está centrado y tiene una línea horizontal decorativa a cada lado, hecha con `main > section h2::before` y `::after`
  (`content: ""`, borde o fondo con `var(--color-primary)`) en `main.css`. Las líneas pueden encogerse hasta desaparecer
  (`min-width: 0`) y nunca provocan scroll horizontal; a 375 px "Horario y ubicación" cabe o se parte en dos líneas sin
  desbordar. El `textContent` de los h2 y sus `id`/`aria-labelledby` no cambian (page.test CA-2 pasa sin cambios). El `h1` de la
  portada no lleva líneas.

### Horario y ubicación
- **CA-9 — Iconos de calendario y ubicación.** Dado `renderLocation`, cuando se leen los `<h3>`, entonces "Horario" empieza con el
  icono `calendar` y "Dirección" con `pin` (`class="location__icon"`, `color: var(--color-primary)` desde `location.css`), y
  `h3.textContent` sigue siendo exactamente "Horario" y "Dirección". En `location.ts` solo cambian `createTitle` y sus dos llamadas;
  `MAP_URL_PREFIX`, `DIRECTIONS_URL_PREFIX`, `MAP_SANDBOX`, `MAP_TITLE`, los atributos del iframe, los guardas y el enlace "Cómo
  llegar" quedan idénticos, y `src/lib/maps.ts` no aparece en el diff (D-10). `location.test.ts` y `location.guards.test.ts` pasan
  sin cambios.

### Botones de reserva
- **CA-10 — Logo de WhatsApp.** Dado `createReserveButton(url)`, cuando se crea, entonces su primer hijo es el icono `whatsapp` de
  `icons.ts` (glifo reconocible de WhatsApp: bocadillo redondo con auricular, monocromo, dibujado en el código) con clase
  `btn__icon`, en `currentColor` (`on-whatsapp` sobre `whatsapp`, 6.47:1). `href`, guarda `https://wa.me/`, `target`, `rel`,
  `aria-label`, texto visible y la clase `btn btn--whatsapp` no cambian; `CHAT_ICON_PATH` y `createChatIcon` desaparecen de
  `reserve.ts`. `reserve.test.ts` y a11y CA-4 pasan sin cambios; `src/lib/whatsapp.ts` no aparece en el diff; los dos botones
  siguen apuntando a la misma URL (main.test).

### Pie
- **CA-11 — Pie oscuro con la luna.** Dado `index.html`, cuando se lee el `<footer>`, entonces contiene un `<svg
  class="site-footer__moon">` estático (luna creciente) en `var(--color-secondary)` (9.75:1 sobre `footer-bg`), junto al nombre;
  el pie conserva `background: var(--color-footer-bg)` y `color: var(--color-footer-text)`, y el aviso de D-00 es exactamente el
  de hoy (page.test CA-5 pasa sin cambios). Las nuevas reglas viven en `footer.css`.

### Accesibilidad, estilos y decisiones (no regresión)
- **CA-12 — Foco y zonas táctiles sin cambios.** Dada la página montada, cuando se listan los enfocables (sin el iframe), entonces
  son **exactamente 8**, en este orden y con estos nombres: "Saltar al contenido", "Cafetería Luna", "Menú", "Horario y
  ubicación", "Reservar", "Reservar mesa por WhatsApp (se abre…)" de `#inicio`, "Cómo llegar (se abre…)" y "Reservar mesa por
  WhatsApp (se abre…)" de `#reservar`. Ningún SVG ni pseudo-elemento es enfocable; no se añade `tabindex`. `a11y.test.ts` pasa sin
  cambios; las únicas reglas `:focus-visible` siguen siendo las tres de D-12 y la única que quita el contorno es `main:focus`.
- **CA-13 — Estilos por archivo y puertas de estilo.** Dados `src/styles/*.css`, entonces: (a) no se crea ningún archivo CSS nuevo y
  `src/main.ts` no cambia (CA-11 de split.test pasa); (b) cada regla nueva vive en el archivo de su sección (`main.css`,
  `header.css`, `hero.css`, `footer.css`, `menu.css`, `location.css`); `buttons.css`, `reserve.css` y `tokens.css` no cambian;
  (c) la tabla `SPLIT` de `split.test.ts` solo **gana** los selectores nuevos (p. ej. `main > section h2::before`,
  `main > section h2::after`, `.brand__icon`, `.hero__moon`, `.hero__art` y sus partes, la regla de dos columnas de `.hero__content`
  a 768 px, `.site-footer__moon`); ningún selector existente se borra, se mueve de archivo ni cambia de contexto; (d) cada archivo
  ≤ 200 líneas y sin literales de color (split CA-8); (e) ningún `.ts` de `src/` que no sea test contiene `innerHTML`, `outerHTML`,
  `insertAdjacentHTML` ni `DOMParser` (D-04).
- **CA-14 — Sin recursos de terceros nuevos.** Dado el diff de la rama, entonces `index.html` no gana `<link>` ni `<script>`
  externos, ningún archivo contiene `fonts.googleapis.com` ni `fonts.gstatic.com`, y `package.json`, `package-lock.json`,
  `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `src/data/business.ts`, `src/lib/whatsapp.ts`, `src/lib/maps.ts` y
  `src/main.ts` no aparecen en el diff.
- **CA-15 — Puertas.** Dado el worktree, cuando se ejecuta `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261117-001`
  desde la raíz de la fábrica, entonces `lint`, `typecheck`, `test` y `build` pasan.

### Comprobación visual (estación de evidencia)
- **CA-16 — Evidencia y Lighthouse.** Dada la rama construida, cuando se ejecuta desde la raíz de la fábrica
  `node scripts/evidencia.mjs cafeteria-luna T-20261117-001 --ronda 1 --lighthouse`, entonces en
  `tareas/T-20261117-001/evidencia-ronda1/evidencia.json`:
  (a) a 375, 768 y 1024 px `desbordaHorizontal` es `false` y las listas `fuera` y `cortado` están vacías;
  (b) ningún enfocable tiene `menor44: true`;
  (c) el recorrido con Tab a 375 px tiene los 8 elementos de CA-12, cada uno con contorno de foco visible;
  (d) no hay errores de consola;
  (e) la mediana de Lighthouse móvil es ≥ 90 en rendimiento y ≥ 90 en accesibilidad.
- **CA-17 — Parecido con el boceto.** Dadas las capturas `pagina-375.png` y `pagina-1024.png` de la evidencia, cuando el revisor de
  UI las compara con `aprobado-movil.png` y `aprobado-escritorio.png`, entonces se ven, en este orden: cabecera con luna dorada +
  "Cafetería Luna"; portada con luna dorada y, en 1024, la taza a la derecha del título; Menú con título centrado entre dos líneas y
  tarjetas Bebidas (taza) y Postres (pastel) con puntos entre producto y precio; Horario y ubicación con título entre líneas e iconos
  de calendario y ubicación; Reservar con título entre líneas y botón verde con el logo de WhatsApp; pie oscuro con luna dorada. La
  paleta es la de los tokens (crema, marrón, dorado, verde WhatsApp). No se exige igualdad al píxel y los textos son los del brain.

## Plan
1. `src/sections/icons.ts` + `icons.test.ts` (CA-1): una función `createIcon(name, className?)` con los trazados como constantes y
   `createElementNS`; `cup-art` puede tener partes con clase para colorearlas desde CSS. Primero el test (TDD).
2. Tests de las secciones en rojo: `hero.test.ts` (CA-4/5, ajuste del orden ignorando SVG decorativos), `menu.test.ts` (CA-6/7),
   `location.test.ts` (CA-9), test de inventario y enfocables en `a11y.test.ts` o un `decor.test.ts` nuevo (CA-2, CA-12),
   `page.test.ts` (CA-3, CA-11).
3. `src/sections/menu.ts` (iconos en h3) y `src/styles/menu.css` (icono, puntos guía, quitar separador).
4. `src/sections/location.ts` (solo `createTitle`) y `src/styles/location.css` (`.location__icon`, título en fila).
5. `src/sections/reserve.ts` (sustituir el bocadillo por `createIcon("whatsapp", "btn__icon")`).
6. `src/sections/hero.ts` (luna + `cup-art`) y `src/styles/hero.css` (colores, ocultar taza en móvil, dos columnas desde 768 px).
7. `index.html` (SVG estático de la luna en `.brand` y en el pie; mismos atributos de CA-1) + `header.css` y `footer.css`.
8. `src/styles/main.css` (h2 centrados con `::before`/`::after`) y ampliar `SPLIT` en `src/styles/split.test.ts` (CA-13 c).
9. `verificar.mjs` (CA-15) y `evidencia.mjs … --ronda 1 --lighthouse` (CA-16); dejar el resumen en el rastro para el revisor (CA-17).

## Fuera de alcance
Diferencias del boceto que **no** pide la entrada (la entrada lista seis cambios y dice "sin cambiar contenido ni datos"); quedan
como propuestas para otra tarea:
- **Portada centrada en móvil** (el boceto móvil centra luna, título, eslogan y botón) y **eslogan en cursiva y color primario**:
  cambian la composición y el tono del texto, no solo decoran; tocar CA-01 merece su propia tarea y evidencia.
- **Taza pequeña con líneas bajo el eslogan (móvil)** y **fondo ondulado** de la portada de escritorio: no están en la entrada y
  añaden altura en móvil, con riesgo para CA-01.2 (botón sin hacer scroll).
- **"Reservar" de escritorio en una fila** (título | separador vertical | texto | botón a la derecha): es un cambio de maquetación
  de la sección, no decoración.
- **Insignias "Ejemplo" en las tarjetas del menú**, sufijos "(ejemplo)" en precios y horarios, y los textos del boceto ("Aparta tu
  mesa…", "Datos de ejemplo para la demo", "Dirección de ejemplo · colonia por confirmar"): son contenido; mandan los textos del
  brain y el aviso de D-00 del pie.
- **Filas alternas (cebra) del horario** y **tarjeta que envuelve dirección + mapa + "Cómo llegar"** con el mapa como tarjeta:
  cambios de estilo de `location` que no pide la entrada; el mapa no se toca (D-10).
- **Nav corta "Horario" en móvil y nav con puntos separadores en una sola fila**: cambia un texto visible (page.test CA-3) y la
  cabecera de dos filas de D-08.
- **Tipografía Fraunces/DM Sans desde Google Fonts**: hueco abierto (recurso de terceros, privacidad y Lighthouse); se mantienen los
  fallbacks del sistema. No bloquea esta tarea.

## Riesgos / zonas sensibles que toca
- **Zonas sensibles tocadas (requieren aprobación humana):** `index.html` (SVG estáticos de cabecera y pie), `src/sections/hero.ts`
  (decoración de la portada; el botón se sigue creando con `createReserveButton`), `src/sections/reserve.ts` (solo el icono del
  botón), `src/sections/location.ts` (solo los títulos; D-10 intacto).
- **No se tocan:** `src/data/business.ts`, `src/lib/whatsapp.ts`, `src/lib/maps.ts`, `src/main.ts`, `tokens.css`, `buttons.css`,
  `reserve.css`, dependencias ni configuración (CA-14).
- **Embudo de reservas:** cambiar el icono en `reserve.ts` no debe alterar URL, guarda ni nombre accesible (CA-10); los tests
  existentes de `reserve`, `whatsapp` y `main` deben pasar sin editarlos.
- **Portada en móvil:** la luna añade altura; la taza va oculta por debajo de 768 px. Si a 375×812 el botón sale de la primera
  pantalla, reducir la luna antes que tocar los tokens (CA-5, CA-16).
- **Tests que se editan a propósito:** `hero.test.ts` CA-7 (ignorar SVG decorativos al comprobar el orden) y `split.test.ts` (solo
  añadir selectores a `SPLIT`). Cualquier otro test existente que haya que cambiar es señal de regresión.
- **Conflicto menor diseño ↔ boceto:** `diseno.md` (patrón Sección) pide una luna junto al h2; el boceto aprobado y la entrada piden
  líneas a los lados. Manda el boceto; al cerrar, el diseñador debería actualizar ese párrafo de `diseno.md`.
- **D-12:** la luna dentro de `.brand` no cambia su padding, margen, altura ni la regla de foco; el anillo hacia dentro cae sobre
  el padding de 8 px, no sobre el icono.
- **Marca de WhatsApp:** el glifo es un dibujo propio, monocromo y simplificado, usado solo para señalar el enlace a WhatsApp; no se
  descarga ni se copia ningún archivo de logotipo.
