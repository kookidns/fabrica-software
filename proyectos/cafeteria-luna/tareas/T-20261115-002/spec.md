# T-20261115-002 · Sección Menú con bebidas y postres
Tipo: tarea      Toca interfaz: sí      Texto visible para el usuario: sí

Cubre de `brain/spec.md`: CA-02.1, CA-02.2 y CA-02.3. **CA-02.4 queda pendiente** (la carta real del
negocio es un hueco de `huecos.md`; mientras rija D-00 se usan los productos ficticios de `business.ts`).

## Contexto (qué dice el brain que importa aquí)
- **D-06**: los precios se guardan como número y se formatean en **un único sitio**,
  `src/lib/formatPrice.ts`, con `Intl.NumberFormat(locale, { style: "currency", currency })` usando
  `business.locale` / `business.currency` (hoy `es-MX` / `MXN`). Si la moneda cambia, solo cambian esos
  dos campos de `business.ts`: por eso `formatPrice.ts` no puede llevar `es-MX` ni `MXN` escritos.
  Con `es-MX`/`MXN`, `Intl` produce `$45.00` (dos decimales: es lo que fija D-06; mostrar `$45` sin
  decimales exigiría una decisión nueva, ver el hueco existente "¿En qué moneda y formato…?").
- **D-00**: productos y precios viven **solo** en `src/data/business.ts` (ficticios). `menu.ts` los
  recibe por parámetro; no importa `business` ni copia nombres o precios. `business.test.ts` ya
  garantiza ≥ 3 productos por grupo, nombre no vacío y precio finito > 0.
- **D-04**: `index.html` ya tiene `section#menu` con su `<h2 id="menu-titulo">Menú</h2>` estático;
  `src/main.ts` monta el contenido tras ese `<h2>` con una función `datos → HTMLElement` que usa solo
  `textContent`/`setAttribute` (nunca `innerHTML`). **No hace falta tocar `index.html`.**
- **D-01**: la sección es un módulo `camelCase.ts` en `src/sections/` (`menu.ts`, ya previsto en
  `arquitectura.md`); `lib/` contiene funciones puras sin DOM.
- **D-02 / estilo-codigo.md**: CSS plano mobile-first, solo `var(--…)`; nada de colores ni tamaños a
  mano.
- **D-03**: Vitest + jsdom; jsdom no pinta, así que el "sin scroll horizontal a 375 px" y la fila
  nombre+precio se comprueban a mano y quedan en `build-rondaN.md`.
