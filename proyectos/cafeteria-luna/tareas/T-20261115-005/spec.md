# T-20261115-005 · Anillo de foco de la marca sin recortar
Tipo: tarea      Toca interfaz: sí      Texto visible para el usuario: no

## Contexto (qué dice el brain que importa aquí)
- **Origen**: `bandeja/007-anillo-foco-marca.md`. Es un pendiente MEDIO de T-20261115-004 (`log.md`):
  el anillo de foco de `.brand` sale recortado por arriba. Ya ocurría en main antes de esa tarea.
  Se ve en `tareas/T-20261115-004/evidencia-ronda1/tab-02.png`: el anillo azul se ve a la izquierda,
  a la derecha y abajo, pero falta el lado de arriba.
- **Causa** (código actual del worktree):
  - `main.css` dibuja todo `:focus-visible` con `outline: 3px solid var(--color-focus); outline-offset: 3px`.
  - El borde exterior del anillo sobresale 6 px (offset + grosor) fuera de la caja del elemento.
  - `.brand` (`header.css`) es el primer hijo de `.site-header__inner`, que no tiene padding, dentro de
    la cabecera sticky (`top: 0`). Su caja empieza en y = 0 a 375, 768 y 1024 px, con la página arriba
    del todo o con scroll. Por eso el lado de arriba del anillo cae en y = −6…−3, fuera de la ventana.
  - A la izquierda no se recorta porque `.container` deja un gutter de 16 o 24 px.
- **`diseno.md`**:
  - El anillo es `3px solid var(--color-focus)` con offset de 3 px para que caiga sobre el fondo y nunca
    sobre `primary`.
  - `.brand` no tiene fondo propio: un anillo hacia dentro cae sobre `--color-surface` de la cabecera
    (fila 22 de contraste, 6.97:1). Así se mantiene la intención del token.
- **D-08**: cabecera de dos filas en móvil (marca a `--header-height`, navegación a `--tap-min`);
  `main:focus` sin contorno. **No se toca.**
- **D-11**:
  - Los estilos de la cabecera viven en `header.css`; ningún archivo de estilos pasa de ~200 líneas
    (hoy tiene 110).
  - `.brand` conserva `min-height: var(--header-height)`, que vigila el CA-6 de `split.test.ts`.
- **`split.test.ts` (CA-9)** fija la lista exacta de selectores de `header.css`. Un selector nuevo
  obliga a actualizar esa lista en la misma tarea.
- **Zonas sensibles**: este cambio solo necesita `src/styles/header.css` y su prueba. Ninguno de los dos
  está en `zonas-sensibles.txt`.
- **Nota de trazabilidad**: la entrada dice `cubre: CA-05.4`, pero en `brain/spec.md` ese CA trata de
  lectores de pantalla (encabezados, alt y propósito del botón de WhatsApp), no del foco visible. Ningún
  CA de producto cubre hoy el foco visible. Lo añado como hueco; no bloquea la tarea.

## Objetivo
Cuando el enlace de la marca ("Cafetería Luna") recibe el foco por teclado, su anillo de foco debe verse
completo en los cuatro lados a 375, 768 y 1024 px. La página en reposo y en hover debe quedar igual, y
no debe cambiar el anillo de ningún otro elemento.

## Criterios de aceptación
Todos los CA visuales se comprueban en el build (`npm run build && npm run preview`, o el servidor que
levanta `scripts/evidencia.mjs`) con Chrome y estas ventanas: 375×812, 768×1024 y 1024×768. Son las
mismas `VISTAS` de `evidencia.mjs`.

**Cómo enfocar la marca**: cargar la página y pulsar Tab dos veces (primero "Saltar al contenido",
después la marca). Antes de medir, comprobar en la consola que
`document.activeElement === document.querySelector('.brand') && document.activeElement.matches(':focus-visible')`
devuelve `true`.

