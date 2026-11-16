# T-20261114-002 · Archivo de datos del negocio y enlace de reserva por WhatsApp
Tipo: tarea      Toca interfaz: no (solo datos y una función pura; ningún botón ni sección se pinta en esta tarea)

Cubre de `brain/spec.md`: CA-04.2, CA-04.3, CA-04.4 (en la parte que depende de la URL; el botón que la
usa llega con las secciones portada/reservar).

## Contexto (qué dice el brain que importa aquí)
- **D-00**: los datos reales no se conocen (todos están en `huecos.md`). Se usan datos **ficticios
  claramente marcados** en un **único archivo de datos**: precios en MXN, horario y dirección de
  ejemplo, WhatsApp `+52 000 000 0000`. El sitio no se publica hasta resolver los huecos.
- **arquitectura.md → Datos**: `src/data/business.ts` exporta la constante tipada `business` con
  `name`, `slogan`, `locale` (`es-MX`), `currency` (`MXN`), `menu` (`drinks[]`, `desserts[]` de
  `{ name, price }`), `hours` (7 entradas lunes→domingo, `{ day, open, close } | { day, closed: true }`),
  `address` (texto completo), `coordinates` (`{ lat, lng }`), `whatsapp`
  (`{ number: "520000000000", message }`). Comentario de cabecera que diga que los valores son
  ficticios. **Ningún otro módulo contiene datos del negocio.**
- **D-01**: TypeScript tipa el archivo de datos para que un campo mal escrito falle en `typecheck`.
- **D-05 / arquitectura → Integraciones**: enlace `https://wa.me/<número solo dígitos>?text=<mensaje
  con encodeURIComponent>`; sirve para la app móvil y para WhatsApp Web/página de WhatsApp en
  escritorio. Sin claves ni `.env`.
- **D-06**: los precios se guardan como **número** (el formateo con `Intl.NumberFormat` es de
  `src/lib/formatPrice.ts`, otra tarea).
- **arquitectura.md → Estructura**: `src/lib/` = funciones puras, sin DOM. Pruebas junto al código
  (`*.test.ts`). Nombres de código en inglés; textos visibles (nombres de día, productos, mensaje)
  en español, con tuteo y tono cercano (`vision.md`).
- **D-07**: TypeScript estricto (`strict`, `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax` → los tipos se importan con `import type`).
- **Estado del código** (worktree con lo integrado de T-20261114-001): solo `src/main.ts` (imports de
  estilos), `src/styles/*.css` vacíos y `src/project.test.ts`. No existen `src/data/` ni `src/lib/`:
  nada que reutilizar ni duplicar.

## Objetivo
Crear `src/data/business.ts` (único archivo de datos, tipado, con todos los valores ficticios marcados
según D-00) y `src/lib/whatsapp.ts` (función pura que construye la URL `wa.me` de reserva), con
pruebas que garanticen que el número queda limpio, el mensaje se codifica y decodifica sin pérdida y
pide fecha, hora y nº de personas.

## Criterios de aceptación
### Datos (`src/data/business.ts`, pruebas en `src/data/business.test.ts`)
- **CA-1** — Dado `src/data/business.ts`, cuando una prueba lee su código fuente, entonces empieza con
  un comentario de cabecera que contiene la palabra `ficticio`/`ficticios` (sin distinguir mayúsculas)
  y la referencia `D-00`, indicando que todos los valores son de ejemplo y deben sustituirse por los
  reales.
- **CA-2** — Dado `business`, cuando una prueba lo importa, entonces `name` es `"Cafetería Luna"`,
  `slogan` es una cadena no vacía, `locale` es `"es-MX"` y `currency` es `"MXN"`.
- **CA-3** — Dado `business.menu`, cuando una prueba lo recorre, entonces `drinks` y `desserts` tienen
  al menos 3 productos cada uno, y cada producto tiene `name` no vacío y `price` numérico, finito y
  mayor que 0.
