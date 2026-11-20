#!/usr/bin/env node
// Hook PreToolUse de Claude Code: bloquea lo que ningún agente de la fábrica debe hacer.
// Recibe por stdin el JSON de la llamada a la herramienta. Salir con código 2 = bloquear
// (el mensaje de stderr se le devuelve al agente para que entienda por qué).

let entrada = '';
process.stdin.on('data', (c) => (entrada += c));
process.stdin.on('end', () => {
  let datos;
  try {
    datos = JSON.parse(entrada.replace(/^﻿/, '').trim());
  } catch {
    process.exit(0);
  }
  const herramienta = datos.tool_name ?? '';
  const input = datos.tool_input ?? {};

  if (herramienta === 'Bash' || herramienta === 'PowerShell') {
    // Se ignora el texto entre comillas (p. ej. un mensaje de commit que diga "push notifications").
    const cmd = String(input.command ?? '').replace(/"[^"]*"|'[^']*'/g, '""');
    const reglas = [
      [/--aprobar\b/, 'Solo el humano puede aprobar tareas de riesgo ALTO (cerrar-tarea.mjs --aprobar).'],
      [/(boceto|estructura)\.mjs\S*\s+aprobar\b/, 'Solo el humano aprueba la estructura y los recursos visuales (node scripts/estructura.mjs aprobar ...).'],
      [/\bgit\b[^\n;|&]*\bpush\b/, 'Los agentes no hacen push. Lo decide el humano.'],
      [/\bgh\s+pr\s+merge\b/, 'Los agentes no fusionan PRs.'],
      [/\bgit\b[^\n;|&]*\bmerge\b(?!\s+(--abort|main\b|master\b))/, 'Integrar ramas es trabajo de scripts/cerrar-tarea.mjs, no de un agente.'],
      [/\bgit\b[^\n;|&]*\breset\s+--hard\b/, 'git reset --hard destruye trabajo: prohibido para agentes.'],
      [/\bgit\b[^\n;|&]*\bbranch\s+-D\b/, 'Borrar ramas a la fuerza está prohibido para agentes.'],
      [/--no-verify\b/, 'No se saltan los hooks de git.'],
      [/\bgit\b[^\n;|&]*\bworktree\s+remove\b/, 'Los worktrees los limpia scripts/cerrar-tarea.mjs.'],
    ];
    for (const [patron, motivo] of reglas) {
      if (patron.test(cmd)) {
        console.error(`⛔ Guardián de la fábrica: ${motivo}`);
        process.exit(2);
      }
    }
  }

  if (herramienta === 'Edit' || herramienta === 'Write' || herramienta === 'NotebookEdit') {
    const ruta = String(input.file_path ?? '').replaceAll('\\', '/');
    const protegidos = [
      [/\/tareas\/[^/]+\/(traza\.jsonl|riesgo-codigo\.json)$/, 'La traza y el riesgo calculado por código no se editan a mano.'],
      [/\/proyectos\/[^/]+\/app\//,'No se edita app/ directamente: se trabaja en el worktree de la tarea (.worktrees/<ID>/).'],
      [/\/boceto\/(aprobado[^/]*|estado\.json)$/, 'El boceto aprobado de un proyecto antiguo no se edita a mano.'],
      [/\/estructura\/(aprobado\/|estado\.json$)/, 'La estructura aprobada solo la fija el humano con scripts/estructura.mjs aprobar.'],
    ];
    for (const [patron, motivo] of protegidos) {
      if (patron.test(ruta)) {
        console.error(`⛔ Guardián de la fábrica: ${motivo}`);
        process.exit(2);
      }
    }
  }

  process.exit(0);
});
