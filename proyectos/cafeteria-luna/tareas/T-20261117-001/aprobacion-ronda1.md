VEREDICTO: APROBADO
Ronda: 1
Cambios obligatorios: ninguno. No queda ningún hallazgo CRÍTICO ni ALTO. Los 17 CA tienen prueba o evidencia y las puertas pasan.
Hallazgos descartados:
- **Mapa en blanco en `pagina-*.png`** (lo marcan como "no verificado" el revisor de código y el de UI): es un efecto de la captura, no de esta tarea.
  - El iframe lleva `loading="lazy"` (diseno.md, "Mapa") y es de terceros. La captura de página completa se toma sin desplazarse hasta él, así que el iframe no ha pintado todavía.
  - En el recorrido con Tab, el foco entra en el iframe (pasos 7–13 de `evidencia.json`). En `tab-08.png` el mapa de OpenStreetMap ya se ve cargado, con teselas, chincheta, atribución y el botón "+" con foco.
  - El diff no toca `src/lib/maps.ts`. En `location.ts` solo cambia `createTitle` y sus dos llamadas, y lo vigila `sections/decor.test.ts` CA-9 (D-10 intacto).
- **Pasos 7–13 del recorrido con Tab con contorno "NINGUNO"**: el foco está dentro del iframe de otro origen y desde fuera no se puede medir (lo dice la nota de `resumen.md`). CA-12 y CA-16 (c) cuentan los enfocables "sin el iframe", y los 8 de la página tienen `3px solid rgb(31, 78, 140)` en el orden y con los nombres de CA-12. No es una regresión.
- **Consola: `404 /favicon.ico`** (CA-16 d): es una entrada de nivel `log` del servidor estático local, por un recurso que nunca existió en `public/`. Ya venía de antes (T-20261115-005) y la página no lanza ningún error JS. Doy CA-16 (d) por cumplido y lo dejo como pendiente aparte.
- **Gran espacio vacío sobre la portada** en las capturas de 375 y 1024: es el `min-height: calc(100svh - var(--header-height))` de diseno.md ("Portada"). Esta tarea no lo cambia (es contexto del diff de `hero.css`) y está fuera de alcance.
Mejoras sugeridas (no bloquean):
1. `src/styles/main.css` (`main > section h2::before/::after`): a 375 px, en "Horario y ubicación" las líneas quedan en unos 5,6 px y parecen guiones sueltos ("- Horario y ubicación -" en `pagina-375.png`). La spec lo permite (`min-width: 0`). En otra tarea se podrían ocultar por debajo de un ancho mínimo, por ejemplo con `max-width: 0` hasta `sm`, o fijarles un mínimo y dejar que el título se parta. Habría que ajustar el texto de CA-8. Origen: aprobador / ui (observación 2 del constructor).
2. `src/styles/menu.css` (`.menu__name::after`): con un nombre largo a 375 px ("Cheesecake de frutos rojos"), la línea de puntos queda como un tramo corto entre las dos líneas de texto. La spec lo permite. Origen: codigo [BAJO].
3. `src/sections/icons.ts` (`MOON_PATH`) e `index.html` (lunas de `.brand` y del pie): el trazado está duplicado a mano. Conviene un test que compare los `d` de las lunas de `index.html` con `MOON_PATH`. Origen: codigo [BAJO].
4. `src/decor.test.ts`, `src/sections/decor.test.ts` y `src/styles/decor.test.ts`: tres archivos con el mismo nombre. Conviene darles nombres distintos, por ejemplo `page-decor.test.ts`, `sections-decor.test.ts` y `styles-decor.test.ts`. Origen: codigo [BAJO].

---

## Consolidación por revisor
| Revisor | Veredicto | Hallazgos | Tratamiento |
|---|---|---|---|
| seguridad | OK | ninguno; `npm audit --omit=dev` con 0 vulnerabilidades | — |
| ux | OK | ninguno | — |
| ui (Codex, con el boceto adjunto) | OK | ninguno dentro del alcance; no verificó el mapa cargado ni la vista a 1280 | mapa: descartado arriba; 1280: pendiente |
| codigo | OK | 3 BAJO; ejecutó `verificar.mjs` (lint, typecheck, test 397/397 y build en verde) | mejoras 2–4 |

