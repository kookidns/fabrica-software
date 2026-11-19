# T-20261117-001 · Build ronda 1 (constructor)

- Rama: `fabrica/T-20261117-001` (base `main` = 8c85c1a) · Carpeta: `proyectos/cafeteria-luna/.worktrees/T-20261117-001`
- Commits (3, pequeños):
  - `071fa45` módulo `icons.ts` con los SVG decorativos (CA-1)
  - `756a4cd` decoración SVG y estilos de las secciones
  - **`140269a`** (cabeza de la rama) puntos guía del menú en `text-muted`
- Pruebas: **397** en 21 archivos, todas en verde. Antes había 280 en 17 archivos: se añaden 117 casos y 4 archivos de prueba nuevos.
- Puertas: lint ok · typecheck ok · test ok · build ok.
- Dependencias: ninguna nueva. En el worktree solo se ejecutó `npm ci`.
- No se ejecutó `scripts/evidencia.mjs` (lo ejecuta la fábrica).

## Archivos cambiados
`git diff --stat main`: 18 archivos, +979 / −42.

**Código**
- `src/sections/icons.ts` (nuevo, 137 líneas):
  - `createIcon(name, className?)` y `ICON_NAMES` para `moon`, `cup`, `cake`, `calendar`, `pin`, `whatsapp` y `cup-art`.
  - Exporta `MOON_PATH`, el mismo trazado que usan las lunas estáticas de `index.html`.
  - Todo con `createElementNS`. Solo hay `currentColor`/`none`: los colores salen de CSS con tokens.
- `src/sections/hero.ts`: hijos `svg.hero__moon`, `h1`, `p`, botón y `svg.hero__art`. El botón se sigue creando con `createReserveButton`.
- `src/sections/menu.ts`: `renderGroup` recibe el icono (`cup` para Bebidas, `cake` para Postres) y lo antepone en el `h3` con `heading.append(icon, title)`.
- `src/sections/location.ts`: solo cambian el import, `createTitle(text, icon)` y sus dos llamadas (`calendar`, `pin`). Constantes, iframe, guardas y enlace, idénticos.
- `src/sections/reserve.ts`: se quitan `SVG_NS`, `CHAT_ICON_PATH` y `createChatIcon`; ahora usa `createIcon("whatsapp", "btn__icon")`. URL, guarda, atributos, texto y clase, sin cambios.
- `index.html`: `<svg class="brand__icon">` es el primer hijo de `.brand`, sin espacio delante, y `<svg class="site-footer__moon">` va dentro de `.site-footer__name`.

**Estilos**
- `header.css`: solo se añade `.brand__icon`.
- `hero.css`:
  - `.hero__moon`, `.hero__art` (`display: none` en la base) y las partes de la taza, coloreadas con `color`/`fill` y tokens.
  - En `@media (min-width: 768px)`: `.hero__content` pasa a rejilla `minmax(0, 1fr) auto` y `.hero__art` va en la columna 2, filas 1 a 4.
- `main.css`:
  - `main > section h2` pasa a rejilla `minmax(0,1fr) auto minmax(0,1fr)`, centrada.
  - Nuevas reglas `::before`/`::after` con `content: ""`, `max-width: var(--space-8)`, `min-width: 0` y `border-top: 2px solid var(--color-primary)`.
- `menu.css`:
  - `.menu__title` en flex y nueva regla `.menu__icon`.
  - `.menu__name` en flex, más `.menu__name::after`: puntos `2px dotted var(--color-text-muted)`, flexibles.
  - Se elimina `.menu__item + .menu__item`.
  - El `column-gap` de la fila baja de `--space-4` a `--space-2`.
- `location.css`: `.location__title` en flex y nueva regla `.location__icon`.
- `footer.css`: nueva regla `.site-footer__moon`.

**Pruebas**
- Editadas a propósito:
  - `hero.test.ts`: CA-7 ignora `svg[aria-hidden="true"]` y se añaden los `describe` de CA-4 y CA-5.
  - `split.test.ts`: `SPLIT` solo gana selectores.
- Nuevas: `src/sections/icons.test.ts`, `src/sections/decor.test.ts`, `src/decor.test.ts` y `src/styles/decor.test.ts`.

