# Constructor · T-20261115-001 · ronda 1 (claude opus)

Las cuatro puertas pasan. Commit **3ae0362** en `fabrica/T-20261115-001`: "esqueleto de la página, cabecera sticky con navegación, portada y sección Reservar con tokens de diseño". No hice merge ni push y no toqué `app/`. El worktree queda limpio.

## Archivos
Modificados:
- `index.html`: el `<head>` queda igual. Añadí `header.site-header`, con el enlace de salto, la marca que apunta a `#inicio` y `nav[aria-label="Principal"] > ul` con 3 enlaces. Después `main#contenido` (`tabindex="-1"` para que el enlace de salto mueva el foco), que contiene `section#inicio` vacía (`aria-labelledby="inicio-titulo"`) y `#menu`, `#horario` y `#reservar`, cada una con su `<h2 id="…-titulo">` estático. Por último `footer` con el nombre y el aviso de D-00. No hay `<h1>`.
- `src/main.ts`: exporta `mount(doc)`. Primero busca `#inicio` y `#reservar h2`; si falta alguno lanza un Error con el selector antes de pintar nada. Calcula `buildWhatsAppUrl(...)` **una sola vez**, añade `renderHero` a `#inicio` y coloca `renderReserve` justo después del `<h2>` de Reservar. Al final del módulo llama a `mount(document)`. Los imports de CSS siguen en el mismo orden.
- `src/styles/tokens.css`: el bloque "Tokens CSS" de `diseno.md` copiado tal cual.
- `src/styles/main.css`: mobile-first y solo con `var(--…)`, detallado más abajo.
- `src/project.test.ts`: solo cambié "CA-4" y "CA-5" (CA-13). Borré el helper `stripCssComments`, que solo usaba CA-5; si se queda, `noUnusedLocals` rompe `typecheck`.

Nuevos:
- `src/sections/reserve.ts`: `createReserveButton(url)` exige el prefijo `https://wa.me/` y si no lo tiene lanza un Error. El icono SVG se crea con `createElementNS`, con `aria-hidden` y `focusable="false"`, y va antes del `<span>` de texto. El enlace lleva las clases `btn btn--whatsapp`. También exporta `renderReserve(url)`, que devuelve `div.reserve > p + botón`.
- `src/sections/hero.ts`: `renderHero({ name, slogan }, url)` devuelve `div.hero__content.container > h1#inicio-titulo + p + botón`. Reutiliza `createReserveButton`, así que el botón se construye en un único sitio. No importa `business`.
- Pruebas: `src/page.test.ts`, `src/sections/reserve.test.ts`, `src/sections/hero.test.ts`, `src/main.test.ts` y `src/styles/styles.test.ts`.

