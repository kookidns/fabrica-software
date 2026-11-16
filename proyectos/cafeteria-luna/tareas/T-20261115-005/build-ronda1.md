# T-20261115-005 · Build ronda 1 (constructor)

- Rama: `fabrica/T-20261115-005` (base `main` = 8e8bca0) · Carpeta: `proyectos/cafeteria-luna/.worktrees/T-20261115-005`
- Commit: **546e405** `T-20261115-005: anillo de foco de la marca hacia dentro (outline-offset -3px) con padding-inline compensado, sin recorte a 375/768/1024 px`
- Pruebas: **280** en 17 archivos, todas en verde (antes 274: +5 casos en el `describe` nuevo del CA-4 y +1 caso de CA-9 por el selector `.brand:focus-visible`).
- Puertas: lint ok · typecheck ok · test ok · build ok
- Sin dependencias nuevas: `package.json` y `package-lock.json` no cambian. En el worktree solo se ejecutó `npm ci` para instalar las fijadas.
- No se ejecutó `scripts/evidencia.mjs` (lo ejecuta la fábrica).

## Archivos cambiados
Coinciden con los "Archivos previstos" de la spec (`git diff --stat main`: 2 archivos, +78 líneas, ninguna borrada):
- `src/styles/header.css` (de 109 a 120 líneas):
  - `.brand` gana `padding-inline: var(--space-2)` y `margin-inline: calc(-1 * var(--space-2))`, con un comentario. Conserva `min-height: var(--header-height)`.
  - Nueva regla, justo después de `.brand`: `.brand:focus-visible { outline-offset: -3px; }`, con un comentario que explica por qué.
  - Ningún otro selector ni el bloque `@media (min-width: 768px)` cambian.
- `src/styles/split.test.ts`: `.brand:focus-visible` añadido a `SPLIT["header.css"][""]` y un `describe` nuevo, "T-20261115-005 CA-4: change limited to the focus ring of .brand", que reutiliza `parseCss`, `declarations`, `exactRule` y `tokenPx`.

## CA → prueba → rojo/verde

| CA | Prueba (archivo › describe › caso) | Estado |
|---|---|---|
| CA-1 | Comprobación manual en Chrome (abajo) | Antes: `exterior.top` = **−6** en las 3 vistas. Después: **0** en las 3 vistas, arriba y al final de la página |
| CA-2 | Comprobación manual en Chrome (abajo). Apoyo estático: `split.test.ts` › CA-4 › ".brand gains inline padding cancelled by an equal negative margin, wider than the inward ring" | Manual: cumple. Prueba de apoyo: R→V |
| CA-3 | Comprobación manual en Chrome (abajo). La comparación oficial de `evidencia.mjs --comparar-main` queda para la fábrica | Cumple en la comprobación previa: capturas de página completa idénticas byte a byte a 375, 768 y 1024 px; texto y cabecera iguales al píxel a 768 px |
| CA-4 a | `split.test.ts` › CA-9 › "header.css (top level) .brand:focus-visible" y "header.css contains only the selectors of decision 1" · CA-4 › "(a) adds no :hover rule and leaves the @media (min-width: 768px) rules of header.css unchanged" | Los 2 casos de CA-9: R→V. El caso (a): verde previsto, porque vigila que nada cambie. Se comprobó que puede fallar con mutaciones temporales: `flex-basis: 50%` en el `@media` → rojo (a); `.brand:hover` añadido → rojo (a) y CA-9 |
| CA-4 b | CA-4 › "(b) .brand:focus-visible declares a negative outline-offset in px at least as large as the global ring" | R→V |
| CA-4 c | CA-4 › "(c) .brand:focus-visible keeps width, style and color from the global ring" | R→V |
| CA-4 d | CA-4 › "(d) the only :focus-visible selectors in src/styles/*.css are the global, footer and brand ones". También comprueba que `main.css :focus-visible` sigue con `outline: 3px solid var(--color-focus); outline-offset: 3px` | R→V. Mutación con un `.nav-link:focus-visible` añadido: rojo |
| CA-5 | Puertas (abajo) · CA-6, CA-7 y CA-8 de `split.test.ts` en verde · recorrido con Tab previo (abajo) | Puertas ok. La parte de `evidencia.mjs` (`tab-02.png`, enfocables, consola) queda para la fábrica |

- Rojo inicial: `npx vitest run src/styles/split.test.ts` → **6 fallos y 87 aprobadas**. Fallaron los 2 casos de CA-9, (b), (c), (d) y el de padding.
- Verde tras el cambio de CSS: 93/93.
- Las mutaciones se hicieron sobre una copia guardada en el scratchpad. Se restauró `header.css` (hash idéntico) antes del commit.

