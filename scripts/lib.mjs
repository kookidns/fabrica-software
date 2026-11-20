// Utilidades compartidas por las estaciones de código de la fábrica.
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function fallar(msg, codigo = 1) {
  console.error(`✖ ${msg}`);
  process.exit(codigo);
}

export function rutasProyecto(proyecto) {
  if (!proyecto || !/^[a-z0-9][a-z0-9-]*$/.test(proyecto)) {
    fallar(`Nombre de proyecto inválido: "${proyecto ?? ''}" (usa kebab-case: mi-proyecto)`);
  }
  const dir = join(RAIZ, 'proyectos', proyecto);
  return {
    dir,
    app: join(dir, 'app'),
    brain: join(dir, 'brain'),
    bandeja: join(dir, 'bandeja'),
    tareas: join(dir, 'tareas'),
    worktrees: join(dir, '.worktrees'),
  };
}

export function rutasTarea(proyecto, id) {
  const p = rutasProyecto(proyecto);
  if (!id || !/^T-\d{8}-\d{3}$/.test(id)) fallar(`ID de tarea inválido: "${id ?? ''}"`);
  const dir = join(p.tareas, id);
  if (!existsSync(dir)) fallar(`No existe la tarea ${id} en ${proyecto}`);
  return { ...p, tarea: dir, estado: join(dir, 'estado.json'), traza: join(dir, 'traza.jsonl') };
}

export function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}

export function esRepoConCommits(dir) {
  return existsSync(join(dir, '.git')) && git(['rev-parse', '--verify', 'HEAD'], dir).ok;
}

export function ramaBase(app) {
  const r = git(['symbolic-ref', '--short', 'HEAD'], app);
  return r.ok ? r.out : 'main';
}

export function leerJSON(ruta, porDefecto = null) {
  if (!existsSync(ruta)) return porDefecto;
  try {
    return JSON.parse(readFileSync(ruta, 'utf8').replace(/^﻿/, ''));
  } catch {
    return porDefecto;
  }
}

export function escribirJSON(ruta, datos) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n', 'utf8');
}

export function ahora() {
  return new Date().toISOString();
}

// Añade una línea a la traza de auditoría y actualiza estado.json.
export function registrar(rutas, estacion, resultado, nota = '') {
  const linea = { ts: ahora(), estacion, resultado, nota };
  appendFileSync(rutas.traza, JSON.stringify(linea) + '\n', 'utf8');
  const estado = leerJSON(rutas.estado, {});
  estado.estacion = estacion;
  estado.resultado = resultado;
  estado.actualizada = linea.ts;
  if (estacion === 'aprobador' && resultado === 'RECHAZADO') estado.rondas_rechazadas = (estado.rondas_rechazadas ?? 0) + 1;
  escribirJSON(rutas.estado, estado);
  return linea;
}

// Localiza el ejecutable de Codex (OpenAI): CODEX_BIN, fabrica.config.json > codex.ejecutable, PATH o la app de escritorio.
export function encontrarCodex(cfgCodex = {}) {
  if (process.env.CODEX_BIN && existsSync(process.env.CODEX_BIN)) return process.env.CODEX_BIN;
  const cfg = cfgCodex?.ejecutable;
  if (cfg && cfg !== 'auto') return existsSync(cfg) ? cfg : null;
  const w = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['codex'], { encoding: 'utf8' });
  if (w.status === 0) {
    const rutas = w.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const exe = rutas.find((r) => /\.exe$/i.test(r)) ?? rutas.find((r) => !/\.(cmd|ps1)$/i.test(r));
    if (exe) return exe;
  }
  // App de escritorio de Codex en Windows: %LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe
  const base = join(process.env.LOCALAPPDATA ?? '', 'OpenAI', 'Codex', 'bin');
  if (existsSync(base)) {
    const candidatos = readdirSync(base)
      .map((d) => join(base, d, 'codex.exe'))
      .filter((f) => existsSync(f))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    if (candidatos[0]) return candidatos[0];
  }
  return null;
}

// Objetivo visual aprobado de una tarea: la estructura de la tarea, o la del proyecto, o (proyectos antiguos)
// el boceto. Devuelve { tipo: 'estructura'|'boceto'|null, carpeta, diagrama, imagenes[] }.
export function objetivoVisual(dirTarea, dirBrain) {
  for (const carpeta of [join(dirTarea, 'estructura', 'aprobado'), join(dirBrain, 'estructura', 'aprobado')]) {
    const diagrama = join(carpeta, 'diagrama.md');
    if (!existsSync(diagrama)) continue;
    const recursos = leerJSON(join(carpeta, 'recursos.json'), []);
    const imagenes = (Array.isArray(recursos) ? recursos : [])
      .filter((r) => r.generar).map((r) => join(carpeta, 'img', `${r.id}.webp`)).filter((f) => existsSync(f));
    return { tipo: 'estructura', carpeta, diagrama, imagenes };
  }
  for (const carpeta of [join(dirTarea, 'boceto'), join(dirBrain, 'boceto')]) {
    const imagenes = ['movil', 'escritorio'].map((f) => join(carpeta, `aprobado-${f}.png`)).filter((f) => existsSync(f));
    if (imagenes.length) return { tipo: 'boceto', carpeta, diagrama: null, imagenes };
  }
  return { tipo: null, carpeta: null, diagrama: null, imagenes: [] };
}

export function ultimaTraza(rutas, estacion) {
  if (!existsSync(rutas.traza)) return null;
  const lineas = readFileSync(rutas.traza, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  return lineas.reverse().find((l) => l.estacion === estacion) ?? null;
}