- **D-08** (pendiente): `main.css` ya mide 317 líneas (guía ~200, `arquitectura.md`: "Archivos de más
  de ~200 líneas se dividen"). Para no agrandar esa deuda, los estilos del menú van en un archivo nuevo
  `src/styles/menu.css` (ver "Decisiones de esta spec"); la división de `main.css` sigue en la tarea 006.
- **diseno.md → Tarjeta**: cada grupo (Bebidas / Postres) es una tarjeta: `background:
  var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: var(--space-5); box-shadow: var(--shadow-sm)`; informativa, sin hover. Fila de producto:
  nombre a la izquierda (`--text-lg`, `--color-text`) y precio a la derecha (`--text-lg`, peso 700,
  `--color-primary`), alineados a la línea base; si el nombre es largo, no se separa de su precio
  (CA-02.3). Títulos de grupo `h3` en `--text-xl`. **Rejilla**: 1 columna en móvil; desde 768 px, 2
  columnas (Bebidas | Postres) con `gap: var(--space-6)`. Contrastes ya calculados: precio `primary`
  sobre `surface-raised` 8.29:1, nombre `text` sobre `surface-raised` 16.30:1.
- **Estado del código (main = worktree)**: no existen `src/lib/formatPrice.ts` ni
  `src/sections/menu.ts`. `main.ts` monta portada y Reservar con `requireElement` (busca todos los
  contenedores antes de pintar). `#menu` es la 2.ª sección, así que su fondo es `--color-surface`
  (`main > section:nth-of-type(even)`).

## Decisiones de esta spec (a registrar en `decisiones.md` al cerrar, si el aprobador las acepta)
1. **Marcado**: lista de definición. Cada grupo es un `<div>` con un `<h3>` y un `<dl>`; cada producto
   es un `<div>` hijo del `<dl>` con exactamente un `<dt>` (nombre) y un `<dd>` (precio). El `<div>`
   envolvente es HTML válido dentro de `<dl>` y permite maquetar nombre y precio en la misma fila. Los
   grupos son `<div>` y no `<section>`, para no crear landmarks extra.
2. **Firma**: `formatPrice(price, locale, currency)` es pura y recibe `locale`/`currency` por
   parámetro; `renderMenu(menu, { locale, currency })` importa `formatPrice`; `main.ts` le pasa
   `business.menu`, `business.locale` y `business.currency`.
3. **Precio inválido**: `formatPrice` lanza `Error` si el precio no es un número finito ≥ 0 (fallo
   visible en vez de pintar `$NaN`).
4. **Estilos del menú en `src/styles/menu.css`**, importado en `main.ts` justo después de `main.css`.

## Objetivo
Que la sección Menú muestre dos tarjetas tituladas "Bebidas" y "Postres" con cada producto de
`business.ts` como nombre + precio formateado en la moneda local, legible en una fila a 375 px sin
scroll horizontal, y en dos columnas desde 768 px.

## Textos visibles (exactos)
| Dónde | Texto |
|---|---|
| `<h3>` del primer grupo | `Bebidas` |
| `<h3>` del segundo grupo | `Postres` |
| Nombre de cada producto (`<dt>`) | `item.name` de los datos (no se escribe a mano) |
| Precio de cada producto (`<dd>`) | `formatPrice(item.price, locale, currency)` (hoy, p. ej., `$45.00`) |

El `<h2>` `Menú` ya existe en `index.html` y no cambia. El aviso del pie ya dice que el menú y los
precios son de ejemplo.

## Criterios de aceptación
### Formato de precio (`src/lib/formatPrice.ts`; pruebas en `src/lib/formatPrice.test.ts`)
- **CA-1** — Dado `formatPrice(price, locale, currency)`, cuando se llama con `(45, "es-MX", "MXN")`,
  entonces devuelve exactamente lo mismo que
  `new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(45)` y ese texto
  contiene el símbolo `$` y `45` (CA-02.2). Con `(1250.5, "es-MX", "MXN")` devuelve el mismo resultado
  que `Intl` para esos datos (separador de miles y decimales los decide `Intl`, no código propio).
- **CA-2** — Dado otro `locale`/`currency` (p. ej. `("es-ES", "EUR")`), cuando se formatea `45`,
  entonces el resultado coincide con `Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })`
  y contiene `€` (prueba de que la moneda sale de los parámetros, D-06).
- **CA-3** — Dado un precio `NaN`, `Infinity` o negativo, cuando se llama a `formatPrice`, entonces lanza
  un `Error`. `0` es válido.
- **CA-4** — Dado el código fuente de `formatPrice.ts`, cuando una prueba lo lee, entonces contiene
  `Intl.NumberFormat` y `style: "currency"` (o `'currency'`), no contiene los literales `es-MX` ni `MXN`,
  no importa `business` y no usa el DOM (`document`, `window`).

### Sección Menú (`src/sections/menu.ts`; pruebas en `src/sections/menu.test.ts`)
- **CA-5** — Dada `renderMenu(menu, { locale, currency })` con datos de prueba (p. ej. 2 bebidas y 3
  postres), cuando se llama, entonces devuelve un elemento con exactamente **dos** grupos, en este
  orden: el primero con un `<h3>` de texto exacto `Bebidas` y el segundo con un `<h3>` `Postres`; cada
  grupo contiene un `<dl>` (CA-02.1).
- **CA-6** — Dado el mismo resultado, cuando se recorre cada `<dl>`, entonces sus hijos son solo
  `<div>`, uno por producto y **en el mismo orden** que los datos; cada `<div>` tiene exactamente un
  `<dt>` cuyo texto es `item.name` y un `<dd>` cuyo texto es `formatPrice(item.price, locale, currency)`
  (CA-02.2). El número de `<dt>` del grupo Bebidas es igual a `menu.drinks.length` y el de Postres a
  `menu.desserts.length`.
- **CA-7** — Dado un nombre de producto que contiene HTML (p. ej. `<img src=x onerror=alert(1)>`), cuando
  se pinta el menú, entonces aparece como texto literal en el `<dt>` y no se crea ningún `<img>`.
- **CA-8** — Dado el código fuente de `menu.ts`, cuando una prueba lo lee, entonces no contiene
  `innerHTML`, `outerHTML`, `insertAdjacentHTML` ni `Intl.NumberFormat` (el formato vive solo en
  `formatPrice.ts`), importa `formatPrice` de `../lib/formatPrice`, no importa `business` y no contiene
  ningún nombre de producto de `business.menu` (D-00).

### Montaje (`src/main.ts`; pruebas nuevas en `src/main.test.ts`)
- **CA-9** — Dado el `<body>` de `index.html` cargado en jsdom, cuando se ejecuta el montaje, entonces el
  elemento que sigue al `<h2>` de `#menu` es el menú: contiene los `<h3>` `Bebidas` y `Postres`, tantos
  `<dt>` como `business.menu.drinks.length + business.menu.desserts.length`, y cada producto de
  `business.menu` aparece con su nombre y con
  `formatPrice(item.price, business.locale, business.currency)` como precio (hoy, por ejemplo,
  `Café americano` → `$45.00`). La página sigue teniendo exactamente un `<h1>` y `#menu` sigue teniendo
  exactamente un `<h2>`.
- **CA-10** — Dado un documento sin `#menu h2`, cuando se ejecuta `mount(doc)`, entonces lanza un `Error`
  cuyo mensaje nombra ese selector **y** no se ha pintado nada (ni la portada ni el botón de reserva:
  los contenedores se buscan todos antes de pintar).
- **CA-11** — Dadas las pruebas existentes de `src/main.test.ts` (CA-10, CA-11, CA-12 de
  T-20261115-001), `src/page.test.ts`, `src/project.test.ts`, `src/styles/styles.test.ts`,
  `src/sections/*.test.ts`, `src/data/business.test.ts` y `src/lib/whatsapp.test.ts`, cuando se ejecuta
  `npm run test`, entonces pasan **sin modificar** ninguna de ellas (solo se añaden casos nuevos).

### Estilos (`src/styles/menu.css`; pruebas que leen el archivo, sin comentarios)
- **CA-12** — Dado `src/main.ts`, cuando se lee, entonces importa `./styles/menu.css` después de
  `./styles/main.css`; y `src/styles/main.css` no cambia en esta tarea.
- **CA-13** — Dado `src/styles/menu.css`, cuando una prueba lo lee, entonces: no contiene literales de
  color (`#` hexadecimal, `rgb(`, `rgba(`, `hsl(`, `hsla(`); la regla del grupo usa
  `var(--color-surface-raised)`, `var(--color-border)`, `var(--radius-md)`, `var(--shadow-sm)` y
  `var(--space-5)`; la regla del precio (`dd` del menú) tiene `white-space: nowrap`, `font-weight: 700`
  y `var(--color-primary)`; la regla del nombre (`dt` del menú) tiene `min-width: 0` y permite partir
  la línea (`overflow-wrap: anywhere` o `break-word`); y hay un bloque `@media (min-width: 768px)` con
  una regla de la lista de grupos que define dos columnas (`grid-template-columns` con dos pistas, p. ej.
  `1fr 1fr` o `repeat(2, …)`) y `gap: var(--space-6)`.

### Comprobación manual (jsdom no pinta; se deja en `build-rondaN.md`)
- **CA-14** — Dado `npm run dev` a **375×667** (DevTools), cuando se navega a `#menu`, entonces: (a) se
  ven las tarjetas `Bebidas` y `Postres` una debajo de otra, cada producto con su precio en la misma
  fila; (b) no hay scroll horizontal (`document.documentElement.scrollWidth <= 375`); (c) editando **en
  DevTools** (no en `business.ts`) el texto de un `<dt>` a un nombre largo, p. ej. `Cheesecake de frutos
  rojos con salsa de maracuyá y crumble de nuez`, el nombre pasa a varias líneas, el precio no se parte
  ni se separa de él y sigue sin haber scroll horizontal (CA-02.3); (d) a **768 px** o más, las dos
  tarjetas quedan en dos columnas; (e) el precio se lee en canela (`primary`) y en negrita. El
  constructor anota cada punto (y una captura si puede) en `build-rondaN.md`.

### Puertas
- **CA-15** — Dada la carpeta de trabajo, cuando se ejecuta `node scripts/verificar.mjs
  proyectos/cafeteria-luna/.worktrees/T-20261115-002` desde la raíz de la fábrica, entonces `lint`,
  `typecheck`, `test` y `build` salen `ok` (ninguna `omitida`).

## Plan
1. **TDD — formato**: `src/lib/formatPrice.test.ts` (CA-1 a CA-4). Implementar
   `src/lib/formatPrice.ts`: `formatPrice(price: number, locale: string, currency: string): string`,
   con la guarda de CA-3 y `Intl.NumberFormat(locale, { style: "currency", currency })`.
2. **TDD — sección**: `src/sections/menu.test.ts` (CA-5 a CA-8). Implementar `src/sections/menu.ts`:
   `renderMenu(menu: Business["menu"], money: { locale: string; currency: string }): HTMLElement`
   (tipos con `import type`, que no importa el valor `business`). Un contenedor (p. ej.
   `div.menu`) con dos `div.menu__group` → `h3.menu__title` + `dl.menu__list` → `div.menu__item` →
   `dt.menu__name` + `dd.menu__price`. Una función auxiliar para un grupo evita duplicar código.
3. **TDD — montaje**: añadir a `src/main.test.ts` casos nuevos (CA-9, CA-10) sin tocar los existentes.
   En `src/main.ts`: `requireElement(doc, "#menu h2")` junto a los otros (antes de pintar), y
   `menuHeading.after(renderMenu(business.menu, { locale: business.locale, currency: business.currency }))`;
   añadir `import "./styles/menu.css";` tras el de `main.css`.
4. **TDD — estilos**: pruebas de CA-12 y CA-13 (en `src/styles/styles.test.ts` como `describe` nuevo o en
   un `src/styles/menu.test.ts`). Escribir `src/styles/menu.css` mobile-first: lista de grupos en
   `display: grid` con `gap: var(--space-5)` (1 columna); tarjeta según `diseno.md`; `h3` con
   `--text-xl` y `margin-bottom: var(--space-4)`; `dl` sin margen; cada `div.menu__item` con
   `display: grid; grid-template-columns: 1fr auto; align-items: baseline; column-gap: var(--space-4)`
   y separación vertical con tokens (separador opcional en `--color-border`, solo decorativo); `dt` con
   `--text-lg`, `--color-text`, `min-width: 0`, `overflow-wrap: anywhere`; `dd` con `margin: 0`,
   `--text-lg`, peso 700, `--color-primary`, `white-space: nowrap`, `text-align: end`; y
   `@media (min-width: 768px)` con `grid-template-columns: 1fr 1fr; gap: var(--space-6)`.
5. Comprobación manual CA-14 y anotarla en `build-rondaN.md`.
6. `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-002` hasta que las cuatro
   puertas pasen (CA-15).

Archivos que cambian: `src/main.ts`, `src/main.test.ts` (solo casos añadidos) y, si se eligen ahí las
pruebas de CSS, `src/styles/styles.test.ts` (solo un `describe` añadido). Nuevos:
`src/lib/formatPrice.ts`, `src/lib/formatPrice.test.ts`, `src/sections/menu.ts`,
`src/sections/menu.test.ts`, `src/styles/menu.css`. **No deben cambiar**: `index.html`,
`src/data/business.ts`, `src/lib/whatsapp.ts`, `src/sections/hero.ts`, `src/sections/reserve.ts`,
`src/styles/main.css`, `src/styles/tokens.css`, `package.json`, `package-lock.json`, `vite.config.ts`,
`tsconfig.json`, `eslint.config.js`.

## Fuera de alcance
- **CA-02.4** (productos y precios reales): depende de la carta del negocio (`huecos.md`, D-00). No se
  toca `business.ts`.
- Cambiar el formato a precios sin decimales (`$45`) o a otra moneda: D-06 fija la llamada a `Intl`;
  cualquier cambio necesita decisión humana (hueco existente de moneda y formato).
- Alérgenos, etiquetas (vegano, sin gluten), descripciones, fotos de productos o más categorías
  (hueco existente de alérgenos; `spec.md` solo pide bebidas y postres).
- Puntos guía entre nombre y precio (opcionales en `diseno.md`) y la luna decorativa en los `<h2>`:
  pulido posterior (tarea 006).
- Sección Horario y ubicación (tarea 005), división de `main.css` y auditoría Lighthouse/44 px de toda
  la página (tarea 006).
- Carga de Google Fonts (hueco abierto en T-20261115-001): se siguen usando las pilas de los tokens.
- Dependencias nuevas (no hacen falta).

## Riesgos / zonas sensibles que toca
- **Riesgo ALTO** (`zonas-sensibles.txt`): modifica `src/main.ts`; si el montaje falla, la página queda
  en blanco o a medias (incluidos los botones de reserva, que se montan en el mismo `mount`). CA-10 y
  CA-11 lo cubren; requiere **aprobación humana** en el cierre. `formatPrice.ts`, `menu.ts` y
  `menu.css` no son zonas sensibles.
- Orden de montaje: `#menu h2` debe buscarse **antes** de pintar nada, como los demás contenedores; si
  se busca después, un fallo dejaría la portada pintada y el resto vacío (CA-10).
- Datos engañosos: un precio mal formateado engaña al cliente. El formato sale siempre de `Intl` con
  los datos de `business.ts` (CA-1, CA-2, CA-9) y un precio inválido falla en vez de pintarse (CA-3).
- XSS: nombres solo con `textContent` (CA-7, CA-8).
- Pruebas frágiles por ICU: comparar con la salida de `Intl.NumberFormat` en lugar de cadenas fijas
  (salvo `$`/`€` y los dígitos); `Intl` puede usar espacios no separables en otros locales (p. ej.
  `45,00 €`).
- Layout a 375 px: `dt` sin `min-width: 0` o `dd` sin `nowrap` provocan desbordes o precios partidos;
  solo se ve en el navegador (CA-13 fija las reglas, CA-14 lo comprueba).
- Encabezados: los `<h3>` van dentro de `#menu` bajo su `<h2>`, sin saltar niveles; no añadir otro
  `<h2>` ni `<h1>` (CA-9).