## Puertas
`node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261115-005`, desde la raíz de la fábrica (código de salida 0):
```
✔ lint       ok
✔ typecheck  ok
✔ test       ok   (17 archivos, 280 pruebas)
✔ build      ok
```
Siguen en verde:
- CA-6: `.brand` con `min-height: var(--header-height)`;
- CA-7: ningún `outline: none` nuevo;
- CA-8: `header.css` tiene 120 líneas, ≤ 200, y ningún literal de color.

No se desactivó ninguna regla, no se borró ninguna prueba y no se usó `--no-verify`.

## Comprobación manual (CA-1, CA-2, CA-3 y parte del CA-5)

### Entorno y método
- **Builds**:
  - "antes": `vite build` del worktree en `main` (8e8bca0), antes de tocar nada;
  - "después": `vite build` del commit.

  Los dos se generaron con `--outDir` en `scratchpad/t005-tools/dist-{main,rama}`, fuera del worktree.
- **Servidor**: servidor estático de Node, igual que el de `evidencia.mjs`, en `127.0.0.1` con un puerto libre que elige el sistema. Vive dentro del propio script y se cierra al terminar. No quedó ningún proceso de node ni de Chrome.
- **Navegador**: Chrome del sistema **157.0.8103.80** headless, con `puppeteer-core@23` de `scratchpad/t004-tools/`.
- **Vistas**: las mismas `VISTAS` de `evidencia.mjs`: 375×812 (`isMobile`), 768×1024 y 1024×768, todas con DPR 1.
- **Terceros**: se bloquearon las peticiones a OSM y Google, igual que en `--comparar-main`.
- **Foco**: se carga la página y se pulsa Tab dos veces. Antes de medir, en las 12 mediciones (3 vistas × antes/después × arriba/final), `document.activeElement === document.querySelector('.brand') && document.activeElement.matches(':focus-visible')` devolvió **`true`**.
- **Medida**: la de la spec, copiada literalmente. Además se recogieron `overflow` de los ancestros y un muestreo de píxeles: el porcentaje de píxeles de color `--color-focus` en la fila o columna central de cada lado de 3 px del anillo, en una captura de la ventana.
- **Script**: `scratchpad/t005-tools/medir.mjs`.
- **Datos en bruto**: `capturas-ronda1/mediciones-ronda1.json`.

### CA-1 · anillo completo dentro de la ventana — **cumple**
Valores de `exterior` y lados con color de foco:

| Vista | Momento | Antes `exterior` (top / left / right / bottom) | Antes lados (arr / aba / izq / der) | Después `exterior` (top / left / right / bottom) | Después lados | W × H |
|---|---|---|---|---|---|---|
| 375 | scrollY 0 | **−6** / 10 / 159.09 / 62 | **0 %** / 100 / 100 / 100 | **0** / 8 / 161.09 / 56 | 100 / 100 / 100 / 100 | 375 × 812 |
| 375 | final (scrollY 2270) | **−6** / 10 / 159.09 / 62 | **0 %** / 100 / 100 / 100 | **0** / 8 / 161.09 / 56 | 100 / 100 / 100 / 100 | 375 × 812 |
| 768 | scrollY 0 | **−6** / 18 / 182.33 / 70 | **0 %** / 100 / 100 / 100 | **0** / 16 / 184.33 / 64 | 100 / 100 / 100 / 100 | 768 × 1024 |
| 768 | final (scrollY 1702) | **−6** / 18 / 182.33 / 70 | **0 %** / 100 / 100 / 100 | **0** / 16 / 184.33 / 64 | 100 / 100 / 100 / 100 | 768 × 1024 |
| 1024 | scrollY 0 | **−6** / 18 / 182.33 / 70 | **0 %** / 100 / 100 / 100 | **0** / 16 / 184.33 / 64 | 100 / 100 / 100 / 100 | 1024 × 768 |
| 1024 | final (scrollY 1711) | **−6** / 18 / 182.33 / 70 | **0 %** / 100 / 100 / 100 | **0** / 16 / 184.33 / 64 | 100 / 100 / 100 / 100 | 1024 × 768 |

- Después, en todas las filas: `exterior.top ≥ 0`, `left ≥ 0`, `right ≤ W` y `bottom ≤ H`.
- `overflow` es `visible` en `.site-header__inner` y en `.site-header`, antes y después y en todas las vistas.
- Confirmado a 1024 px lo que T-20261115-004 solo suponía: en `main` el lado de arriba también se perdía a ese ancho.

### CA-2 · mismo anillo, sin tapar el texto — **cumple**
- `anillo` = `["solid", "3px", "rgb(31, 78, 140)"]` en todas las mediciones de la rama. `outline-offset` calculado: `-3px`.
- El texto queda dentro del borde interior en las 6 mediciones de la rama. La holgura es de 5 px a los lados; arriba y abajo es mayor:

