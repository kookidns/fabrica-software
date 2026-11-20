---
description: Genera o rehace con ChatGPT la estructura (diagrama) y los recursos visuales de un proyecto o de una pantalla nueva
argument-hint: <proyecto> [ID-de-tarea] [--recurso <id>] [qué cambiar respecto a la versión anterior]
---

Argumentos: $ARGUMENTS
(Primera palabra: proyecto. Si la segunda tiene forma `T-AAAAMMDD-NNN`, es una tarea. `--recurso <id>`
rehace solo esa imagen. El resto, si lo hay, son los cambios que pide el humano sobre la última versión.)

Esta es la estación de **estructura y recursos**. ChatGPT (vía Codex, con tu sesión de ChatGPT) no dibuja
la página terminada: define su estructura como diagrama (Mermaid) y genera solo las imágenes que irán
dentro (ilustraciones, fotos, fondos). Los iconos simples los dibuja después el constructor en SVG.

1. Estación de código:
   `node scripts/estructura.mjs generar <p> [--tarea <ID>] [--recurso <id>] [--notas "<cambios pedidos>"]`
   Si falla, enséñame el registro que indique y detente.
2. Lee `vN/diagrama.md`, `vN/recursos.md` y `vN/version.md`, y abre con Read las imágenes `vN/img/*.webp`.
   Enséñamelo:
   - el diagrama, dibujado si tienes una herramienta para mostrar diagramas, o como texto;
   - cada imagen con su id, la sección donde va y su texto alternativo;
   - los supuestos.
3. **Detente aquí. Es una estación humana.** Dime las salidas:
   - Pedir cambios: `/fabrica estructura <p> [ID] <qué cambiar>`, o `--recurso <id> <qué cambiar>` para una sola imagen.
   - Aprobarla: lo ejecuto yo en mi terminal: `node scripts/estructura.mjs aprobar <p> [--tarea <ID>]`.
     Tú no puedes aprobarla: el guardián lo bloquea.

Al aprobar, la versión pasa a `brain/estructura/aprobado/` (o a `tareas/<ID>/estructura/aprobado/`) y se
convierte en el objetivo. Sin la estructura del proyecto aprobada, `nueva-tarea.mjs` no deja empezar.
