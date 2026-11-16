# Decisiones

Lo que está aquí ya se decidió. No se rediscute sin una decisión humana nueva.

<!--
## D-01 · <título> (AAAA-MM-DD · origen: T-xxxx)
- Contexto:
- Decisión:
- Alternativas descartadas:
- Consecuencias:
-->

## D-00 · Datos de negocio de ejemplo para la demo (2026-11-14 · origen: humano)
- Contexto: los datos reales del negocio están en huecos.md y aún no se conocen.
- Decisión: mientras tanto se usan datos ficticios claramente marcados (precios en MXN, horario y dirección de ejemplo, WhatsApp +52 000 000 0000). Se guardan en un único archivo de datos para sustituirlos fácilmente.
- Consecuencias: el sitio no se publica hasta resolver los huecos que bloquean la publicación.

## D-01 · Stack: Vite + TypeScript sin framework (2026-11-14 · origen: arquitecto)
- Contexto: landing de una sola página, sin backend ni estado. `estandares/stack.md` indica para
  sitios de una página "HTML + CSS + JS sin framework", y a la vez exige las puertas `lint`,
  `typecheck`, `test` y `build` vía `npm run` en todo proyecto con `package.json`.
- Decisión: **Vite** como servidor de desarrollo y build estático, con **TypeScript vanilla** (sin
  framework de UI). Es lo mínimo que mantiene la regla "sin framework" y da las cuatro puertas.
  TypeScript tipa el archivo de datos (D-00): al sustituir los datos ficticios por los reales, un
  campo mal escrito falla en `typecheck` en vez de en producción.
- Alternativas descartadas: HTML/CSS/JS sin `package.json` (`verificar.mjs` no ejecutaría ninguna
  puerta y no habría TDD); Astro + Tailwind (más configuración y conceptos para una sola página);
  Vite + React (framework innecesario: no hay interactividad); JS sin TypeScript (se perdería la
  puerta `typecheck` y la validación del archivo de datos).
- Consecuencias: el estándar de estilo "un componente por archivo en `PascalCase.tsx`" no aplica;
  cada sección es un módulo `camelCase.ts` en `src/sections/` que devuelve un `HTMLElement`.

## D-02 · Estilos con CSS plano y custom properties, sin Tailwind (2026-11-14 · origen: arquitecto)
- Contexto: pocos estilos, una sola página y el objetivo de Lighthouse ≥ 90.
- Decisión: CSS plano, mobile-first. Los tokens de `diseno.md` se declaran como custom properties en
  `src/styles/tokens.css` y el resto de CSS solo usa `var(--…)`.
- Alternativas descartadas: Tailwind CSS (dependencia y configuración extra para muy poco CSS).
- Consecuencias: el **diseñador** entrega los tokens como bloque `:root { --… }` listo para copiar en
  lugar del bloque `theme.extend` de Tailwind.

## D-03 · Puertas de calidad (2026-11-14 · origen: arquitecto)
- Decisión: `lint` = ESLint 9 (flat config) + typescript-eslint; `typecheck` = `tsc --noEmit`;
  `test` = `vitest run` con entorno **jsdom**; `build` = `vite build`. Pruebas junto al código
  (`*.test.ts`).
- Alternativas descartadas: happy-dom (menos fiel para pruebas de accesibilidad); Playwright en las
  puertas (pesado para esta fase; Lighthouse y el ancho de 375 px se verifican en la tarea 006).
- Consecuencias: CA-05.3 (Lighthouse) no es automatizable en `npm run` y se verifica manualmente
  sobre `npm run preview`, dejando el informe en el rastro de la tarea.

## D-04 · Renderizado: esqueleto estático + datos pintados en cliente (2026-11-14 · origen: arquitecto)
- Contexto: D-00 exige que todos los datos del negocio vivan en un único archivo.
- Decisión: `index.html` contiene la estructura estática (landmarks, navegación, encabezados de
  sección, textos fijos). `src/main.ts` lee `src/data/business.ts` y monta el contenido de cada
  sección con funciones `datos → HTMLElement` que usan `textContent`/`setAttribute` (nunca
  `innerHTML` con datos).
- Alternativas descartadas: datos copiados en el HTML (rompe D-00); prerender en build con un plugin
  de Vite (más complejo; queda como plan B si Lighthouse móvil baja de 90).
- Consecuencias: sin JavaScript la página muestra la estructura pero no los datos; aceptable para el
  público objetivo (móvil moderno).