No hay duplicados reales entre revisores. Solo el mapa en blanco sale en dos informes (código y UI) como "no verificado", y aquí queda fusionado y descartado.

## Comprobaciones propias
- **Puertas (CA-15)**: verdes según el revisor de código, que las ejecutó él mismo, no según el constructor.
- **Evidencia neutral (CA-16)**:
  - a 375, 768 y 1024 px, `desbordaHorizontal: false` y las listas `fuera` y `cortado` vacías;
  - ningún `menor44`;
  - Tab con los 8 enfocables de CA-12, todos con contorno;
  - Lighthouse con 99/100/100 en rendimiento y 100/100/100 en accesibilidad, mediana 100/100.
- **Diff**:
  - `maps.ts`, `whatsapp.ts`, `business.ts`, `main.ts`, `tokens.css`, `buttons.css`, `reserve.css` y la configuración no aparecen en el diff;
  - en `reserve.ts` solo se cambia el icono;
  - los colores de los CSS nuevos van todos con `var(--…)`;
  - se quita el separador sólido `.menu__item + .menu__item`;
  - la taza tiene `display: none` en la base y `block` desde 768 px.

## Frente al boceto aprobado (lo he comparado yo con Read)
Comparé `evidencia-ronda1/pagina-375.png` con `brain/boceto/aprobado-movil.png`, y `pagina-1024.png` con `aprobado-escritorio.png`.

**Lo que pedía la entrada y la spec dejó dentro del alcance: se cumple en las dos vistas.**
| # | Boceto | Página (ronda 1) |
|---|---|---|
| 1 | Luna dorada junto a "Cafetería Luna" en la cabecera | ✅ 375 y 1024 |
| 2 | Luna dorada en la portada | ✅ sobre el h1 |
| 3 | Taza junto al título en escritorio | ✅ a 1024, a la derecha, con platillo, vapor, luna, destellos y ramita; oculta a 375 |
| 4 | Iconos de taza (Bebidas) y pastel (Postres) | ✅ |
| 5 | Puntos entre producto y precio, sin separador sólido | ✅ (a 1024 el boceto dibuja filas con línea; la spec sigue el móvil, que es lo pedido) |
| 6 | h2 centrados entre dos líneas | ✅ Menú, Horario y ubicación, y Reservar (a 375 las líneas de "Horario y ubicación" son muy cortas, ver mejora 1) |
| 7 | Iconos de calendario y ubicación | ✅ en los h3 "Horario" y "Dirección" |
| 8 | Logo de WhatsApp en los botones verdes | ✅ en los dos botones |
| 9 | Pie oscuro con luna dorada | ✅ junto al nombre (en el boceto móvil va a la derecha; la spec pide "junto al nombre") |

- **Paleta**: crema, superficie beige, marrón, dorado y verde WhatsApp, como en el boceto. **Tono**: cálido y tranquilo. **Orden de secciones**: idéntico. Los textos son los del brain, sin los "(ejemplo)" del boceto.
- La página se acerca claramente al objetivo en todo lo que la entrada pedía. Las diferencias que siguen son justo las que la spec puso en "Fuera de alcance":
  - portada centrada en móvil y eslogan en cursiva y color primario;
  - taza pequeña con líneas bajo el eslogan;
  - fondo ondulado;
  - "Reservar" en una fila en escritorio;
  - insignias "Ejemplo";
  - horario en cebra y dirección y mapa dentro de una tarjeta;
  - navegación con puntos;
  - fuentes Fraunces y DM Sans.
- Ninguna de esas diferencias bloquea.

