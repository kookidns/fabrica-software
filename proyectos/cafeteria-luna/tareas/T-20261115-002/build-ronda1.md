# T-20261115-002 · Build · ronda 1

Constructor · rama `fabrica/T-20261115-002` · worktree `proyectos/cafeteria-luna/.worktrees/T-20261115-002`
**Commits (HEAD = `56807a6`):**
- `755cff8` — "T-20261115-002: sección Menú con bebidas y postres (formatPrice con Intl, renderMenu en <dl>, menu.css)"
- `56807a6` — "T-20261115-002: construir el menú antes de pintar (un precio inválido no deja la página a medias)"

## Archivos cambiados
| Archivo | Cambio |
|---|---|
| `src/lib/formatPrice.ts` | **Nuevo.** `formatPrice(price, locale, currency)`: pura, `Intl.NumberFormat(locale, { style: "currency", currency })`; lanza `Error` si el precio no es finito o es < 0. |
| `src/lib/formatPrice.test.ts` | **Nuevo.** CA-1 a CA-4 (12 tests). |
| `src/sections/menu.ts` | **Nuevo.** `renderMenu(menu, { locale, currency })` → `div.menu` > 2 × `div.menu__group` (`h3.menu__title` + `dl.menu__list` > `div.menu__item` > `dt.menu__name` + `dd.menu__price`). Solo `textContent`/`className`; tipos con `import type` (no importa el valor `business`). Una función auxiliar `renderGroup` para no duplicar código. |
| `src/sections/menu.test.ts` | **Nuevo.** CA-5 a CA-8 (8 tests). |
| `src/styles/menu.css` | **Nuevo.** Estilos mobile-first del menú, solo `var(--…)`. |
| `src/main.ts` | `import "./styles/menu.css"` tras `main.css`; `requireElement(doc, "#menu h2")` junto a los demás contenedores; el menú se **construye antes de pintar nada** (`const menu = renderMenu(business.menu, { locale, currency })`) y luego `menuHeading.after(menu)`. |
| `src/main.test.ts` | **Solo añadidos**: una línea `import { formatPrice }` y 3 `describe` nuevos (CA-9, CA-10, CA-12; 5 tests). Ningún test existente cambia (`git diff` sin líneas eliminadas). |
| `src/styles/styles.test.ts` | **Solo añadidos**: un helper `mediaBlock` y un `describe` nuevo (CA-13; 5 tests). Ningún test existente cambia. |

No cambian (comprobado con `git diff --stat`): `index.html`, `src/data/business.ts`, `src/lib/whatsapp.ts`,
`src/sections/hero.ts`, `src/sections/reserve.ts`, `src/styles/main.css`, `src/styles/tokens.css`,
`package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`.
Todos los archivos nuevos o tocados están en UTF-8 sin BOM.