**Sin cambios** (comprobado con `git diff --name-only main`):
- configuración y dependencias: `package*.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`;
- datos y librerías: `src/data/business.ts`, `src/lib/**`, `src/main.ts`;
- estilos: `buttons.css`, `reserve.css`, `tokens.css`;
- `public/`;
- pruebas: `menu.test.ts`, `location*.test.ts`, `reserve.test.ts`, `page.test.ts`, `a11y.test.ts`, `main.test.ts` y `styles.test.ts`.

## CA → prueba → rojo/verde
Para el rojo, primero se escribieron todas las pruebas nuevas y se ejecutó la batería completa: **45 fallos y 352 en verde**. Las 280 pruebas que ya existían siguieron en verde, y CA-7 de hero, ya editado, también. Después se implementó y quedó en **397/397**.

| CA | Prueba (archivo › describe › caso) | R→V |
|---|---|---|
| CA-1 | `sections/icons.test.ts` › "CA-1: createIcon…" (7 nombres × namespace, a, b, c, d + clase, nueva instancia, partes de `cup-art`) y "CA-1: icons.ts source" (createElementNS, sin literales de color, sin APIs de HTML, ≤ 200 líneas) | R (el módulo no existía) → V, 43 casos |
| CA-2 | `decor.test.ts` › "CA-2: inventory…" › "has exactly 10 <svg>, in the agreed places" · "makes all 10 decorative" · "has no <img>, <picture> or <object>" · "CA-2, CA-13 (e), CA-14…" › por archivo "has no image references nor sketch files" · "keeps public/ without files" | El recuento: R→V. Los casos de "decorative", "no img" y escaneo de archivos son guardas: verdes desde el principio porque vigilan que nada se rompa |
| CA-3 | `decor.test.ts` › "CA-3: static moon in the header brand" (primer hijo `svg.brand__icon` con `MOON_PATH`; texto y href) · `styles/decor.test.ts` › "CA-3…" (`.brand__icon` con `flex: none`, tamaño en em y `secondary`; `.brand` y `.brand:focus-visible` idénticos) · `split.test` CA-9 `.brand__icon` | R→V (la parte de "idénticos" es guarda, verde) |
| CA-4 | `hero.test.ts` › "CA-4: moon in the hero" (2 casos) · CA-7 editado · `styles/decor.test.ts` `.hero__moon` en `secondary` | R→V |
| CA-5 | `hero.test.ts` › "CA-5: cup illustration…" (2 casos) · `styles/decor.test.ts` (`display: none` en la base, `block` y columna 2 a 768 px; `.hero__content` en rejilla de 2 columnas; partes solo con los tokens permitidos) · `split.test` CA-9 | R→V. Medido en Chrome (abajo) |
| CA-6 | `sections/decor.test.ts` › "CA-6…" (Bebidas → `cup`, Postres → `cake`, `menu__icon`, texto exacto; firma idéntica a `createIcon`) · `styles/decor.test.ts` (`.menu__title` en flex con gap de token; `.menu__icon` en `primary`) | R→V |
| CA-7 | `styles/decor.test.ts` › "draws a flexible dotted ::after…" y "removes the solid separator" · `sections/decor.test.ts` › "CA-7: the menu rows keep their DOM" (guarda: `dt + dd`, un solo nodo de texto) | Los de CSS: R→V. El de DOM es guarda (verde). styles.test CA-13 sigue en verde |
| CA-8 | `styles/decor.test.ts` › "CA-8…" (h2 en rejilla centrada; `::before`/`::after` vacíos con `min-width: 0` y línea `primary`; el h1 sin líneas) · `split.test` CA-9 (2 selectores) | R→V (lo del h1 es guarda) |
| CA-9 | `sections/decor.test.ts` › "CA-9…" (Horario → `calendar`, Dirección → `pin`, `location__icon`, texto exacto, id de la tabla; import de `createIcon` y constantes del mapa literales) · `styles/decor.test.ts` CA-9 | R→V |
| CA-10 | `sections/decor.test.ts` › "CA-10…" (primer hijo = `whatsapp` de `icons.ts` con `btn__icon`; clase `btn btn--whatsapp`; ya no hay `CHAT_ICON_PATH`, `createChatIcon` ni `createElementNS` en `reserve.ts`) · reserve.test, a11y CA-4 y main.test sin cambios, en verde | R→V |
| CA-11 | `decor.test.ts` › "CA-11: static moon in the footer" · `styles/decor.test.ts` CA-11 (`secondary`; el pie conserva `footer-bg`/`footer-text`) · page.test CA-5 sin cambios, en verde | R→V |
| CA-12 | `decor.test.ts` › "CA-12…" (los 8 enfocables, en orden y con nombre; solo `main#contenido` lleva `tabindex`) · a11y.test sin cambios · split.test (d) y CA-7 | Guarda (verde desde el principio, como debe ser en una no-regresión). Recorrido con Tab en Chrome (abajo) |
| CA-13 | (a) split.test CA-11 en verde, `main.ts` sin diff, ningún CSS nuevo · (b) diff limitado a los archivos de cada sección · (c) `SPLIT` solo gana selectores y CA-9 pasa · (d) split CA-8 (header 130, hero 89, main 123, menu 95, location 127 y footer 39 líneas; sin literales) · (e) `decor.test.ts` › "uses no HTML-string DOM API in any non-test .ts" | V |
| CA-14 | `decor.test.ts` › "adds no <link> and no external <script>" y el escaneo de `fonts.googleapis`/`fonts.gstatic` · `git diff --name-only main` sin ninguno de los archivos protegidos | V |
| CA-15 | `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261117-001` | V (abajo) |
| CA-16 | Lo ejecuta la fábrica. La comprobación previa en Chrome cumple a), b), c) y d) (abajo) | — |
| CA-17 | Comparación visual con las capturas (abajo) | — |

