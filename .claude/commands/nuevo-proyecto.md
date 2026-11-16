---
description: Crea un proyecto nuevo y siembra su brain con visión y especificación
argument-hint: <nombre-en-kebab-case> <descripción de la idea>
---

Argumentos: $ARGUMENTS
(La primera palabra es el nombre del proyecto; el resto es la idea.)

1. Estación de código: `node scripts/nuevo-proyecto.mjs <nombre>`. Copia la plantilla e inicializa
   `app/` como repositorio git con rama `main`. Si falla (p. ej. ya existe), detente y dime el error.
2. Lanza el agente **analista** con el nombre y la idea → `brain/vision.md`, `brain/spec.md`, `brain/huecos.md`.
3. Muéstrame un resumen de la spec y los huecos.

**Detente aquí.** Esta es una estación humana: yo reviso y apruebo la spec. Cuando lo haga usaré
`/planificar <nombre>`.
