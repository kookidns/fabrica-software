# Sistema de diseño

Cafetería Luna: cercana, cálida, de barrio, con cuidado por el producto (`vision.md`). Mobile-first
desde 375 px. CSS plano con custom properties (D-02): el bloque de la sección "Tokens CSS" va tal
cual en `src/styles/tokens.css`; el resto del CSS solo usa `var(--…)`.

Notas de alcance:
- **Modo oscuro: no aplica.** La spec no lo pide; se entrega solo el tema claro. Si se pide después,
  se registra una decisión nueva y se añade un bloque `@media (prefers-color-scheme: dark)`.
- La marca no tiene colores/logo/tipografía (`vision.md`: PENDIENTE). Esta paleta es propuesta del
  diseñador y sustituible cambiando solo los valores de `tokens.css`.

## Tokens
### Colores (HEX)
| Token | HEX | Uso |
|---|---|---|
| `--color-bg` | `#FBF6EE` | Fondo de página (crema) |
| `--color-surface` | `#F3EADB` | Secciones alternas, cabecera, tarjetas sobre fondo |
| `--color-surface-raised` | `#FFFFFF` | Tarjetas elevadas, tabla de horario, input |
| `--color-text` | `#2B1D14` | Texto principal (espresso) |
| `--color-text-muted` | `#6B5646` | Texto secundario, precios secundarios, leyendas |
| `--color-primary` | `#7A3E1D` | Primario (canela/terracota): botón principal, enlaces, acentos |
| `--color-primary-hover` | `#62301A` | Hover/active del primario |
| `--color-on-primary` | `#FFFFFF` | Texto sobre primario |
| `--color-secondary` | `#E9C46A` | Secundario (dorado luna): detalles, insignias, luna decorativa |
| `--color-on-secondary` | `#2B1D14` | Texto sobre secundario |
| `--color-whatsapp` | `#1E6B45` | Botón "Reservar mesa por WhatsApp" (verde oscuro, evoca WhatsApp con AA) |
| `--color-on-whatsapp` | `#FFFFFF` | Texto sobre el botón de WhatsApp |
| `--color-success` | `#2E6B3A` | Éxito / "abierto" |
| `--color-error` | `#B3261E` | Error / "cerrado" |
| `--color-border` | `#D9C9B3` | Separadores y bordes decorativos (no portan información; ver nota) |
| `--color-focus` | `#1F4E8C` | Anillo de foco |
| `--color-footer-bg` | `#2B1D14` | Fondo del pie |
| `--color-footer-text` | `#F3EADB` | Texto del pie |

Notas: el borde de input usa `--color-text-muted` (no `--color-border`) para cumplir 3:1 en
componentes de interfaz (ver ratios).

### Tipografía (Google Fonts, 2 familias, `font-display: swap`)
- **Títulos: Fraunces** (serif cálida con carácter), pesos 600 y 700.
- **Cuerpo/UI: DM Sans**, pesos 400, 500 y 700.
- Carga: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600;700&display=swap`
  (con `preconnect`; recurso de terceros: zona sensible según arquitectura, requiere aprobación).
- Fallbacks: `Georgia, "Times New Roman", serif` y `system-ui, -apple-system, "Segoe UI", sans-serif`.

| Token | Móvil (375 px) | ≥ 768 px | Uso |
|---|---|---|---|
| `--text-xs` | 0.8125rem (13) | igual | Pie, leyendas |
| `--text-sm` | 0.9375rem (15) | igual | Texto secundario |
| `--text-base` | 1rem (16) | 1.0625rem | Cuerpo |
| `--text-lg` | 1.125rem (18) | 1.25rem | Nombre/precio de producto, lead |
| `--text-xl` | 1.5rem (24) | 1.75rem | Títulos de grupo (h3) |
| `--text-2xl` | 1.875rem (30) | 2.5rem | Títulos de sección (h2) |
| `--text-3xl` | 2.5rem (40) | 3.75rem | Nombre en portada (h1) |

Interlineado: 1.6 cuerpo, 1.2 títulos. Ancho de línea de lectura ≤ 65ch.

### Espaciado, radios, sombras
Escala de 4 px: `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 ·
`--space-6` 32 · `--space-7` 48 · `--space-8` 72 (px). Gutter lateral móvil: `--space-4` (16 px).