## Puertas
Desde la raíz de la fábrica, con código de salida 0:
```
✔ lint       ok
✔ typecheck  ok
✔ test       ok   (21 archivos, 397 pruebas)
✔ build      ok
```
No se desactivó ninguna regla, no se borró ninguna prueba y no se usó `--no-verify`.

## Comprobación en Chrome (previa a CA-16)
- **Entorno**:
  - build de la rama con `vite build --outDir` en el scratchpad, fuera del worktree;
  - servidor estático de Node en 127.0.0.1 con un puerto que elige el sistema (no el 4190), cerrado al terminar;
  - Chrome 157 headless con `puppeteer-core`.
- **Vistas y bloqueos**: las mismas `VISTAS` que `evidencia.mjs`, con DPR 1, y bloqueadas OSM y Google.
- **Script**: `scratchpad/t001-17-tools/capturar.mjs`.
- **Datos**: `capturas-ronda1/mediciones-ronda1.json`.

### Métricas de `evidencia.mjs`
| Vista | `desbordaHorizontal` | `fuera` | `cortado` | `menor44` | Número de `<svg>` |
|---|---|---|---|---|---|
| 375 | false | [] | [] | [] | 10 |
| 768 | false | [] | [] | [] | 10 |
| 1024 | false | [] | [] | [] | 10 |

### Primera pantalla de la portada (CA-5)
- **375×812**: la taza tiene `display: none`.
  - Luna: y 341–389. h1: 405–453. Eslogan: 469–497.
  - **Botón: 525–573**, entero dentro de los 812 px.
- **768×1024**: la taza ocupa x 514–744 e y 463–627, a la derecha del h1 (x 24–481, y 479–551). El botón termina en y = 675.
- **1024×768**: la taza ocupa x 693–1000 e y 307–527, a la derecha del h1 (y 351–423). El botón termina en y = 547.

### Recorrido con Tab a 375 px (CA-12)
Pasos 1–8:
1. Saltar al contenido
2. Cafetería Luna
3. Menú
4. Horario y ubicación
5. Reservar
6. Reservar mesa por WhatsApp (se abre…), en `#inicio`
7. Cómo llegar (se abre…)
8. Reservar mesa por WhatsApp (se abre…)

Todos con `3px solid rgb(31, 78, 140)` y visibles.

### Consola
Solo aparece `404 /favicon.ico` a 375 px. Es el mismo error previo que ya anotó T-20261115-005 y no lo introduce esta tarea.

