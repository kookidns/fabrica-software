#!/usr/bin/env node
// Puente a Codex (OpenAI): ejecuta una estación de la fábrica con `codex exec`, usando la MISMA
// definición de rol que los subagentes de Claude (.claude/agents/<rol>.md).
//
// Uso:
//   node scripts/agente-codex.mjs --comprobar
//   node scripts/agente-codex.mjs <rol> <proyecto> <ID> [--ronda N] [--extra "texto"]
//   node scripts/agente-codex.mjs revisores <proyecto> <ID> [--ronda N]
//       → lanza EN PARALELO todos los revisores que tengan motor "codex" en fabrica.config.json
//
// Guarda la entrega en tareas/<ID>/, el registro completo en tareas/<ID>/logs/ y deja traza.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, escribirJSON, fallar, git, leerJSON, objetivoVisual, registrar, rutasTarea, encontrarCodex as encontrarCodexLib } from './lib.mjs';

const CONFIG = leerJSON(join(RAIZ, 'fabrica.config.json'), {});
const REVISORES = ['revisor-seguridad', 'revisor-ux', 'revisor-ui', 'revisor-codigo'];

// Cómo trabaja cada rol cuando corre en Codex: dónde puede escribir y dónde se guarda su entrega.
const PERFILES = {
  'spec-writer':         { escribe: 'tarea',      salida: (t) => join(t, 'spec-writer-respuesta.md') },
  'constructor':         { escribe: 'worktree',   salida: (t, n) => join(t, `build-ronda${n}.md`) },
  'revisor-seguridad':   { escribe: 'revisiones', salida: (t, n) => join(t, 'revisiones', `revisor-seguridad-ronda${n}.md`) },
  'revisor-ux':          { escribe: 'revisiones', salida: (t, n) => join(t, 'revisiones', `revisor-ux-ronda${n}.md`) },
  'revisor-ui':          { escribe: 'revisiones', salida: (t, n) => join(t, 'revisiones', `revisor-ui-ronda${n}.md`) },
  'revisor-codigo':      { escribe: 'revisiones', salida: (t, n) => join(t, 'revisiones', `revisor-codigo-ronda${n}.md`) },
  'aprobador':           { escribe: 'nada',       salida: (t, n) => join(t, `aprobacion-ronda${n}.md`) },
  'clasificador-riesgo': { escribe: 'nada',       salida: (t) => join(t, 'riesgo-agente.json'), json: true },
};

// ---------- localizar Codex ----------
function encontrarCodex() {
  return encontrarCodexLib(CONFIG.codex);
}

function comprobar() {
  const exe = encontrarCodex();
  if (!exe) fallar('No encuentro Codex. Instala la app o el CLI (npm i -g @openai/codex), o pon su ruta en fabrica.config.json > codex.ejecutable.');
  const v = spawnSync(exe, ['--version'], { encoding: 'utf8' });
  const l = spawnSync(exe, ['login', 'status'], { encoding: 'utf8' });
  console.log(`Codex:  ${exe}\nVersión: ${(v.stdout || v.stderr).trim()}\nSesión:  ${(l.stdout || l.stderr).trim()}\n`);
  console.log('Reparto de estaciones (fabrica.config.json):');
  for (const [rol, e] of Object.entries(CONFIG.estaciones ?? {})) {
    const modelo = e.motor === 'codex' ? ` · ${e.modelo ?? CONFIG.codex?.modelo_por_defecto ?? 'por defecto'}` : '';
    console.log(`  ${rol.padEnd(20)} ${e.motor}${modelo}`);
  }
  if (l.status !== 0) process.exit(1);
}