Radios: `--radius-sm` 6 px · `--radius-md` 12 px · `--radius-lg` 20 px · `--radius-pill` 999 px.
Sombras (tinte marrón, suaves): `--shadow-sm` y `--shadow-md` (ver bloque).

## Tokens CSS (`:root`, listo para copiar en `src/styles/tokens.css`)
```css
:root {
  /* Color */
  --color-bg: #FBF6EE;
  --color-surface: #F3EADB;
  --color-surface-raised: #FFFFFF;
  --color-text: #2B1D14;
  --color-text-muted: #6B5646;
  --color-primary: #7A3E1D;
  --color-primary-hover: #62301A;
  --color-on-primary: #FFFFFF;
  --color-secondary: #E9C46A;
  --color-on-secondary: #2B1D14;
  --color-whatsapp: #1E6B45;
  --color-on-whatsapp: #FFFFFF;
  --color-success: #2E6B3A;
  --color-error: #B3261E;
  --color-border: #D9C9B3;
  --color-focus: #1F4E8C;
  --color-footer-bg: #2B1D14;
  --color-footer-text: #F3EADB;

  /* Tipografía */
  --font-heading: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --text-xs: 0.8125rem;
  --text-sm: 0.9375rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.875rem;
  --text-3xl: 2.5rem;
  --leading-body: 1.6;
  --leading-heading: 1.2;

  /* Espaciado (escala de 4 px) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4.5rem;

  /* Radios */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgb(43 29 20 / 0.08), 0 1px 3px rgb(43 29 20 / 0.06);
  --shadow-md: 0 4px 12px rgb(43 29 20 / 0.12), 0 2px 4px rgb(43 29 20 / 0.06);

  /* Layout */
  --container-max: 64rem;      /* 1024 px */
  --gutter: var(--space-4);
  --tap-min: 44px;             /* zona táctil mínima (CA-05.2) */
  --header-height: 56px;
}

@media (min-width: 768px) {
  :root {
    --text-base: 1.0625rem;
    --text-lg: 1.25rem;
    --text-xl: 1.75rem;
    --text-2xl: 2.5rem;
    --text-3xl: 3.75rem;
    --gutter: var(--space-5);
    --header-height: 64px;
  }
}
```

## Contraste WCAG AA (calculado numéricamente)
Fórmula WCAG 2.x: luminancia relativa sRGB y ratio (L1+0.05)/(L2+0.05). Umbrales: texto normal
≥ 4.5:1, texto grande (≥ 24 px, o ≥ 18.66 px en negrita) y componentes de interfaz ≥ 3:1.