## Nota para el humano
Según la spec, esta tarea toca zonas sensibles que requieren aprobación humana: `index.html`, `hero.ts`, `reserve.ts` y `location.ts`. Este APROBADO de la estación no sustituye esa aprobación antes de fusionar `fabrica/T-20261117-001` (140269a) en `main`.

## Qué registrar en el brain al cerrar
**Decisiones (`decisiones.md`)**
- **D-13 · SVG decorativos en `src/sections/icons.ts`** (origen: T-20261117-001).
  - Es el único sitio de los gráficos decorativos: `createIcon(name, className?)` con `createElementNS`.
  - Cada SVG lleva `aria-hidden="true"`, `focusable="false"` y `viewBox`. No lleva `title`, `text`, `use`, `href`, `style` ni `on*`.
  - `fill` y `stroke` solo valen `currentColor` o `none`, y el color se pone desde el CSS de cada sección con tokens.
  - Las lunas estáticas de `index.html` (`.brand__icon` y `.site-footer__moon`) repiten `MOON_PATH`.
  - No se usan imágenes, `data:` ni `url(` en CSS.
  - Total en la página: 10 SVG (CA-2).
- **D-14 · Patrón de títulos y filas del menú.**
  - El h2 de sección va en una rejilla `minmax(0,1fr) auto minmax(0,1fr)`, centrado, con líneas `::before`/`::after` de `2px solid var(--color-primary)`, `max-width: var(--space-8)` y `min-width: 0`. El h1 no lleva líneas.
  - Los puntos guía del menú se hacen con `.menu__name::after` en `2px dotted var(--color-text-muted)` (con `--color-border` apenas se veían), sin separador sólido entre filas y con `column-gap: var(--space-2)`.
  - El logo de WhatsApp sustituye al bocadillo genérico. Es un dibujo propio y monocromo en `currentColor`.

**Ajustes de `diseno.md`**
- En "Sección (patrón)" (líneas 235–236), cambiar "con una luna creciente decorativa en `secondary`" por "centrado entre dos líneas decorativas en `primary` (D-14)", porque mandan el boceto y la entrada.
- Añadir los patrones nuevos en sus apartados:
  - cabecera: luna `secondary` delante del nombre, dentro de `.brand`, sin cambiar su padding ni la regla de foco (D-12);
  - portada: luna `secondary` sobre el h1 y taza `cup-art` solo desde 768 px, en dos columnas;
  - Menú: iconos `cup`/`cake` en `primary` en los h3 y puntos guía;
  - Horario y ubicación: iconos `calendar`/`pin` en `primary`;
  - botones de WhatsApp: logo propio en `currentColor`;
  - pie: la luna ya está descrita, solo hay que indicar que va junto al nombre.

**Pendientes (`huecos.md` o bandeja)**
1. Diferencias del boceto que quedaron fuera de alcance, como propuestas de tareas:
   - portada centrada en móvil, con el eslogan en cursiva y color primario;
   - taza pequeña bajo el eslogan;
   - fondo ondulado de escritorio;
   - "Reservar" en una fila en escritorio;
   - horario en cebra y tarjeta de dirección y mapa;
   - navegación con puntos separadores.
2. Fuentes Fraunces y DM Sans: el hueco del 2026-11-15 sigue abierto.
3. Falta `favicon` en `public/`, lo que da un 404 en la consola de cada evidencia. Merece una tarea pequeña: un favicon propio, por ejemplo la luna en SVG.
4. Mejoras 1–4 de esta aprobación: líneas del h2 a 375 px, puntos con nombres largos, test que sincronice `MOON_PATH` y nombres de los `decor.test.ts`.
5. Comprobaciones manuales que no hizo nadie:
   - mapa cargado y recorrido de sus controles con teclado;
   - recorrido con lector de pantalla;
   - apertura de WhatsApp en móvil y en escritorio;
   - vista a 1280×800.
6. Fábrica: que `scripts/evidencia.mjs` desplace la página hasta el mapa, o espere a que cargue, antes de la captura de página completa, para que el iframe diferido no salga en blanco y no confunda a los revisores.