## D-05 · Integraciones sin claves: WhatsApp, OpenStreetMap y Google Maps URLs (2026-11-14 · origen: arquitecto)
- Decisión: reserva con enlace `https://wa.me/<dígitos>?text=<mensaje codificado>`; mapa con iframe
  de OpenStreetMap con marcador y `loading="lazy"`; "Cómo llegar" con
  `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
- Alternativas descartadas: iframe de Google Maps (más pesado y con cookies de terceros); API de
  WhatsApp Business (innecesaria: no hay reservas propias, ver spec "No entra"); URI `geo:` (no
  funciona en iOS ni escritorio).
- Consecuencias: no hay secretos ni `.env`. Las coordenadas también son datos del negocio y van en
  `business.ts` (hueco añadido en `huecos.md`).

## D-06 · Formato de precio (2026-11-14 · origen: arquitecto, deriva de D-00)
- Decisión: los precios se guardan como número y se formatean en un único sitio
  (`src/lib/formatPrice.ts`) con `Intl.NumberFormat(business.locale, { style: "currency",
  currency: business.currency })`; hoy `es-MX` / `MXN`.
- Consecuencias: si el hueco de moneda se resuelve con otra moneda, solo cambian `locale` y
  `currency` en `business.ts`.

## D-07 · Versiones y TypeScript estricto (2026-11-14 · origen: T-20261114-001)
- Decisión: vite 7 + vitest 3 + typescript 5 + eslint 9 (por compatibilidad con typescript-eslint 8), versiones fijadas en package-lock.json; instalar con `npm ci`. tsconfig añade noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, verbatimModuleSyntax e isolatedModules sobre `strict`.
- Pendiente de decisión humana: pasar a ESLint 10 (npm avisa que la 9 ya no tiene soporte).

## D-08 · Cabecera, foco y botón de WhatsApp (2026-11-15 · origen: T-20261115-001)
- Decisión: por debajo de 768 px la cabecera sticky ocupa dos filas (marca a `--header-height`,
  navegación a `--tap-min`); `scroll-margin-top` y la altura de la portada restan
  `header-height + tap-min` en móvil y solo `header-height` desde 768 px.
- El hover del botón de WhatsApp lo oscurece ~10 % con
  `color-mix(in srgb, var(--color-whatsapp) 90%, var(--color-text))`; su altura mínima es `var(--space-7)` (48 px).
- `main#contenido` lleva `tabindex="-1"` sin contorno de foco, para que "Saltar al contenido" mueva
  el foco sin dibujar un anillo alrededor de toda la página.
- Pendiente: `main.css` mide 317 líneas (guía ~200); dividirlo en la tarea 006.

## D-09 · Sección Menú y orden de montaje (2026-11-15 · origen: T-20261115-002)
- Marcado: cada grupo es un `<div>` con `<h3>` y `<dl>`; cada producto, un `<div>` con `<dt>` (nombre)
  y `<dd>` (precio). Grupos en `<div>`, no `<section>`, para no añadir landmarks.
- `formatPrice(price, locale, currency)` es pura (implementa D-06) y lanza Error si el precio no es
  finito o es negativo, en vez de pintar `$NaN`. `renderMenu` la importa; `main.ts` le pasa
  `business.menu`, `business.locale` y `business.currency`.
- Los estilos de cada sección nueva van en su propio archivo (`src/styles/menu.css`), importado en
  `main.ts` después de `main.css`; rejilla de 2 columnas desde 768 px con
  `repeat(2, minmax(0, 1fr))` y `align-items: start`.
- `mount()` construye todo lo que puede fallar (URL de reserva, menú, futuras secciones) antes de
  pintar nada: o se pinta la página entera o no se pinta nada.

## D-10 · Mapa y "Cómo llegar" (2026-11-15 · origen: T-20261115-003, concreta D-05)
- Las URLs se construyen solo en `src/lib/maps.ts` con `toFixed(6)`; bbox de OSM oeste,sur,este,norte
  con d = 0.005°; una coordenada inválida lanza Error. Se comprueba el prefijo antes de usar cada URL.
- iframe: `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"` (OSM pide Referer),
  `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`; sin `allow`,
  `allowfullscreen` ni navegación del documento superior. El embed de OSM hoy usa MapLibre GL
  (WebGL + worker `blob:`), que necesita `allow-same-origin` (seguro: el iframe es de otro origen).
  Ampliar permisos requiere decisión humana.
- Limitación conocida: `loading="lazy"` no garantiza que no se contacte a OSM sin hacer scroll
  (Chrome precarga a ~1300 px); las teselas sí esperan al scroll.
- Horario en `<table>` con `th scope="row"`, horas en 24 h ("08:00 a 20:00"), cerrado = "Cerrado".
- `.btn--secondary` vive en `location.css` hasta que la tarea 006 divida `main.css`.

## D-11 · Estilos divididos, zonas táctiles y Lighthouse (2026-11-15 · origen: T-20261115-004, cierra pendientes de D-08 y D-10)
- `main.css` se divide en `main.css` (base), `header.css`, `buttons.css` (incluye `.btn--secondary`),
  `hero.css`, `reserve.css` y `footer.css`; `main.ts` los importa en ese orden, antes de `menu.css` y
  `location.css`. Ningún archivo de estilo pasa de ~200 líneas.
- `.nav-link` y `.btn` llevan `min-width: var(--tap-min)` además de la altura mínima. Todo elemento
  enfocable nuevo debe usar una de las clases que vigila `src/a11y.test.ts` (CA-5).
- Lighthouse móvil: 3 ejecuciones sobre el build y se toma la mediana; umbral ≥ 90 en rendimiento y
  accesibilidad. Línea base: 100/100 (Lighthouse 12.8.2, Chrome 157, fuentes del sistema). Repetir si
  se cargan fuentes externas y antes de publicar.
- Excepción pendiente de decisión humana (huecos.md): los controles internos del mapa de OSM
  (+/− 29×29 px, atribución 14 px de alto) no llegan a 44 px y no se pueden estilar.

## D-12 · Excepción de foco en la marca (2026-11-15 · origen: T-20261115-005)
- `.brand:focus-visible` usa `outline-offset: -3px` porque su caja empieza en el borde superior de la
  ventana (cabecera sticky) y el anillo exterior quedaba recortado. Grosor, estilo y color siguen
  siendo los globales; el anillo cae sobre `--color-surface` (6.97:1). Si la marca recibe algún día
  un fondo `primary`, revisar esta excepción.
- `.brand` lleva `padding-inline: var(--space-2)` compensado con `margin-inline: calc(-1 * var(--space-2))`:
  el texto no se mueve en reposo, queda holgura entre anillo y texto y la zona clicable crece 8 px por lado.
- Solo existen tres reglas `:focus-visible`: la global, la del pie y la de `.brand` (lo vigila `split.test.ts`, CA-4d).
