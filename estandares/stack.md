# Stack por defecto

Úsalo salvo que la spec del proyecto justifique otra cosa (y entonces regístralo en `decisiones.md`).

## Páginas web y landing pages
- **Astro** + **Tailwind CSS**. HTML estático, rápido y con buen SEO.
- Sitios muy simples (una sola página): HTML + CSS + JS sin framework.

## Aplicaciones web interactivas
- **Vite + React + TypeScript** + **Tailwind CSS**.
- Estado: hooks de React; añade una librería solo si hace falta.
- Datos/backend: **Supabase** (auth, base de datos, almacenamiento).

## Calidad (obligatorio en todo proyecto con `package.json`)
Scripts mínimos en `package.json`:
- `lint`: ESLint
- `typecheck`: `tsc --noEmit` (si hay TypeScript)
- `test`: Vitest (pruebas unitarias)
- `build`: build de producción

## Despliegue
- Vercel o Netlify. Solo cuando el humano lo pida.