## CA → prueba (rojo → verde)
| CA | Prueba (archivo › describe › test) | Rojo | Verde |
|---|---|---|---|
| CA-1 | `src/lib/formatPrice.test.ts` › "CA-1: formatPrice formats with Intl for es-MX / MXN" › 45 igual a Intl con `$` y `45`; 1250.5 igual a Intl | ✔ (no existía `./formatPrice`: el archivo de pruebas fallaba al importar) | ✔ |
| CA-2 | `formatPrice.test.ts` › "CA-2: the currency comes from the parameters" › es-ES/EUR igual a Intl y con `€` | ✔ (igual que CA-1) | ✔ |
| CA-3 | `formatPrice.test.ts` › "CA-3: invalid prices throw" › NaN, ±Infinity, -1, -0.01 lanzan; 0 es válido | ✔ (igual que CA-1; además, sin la guarda `Intl` devuelve `"NaN"` y no lanza, así que el test depende de la guarda) | ✔ |
| CA-4 | `formatPrice.test.ts` › "CA-4: formatPrice.ts source" › usa `Intl.NumberFormat` + `style: "currency"`; sin `es-MX`/`MXN`/`business`; sin `document`/`window` | ✔ (el archivo fuente no existía) | ✔ |
| CA-5 | `src/sections/menu.test.ts` › "CA-5: renderMenu returns the Bebidas and Postres groups" | ✔ (no existía `./menu`) | ✔ |
| CA-6 | `menu.test.ts` › "CA-6: each <dl> lists the products in order as <div><dt><dd>" › Bebidas / Postres (orden, `dt`=`item.name`, `dd`=`formatPrice(...)`, nº de `dt`) + usa el locale/moneda recibidos | ✔ | ✔ |
| CA-7 | `menu.test.ts` › "CA-7: product names are painted as text" › `<img src=x onerror=alert(1)>` literal, sin `<img>` | ✔ | ✔ |
| CA-8 | `menu.test.ts` › "CA-8: menu.ts source" › sin `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`Intl.NumberFormat`; importa `formatPrice` de `../lib/formatPrice`; no importa `business` ni contiene sus nombres de producto | ✔ | ✔ |
| CA-9 | `src/main.test.ts` › "T-20261115-002 CA-9: mounting fills #menu after its <h2>" › menú tras el `<h2>`, `h3` Bebidas/Postres, 7 `dt` con nombre y precio de `business`, 1 `<h1>`, 1 `<h2>` en `#menu`; `Café americano` → `formatPrice(45, …)` (`$45.00`) | ✔ (2 tests fallaban: nada tras el `<h2>`) | ✔ |
| CA-10 | `main.test.ts` › "T-20261115-002 CA-10: a missing #menu h2 fails before painting" › (1) `mount()` lanza con `#menu h2`; 0 `h1`, 0 `a.btn--whatsapp`, 0 `dl` en el documento roto. (2) Extra, mismo espíritu: con un precio `NaN` (mock de `business` con `vi.doMock`) la importación lanza y no queda pintado ni `h1`, ni botón, ni `dl` | (1) ✔ (no lanzaba). (2) ✔ contra `main.ts` de `755cff8`: "expected <h1 …> to have a length of +0 but got 1" (la portada ya estaba pintada) | ✔ |
| CA-11 | Toda la suite: los 71 tests previos siguen pasando sin modificarse (solo se añadieron casos) | — (es de no regresión) | ✔ 101/101 |
| CA-12 | `main.test.ts` › "T-20261115-002 CA-12: main.ts imports menu.css after main.css"; `main.css` sin cambios según `git diff` | ✔ (no había import) | ✔ |
| CA-13 | `src/styles/styles.test.ts` › "T-20261115-002 CA-13: menu.css only uses tokens and fixes the 375 px row" › sin literales de color; tarjeta con los 5 tokens; `dd` con `nowrap` + 700 + `primary`; `dt` con `min-width: 0` + `overflow-wrap: anywhere`; `@media (min-width: 768px)` con 2 columnas y `gap: var(--space-6)` | ✔ (primero ENOENT; después, con `menu.css` vacío, 4 de 5 tests fallaban; "sin literales de color" pasa trivialmente con el archivo vacío) | ✔ |
| CA-14 | Comprobación manual en navegador (ver abajo) | — | ✔ (a–e medidos) |
| CA-15 | `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-002` | — | ✔ 4/4 ok |

Total: **101 tests en 10 archivos** (antes 71 en 8; +30: 12 formatPrice, 8 menu, 5 main, 5 estilos).

## Puertas (CA-15), sobre `56807a6`
```
✔ lint       ok
✔ typecheck  ok
✔ test       ok   (10 archivos, 101 tests)
✔ build      ok   (dist/assets/index-*.css 6.78 kB, index-*.js 4.18 kB)
```
Ninguna puerta omitida. Sin reglas desactivadas ni tests borrados.

## CA-14 · Comprobación manual
**Cómo:** `npm run build` (dentro de la puerta) + `npx vite preview --port 4317`, abierto en el
navegador integrado del escritorio de Claude con viewport emulado. Las medidas se tomaron con
`getBoundingClientRect` / `getComputedStyle` desde la consola de la página. **Diferencia con la spec:**
la spec dice `npm run dev`; se usó el build servido con `vite preview` (mismo CSS y JS, ya empaquetado).
Las fuentes Fraunces/DM Sans no se cargan (hueco abierto), así que se ven las de respaldo (Georgia /
system-ui); con las fuentes reales los anchos de texto variarán un poco. El servidor se paró al terminar.