## Frente al boceto (CA-17)
Comparación de `pagina-375.png` y `pagina-1024.png` con `aprobado-movil.png` y `aprobado-escritorio.png`:
1. **Cabecera**: luna dorada junto a "Cafetería Luna", como en el boceto.
2. **Portada**:
   - Luna dorada sobre el título.
   - A 1024 px, la taza con platillo, vapor, luna dorada, destellos y ramita va a la derecha del título, como en el boceto de escritorio.
   - En móvil el texto sigue alineado a la izquierda: centrarlo queda fuera de alcance.
3. **Menú**:
   - "Menú" centrado entre dos líneas marrones.
   - Tarjetas Bebidas, con taza, y Postres, con pastel.
   - Puntos guía entre producto y precio y sin separador sólido, como en el boceto móvil.
   - Con el nombre largo, "Cheesecake de frutos rojos" se parte en dos líneas a 375 px. Los puntos se acortan y el precio no se parte.
4. **Horario y ubicación**: título entre líneas e iconos de calendario y de ubicación en los h3.
5. **Reservar**:
   - Título entre líneas.
   - Botón verde con el glifo de WhatsApp (bocadillo redondo con auricular), también en la portada.
6. **Pie**: oscuro, con la luna dorada junto al nombre.
7. **Paleta**: crema, marrón, dorado y verde WhatsApp de los tokens. Los textos son los del brain.

## Decisiones nuevas
Ninguna que contradiga el brain. Propuestas para registrar:
- **`icons.ts` como único sitio de los SVG decorativos.** Patrón: `createIcon(name, className?)`, solo `currentColor`/`none` y color desde CSS con `color`/`fill` y tokens. Las lunas estáticas de `index.html` repiten `MOON_PATH`.
- **h2 de sección** en rejilla `minmax(0,1fr) auto minmax(0,1fr)`, con líneas `::before`/`::after` de hasta `--space-8`. Esto sustituye la "luna junto al h2" del patrón Sección de `diseno.md`: el diseñador debería actualizar ese párrafo, como ya avisa la spec.
- **Puntos guía del menú** en `2px dotted var(--color-text-muted)`. Primero se probó `--color-border`, pero sobre blanco apenas se veía.

## Desviaciones y observaciones
1. **Pruebas nuevas en archivos nuevos.** El plan proponía añadir casos a `menu.test.ts`, `location.test.ts` y `page.test.ts`. Como los CA piden que esas pruebas pasen "sin cambios", los casos nuevos van en `src/sections/decor.test.ts` y `src/decor.test.ts`. Solo se editaron `hero.test.ts` y `split.test.ts`, que son los previstos.
2. **"Horario y ubicación" a 375 px.** El título cabe en una línea, pero las líneas laterales quedan en ~5.6 px y parecen guiones cortos. La spec lo permite ("pueden encogerse hasta desaparecer", `min-width: 0`). Si el revisor de UI prefiere que desaparezcan o que el título se parta, hay que darles un mínimo o bajar el `column-gap`, lo que contradice el `min-width: 0` literal.
3. **Reglas existentes con declaraciones cambiadas.** Los selectores no cambian:
   - `main > section h2`: rejilla y centrado;
   - `.menu__title` y `.location__title`: flex;
   - `.menu__name`: flex;
   - `.menu__item`: `column-gap` de `--space-4` a `--space-2`, para que los puntos lleguen cerca del precio.
4. **Guardas sin rojo.** CA-12 y las partes "no cambia" de CA-2, CA-3, CA-7 y CA-8 son pruebas de no regresión y nacieron en verde. Se comprobó que fallan con los cambios correspondientes: por ejemplo, la firma del icono o el recuento de SVG fallaban antes de implementar.
5. Pendiente de la fábrica: `evidencia.mjs … --ronda 1 --lighthouse` (CA-16, incluido Lighthouse) y la revisión de UI (CA-17).

### Capturas (`capturas-ronda1/`)
- `pagina-{375,768,1024}.png`: página completa.
- `primera-pantalla-{375,768,1024}.png`.
- `detalle-{cabecera,portada,menu,horario,reservar,pie}-1024.png`: con DPR 2, para ver los dibujos.
- `mediciones-ronda1.json`.
