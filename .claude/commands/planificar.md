---
description: Con la spec aprobada, define arquitectura y diseño en el brain y llena la bandeja de tareas
argument-hint: <nombre-del-proyecto>
---

Proyecto: `proyectos/$ARGUMENTS/`

1. Si `brain/spec.md` dice `Estado: BORRADOR`, pregúntame si la apruebo. Si digo que sí, cámbialo a
   `Estado: APROBADA (<fecha de hoy>)`. Si no, detente.
2. Lanza el agente **arquitecto** → `brain/arquitectura.md`, `brain/decisiones.md` y archivos en `bandeja/`.
3. Lanza el agente **disenador** → `brain/diseno.md`.
4. Comprueba que cada `CA-xx.x` de `brain/spec.md` aparece en algún archivo de `bandeja/`. Si falta
   alguno, pide al arquitecto que lo cubra.
5. Muéstrame la lista de tareas de la bandeja y un resumen del diseño.
   Siguiente paso: `/fabrica $ARGUMENTS` (procesa la siguiente entrada de la bandeja).