| Punto | Resultado a 375×667 / 768×1024 | Estado |
|---|---|---|
| (a) Tarjetas una debajo de otra, precio en la misma fila | Bebidas: left 16, top 776, ancho 343; Postres: left 16, top 1085, ancho 343 (misma columna, apiladas). Los 7 productos: `dt` y `dd` empiezan en la misma línea (`sameRow: true`), 1 línea cada uno. | ✔ |
| (b) Sin scroll horizontal | `innerWidth` 375, `document.documentElement.scrollWidth` **375**. | ✔ |
| (c) Nombre largo (editado en el DOM, **no** en `business.ts`): "Cheesecake de frutos rojos con salsa de maracuyá y crumble de nuez" | El `dt` pasa a **3 líneas**; el `dd` `$80.00` sigue en **1 línea**, alineado arriba con el nombre (diferencia de `top` = 0 px) y su borde derecho en 334 px dentro de la tarjeta (borde 359); `scrollWidth` sigue en **375**. | ✔ |
| (d) Dos columnas a 768 px | `grid-template-columns` calculado `336.5px 336.5px`, `column-gap` 32 px; Bebidas left 24 / Postres left 393, mismo `top` (208). `scrollWidth` 753 (< 768; el viewport emulado incluye una barra de scroll de 15 px). | ✔ |
| (e) Precio en canela y negrita | `color: rgb(122, 62, 29)` = `#7A3E1D` (`--color-primary`), `font-weight: 700`. | ✔ |

Capturas: tomadas durante la sesión (375 px con las dos tarjetas; 375 px con el nombre largo en 3 líneas
y el precio a su derecha; 768 px con Bebidas | Postres en dos columnas). No se guardaron en el rastro
porque la herramienta las deja en una carpeta temporal de la sesión.

**Lo que no se verificó:** dispositivos reales (iOS/Android), otros navegadores distintos del integrado
(Chromium), ni zoom de texto al 200 %. Lighthouse queda para la tarea 006.

## Notas de implementación
- `menu.css` usa `repeat(2, minmax(0, 1fr))` en vez de `1fr 1fr`: con `minmax(0, …)` una columna no se
  ensancha por el contenido mínimo y ambas quedan iguales (CA-13 acepta `repeat(2, …)`).
- `.menu` lleva `align-items: start` desde 768 px para que una tarjeta corta no se estire hasta la
  altura de la otra.
- Separadores entre productos con `--color-border` (solo decorativos, como manda `diseno.md`).
- Orden de montaje: en el primer commit el menú se construía entre la portada y Reservar, así que un
  precio inválido habría dejado la portada pintada y Reservar vacío. En `56807a6` el menú se construye
  **antes** de pintar nada (como ya se hacía con la URL de WhatsApp), con test rojo→verde. Hoy
  `business.test.ts` ya impide precios no finitos o ≤ 0; esto protege el caso en que alguien cambie los datos.
- La medición de CA-14 se hizo sobre el build de `755cff8`; `56807a6` solo cambia el orden de las
  llamadas en `mount()` (mismo DOM y CSS resultantes), así que las medidas siguen valiendo.

## Decisiones nuevas
Las 4 "Decisiones de esta spec" se implementaron tal cual (marcado `<dl>` con `<div>` por producto y
grupos `<div>`; firmas `formatPrice(price, locale, currency)` y `renderMenu(menu, { locale, currency })`;
error con precio no finito o negativo; estilos en `src/styles/menu.css` importado tras `main.css`).
Además, decisiones menores del constructor:
1. **Rejilla de dos columnas con `repeat(2, minmax(0, 1fr))`** y `align-items: start` (en vez de
   `1fr 1fr`), para que las columnas sean iguales y las tarjetas no se estiren.
2. **Tipo `Money { locale; currency }` exportado desde `src/sections/menu.ts`** como forma del segundo
   parámetro de `renderMenu`.
3. **`mount()` construye todo lo que puede fallar (URL de reserva y menú) antes de pintar nada**, no
   solo la búsqueda de contenedores. Las secciones futuras (Horario y ubicación, tarea 005) deberían
   seguir el mismo patrón.
4. **Pruebas de `menu.css` dentro de `src/styles/styles.test.ts`** (un `describe` nuevo y un helper
   `mediaBlock` que extrae el cuerpo de un `@media` con llaves equilibradas), para reutilizar
   `parseRules`/`readCss` en vez de duplicarlos.
