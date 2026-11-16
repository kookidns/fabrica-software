<!-- tipo: tarea · origen: bandeja/001-inicializar-proyecto.md · 2026-11-14T16:11:42.900Z -->

---
tipo: tarea
cubre: ninguno (base técnica para todas las tareas)
---
# Inicializar proyecto con el stack y los scripts lint/typecheck/test/build
Crear en `app/` el proyecto Vite + TypeScript vanilla (D-01) con `package.json` y los scripts `dev`,
`lint` (ESLint 9 + typescript-eslint), `typecheck` (`tsc --noEmit`), `test` (`vitest run`, entorno
jsdom), `build` (`vite build`) y `preview` (D-03). Dejar la estructura de `brain/arquitectura.md`:
`index.html` mínimo con `lang="es"` y `<title>Cafetería Luna</title>`, `src/main.ts`,
`src/styles/tokens.css` y `main.css` vacíos, y una prueba de humo que pase.
Hecho cuando `node scripts/verificar.mjs <carpeta>` pasa las cuatro puertas. Sin código de secciones.
