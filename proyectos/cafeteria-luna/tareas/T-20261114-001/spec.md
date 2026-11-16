# T-20261114-001 · Inicializar proyecto con el stack y los scripts lint/typecheck/test/build
Tipo: tarea      Toca interfaz: no (solo un `index.html` mínimo sin contenido visible; las secciones van en tareas posteriores)

## Contexto (qué dice el brain que importa aquí)
- **D-01**: Vite + TypeScript vanilla, sin framework de UI. Cada sección será un módulo `camelCase.ts`
  en `src/sections/` (no se crea ninguna en esta tarea).
- **D-02**: CSS plano con custom properties; los tokens vivirán en `src/styles/tokens.css` (sin Tailwind).
  En esta tarea `tokens.css` y `main.css` se crean **vacíos** (lo pide la entrada; el bloque de tokens
  de `diseno.md` se copia en una tarea posterior).
- **D-03**: `lint` = ESLint 9 (flat config, `eslint.config.js`) + typescript-eslint; `typecheck` =
  `tsc --noEmit`; `test` = `vitest run` con entorno **jsdom**; `build` = `vite build`. Pruebas junto
  al código (`*.test.ts`).
- **arquitectura.md**: estructura de `app/` (`index.html`, `package.json`, `package-lock.json`,
  `tsconfig.json`, `vite.config.ts` con el bloque `test` de Vitest, `eslint.config.js`, `src/main.ts`,
  `src/styles/`). Sin dependencias de producción: todo en `devDependencies`, versiones fijadas en
  `package-lock.json`. Las pruebas de estructura leen `index.html` y lo cargan en jsdom. Nombres de
  código en inglés, textos visibles en español.
- **D-04**: `src/main.ts` es el punto de entrada que importa los estilos (y más adelante monta las
  secciones). Prohibido `innerHTML` con datos (no aplica aún: no hay datos).
- **D-05**: sin secretos ni `.env`.
- Puertas: `node scripts/verificar.mjs <carpeta>` ejecuta `lint`, `typecheck`, `test`, `build` con
  `CI=true`; una puerta ausente se marca "omitida", así que las cuatro deben existir.
- Estado actual del código: el worktree solo contiene `README.md` y `.gitignore` (ya ignora
  `node_modules/`, `dist/`, `.env`, `coverage/`). No hay nada que reutilizar ni duplicar.

## Objetivo
Dejar en el worktree un proyecto Vite + TypeScript vanilla que arranca, compila y pasa las cuatro
puertas de calidad, con la estructura base de `brain/arquitectura.md` y una prueba de humo, sin
ningún código de secciones ni datos de negocio.

## Criterios de aceptación
- **CA-1** — Dado `package.json`, cuando una prueba lo lee, entonces define los scripts `dev`,
  `lint`, `typecheck`, `test`, `build` y `preview`, con `typecheck` = `tsc --noEmit`, `test` =
  `vitest run`, `build` = `vite build`, y `lint` invoca `eslint`.
- **CA-2** — Dado `package.json`, cuando una prueba lo lee, entonces no tiene `dependencies` (o está
  vacío) y en `devDependencies` figuran al menos `vite`, `typescript`, `vitest`, `jsdom`, `eslint` y
  `typescript-eslint`; y existe `package-lock.json` en el worktree.
- **CA-3** — Dado `index.html`, cuando una prueba lo carga en jsdom, entonces el elemento `<html>`
  tiene `lang="es"`, `document.title` es exactamente `Cafetería Luna`, tiene `<meta charset="UTF-8">`
  y `<meta name="viewport" content="width=device-width, initial-scale=1">`, y carga
  `/src/main.ts` con `<script type="module">`.
- **CA-4** — Dado `index.html`, cuando una prueba lo carga en jsdom, entonces no contiene secciones
  de contenido (ningún `<section>` ni `<h2>`): la tarea no incluye código de secciones.
- **CA-5** — Dado el worktree, cuando una prueba comprueba los archivos, entonces existen
  `src/main.ts`, `src/styles/tokens.css` y `src/styles/main.css`, y ambos CSS están vacíos (o solo
  con espacios/comentarios, sin reglas).
- **CA-6** — Dado `src/main.ts`, cuando una prueba lo lee, entonces importa `./styles/tokens.css` y
  `./styles/main.css`, en ese orden (tokens antes que el resto de estilos).
- **CA-7** — Dada la configuración de Vitest, cuando se ejecuta `npm run test`, entonces las pruebas
  corren en entorno jsdom (la prueba de humo verifica que `window` y `document` existen) y el
  comando termina sin modo watch.
