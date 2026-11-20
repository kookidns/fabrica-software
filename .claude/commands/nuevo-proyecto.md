---
description: Crea un proyecto nuevo, siembra su brain con visión y especificación, y genera con ChatGPT la estructura (diagrama) y los recursos visuales
argument-hint: <nombre-en-kebab-case> <descripción de la idea, tan detallada como quieras>
---

Argumentos: $ARGUMENTS
(La primera palabra es el nombre del proyecto; el resto es la idea. Si el humano adjuntó imágenes de
referencia o enlaces, pásaselos también al analista.)

1. Estación de código: `node scripts/nuevo-proyecto.mjs <nombre>`. Copia la plantilla e inicializa
   `app/` como repositorio git con rama `main`. Si falla (p. ej. ya existe), detente y dime el error.
2. Lanza el agente **analista** con el nombre y la idea → `brain/vision.md`, `brain/spec.md`, `brain/huecos.md`.
3. Estación de estructura y recursos: `node scripts/estructura.mjs generar <nombre>`. ChatGPT define la
   estructura como diagrama y genera solo las imágenes que irán dentro de la página. Lee `v1/diagrama.md`,
   `v1/recursos.md` y `v1/version.md`, y abre con Read las imágenes `v1/img/*.webp`.
4. Muéstrame:
   - un resumen de la visión y la spec, con los huecos que tengo que resolver;
   - el diagrama de la estructura: dibújalo si tienes una herramienta para mostrar diagramas; si no, como texto;
   - los recursos visuales: cada imagen con su id, dónde va y su texto alternativo.

**Detente aquí.** Son estaciones humanas: reviso la spec, la estructura y los recursos.
- Para cambiar la estructura o varias cosas: `/fabrica estructura <nombre> <qué cambiar>`.
- Para rehacer una sola imagen: `/fabrica estructura <nombre> --recurso <id> <qué cambiar>`.
- Cuando me guste, la apruebo yo en mi terminal: `node scripts/estructura.mjs aprobar <nombre>`.
- Con la spec y la estructura aprobadas, sigo con `/fabrica planificar <nombre>`.