// ---------- construir el prompt ----------
function cuerpoDelRol(rol) {
  const ruta = join(RAIZ, '.claude', 'agents', `${rol}.md`);
  if (!existsSync(ruta)) fallar(`No existe la definición del rol: ${ruta}`);
  return readFileSync(ruta, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
}

function construirPrompt(rol, perfil, r, estado, trabajo, ronda, extra, rutaDiff = null) {
  const notas = {
    worktree: `- Solo puedes escribir dentro de la carpeta de trabajo. **No hagas commit**: la fábrica lo hace al terminar.`,
    revisiones: `- Solo puedes escribir en ${join(r.tarea, 'revisiones')} (p. ej. capturas). No modifiques el código ni otros archivos: la fábrica lo comprueba.\n- Contexto limpio: NO leas build-ronda*.md, aprobacion-*.md, riesgo-*.json, otras revisiones ni capturas o comprobaciones del constructor. Juzga solo con el brain, la spec, el diff y lo que compruebes tú; si algo no lo puedes verificar, dilo en la línea "No verificado por mí" (no es un hallazgo). SÍ puedes usar tareas/<ID>/evidencia-ronda<N>/: la genera la estación de código scripts/evidencia.mjs, no el constructor.`,
    tarea: `- Escribe tus archivos dentro de ${r.tarea}.`,
    nada: `- No escribas archivos. Tu entrega es tu último mensaje.`,
  }[perfil.escribe];
  return `${cuerpoDelRol(rol)}

---
## Datos de esta ejecución (te los pasa la fábrica)
- Raíz de la fábrica: ${RAIZ}
- Proyecto: ${estado.proyecto} → ${r.dir}
- Brain: ${r.brain} (empieza por index.md)
- Tarea: ${estado.id} → ${r.tarea}
- Spec de la tarea: ${join(r.tarea, 'spec.md')}
- Carpeta de trabajo (worktree, rama ${estado.rama ?? 'sin rama'}): ${trabajo}
- Rama base: ${estado.base ?? 'main'} (donde las instrucciones dicen "main", usa esta)
- Ronda: ${ronda}
${rutaDiff ? `- Diff completo de la tarea (lo genera la fábrica, ${estado.base ?? 'main'}...HEAD, con commits y resumen): ${rutaDiff}\n  Donde las instrucciones digan \`git diff main...HEAD\`, lee este archivo: equivale exactamente y no necesita git (en tu sandbox git puede fallar).\n` : ''}${extra ?`- Indicaciones adicionales: ${extra}\n` : ''}
## Notas para Codex
- Las rutas relativas de las instrucciones (brain/…, tareas/<ID>/…, scripts/…, estandares/…) se resuelven con las rutas absolutas de arriba.
- Donde las instrucciones mencionan Read, Grep o Glob, usa los comandos de shell equivalentes.
${notas}
- Tu ÚLTIMO mensaje es tu entrega y se guarda tal cual: respeta el formato obligatorio del rol.`;
}

// ---------- diff de la tarea (para agentes cuyo sandbox no puede ejecutar git) ----------
// Lo genera la fábrica, no el constructor: es el cambio exacto base...HEAD de la carpeta de trabajo.
function prepararDiff(r, estado, trabajo, ronda) {
  if (!existsSync(join(trabajo, '.git'))) return null;
  const base = estado.base ?? 'main';
  const head = git(['rev-parse', '--short', 'HEAD'], trabajo).out;
  const commits = git(['log', '--oneline', `${base}..HEAD`], trabajo).out;
  const stat = git(['diff', '--stat', `${base}...HEAD`], trabajo).out;
  const diff = spawnSync('git', ['diff', `${base}...HEAD`], { cwd: trabajo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (diff.status !== 0) return null;
  const ruta = join(r.tarea, `diff-ronda${ronda}.patch`);
  const cabecera = [
    `# Diff de ${estado.id} · ronda ${ronda} · ${base}...HEAD (${head}) · generado por la fábrica`,
    '# Commits:', ...commits.split('\n').filter(Boolean).map((c) => `#   ${c}`),
    '# Resumen:', ...stat.split('\n').filter(Boolean).map((s) => `#  ${s}`), '',
  ].join('\n');
  writeFileSync(ruta, cabecera + '\n' + diff.stdout, 'utf8');
  return ruta;
}