**Medida** (pegar en la consola con la marca enfocada):
```js
const b = document.querySelector('.brand'), s = getComputedStyle(b), r = b.getBoundingClientRect();
const off = parseFloat(s.outlineOffset), w = parseFloat(s.outlineWidth);
const exterior = { top: r.top - off - w, left: r.left - off - w, right: r.right + off + w, bottom: r.bottom + off + w };
const interior = { top: r.top - off, left: r.left - off, right: r.right + off, bottom: r.bottom + off };
const rg = document.createRange(); rg.selectNodeContents(b); const t = rg.getBoundingClientRect();
({ exterior, interior, texto: { top: t.top, left: t.left, right: t.right, bottom: t.bottom },
   W: document.documentElement.clientWidth, H: innerHeight, anillo: [s.outlineStyle, s.outlineWidth, s.outlineColor] })
```

- **CA-1 — Anillo completo dentro de la ventana.**
  - Dado: la marca enfocada con teclado en cada una de las tres ventanas, primero con `scrollY = 0` y
    después tras desplazarse al final de la página (la cabecera es sticky).
  - Cuando: se ejecuta la medida.
  - Entonces se cumplen las cuatro condiciones:
    - `exterior.top ≥ 0`
    - `exterior.left ≥ 0`
    - `exterior.right ≤ W`
    - `exterior.bottom ≤ H`
  - Y además `getComputedStyle(...).overflow` es `visible` en `.site-header__inner` y en `.site-header`:
    ningún ancestro recorta el anillo.
  - Con el código actual falla: `exterior.top` vale −6.
- **CA-2 — Mismo anillo, sin tapar el texto.**
  - Dado: la misma situación del CA-1.
  - Cuando: se ejecuta la medida.
  - Entonces:
    - `anillo` es `["solid", "3px", "rgb(31, 78, 140)"]` (`--color-focus`).
    - El rectángulo del texto queda dentro del borde interior del anillo: `texto.top ≥ interior.top`,
      `texto.left ≥ interior.left`, `texto.right ≤ interior.right` y `texto.bottom ≤ interior.bottom`.
      Así el anillo no se dibuja encima de ninguna letra de "Cafetería Luna".
- **CA-3 — Reposo idéntico a main.**
  - Dado: la rama terminada.
  - Cuando: se ejecuta `node scripts/evidencia.mjs cafeteria-luna T-20261115-005 --ronda N --comparar-main`.
  - Entonces `resumen.md` dice "idénticas" a 375 px y a 1024 px. Es una comparación byte a byte, sin foco
    ni hover.
  - Y a 768 px, que `--comparar-main` no recorre, sin foco y con `scrollY = 0`, estas medidas coinciden
    con las de main al píxel:
    - el rectángulo del texto de la marca: `Range.getBoundingClientRect()` de su contenido, como en la
      medida de arriba;
    - el `getBoundingClientRect()` de `.site-header`.
- **CA-4 — Cambio acotado al foco de la marca** (prueba Vitest en `src/styles/split.test.ts`).
  - Dado: los archivos de `src/styles/`.
  - Cuando: se ejecuta `npm run test`.
  - Entonces:
    - **a)** El primer nivel de `header.css` contiene exactamente los selectores de antes más
      `.brand:focus-visible`. No hay ningún `:hover` nuevo y las reglas de `@media (min-width: 768px)`
      no cambian.
    - **b)** `.brand:focus-visible` declara `outline-offset` con un valor negativo en px cuyo valor
      absoluto es ≥ 3 (el grosor del anillo global).
    - **c)** `.brand:focus-visible` no declara `outline`, `outline-color`, `outline-style` ni
      `outline-width`: el grosor, el estilo y el color siguen saliendo de la regla global.
    - **d)** En todo `src/styles/*.css`, los únicos selectores con `:focus-visible` son `:focus-visible`
      (`main.css`, que sigue con `outline: 3px solid var(--color-focus); outline-offset: 3px`),
      `.site-footer :focus-visible` (`footer.css`) y `.brand:focus-visible` (`header.css`).