| # | Texto / elemento | Fondo | Ratio | Mínimo | Resultado |
|---|---|---|---|---|---|
| 1 | `text` #2B1D14 | `bg` #FBF6EE | **15.15:1** | 4.5 | AA/AAA |
| 2 | `text` #2B1D14 | `surface` #F3EADB | **13.66:1** | 4.5 | AA/AAA |
| 3 | `text` #2B1D14 | `surface-raised` #FFFFFF | **16.30:1** | 4.5 | AA/AAA |
| 4 | `text-muted` #6B5646 | `bg` #FBF6EE | **6.41:1** | 4.5 | AA |
| 5 | `text-muted` #6B5646 | `surface` #F3EADB | **5.78:1** | 4.5 | AA |
| 6 | `text-muted` #6B5646 | `surface-raised` #FFFFFF | **6.90:1** | 4.5 | AA |
| 7 | `on-primary` #FFFFFF | `primary` #7A3E1D | **8.29:1** | 4.5 | AA/AAA |
| 8 | `on-primary` #FFFFFF | `primary-hover` #62301A | **10.73:1** | 4.5 | AA/AAA |
| 9 | `primary` #7A3E1D (enlaces/texto) | `bg` #FBF6EE | **7.70:1** | 4.5 | AA/AAA |
| 10 | `primary` #7A3E1D | `surface` #F3EADB | **6.95:1** | 4.5 | AA |
| 11 | `primary` #7A3E1D | `surface-raised` #FFFFFF | **8.29:1** | 4.5 | AA/AAA |
| 12 | `on-secondary` #2B1D14 | `secondary` #E9C46A | **9.75:1** | 4.5 | AA/AAA |
| 13 | `on-whatsapp` #FFFFFF | `whatsapp` #1E6B45 | **6.47:1** | 4.5 | AA |
| 14 | `whatsapp` #1E6B45 (texto/icono) | `bg` #FBF6EE | **6.02:1** | 4.5 | AA |
| 15 | `success` #2E6B3A | `bg` #FBF6EE | **5.95:1** | 4.5 | AA |
| 16 | `success` #2E6B3A | `surface` #F3EADB | **5.37:1** | 4.5 | AA |
| 17 | `error` #B3261E | `bg` #FBF6EE | **6.08:1** | 4.5 | AA |
| 18 | `error` #B3261E | `surface` #F3EADB | **5.48:1** | 4.5 | AA |
| 19 | `footer-text` #F3EADB | `footer-bg` #2B1D14 | **13.66:1** | 4.5 | AA/AAA |
| 20 | `secondary` #E9C46A (acentos) | `footer-bg` #2B1D14 | **9.75:1** | 3 | AA |
| 21 | `focus` #1F4E8C (anillo) | `bg` #FBF6EE | **7.72:1** | 3 | AA |
| 22 | `focus` #1F4E8C (anillo) | `surface` #F3EADB | **6.97:1** | 3 | AA |
| 23 | borde de input `text-muted` #6B5646 | `bg` #FBF6EE | **6.41:1** | 3 | AA |