// ---------- ejecutar una estación ----------
function huella(trabajo) {
  if (!existsSync(join(trabajo, '.git'))) return null;
  return `${git(['rev-parse', 'HEAD'], trabajo).out}\n${git(['status', '--porcelain'], trabajo).out}`;
}

function ejecutar(rol, proyecto, id, ronda, extra) {
  const perfil = PERFILES[rol];
  if (!perfil) fallar(`Rol desconocido para Codex: ${rol}. Roles: ${Object.keys(PERFILES).join(', ')}`);
  const exe = encontrarCodex();
  if (!exe) fallar('No encuentro Codex (ejecuta: node scripts/agente-codex.mjs --comprobar)');

  const r = rutasTarea(proyecto, id);
  const estado = leerJSON(r.estado, {});
  const trabajo = join(RAIZ, estado.trabajo ?? '');
  const estacion = CONFIG.estaciones?.[rol] ?? {};
  const modelo = estacion.modelo ?? CONFIG.codex?.modelo_por_defecto ?? null;
  const salida = perfil.salida(r.tarea, ronda);
  const dirLogs = join(r.tarea, 'logs');
  mkdirSync(dirLogs, { recursive: true });
  mkdirSync(join(r.tarea, 'revisiones'), { recursive: true });

  // El revisor de UI recibe adjuntos los recursos aprobados (o el boceto, en proyectos antiguos) para comparar.
  const objetivo = rol === 'revisor-ui' ? objetivoVisual(r.tarea, r.brain) : { tipo: null, imagenes: [] };
  const adjuntos = objetivo.imagenes.slice(0, 8);
  const args = ['exec', ...adjuntos.map((b) => `--image=${b}`), '--color', 'never', '-o', salida];
  if (modelo) args.push('-m', modelo);
  if (estacion.esfuerzo) args.push('-c', `model_reasoning_effort="${estacion.esfuerzo}"`);
  if (perfil.escribe === 'worktree') {
    args.push('-s', 'workspace-write', '-C', trabajo, '-c', 'sandbox_workspace_write.network_access=true');
  } else if (perfil.escribe === 'revisiones') {
    args.push('-s', 'workspace-write', '-C', join(r.tarea, 'revisiones'), '--skip-git-repo-check');
  } else if (perfil.escribe === 'tarea') {
    args.push('-s', 'workspace-write', '-C', r.tarea, '--skip-git-repo-check');
  } else {
    args.push('-s', 'read-only', '-C', r.tarea, '--skip-git-repo-check');
  }
  args.push('-'); // el prompt va por stdin

  const rutaDiff = perfil.escribe === 'worktree' ? null : prepararDiff(r, estado, trabajo, ronda);
  const extraObjetivo = objetivo.tipo === 'estructura'
    ? `Estructura aprobada: ${objetivo.diagrama} (y recursos.json en la misma carpeta). Los recursos aprobados van adjuntos como imagen: ${adjuntos.join(', ')}`
    : objetivo.tipo === 'boceto' ? `El boceto aprobado (objetivo visual) va adjunto como imagen: ${adjuntos.join(', ')}` : null;
  const prompt = construirPrompt(rol, perfil, r, estado, trabajo, ronda, [extra, extraObjetivo].filter(Boolean).join(' · ') || undefined, rutaDiff);
  const antes = perfil.escribe === 'worktree' ? null : huella(trabajo);
  const log = createWriteStream(join(dirLogs, `${rol}-ronda${ronda}.log`));
  log.write(`$ ${exe} ${args.join(' ')}\n\n===== PROMPT =====\n${prompt}\n\n===== SALIDA =====\n`);
  const inicio = Date.now();
  console.log(`▶ ${rol} → Codex ${modelo ?? '(modelo por defecto)'}`);

  return new Promise((resolver) => {
    const hijo = spawn(exe, args, { cwd: RAIZ, windowsHide: true });
    const limite = setTimeout(() => hijo.kill(), (CONFIG.codex?.timeout_minutos ?? 25) * 60_000);
    hijo.stdout.pipe(log, { end: false });
    hijo.stderr.pipe(log, { end: false });
    hijo.stdin.end(prompt);
    hijo.on('close', (codigo) => {
      clearTimeout(limite);
      log.end();
      const seg = Math.round((Date.now() - inicio) / 1000);
      const nota = `codex ${modelo ?? 'default'} · ${seg}s`;

      if (codigo !== 0 || !existsSync(salida)) {
        registrar(r, rol, 'ERROR', `${nota} · código ${codigo} (ver logs/${rol}-ronda${ronda}.log)`);
        if (perfil.json) escribirJSON(salida, { nivel: 'ALTO', motivo: `el clasificador Codex falló (código ${codigo}); por seguridad, ALTO` });
        console.error(`✖ ${rol}: Codex terminó con código ${codigo}. Registro: ${join(dirLogs, `${rol}-ronda${ronda}.log`)}`);
        return resolver(false);
      }

      // Integridad: un revisor/aprobador/clasificador no puede haber tocado el código
      if (antes !== null && huella(trabajo) !== antes) {
        registrar(r, rol, 'ERROR', `${nota} · modificó la carpeta de trabajo sin permiso`);
        console.error(`✖ ${rol}: modificó la carpeta de trabajo. Revisa con: git -C "${trabajo}" status`);
        return resolver(false);
      }

      let texto = readFileSync(salida, 'utf8');
      let resultado = texto.match(/VEREDICTO:\s*\**\s*([A-Z_]+)/)?.[1] ?? 'ENTREGADO';

      if (perfil.json) {
        // Fallo seguro: si la respuesta no es un JSON válido con nivel BAJO|ALTO, se trata como ALTO
        let datos = null;
        try { datos = JSON.parse(texto.match(/\{[\s\S]*\}/)?.[0] ?? ''); } catch { /* inválido */ }
        if (!datos || !['BAJO', 'ALTO'].includes(datos.nivel)) {
          datos = { nivel: 'ALTO', motivo: `respuesta no válida del clasificador; por seguridad, ALTO` };
        }
        escribirJSON(salida, datos);
        resultado = datos.nivel;
      }

      if (perfil.escribe === 'worktree' && existsSync(join(trabajo, '.git')) && git(['status', '--porcelain'], trabajo).out) {
        git(['add', '-A'], trabajo);
        const c = git(['commit', '-m', `${id}: constructor (codex, ronda ${ronda})`], trabajo);
        if (!c.ok) console.error(`⚠ No se pudo hacer commit: ${c.err}`);
      }

      registrar(r, rol, resultado, nota);
      console.log(`✔ ${rol}: ${resultado} (${seg}s) → ${salida}`);
      resolver(true);
    });
  });
}

// ---------- CLI ----------
const [rol, proyecto, id, ...resto] = process.argv.slice(2);
if (!rol || rol === '--comprobar') {
  comprobar();
} else {
  const opts = {};
  for (let i = 0; i < resto.length; i += 2) opts[resto[i].replace(/^--/, '')] = resto[i + 1];
  const ronda = Number(opts.ronda ?? 1);
  const roles = rol === 'revisores'
    ? REVISORES.filter((x) => CONFIG.estaciones?.[x]?.motor === 'codex')
    : [rol];
  if (roles.length === 0) {
    console.log('Ningún revisor tiene motor "codex" en fabrica.config.json: nada que lanzar.');
  } else {
    const resultados = await Promise.all(roles.map((x) => ejecutar(x, proyecto, id, ronda, opts.extra)));
    if (resultados.includes(false)) process.exit(1);
  }
}
