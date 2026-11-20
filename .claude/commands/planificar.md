---
description: Con la spec aprobada, define arquitectura y diseño en el brain y llena la bandeja de tareas
argument-hint: <nombre-del-proyecto>
---

Proyecto: `proyectos/$ARGUMENTS/`

1. Si `brain/spec.md` dice `Estado: BORRADOR`, pregúntame si la apruebo. Si digo que sí, cámbialo a
   `Estado: APROBADA (<fecha de hoy>)`. Si no, detente.
2. Comprueba la estructura: `node scripts/estructura.mjs estado $ARGUMENTS`. Si `aprobada` es `null` y
   `fabrica.config.json > estructura.obligatorio` no es `false`, detente: dime que la genere con
   `/fabrica estructura $ARGUMENTS` y que la apruebe yo con `node scripts/estructura.mjs aprobar $ARGUMENTS`.
3. Lanza el agente **arquitecto** → `brain/arquitectura.md`, `brain/decisiones.md` y archivos en `bandeja/`.
   Las tareas construyen `brain/estructura/aprobado/diagrama.md` sección por sección y colocan sus recursos.
4. Lanza el agente **disenador** → `brain/diseno.md`, con tokens coherentes con la marca y los recursos aprobados.
5. Comprueba que cada `CA-xx.x` de `brain/spec.md` aparece en algún archivo de `bandeja/`. Si falta
   alguno, pide al arquitecto que lo cubra.
6. Muéstrame la lista de tareas de la bandeja y un resumen del diseño.
   Siguiente paso: `/fabrica $ARGUMENTS` (procesa la siguiente entrada de la bandeja).
