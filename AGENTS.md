# Instrucciones para agentes de Codex (OpenAI)

Esta carpeta es una AI Factory compartida entre **Claude Code** y **Codex**. Las dos herramientas
siguen las mismas reglas:

1. La constitución completa está en `CLAUDE.md`. Léela antes de actuar: aplica igual a Codex.
2. Las definiciones de cada rol (spec-writer, constructor, revisores, aprobador…) están en
   `.claude/agents/<rol>.md`. Si te asignan un rol, sigue ese archivo al pie de la letra.
3. El contexto de cada proyecto vive en `proyectos/<p>/brain/`. Consúltalo antes de especificar o
   programar y registra en `brain/decisiones.md` toda decisión nueva.
4. El código solo se toca en el worktree de la tarea (`proyectos/<p>/.worktrees/<ID>/`), nunca en `app/`.
5. Prohibido: hacer push, integrar ramas, ejecutar `scripts/cerrar-tarea.mjs --aprobar`, editar
   `tareas/*/traza.jsonl` o `tareas/*/riesgo-codigo.json`, saltarse tests o hooks.

Normalmente no se te invoca a mano: `scripts/agente-codex.mjs` te lanza con el rol, los datos de la
tarea y un sandbox que limita dónde puedes escribir.
