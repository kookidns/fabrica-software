# Estructura y recursos visuales del proyecto

Aquí vive el objetivo del proyecto:
- `node scripts/estructura.mjs generar <p>`: ChatGPT (vía Codex) crea `vN/diagrama.md` (estructura en
  Mermaid), `vN/recursos.json` y `vN/recursos.md` (qué imágenes van y dónde), y `vN/img/<id>.png` y `.webp`
  (solo las imágenes que irán dentro de la página).
- `node scripts/estructura.mjs aprobar <p>`: lo ejecuta **el humano**. Copia la versión a `aprobado/`.

No edites a mano `aprobado/` ni `estado.json`.