- **CA-5 — Puertas y recorrido con Tab.**
  - Dado: la rama terminada.
  - Cuando: se ejecutan `node scripts/verificar.mjs` sobre el worktree y `evidencia.mjs` (CA-3).
  - Entonces:
    - `lint`, `typecheck`, `test` y `build` pasan.
    - Los CA-6, CA-7 y CA-8 de `split.test.ts` siguen en verde: `min-height` de `.brand`, ningún
      `outline: none` nuevo, `header.css` ≤ 200 líneas y sin literales de color.
    - En el recorrido con Tab, el paso de `a.brand` informa `contorno` = `3px solid rgb(31, 78, 140)`
      y `visible: true`.
    - En `tab-02.png` se ve el anillo por los cuatro lados.
    - No aparece ningún enfocable nuevo de menos de 44×44 px ni ningún error de consola.

## Plan
1. **Prueba primero.** En `src/styles/split.test.ts`:
   - añadir `.brand:focus-visible` a `SPLIT["header.css"][""]`;
   - añadir un bloque `describe` para el CA-4 (b, c y d) que reutilice `parseCss` y `declarations`.
   - Debe fallar en rojo antes del cambio de CSS.
2. **`src/styles/header.css`**: añadir `.brand:focus-visible { outline-offset: -3px; }` (o un valor más
   negativo) justo después de `.brand`, con un comentario breve. El anillo se dibuja hacia dentro de la
   caja de la marca, que empieza en y = 0, y cae sobre el fondo de la cabecera.
3. **Separar el anillo de las letras (CA-2).** `.brand` no tiene padding horizontal, así que un anillo
   hacia dentro taparía la "C" y la "a" final. Propuesta: dar a `.brand` `padding-inline: var(--space-2)`
   y `margin-inline: calc(-1 * var(--space-2))`.
   - Es el mismo patrón que usa ya `.site-nav__list`.
   - El texto queda en la misma posición y la página en reposo no cambia (CA-3).
   - Mantener `min-height: var(--header-height)`.
   - Otra solución vale si cumple CA-1 a CA-3.
4. Ejecutar `node scripts/verificar.mjs`, después `evidencia.mjs --comparar-main` (CA-3 y CA-5), y la
   medida manual del CA-1 y el CA-2 a 768 y 1024 px, más la de 375 px con scroll. Dejar los resultados de
   la medida en el rastro de la tarea.
5. **Propuesta para el aprobador** (no la escribe el constructor): registrar en `decisiones.md` la
   excepción de `diseno.md` "en `.brand`, `outline-offset` negativo porque su caja empieza en el borde
   superior de la ventana".

Archivos previstos: `src/styles/header.css` y `src/styles/split.test.ts`.

## Fuera de alcance
- Cambiar el anillo global, el del pie o el de cualquier otro enfocable: enlaces de navegación, botones
  y "Saltar al contenido". Ninguno se ha visto recortado en la evidencia de T-20261115-004.
- Cambiar la altura o el padding visible de la cabecera, `--header-height`, D-08 o la apariencia en hover.
- Modificar `scripts/evidencia.mjs`, por ejemplo para detectar contornos recortados o recorrer con Tab a
  768 y 1024 px. Es una estación de la fábrica, no del proyecto; ya está pendiente en `log.md`.
- `index.html`, `src/main.ts` y cualquier otra zona sensible.

## Riesgos / zonas sensibles que toca
- **Zonas sensibles: ninguna.** `header.css` y `split.test.ts` no están en `zonas-sensibles.txt`.
- **Riesgo visual en reposo**: si se añade padding o margen a `.brand` (paso 3), un redondeo o un cambio
  de `justify-content` podría mover la marca 1 px. Lo detectan la comparación byte a byte del CA-3 a 375
  y 1024 px y la medida a 768 px.
- **Riesgo de contraste**: un anillo hacia dentro cae sobre `--color-surface` (6.97:1, fila 22 de
  `diseno.md`). Solo dejaría de valer si `.brand` recibiera un fondo `primary`, algo que no está previsto.