| Vista | `interior` (top / left / right / bottom) | `texto` (top / left / right / bottom) |
|---|---|---|
| 375 | 3 / 11 / 158.09 / 53 | 17.20 / 16 / 153.09 / 38.20 |
| 768 | 3 / 19 / 181.33 / 61 | 21 / 24 / 176.33 / 43 |
| 1024 | 3 / 19 / 181.33 / 61 | 21 / 24 / 176.33 / 43 |

  Arriba y al final de la página los valores son idénticos.

### CA-3 · reposo idéntico a main — **cumple en la comprobación previa**
- **Captura de página completa sin foco ni hover**, `main` frente a rama, comparada byte a byte (PNG en base64): **idénticas a 375, 768 y 1024 px**.
- **A 768 px**, con `scrollY = 0` y sin foco, todo coincide al píxel:
  - texto de la marca (`Range`): x 24, y 21, 152.328125 × 22, en los dos;
  - `.site-header`: x 0, y 0, 768 × 65, en los dos.
- A 375 y 1024 px el texto y la cabecera también coinciden: texto 16 / 17.20 / 137.09 × 21 y cabecera 375 × 101 a 375 px; los mismos valores que a 768 px para el texto y cabecera 1024 × 65 a 1024 px.
- **Hover sobre la marca**: el recorte de la cabecera es idéntico byte a byte a `main` en las 3 vistas.
- `scrollWidth` = W en las 3 vistas: no hay scroll horizontal.
- La comparación oficial (`evidencia.mjs --comparar-main`, `resumen.md`) la hace la fábrica.

### CA-5 · recorrido con Tab (comprobación previa a 375 px en la rama)
| Paso | Elemento | Contorno | Visible | Tamaño |
|---|---|---|---|---|
| 1 | a.skip-link | 3px solid rgb(31, 78, 140) | true | 173.19×44 |
| 2 | **a.brand** | **3px solid rgb(31, 78, 140)** | **true** | 153.09×56 (antes 137.09×56) |
| 3–5 | a.nav-link ×3 | 3px solid rgb(31, 78, 140) | true | 55.34×44, 148.95×44, 74.25×44 |
| 6 | a.btn.btn--whatsapp | 3px solid rgb(31, 78, 140) | true | 343×48 |

- No hay ningún enfocable nuevo.
- La caja de `.brand` crece 16 px de ancho porque el padding se compensa con margen. Sigue siendo ≥ 44×44 y el texto no se mueve.

### Capturas (`capturas-ronda1/`)
- `antes-{375,768,1024}-foco-marca-{arriba,final}.png`: falta el lado de arriba del anillo.
- `despues-{375,768,1024}-foco-marca-{arriba,final}.png`: el anillo se ve por los cuatro lados.
- `mediciones-ronda1.json`.

## Decisiones nuevas
Ninguna tomada por el constructor. Queda la propuesta del paso 5 de la spec para el aprobador: registrar en `decisiones.md` la excepción de `diseno.md` "en `.brand`, `outline-offset` negativo porque su caja empieza en el borde superior de la ventana". Si se registra, conviene añadir:
- que `.brand` lleva `padding-inline: var(--space-2)` compensado con `margin-inline` negativo, para dejar 5 px entre el anillo y el texto;
- que su zona clicable crece 8 px por cada lado.

## Desviaciones y observaciones
1. **Prueba de apoyo extra**: el `describe` del CA-4 tiene un quinto caso, además de a, b, c y d. Fija el par `padding-inline`/`margin-inline` de `.brand` y que `--space-2` sea ≥ |offset|. Es una guarda estática del CA-2 y el CA-3; no sustituye las mediciones manuales.
2. **Servidor de la comprobación manual**: un servidor estático de Node equivalente al de `evidencia.mjs`, en lugar de `npm run preview`. La spec admite "el servidor que levanta `scripts/evidencia.mjs`". Se usó Puppeteer en vez de CDP directo, con las mismas `VISTAS` y DPR 1.
3. **Error de consola previo, igual en `main`**: a 375 px, en la primera carga de cada build aparece `Failed to load resource: 404`. Sale tanto en `main` como en la rama. No se registró la URL. Lo más probable es que sea la petición automática de `/favicon.ico`, porque el `index.html` no declara icono y el build no incluye ninguno. No lo introduce esta tarea. Si `evidencia.mjs` lo informa, también ocurría antes.
4. Pendiente de la fábrica: `evidencia.mjs --comparar-main`, que cubre el `resumen.md` del CA-3, `tab-02.png`, los enfocables y la consola del CA-5.