- **CA-8** — Dada la carpeta de trabajo, cuando se ejecuta `node scripts/verificar.mjs
  proyectos/cafeteria-luna/.worktrees/T-20261114-001` desde la raíz de la fábrica, entonces las
  cuatro puertas (`lint`, `typecheck`, `test`, `build`) salen `ok`, ninguna `omitida`, y el proceso
  termina con código 0.
- **CA-9** — Dado `npm run build`, cuando termina, entonces genera `dist/index.html` con
  `lang="es"` y el título `Cafetería Luna`. (Comprobable en la puerta `build` + inspección; no se
  versiona `dist/`.)

## Plan
1. **Prueba primero (TDD)**: crear `src/smoke.test.ts` (o `src/project.test.ts`) con las pruebas de
   CA-1 a CA-7: leer `package.json`, `index.html` (cargado en jsdom vía `DOMParser`/`document`),
   `src/main.ts` y los CSS con `node:fs`; comprobar que `window`/`document` existen. Debe fallar
   antes de crear los archivos.
2. `package.json` (`"type": "module"`, `"private": true`, sin `dependencies`) con los seis scripts;
   instalar en `devDependencies`: `vite`, `typescript`, `vitest`, `jsdom`, `eslint`, `@eslint/js`,
   `typescript-eslint`, `globals` (y `@types/node` si las pruebas usan `node:fs`). Generar
   `package-lock.json` con `npm install`.
3. `tsconfig.json`: `strict: true`, `target`/`module` ES2022, `moduleResolution: "bundler"`,
   `noEmit: true`, `types: ["vite/client", "node"]` (para importar CSS y usar `node:fs` en pruebas),
   `include: ["src", "vite.config.ts"]`.
4. `vite.config.ts` con `defineConfig` de `vitest/config` y `test: { environment: "jsdom" }`.
5. `eslint.config.js` (flat config): `@eslint/js` recomendado + `typescript-eslint` recomendado;
   ignorar `dist/` y `node_modules/`.
6. `index.html` mínimo: `<!doctype html>`, `<html lang="es">`, charset, viewport,
   `<title>Cafetería Luna</title>`, `<body>` vacío salvo `<script type="module" src="/src/main.ts">`.
   (El esqueleto con landmarks, nav y secciones es de tareas posteriores.)
7. `src/main.ts`: solo los dos `import` de estilos (tokens y main). `src/styles/tokens.css` y
   `src/styles/main.css` vacíos.
8. Ejecutar `node scripts/verificar.mjs proyectos/cafeteria-luna/.worktrees/T-20261114-001` hasta
   que las cuatro puertas pasen. Opcional: añadir a `README.md` del worktree la sección "Cómo
   ejecutar" copiada de `arquitectura.md`.

Archivos que probablemente cambian (todos nuevos salvo README): `package.json`, `package-lock.json`,
`tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `index.html`, `src/main.ts`,
`src/styles/tokens.css`, `src/styles/main.css`, `src/smoke.test.ts`, `README.md` (opcional).

## Fuera de alcance
- Código de secciones (`src/sections/*`), `src/data/business.ts`, `src/lib/*` y cualquier dato de
  negocio.
- Contenido de `tokens.css` (bloque de `diseno.md`) y de `main.css`; fuentes de Google Fonts.
- Esqueleto semántico completo de `index.html` (header, nav, `<main>`, secciones, footer, enlace
  "Saltar al contenido").
- Favicon / `public/`, Lighthouse (CA-05.3), despliegue, Prettier, hooks de git, CI.
- Dependencias de producción o de UI (React, Tailwind, Astro): contradirían D-01/D-02.

## Riesgos / zonas sensibles que toca
- **Riesgo ALTO esperado** según `arquitectura.md` → "Zonas sensibles": crea `package.json`,
  `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js` (dependencias y build),
  `index.html` y `src/main.ts` (si fallan, la página queda en blanco). Requerirá aprobación humana
  en el cierre.
- Dependencias nuevas de terceros (solo `devDependencies`): fijar versiones con `package-lock.json`;
  revisar que no se cuele nada en `dependencies` (CA-2).
- Configuración ESLint/TS: no desactivar reglas ni bajar `strict` para pasar las puertas (regla de
  la fábrica).
- `CI=true` en `verificar.mjs`: `test` debe ser `vitest run` (sin watch) para no colgarse.
- Windows: rutas y fin de línea; las pruebas que lean archivos deben resolver rutas con
  `node:path`/`import.meta.url`, no rutas absolutas.
