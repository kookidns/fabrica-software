# Arquitectura

Landing de una sola página, estática, sin backend. Ver decisiones D-01 a D-06.

## Stack
- **Vite** (servidor de desarrollo + build estático a `dist/`) con **TypeScript** "vanilla": sin
  framework de UI (D-01).
- **CSS plano** con custom properties (tokens de `diseno.md`); sin Tailwind (D-02).
- **Calidad** (D-03): ESLint 9 (flat config) + typescript-eslint · `tsc --noEmit` · Vitest + jsdom.
- Sin dependencias de producción: todo lo instalado es `devDependencies`.
- Node LTS actual; versiones fijadas en `package-lock.json`.

## Estructura de `app/`
```
app/
├── index.html              # Esqueleto semántico estático (lang="es"): header+nav, <main> con las
│                           # secciones (id + <h2>), contenedores vacíos para los datos, footer.
├── package.json            # scripts: dev, lint, typecheck, test, build, preview
├── package-lock.json
├── tsconfig.json
├── vite.config.ts          # build + bloque `test` de Vitest (environment: jsdom)
├── eslint.config.js
├── public/                 # favicon e imágenes estáticas (si las hay)
└── src/
    ├── main.ts             # Punto de entrada: importa estilos y monta cada sección en su contenedor
    ├── data/
    │   └── business.ts     # ÚNICO archivo de datos del negocio (D-00), tipado y marcado como ficticio
    ├── lib/                # Funciones puras, sin DOM
    │   ├── formatPrice.ts  # número → texto con moneda (Intl.NumberFormat)
    │   ├── whatsapp.ts     # número + mensaje → URL wa.me
    │   └── maps.ts         # coordenadas → URL de "Cómo llegar" y URL del mapa embebido
    ├── sections/           # Una función por sección: datos → HTMLElement (DOM API)
    │   ├── hero.ts         # Portada: nombre, eslogan, botón WhatsApp
    │   ├── menu.ts         # Menú: Bebidas y Postres
    │   ├── location.ts     # Horario y ubicación: tabla de horario, dirección, mapa, "Cómo llegar"
    │   └── reserve.ts      # Reservar: texto + botón WhatsApp
    └── styles/
        ├── tokens.css      # Tokens de diseno.md como custom properties en :root
        └── main.css        # Estilos base, layout mobile-first, componentes
```
- Pruebas **junto al código**: `src/**/<modulo>.test.ts`. Las pruebas de estructura de la página
  leen `index.html` y lo cargan en jsdom.
- Nombres de código en inglés; textos visibles en español (estándar de estilo).
- Archivos de más de ~200 líneas se dividen.

## Rutas / páginas
Una sola ruta: `/` (`index.html`). Navegación interna por anclas, en este orden:

| Ancla | Sección | Contenido |
|---|---|---|
| `#inicio` | Portada | Nombre "Cafetería Luna", eslogan, botón "Reservar mesa por WhatsApp" |
| `#menu` | Menú | Grupos "Bebidas" y "Postres"; producto = nombre + precio |
| `#horario` | Horario y ubicación | Horario lunes→domingo (incl. cierres), dirección, mapa, "Cómo llegar" |
| `#reservar` | Reservar | Texto breve + botón "Reservar mesa por WhatsApp" |
| — | Pie | Nombre, dirección corta, aviso de datos de ejemplo mientras rija D-00 |

La cabecera con la navegación (Menú · Horario y ubicación · Reservar) es **fija/sticky**, de modo
que es accesible desde cualquier punto de la página (CA-01.3).

## Datos e integraciones
### Datos (`src/data/business.ts`)
Constante tipada `business` con: `name`, `slogan`, `locale` (`es-MX`), `currency` (`MXN`),
`menu` (`drinks[]`, `desserts[]` de `{ name, price }`), `hours` (7 entradas lunes→domingo,
`{ day, open, close } | { day, closed: true }`), `address` (texto completo), `coordinates`
(`{ lat, lng }`), `whatsapp` (`{ number: "520000000000", message }`).
- Mientras rija D-00 los valores son **ficticios** y el archivo lo dice en un comentario de cabecera.
- Sustituir los datos reales = editar solo este archivo. Ningún otro módulo contiene datos del negocio.

### Integraciones (todas sin claves ni `.env`)
| Integración | Cómo | CA |
|---|---|---|
| WhatsApp | Enlace `https://wa.me/<número solo dígitos>?text=<mensaje con encodeURIComponent>`. Abre la app en móvil y WhatsApp Web/página de WhatsApp en escritorio. | CA-04.2–04.4 |
| Mapa | `<iframe>` de OpenStreetMap (`export/embed.html` con `bbox` y `marker`), `loading="lazy"`, con `title` accesible. | CA-03.3 |
| Cómo llegar | Enlace `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`: abre la app de mapas en móvil o la web en escritorio. | CA-03.4 |

### Reglas de implementación
- Los datos se insertan en el DOM **solo** con `textContent` / `setAttribute`; prohibido `innerHTML`
  con datos.
- Enlaces externos: `target="_blank"` + `rel="noopener noreferrer"` y un nombre accesible que indique
  el propósito (p. ej., `aria-label` del botón de WhatsApp).
- No se recogen datos personales; sin formularios, cookies propias ni analítica (hueco abierto).
- Rendimiento (Lighthouse móvil ≥ 90): sin librerías de UI, mapa diferido (`loading="lazy"`), imágenes
  con `width`/`height` y formatos modernos, fuentes con `font-display: swap` y como mucho 2 familias.

## Zonas sensibles (riesgo ALTO: requieren aprobación humana)
Además de lo que ya detecta `scripts/riesgo.mjs` (dependencias, configuración de build):
- `src/data/business.ts` — un número o un mensaje de WhatsApp erróneo rompe el objetivo principal de
  negocio (reservas) sin que falle ninguna prueba; un precio, horario o dirección erróneos engañan al
  cliente. Cualquier cambio exige revisión humana.
- `src/lib/whatsapp.ts` y los botones de reserva (`src/sections/hero.ts`, `src/sections/reserve.ts`) —
  es el embudo de conversión: si la URL se construye mal, no entra ninguna reserva.
- `index.html` y `src/main.ts` — si el esqueleto o el montaje fallan, la página queda en blanco.
- `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js` —
  dependencias y build (ya cubiertos por el script).
- Cualquier recurso de terceros nuevo (iframes, scripts, fuentes externas) — afecta a privacidad y
  rendimiento.

## Cómo ejecutar
- Instalar: `npm install` (dentro de `app/` o del worktree)
- Desarrollo: `npm run dev`
- Previsualizar el build: `npm run build && npm run preview`
- Puertas: `node scripts/verificar.mjs <carpeta>` (desde la raíz de la fábrica) → `lint`, `typecheck`,
  `test`, `build`
- Lighthouse (CA-05.3, manual): auditoría móvil sobre `npm run preview`.

## Hosting
Estático (`dist/`) en Vercel o Netlify, **solo cuando el humano lo pida** y con los huecos de
contenido resueltos (D-00). Dominio: pendiente (`huecos.md`).
