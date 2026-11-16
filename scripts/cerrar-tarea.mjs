#!/usr/bin/env node
// Estación de código: integra una tarea aprobada en la rama base, o la deja esperando al humano.
// Uso: node scripts/cerrar-tarea.mjs <proyecto> <ID> [--aprobar]
// --aprobar solo lo ejecuta el HUMANO (el hook guardián lo bloquea para los agentes).
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, fallar, git, leerJSON, registrar, rutasTarea, ultimaTraza } from './lib.mjs';

const [proyecto, id, bandera] = process.argv.slice(2);
const aprobadoPorHumano = bandera === '--aprobar';
const r = rutasTarea(proyecto, id);
const estado = leerJSON(r.estado, {});
const trabajo = join(RAIZ, estado.trabajo ?? '');

// 1. Requisitos: aprobada por el aprobador y riesgo calculado por ambos (script y agente)
const aprob = ultimaTraza(r, 'aprobador');
if (aprob?.resultado !== 'APROBADO') fallar(`La tarea no está APROBADA por el aprobador (último: ${aprob?.resultado ?? 'ninguno'})`);
const rCodigo = leerJSON(join(r.tarea, 'riesgo-codigo.json'));
const rAgente = leerJSON(join(r.tarea, 'riesgo-agente.json'));
if (!rCodigo) fallar('Falta riesgo-codigo.json: ejecuta antes scripts/riesgo.mjs');
if (!rAgente || !['BAJO', 'ALTO'].includes(rAgente.nivel)) fallar('Falta riesgo-agente.json válido ({"nivel":"BAJO|ALTO","motivo":"..."})');

// 2. Nivel final: el más alto de los dos. El agente nunca puede bajar lo que dice el código.
const nivel = rCodigo.nivel === 'ALTO' || rAgente.nivel === 'ALTO' ? 'ALTO' : 'BAJO';
if (nivel === 'ALTO' && !aprobadoPorHumano) {
  registrar(r, 'cierre', 'ESPERANDO_HUMANO', [...rCodigo.motivos, rAgente.motivo].filter(Boolean).join(' | '));
  console.log(`⏸ ${id}: riesgo ALTO. Necesita revisión humana.
  Motivos: ${[...rCodigo.motivos, rAgente.motivo].filter(Boolean).join('; ')}
  Revisa los cambios:  git -C "${join(RAIZ, 'proyectos', proyecto, 'app')}" diff ${estado.base}...${estado.rama}
  Si estás de acuerdo:  node scripts/cerrar-tarea.mjs ${proyecto} ${id} --aprobar`);
  process.exit(0);
}

// 3. Sin git: no hay nada que integrar
if (!estado.rama) {
  registrar(r, 'cierre', 'CERRADA', `riesgo ${nivel}, sin git`);
  console.log(`✔ ${id} cerrada (sin git).`);
  process.exit(0);
}

// 4. Puertas otra vez, justo antes de integrar (determinista, no se confía en lo que dijo nadie)
const puertas = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'verificar.mjs'), trabajo], { stdio: 'inherit' });
if (puertas.status !== 0) {
  registrar(r, 'cierre', 'PUERTAS_FALLAN', 'las puertas fallaron al cerrar');
  fallar('Las puertas fallan: no se integra.');
}

// 5. Integrar en la rama base
const app = join(RAIZ, 'proyectos', proyecto, 'app');
if (git(['status', '--porcelain'], trabajo).out) fallar('El worktree tiene cambios sin commit.');
if (git(['symbolic-ref', '--short', 'HEAD'], app).out !== estado.base) fallar(`app/ no está en la rama ${estado.base}.`);
if (git(['status', '--porcelain'], app).out) fallar('app/ tiene cambios sin commit: no se integra.');
const merge = git(['merge', '--no-ff', estado.rama, '-m', `${id}: integrar (${aprobadoPorHumano ? 'aprobada por humano' : 'riesgo bajo'})`], app);
if (!merge.ok) {
  git(['merge', '--abort'], app);
  registrar(r, 'cierre', 'CONFLICTO', merge.err);
  fallar(`Conflicto al integrar: ${merge.err}`);
}
// Limpieza del worktree. En Windows algún binario de node_modules puede seguir bloqueado unos
// segundos tras el build, así que se fuerza, se reintenta y, si aun así queda algo, se avisa.
git(['worktree', 'remove', '--force', trabajo], app);
if (existsSync(trabajo)) {
  try {
    rmSync(trabajo, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch { /* se avisa abajo */ }
}
git(['worktree', 'prune'], app);
git(['branch', '-d', estado.rama], app);
const restos = existsSync(trabajo) ? ` · no se pudo borrar ${estado.trabajo} (bórrala a mano)` : '';
if (restos) console.error(`⚠ Integrada, pero quedó la carpeta ${trabajo}: algún archivo está bloqueado. Bórrala a mano.`);

registrar(r, 'cierre', 'INTEGRADA', (aprobadoPorHumano ? 'aprobada por humano' : `riesgo ${nivel}`) + restos);
console.log(`✔ ${id} integrada en ${estado.base} (${aprobadoPorHumano ? 'aprobada por humano' : 'riesgo bajo, automática'}).`);