- **CA-4** — Dado `business.hours`, cuando una prueba lo recorre, entonces tiene exactamente 7
  entradas cuyos `day` son, en este orden, `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes`,
  `Sábado`, `Domingo`; al menos una entrada tiene `closed: true` (y no tiene `open`/`close`); y cada
  día abierto tiene `open` y `close` con formato `HH:MM` de 24 h y `open` < `close`.
- **CA-5** — Dado `business`, cuando una prueba lo lee, entonces `address` es una cadena no vacía y
  `coordinates.lat` ∈ [-90, 90] y `coordinates.lng` ∈ [-180, 180] (números finitos).
- **CA-6** — Dado `business.whatsapp`, cuando una prueba lo lee, entonces `number` es exactamente
  `"520000000000"` (solo dígitos: el `+52 000 000 0000` de D-00) y `message` es una cadena no vacía en
  español que menciona **fecha**, **hora** y **personas** (comprobación con expresiones regulares sin
  distinguir mayúsculas: `/\bfecha\b/i`, `/\bhora\b/i`, `/\bpersonas\b/i`).
- **CA-7** — Dado el tipo exportado del archivo de datos (p. ej. `Business`), cuando se ejecuta
  `npm run typecheck`, entonces `business` está anotado con ese tipo (no `any` ni inferido sin tipo) y
  el horario es una unión discriminada: una entrada no puede tener a la vez `closed: true` y
  `open`/`close`.

### Enlace (`src/lib/whatsapp.ts`, pruebas en `src/lib/whatsapp.test.ts`)
- **CA-8** — Dado `buildWhatsAppUrl(number, message)` (exportada, pura, sin DOM ni efectos), cuando se
  llama con `"+52 000 000 0000"` (o con `"(52) 000-000-0000"`), entonces la URL empieza por
  `https://wa.me/520000000000?text=`: el número queda **solo con dígitos** (se eliminan `+`, espacios,
  guiones y paréntesis).
- **CA-9** — Dado un mensaje con espacios, tildes, `ñ`, `¿?`, `&`, `#`, `/`, `=` y saltos de línea,
  cuando se construye la URL, entonces el valor tras `?text=` es exactamente
  `encodeURIComponent(message)` (espacios como `%20`, no `+`), y tanto
  `decodeURIComponent(<valor>)` como `new URL(url).searchParams.get("text")` devuelven el mensaje
  original idéntico (legible, sin pérdida).
- **CA-10** — Dada la URL construida, cuando se analiza con `new URL(...)`, entonces `protocol` es
  `https:`, `hostname` es `wa.me`, `pathname` es `/<dígitos>` y el único parámetro es `text`
  (formato válido para app móvil y WhatsApp Web, CA-04.2/CA-04.4).
- **CA-11** — Dado un número sin ningún dígito (p. ej. `""` o `"+ -"`), cuando se llama a
  `buildWhatsAppUrl`, entonces lanza un `Error` (no devuelve una URL `https://wa.me/?text=…` rota).
- **CA-12** — Dados los datos reales del archivo, cuando se llama a
  `buildWhatsAppUrl(business.whatsapp.number, business.whatsapp.message)`, entonces la URL es
  `https://wa.me/520000000000?text=…` y el texto decodificado menciona fecha, hora y personas
  (CA-04.3).
- **CA-13** — Dado el código fuente de `src/lib/whatsapp.ts`, cuando una prueba lo lee, entonces no
  contiene el número (`520000000000`/`000 000 0000`) ni el mensaje: los datos solo viven en
  `business.ts` (D-00).

### Puertas
- **CA-14** — Dada la carpeta de trabajo, cuando se ejecuta `node scripts/verificar.mjs
  proyectos/cafeteria-luna/.worktrees/T-20261114-002` desde la raíz de la fábrica, entonces `lint`,
  `typecheck`, `test` y `build` salen `ok` (ninguna `omitida`) y las pruebas existentes de
  `src/project.test.ts` siguen pasando sin modificarse.