Reglas derivadas:
- **No usar `secondary` (#E9C46A) como texto ni como borde sobre fondos claros**: su contraste con
  `bg` es insuficiente. Solo como relleno decorativo con `on-secondary`, o sobre `footer-bg`.
- **No usar `--color-border` (#D9C9B3) como único indicador** de un control o de información; es solo
  decorativo (separadores). Los bordes de input usan `text-muted`.
- **El foco nunca se dibuja sobre `primary`**: el contraste foco/primario es 1.0:1 (ilegible). Por eso
  el anillo es `outline: 3px solid var(--color-focus); outline-offset: 3px;`, que cae sobre el fondo
  de página/sección (filas 21 y 22) y no sobre el botón.
- Si en la implementación se coloca texto sobre una foto, añadir velo oscuro y recalcular.

## Componentes base
Todos: zona táctil ≥ 44×44 px (`--tap-min`), `:focus-visible` con el anillo descrito, transiciones
≤ 150 ms y desactivadas con `prefers-reduced-motion: reduce`.

### Botón
Base: `font-family: var(--font-body); font-weight: 700; font-size: var(--text-base); min-height: 48px;
padding: 0 var(--space-5); border-radius: var(--radius-pill); border: 2px solid transparent;`.

| Variante | Fondo / texto / borde | Uso |
|---|---|---|
| `primary` | `primary` / `on-primary` | Acción general |
| `whatsapp` | `whatsapp` / `on-whatsapp` | **Reservar mesa por WhatsApp** (portada y sección Reservar); con icono de chat a la izquierda (decorativo, `aria-hidden`) |
| `secondary` (contorno) | transparente / `primary` / borde `primary` | "Cómo llegar" |
| `ghost` | transparente / `primary` | Enlaces de navegación |

Estados: **hover** = fondo `primary-hover` (whatsapp: oscurecer ~10 %; contorno: fondo `surface`);
**active** = `translateY(1px)`; **focus-visible** = anillo `focus`; **disabled** = `opacity: .5`,
`cursor: not-allowed` (el contraste no se exige en deshabilitado, pero no se usa en esta página).
En móvil el botón principal de portada y de Reservar ocupa el ancho completo del contenedor.

### Tarjeta
`background: surface-raised; border: 1px solid var(--color-border); border-radius: var(--radius-md);
padding: var(--space-5); box-shadow: var(--shadow-sm)`.
Variantes: `plana` (sin sombra, fondo `surface`), `elevada` (`--shadow-md`).
Uso: grupo de menú (Bebidas / Postres) y bloque de horario. Fila de producto: nombre a la izquierda
(`--text-lg`, `text`) y precio a la derecha (`--text-lg`, peso 700, `primary`), alineados a la línea
base con puntos guía opcionales; si el nombre es largo, el precio baja debajo sin romper (CA-02.3).
Estados: informativa, sin hover (no es interactiva).

### Input
No hay formularios en esta página (la reserva ocurre en WhatsApp). Se define por coherencia futura:
`min-height: 48px; padding: 0 var(--space-4); background: surface-raised; border: 2px solid
var(--color-text-muted); border-radius: var(--radius-sm); font-size: 1rem` (≥ 16 px evita el zoom en
iOS). Estados: hover = borde `text`; focus-visible = anillo `focus`; error = borde `error` + mensaje
en `error` con icono; disabled = fondo `surface`, `opacity: .6`. Etiqueta siempre visible encima.

### Cabecera (sticky)
`position: sticky; top: 0; z-index: 10; height: var(--header-height); background: var(--color-surface);
border-bottom: 1px solid var(--color-border)`. Contenido: nombre "Cafetería Luna" (Fraunces 700,
`text`) a la izquierda y navegación (Menú · Horario y ubicación · Reservar) como enlaces `ghost`.
Móvil: la navegación es una fila horizontal bajo/junto al nombre con `gap: var(--space-2)`, cada
enlace con 44 px de alto; sin scroll horizontal en 375 px (si no caben, el nombre se acorta a "Luna"
o la nav pasa a una segunda fila). Enlace de sección activa: subrayado de 3 px en `primary` (no solo
color). Añadir `scroll-margin-top: var(--header-height)` a las secciones para que el ancla no quede
tapada. Enlace "Saltar al contenido" visible al recibir foco.

### Pie
`background: var(--color-footer-bg); color: var(--color-footer-text); padding: var(--space-7)
var(--gutter)`. Contenido: nombre, dirección corta y aviso de datos de ejemplo (D-00), texto
`--text-sm`. Enlaces del pie: `footer-text` con subrayado; foco: anillo en `secondary` (9.75:1 sobre
`footer-bg`). Un pequeño motivo de luna creciente en `secondary` como decoración (`aria-hidden`).

### Sección (patrón)
Alternar fondos `bg` y `surface` entre secciones; `padding-block: var(--space-7)` (móvil) y
`var(--space-8)` (≥ 768 px). `h2` en Fraunces `--text-2xl`, color `text`, con una luna creciente
decorativa en `secondary`.

## Layout y breakpoints
- Mobile-first: estilos base para 375 px; sin scroll horizontal (`min-width: 0` en hijos flex/grid,
  `overflow-wrap: anywhere` en textos largos, iframe del mapa con `width: 100%`).
- Ancho máximo del contenido: `--container-max` (1024 px), centrado, con `padding-inline:
  var(--gutter)`. Texto corrido ≤ 65ch.
- Breakpoints (`min-width`): **sm 480 px** · **md 768 px** · **lg 1024 px**.
- Rejilla: 1 columna en móvil; desde md, Menú en 2 columnas (Bebidas | Postres) con `gap:
  var(--space-6)`, y Horario y ubicación en 2 columnas (horario | mapa) con `grid-template-columns:
  1fr 1fr`. Desde lg solo cambia el aire (más `padding`) y el tamaño de h1.
- Portada: ocupa el alto visible del móvil menos la cabecera (`min-height: calc(100svh -
  var(--header-height))`) y muestra nombre, eslogan y el botón de WhatsApp sin hacer scroll
  (CA-01.1, CA-01.2).
- Mapa: relación 4:3 en móvil, 16:9 desde md; `loading="lazy"` y `title` accesible.
