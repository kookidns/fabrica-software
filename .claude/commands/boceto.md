---
description: Genera con ChatGPT el boceto visual (objetivo) de un proyecto o de una tarea, o lo rehace con tus cambios
argument-hint: <proyecto> [ID-de-tarea] [qué cambiar respecto a la versión anterior]
---

Argumentos: $ARGUMENTS
(Primera palabra: proyecto. Si la segunda tiene forma `T-AAAAMMDD-NNN`, es una tarea. El resto, si lo
hay, son los cambios que pide el humano sobre la última versión.)

Esta es la estación del **boceto visual**. ChatGPT, con la herramienta de imágenes de Codex y tu sesión
de ChatGPT, dibuja cómo debe verse el resultado antes de escribir specs o código.

1. Estación de código:
   `node scripts/boceto.mjs generar <p> [--tarea <ID>] [--notas "<cambios pedidos>"]`
   (en Windows PowerShell entrecomilla las notas). Si falla, enséñame el registro que indique y detente.
2. Abre con Read las imágenes que imprime el script y el `vN.md` de esa versión. Enséñamelas: descríbeme
   en pocas líneas qué muestra cada una, cuáles son los supuestos y qué parte del brain refleja.
3. **Detente aquí. Es una estación humana.** Dime las dos salidas:
   - Pedir cambios: `/boceto <p> [ID] <qué cambiar>`, que genera la versión siguiente partiendo de esta.
   - Aprobarlo: lo ejecuto yo en mi terminal, `node scripts/boceto.mjs aprobar <p> [--tarea <ID>]`.
     Tú no puedes aprobarlo: el guardián lo bloquea.

Al aprobar, el boceto pasa a `brain/boceto/aprobado-*.png` (o a `tareas/<ID>/boceto/`) y se convierte en
el objetivo visual. Sin el boceto del proyecto aprobado, `nueva-tarea.mjs` no deja empezar a construir.