## Plan
1. **TDD — enlace**: crear `src/lib/whatsapp.test.ts` con CA-8 a CA-11 y CA-13 (fallan: el módulo no
   existe).
2. Crear `src/lib/whatsapp.ts`: `export function buildWhatsAppUrl(number: string, message: string):
   string` → `number.replace(/\D/g, "")`, `Error` si queda vacío, devuelve
   `` `https://wa.me/${digits}?text=${encodeURIComponent(message)}` ``. Sin importar `business`.
3. **TDD — datos**: crear `src/data/business.test.ts` con CA-1 a CA-6 (CA-1 lee el fuente con
   `node:fs` resolviendo la ruta con `import.meta.url`, como `project.test.ts`) y añadir CA-12 a
   `whatsapp.test.ts` importando `business`.
4. Crear `src/data/business.ts`: comentario de cabecera (ficticios, D-00, "sustituir solo este
   archivo"); tipos exportados `MenuItem`, `DayHours` (unión `OpenDay | ClosedDay`, con
   `closed?: never`/`open?: never` para que sea excluyente), `Business`; constante
   `export const business: Business = { … }` con valores de ejemplo: nombre, eslogan, `es-MX`/`MXN`,
   ≥3 bebidas y ≥3 postres con precio numérico en MXN, 7 días (al menos uno cerrado, p. ej. lunes),
   dirección y coordenadas de ejemplo, `whatsapp: { number: "520000000000", message }` con un mensaje
   en tuteo que pide fecha, hora y nº de personas.
5. Ejecutar `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261114-002` hasta que
   las cuatro puertas pasen (CA-14).

Archivos nuevos: `src/data/business.ts`, `src/data/business.test.ts`, `src/lib/whatsapp.ts`,
`src/lib/whatsapp.test.ts`. No debe cambiar ningún otro archivo.

## Fuera de alcance
- Botones "Reservar mesa por WhatsApp", secciones (`src/sections/*`), cambios en `index.html` o
  `src/main.ts` (CA-04.1, atributos `target`/`rel`/`aria-label`: tareas de portada y reservar).
- `src/lib/formatPrice.ts` (D-06) y `src/lib/maps.ts` (URLs de mapa y "Cómo llegar").
- Datos reales del negocio: siguen abiertos en `huecos.md` (eslogan, menú, moneda, horario, dirección,
  número de WhatsApp, texto exacto del mensaje, coordenadas). No se inventan como si fueran reales.
- Aviso de "datos de ejemplo" en el pie (lo pinta la tarea del pie a partir de D-00).
- Alérgenos/opciones del menú, festivos, redes sociales (huecos abiertos).
- Dependencias nuevas (no hacen falta: `encodeURIComponent` y `URL` son nativos).

## Riesgos / zonas sensibles que toca
- **Riesgo ALTO** (`zonas-sensibles.txt` y `arquitectura.md`): crea `src/data/business.ts` y
  `src/lib/whatsapp.ts`. Un número o mensaje erróneo rompe el objetivo principal (reservas) y un
  precio/horario/dirección erróneos engañan al cliente → requiere **aprobación humana** en el cierre.
- Codificación: usar `encodeURIComponent` sobre el mensaje completo (no `encodeURI`, no
  `URLSearchParams`, que codifica espacios como `+`); no codificar dos veces.
- Limpieza del número: quitar el `+` y todo lo que no sea dígito; `wa.me` no admite `+`, espacios ni
  guiones, y un `0` inicial de larga distancia no se añade.
- Datos ficticios con apariencia real: deben ser obviamente de ejemplo (número `000 000 0000`,
  comentario de cabecera) para que no se publique por error (D-00).
- TypeScript estricto: usar `import type` para los tipos (`verbatimModuleSyntax`); no relajar
  `tsconfig.json` ni reglas de ESLint para pasar las puertas.
