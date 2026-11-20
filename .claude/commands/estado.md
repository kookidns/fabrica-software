---
description: Resume el estado de un proyecto (o de todos) leyendo su brain, bandeja y tareas
argument-hint: [nombre-del-proyecto]
---

Si me das un nombre ($ARGUMENTS), lee `proyectos/$ARGUMENTS/` y dime:
- Estructura del proyecto (`node scripts/estructura.mjs estado $ARGUMENTS`): versiones, si está aprobada y
  cuántos recursos tiene. Si no lo está, ese es el siguiente paso (`/fabrica estructura $ARGUMENTS`).
- Entradas pendientes en `bandeja/` (cuántas y las 3 siguientes).
- Tareas de `tareas/*/estado.json` agrupadas por estado: en curso, esperando humano, bloqueadas, cerradas.
- Para las que esperan humano: el comando exacto que debo ejecutar.
- Huecos abiertos en `brain/huecos.md`.
- Las 3 últimas entradas de `brain/log.md`.
- El siguiente comando recomendado.

Sin nombre: tabla con todos los proyectos de `proyectos/`, su bandeja y sus tareas por estado.
No modifiques ningún archivo.
