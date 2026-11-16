---
description: Crea un proyecto nuevo, siembra su brain con visión y especificación y genera el boceto visual con ChatGPT
argument-hint: <nombre-en-kebab-case> <descripción de la idea, tan detallada como quieras>
---

Argumentos: $ARGUMENTS
(La primera palabra es el nombre del proyecto; el resto es la idea. Si el humano adjuntó imágenes de
referencia o enlaces, pásaselos también al analista.)

1. Estación de código: `node scripts/nuevo-proyecto.mjs <nombre>`. Copia la plantilla e inicializa
   `app/` como repositorio git con rama `main`. Si falla (p. ej. ya existe), detente y dime el error.
2. Lanza el agente **analista** con el nombre y la idea → `brain/vision.md`, `brain/spec.md`, `brain/huecos.md`.
3. Estación del boceto: `node scripts/boceto.mjs generar <nombre>`. ChatGPT dibuja la página o la app a
   partir del brain recién creado. Abre con Read las imágenes y el `v1.md`.
4. Muéstrame:
   - un resumen de la visión y la spec, con los huecos que tengo que resolver;
   - el boceto (enséñame las imágenes y descríbelas en pocas líneas).

**Detente aquí.** Son estaciones humanas: reviso la spec y el boceto.
- Si quiero cambios en el boceto: `/boceto <nombre> <qué cambiar>`.
- Cuando me guste, lo apruebo yo en mi terminal: `node scripts/boceto.mjs aprobar <nombre>`.
- Con la spec y el boceto aprobados, sigo con `/planificar <nombre>`.
