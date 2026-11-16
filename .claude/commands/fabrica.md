---
description: Pasa una entrada (tarea, error de producción o issue) por toda la línea de la fábrica, repartiendo estaciones entre Claude y Codex
argument-hint: <proyecto> [error|issue|tarea] [texto de la entrada; vacío = siguiente de la bandeja]
---

Argumentos: $ARGUMENTS
(Primera palabra: proyecto. Si la segunda es `error`, `issue` o `tarea`, es el tipo. El resto, si lo
hay, es el texto de la entrada. Sin texto se toma la siguiente entrada de `bandeja/`.)

Eres el **orquestador**. No escribes código ni juzgas calidad: mueves la pieza entre estaciones y
dejas rastro. A los agentes pásales solo rutas y datos (proyecto, ID, carpeta de trabajo, ronda),
nunca tu razonamiento ni el de otro agente: cada uno arranca con contexto limpio.

## Antes de empezar: el reparto de motores
Lee `fabrica.config.json > estaciones`. Cada estación tiene `motor`:
- **`claude`** → lanza el subagente de Claude Code con ese nombre. Guarda tú su respuesta en la
  ruta indicada y luego ejecuta `node scripts/traza.mjs <p> <ID> <estación> <resultado> "claude"`.
- **`codex`** → ejecuta `node scripts/agente-codex.mjs <estación> <p> <ID> --ronda <n>`. El script
  lanza Codex (OpenAI), guarda la entrega en la misma ruta y deja la traza él solo: **no** llames a
  `traza.mjs` para esa estación. Si el script falla, lee el log que indica y detente.

## 0 · Entrada (código)
`node scripts/nueva-tarea.mjs <p> [--tipo <tipo>] [--texto "<texto>"]`
Devuelve JSON con `id` y `trabajo` (carpeta del worktree). Si dice que la bandeja está vacía, termina.

## 1 · Spec — estación `spec-writer`
Entrega: `tareas/<ID>/spec.md`. Si empieza por `NECESITA_HUMANO`, traza `spec-writer NECESITA_HUMANO`,
muéstrame la pregunta y **detente**.

## 2 · Build — estación `constructor`
Datos: proyecto, ID, carpeta de trabajo, spec y, si la ronda es > 1, la ruta del último
`aprobacion-ronda<n-1>.md` (con codex, pásala con `--extra "Corrige lo pedido en <ruta>"`).
Entrega: `tareas/<ID>/build-ronda<n>.md`. Si reporta "Decisiones nuevas", añádelas a
`brain/decisiones.md` con fecha y `origen: <ID>`.

## 2b · Evidencia — estación de código (solo si la spec dice `Toca interfaz: sí`)
`node scripts/evidencia.mjs <p> <ID> --ronda <n>` (añade `--comparar-main` si la spec pide que no
cambie nada visual, y `--lighthouse` si pide Lighthouse). Genera `tareas/<ID>/evidencia-ronda<n>/`
con capturas, mediciones y recorrido con Tab. Los revisores pueden usarla porque no la escribe el
constructor. Si falla (sin Chrome), traza `evidencia FALLO` y sigue: los revisores lo anotarán como
no verificado.

## 3 · Revisión — 4 estaciones EN PARALELO, en un único mensaje
`revisor-seguridad`, `revisor-ux`, `revisor-ui`, `revisor-codigo`. En el MISMO mensaje lanza:
- una llamada a subagente por cada revisor con motor `claude`, y
- un solo comando `node scripts/agente-codex.mjs revisores <p> <ID> --ronda <n>`, que lanza en
  paralelo todos los revisores con motor `codex`.
Entregas: `tareas/<ID>/revisiones/<revisor>-ronda<n>.md`.

## 4 · Aprobación — estación `aprobador`
Datos: la spec y las rutas de los 4 informes de la ronda. Entrega: `tareas/<ID>/aprobacion-ronda<n>.md`.
- **RECHAZADO** → vuelve al paso 2 con n+1. Máximo 3 rondas: si la 3.ª también se rechaza, traza
  `aprobador BLOQUEADA`, añade la entrada a `brain/log.md` y **detente** para que yo decida.
- **APROBADO** → sigue.

## 5 · Riesgo — código + estación `clasificador-riesgo`
1. `node scripts/riesgo.mjs <p> <ID>` → `tareas/<ID>/riesgo-codigo.json`.
2. Estación `clasificador-riesgo` → `tareas/<ID>/riesgo-agente.json` (JSON `{"nivel","motivo"}`).
   El cierre usa el MÁS alto de los dos: ningún agente puede bajar el riesgo.

## 6 · Cierre (código)
`node scripts/cerrar-tarea.mjs <p> <ID>`
- Riesgo BAJO → integra la rama en `main` y limpia el worktree.
- Riesgo ALTO → queda esperando. Dime que revise la rama `fabrica/<ID>` y que, si estoy de acuerdo,
  ejecute yo en mi terminal: `node scripts/cerrar-tarea.mjs <p> <ID> --aprobar`
  (tú no puedes ejecutar `--aprobar`: el hook guardián lo bloquea).

## 7 · Brain
Añade arriba en `brain/log.md`: fecha, ID, título, resultado, riesgo, rondas y qué motor hizo cada estación.

## Resumen final
Tabla con cada estación, su motor (claude/codex + modelo), su resultado y la ruta de su rastro en `tareas/<ID>/`.