No han cambiado `business.ts`, `whatsapp.ts`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json` ni `eslint.config.js`. No se añadió ninguna dependencia.

## CA → prueba (rojo → verde)
Hubo dos fases de rojo. En la A el módulo o la estructura no existían. En la B había un stub deliberadamente incorrecto o una mutación temporal, para ver fallar las aserciones.

| CA | Prueba | Rojo → verde |
|---|---|---|
| CA-1 | page.test.ts › "keeps lang, title…" y "has exactly header, main#contenido and footer…" | La segunda pasó de rojo a verde. La primera es de conservación y ya estaba en verde, porque el `<head>` existía. |
| CA-2 | page.test.ts › "sections inicio, menu, horario, reservar", "static <h2> referenced by aria-labelledby", "#inicio → inicio-titulo, no <h1>" | rojo → verde |
| CA-3 | page.test.ts › "skip link as the first focusable element", "brand link to #inicio not a heading", "nav[aria-label=Principal] with exactly…" | rojo → verde |
| CA-4 | page.test.ts › "every href starting with # resolves…" (≥ 5 anclas) | rojo → verde |
| CA-5 | page.test.ts › "contains Cafetería Luna and the exact notice" | rojo → verde |
| CA-6 | reserve.test.ts › texto y aria-label exactos, target y rel, SVG decorativo primero, clase `btn--whatsapp`, y `it.each` con 5 URL inválidas que lanzan Error (`javascript:alert(1)`, `""`, `http://wa.me/52`, `https://evil.example/https://wa.me/`, `" https://wa.me/52"`) | A (no existía `./reserve`) → B (stub: 9/9 en rojo) → verde |
| CA-7 | hero.test.ts › "renders <h1>, <p>, button and nothing else before it", "h1 id inicio-titulo" | A → B → verde |
| CA-8 | hero.test.ts › "shows HTML literally and creates no <img>" | A → B → verde. Además hice una mutación: con `innerHTML` en hero.ts la prueba falla. |
| CA-9 | reserve.test.ts › "reserve text followed by the reserve button" | A → B → verde |
| CA-10 | main.test.ts › "#inicio h1/slogan y un único <h1>", "texto y botón tras el <h2> de #reservar", "exactamente dos botones con el mismo href de buildWhatsAppUrl (wa.me/520000000000?text=…, fecha/hora/personas)" | rojo (main.ts sin montaje) → verde |
| CA-11 | main.test.ts › "import lanza nombrando #reservar", "mount() lanza nombrando #inicio sin pintar nada" | rojo → verde |
| CA-12 | main.test.ts › 3 archivos sin `innerHTML`/`outerHTML`/`insertAdjacentHTML`, y hero/reserve sin eslogan, número, mensaje ni import de `business` | Es una prueba de guarda: pasó en verde desde el principio. El rojo lo comprobé con una mutación temporal en hero.ts (`innerHTML` + `import { business }`), que hizo fallar 2 pruebas, y después restauré el archivo. |
| CA-13 | project.test.ts › "CA-4: index.html has the page skeleton" y "CA-5: base source files" (ya no exige CSS vacío). CA-1, 2, 3, 6 y 7 quedan sin tocar y en verde. | El CA-4 nuevo pasó de rojo a verde. |
| CA-14 | styles.test.ts › las 47 custom properties de `:root` con su valor exacto (incluidos los 18 `--color-*`, `--tap-min: 44px` y `--header-height: 56px`) y el bloque `@media (min-width: 768px)` con sus 7 redefiniciones | rojo → verde |
| CA-15 | styles.test.ts › sin literales de color, cabecera `position: sticky` + `top: 0`, `scroll-margin-top` con `var(--header-height)`, `:focus-visible` con `var(--color-focus)` y bloque `prefers-reduced-motion: reduce` | 4 pasaron de rojo a verde. "Sin literales de color" pasaba sin comprobar nada con el CSS vacío; lo verifiqué inyectando `#fff` y `rgba(` (las dos veces falla). |
| CA-16 | Comprobación manual, en la sección de abajo | ver abajo |
| CA-17 | `node scripts/verificar.mjs …` | ok. `business.test.ts` y `whatsapp.test.ts` pasan sin cambios. |

En total hay **71 pruebas en verde**: 31 previas y 40 nuevas. Se reparten en 8 archivos: project 8, business 13, whatsapp 10, page 10, reserve 10, hero 3, main 10 y styles 7.

## Puertas (CA-17)
Ejecuté `node scripts/verificar.mjs proyectos\cafeteria-luna\.worktrees\T-20261115-001` desde la raíz de la fábrica: **lint ok · typecheck ok · test ok · build ok**, sin ninguna `omitida`. El build pesa 2,10 kB de HTML, 5,85 kB de CSS y 2,96 kB de JS (sin gzip). Instalé con `npm ci` (D-07). No relajé reglas ni desactivé pruebas.

## CA-16 · Comprobación manual a 375×667
Hice `npm run build` y `vite preview` (puerto 4173) desde el worktree. Lo abrí en el navegador integrado de la app, que es Chromium, con el viewport emulado a **375×667**. Medí con `getBoundingClientRect` y `getComputedStyle` y tomé capturas, pero las capturas no están adjuntas en el rastro. No es un móvil físico. Además no se cargan Google Fonts (está fuera de alcance), así que se ven las fuentes de respaldo: Georgia para los títulos y Segoe UI para el cuerpo, porque es Windows. En un móvil real la fuente de respaldo cambia (Roboto o San Francisco) y los anchos pueden variar unos píxeles.

| Punto | Resultado | Medidas |
|---|---|---|
| (a) Nombre, eslogan y botón sin scroll | **OK** | h1 en y=300–348, eslogan en 364–393 y botón en 421–469, con un viewport de 667 px de alto. La portada mide `100svh − 56 − 44`. |
| (b) Sin scroll horizontal y la cabecera no se corta | **OK** | `scrollWidth` = 375 = `innerWidth`. La cabecera mide 101 px: 56 de la fila del nombre, 44 de la fila de navegación y 1 de borde. Los tres enlaces caben en una fila (el último termina en x=303 de 359 disponibles). |
| (c) Las anclas no quedan tapadas y la cabecera sigue arriba | **OK** | Al pulsar Menú, la sección queda en top=100 y el h2 en 148–184, con la cabecera en 0–101. Con Horario y ubicación, sección en 100 y h2 en 148. Con Reservar se llega al final de la página (scroll máximo 848): sección en 132 y h2 en 180. La cabecera queda en top=0 en todos los casos. |
| (d) Zonas táctiles ≥ 44 px y botones a ancho completo | **OK** | Los enlaces de navegación miden 44 px de alto (anchos 55, 149 y 74). Los dos botones de WhatsApp miden 48 px de alto y 343 px de ancho, que es el contenedor de 375 − 2×16. El enlace de salto, cuando tiene el foco, mide 173×44. |
| (e) El primer Tab va a "Saltar al contenido" y el anillo de foco se ve | **OK** | Con el primer Tab, el foco va a "Saltar al contenido", que se ve en (8,8) con outline `solid 3px rgb(31,78,140)` (#1F4E8C) y offset 3px. Los Tab siguientes pasan por la marca, Menú, Horario y ubicación, Reservar y los 2 botones, todos con `:focus-visible` y el mismo anillo. Al pulsar Enter en el salto, el foco va a `main` y el siguiente Tab cae en el botón de la portada. En la captura, el anillo del botón verde se dibuja fuera, sobre el fondo crema. |
| (f) wa.me en pestaña nueva con el mensaje legible | **Parcial** | Comprobé en el DOM servido que el enlace es `target="_blank"`, `rel="noopener noreferrer"`, host `wa.me` y ruta `/520000000000`, y que los dos botones tienen el mismo `href`. El texto decodificado es legible y sin doble codificación: "¡Hola, Cafetería Luna! Quiero reservar una mesa. ¿Me ayudas?⏎Fecha: ⏎Hora: ⏎Número de personas: ". **No abrí wa.me** (es un sitio externo), así que no está comprobado cómo lo muestra WhatsApp en el móvil ni en la web. |

Otras comprobaciones: la consola no tiene errores. A 1024×768 la cabecera ocupa una sola fila de 65 px (64 + borde), la nav queda a la derecha, el botón tiene ancho automático (320 px) y no hay scroll horizontal.

Nota para el humano sobre CA-16 (f), que viene de la sugerencia del aprobador de T-20261114-002: el mensaje termina en tres líneas "Fecha: ", "Hora: " y "Número de personas: " con el valor vacío. Se lee bien como plantilla para rellenar. No cambié `business.ts`, como pide la spec.

## Decisiones nuevas
Ninguna contradice el brain. Propongo registrar estas:
1. **Cabecera móvil en dos filas**: debajo de 768 px la cabecera tiene una fila de `--header-height` (56 px) para el nombre y otra de `--tap-min` (44 px) para la nav. Por eso, en móvil, `scroll-margin-top` vale `calc(var(--header-height) + var(--tap-min))` y la portada mide `100svh − header-height − tap-min`. Desde 768 px hay una sola fila y se usa solo `--header-height`. Es la opción "segunda fila" que recoge `diseno.md`; no hizo falta acortar el nombre a "Luna".
2. **Hover del botón de WhatsApp**: `color-mix(in srgb, var(--color-whatsapp) 90%, var(--color-text))`, es decir, oscurecerlo un 10 % mezclándolo con un token. Los navegadores sin `color-mix` mantienen el color base.
3. **Altura mínima del botón**: 48 px expresados como `var(--space-7)` (3rem), para no escribir el número a mano.
4. **`main` con `tabindex="-1"` y `main:focus { outline: none }`**: así el enlace de salto mueve el foco de verdad y no se dibuja un anillo alrededor de toda la página.
5. **`main.css` tiene 317 líneas**, por encima de la guía de ~200. Lo dejé en un único archivo porque CA-15 y `arquitectura.md` lo fijan como `main.css`. Propongo dividirlo (por ejemplo base / cabecera / secciones / botón con `@import`) en la tarea 006 o cuando crezca con Menú y Horario.

Riesgo esperado: ALTO. Toca `index.html` y `src/main.ts` y crea los botones de reserva (`hero.ts` y `reserve.ts`), que son zonas sensibles.
