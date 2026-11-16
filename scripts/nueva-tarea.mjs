#!/usr/bin/env node
// Estación de código: registra una entrada como tarea con ID único y le crea un worktree aislado.
// Uso: node scripts/nueva-tarea.mjs <proyecto> [--tipo tarea|error|issue] [--texto "..."] [--archivo ruta.md]
// Sin --texto ni --archivo toma la entrada más antigua de bandeja/ (orden alfabético).
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { RAIZ, ahora, esRepoConCommits, escribirJSON, fallar, git, leerJSON, ramaBase, registrar, rutasProyecto } from './lib.mjs';

const [proyecto, ...resto] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < resto.length; i += 2) opts[resto[i].replace(/^--/, '')] = resto[i + 1];

const p = rutasProyecto(proyecto);
if (!existsSync(p.dir)) fallar(`No existe el proyecto ${proyecto}`);

// 0. Compuerta del boceto: sin objetivo visual aprobado por el humano no se empieza a construir.
const cfgBoceto = leerJSON(join(RAIZ, 'fabrica.config.json'), {}).boceto ?? {};
if (cfgBoceto.obligatorio !== false && !existsSync(join(p.brain, 'boceto', 'aprobado.md'))) {
  fallar(`El proyecto ${proyecto} no tiene boceto aprobado. Genéralo con /boceto ${proyecto} (o node scripts/boceto.mjs generar ${proyecto}) y apruébalo tú con: node scripts/boceto.mjs aprobar ${proyecto}`);
}

// 1. Obtener el texto de la entrada
let texto = opts.texto;
let origen = 'manual';
let archivoBandeja = opts.archivo ? join(RAIZ, opts.archivo) : null;
if (!texto && !archivoBandeja) {
  const pendientes = existsSync(p.bandeja)
    ? readdirSync(p.bandeja).filter((f) => f.endsWith('.md')).sort()
    : [];
  if (pendientes.length === 0) {
    console.log(JSON.stringify({ bandeja_vacia: true }));
    process.exit(0);
  }
  archivoBandeja = join(p.bandeja, pendientes[0]);
}
if (archivoBandeja) {
  if (!existsSync(archivoBandeja)) fallar(`No existe ${archivoBandeja}`);
  texto = readFileSync(archivoBandeja, 'utf8');
  origen = `bandeja/${basename(archivoBandeja)}`;
}
const tipo = opts.tipo ?? (texto.match(/^tipo:\s*(\w+)/m)?.[1] ?? 'tarea');
if (!['tarea', 'error', 'issue'].includes(tipo)) fallar(`Tipo inválido: ${tipo}`);

// 2. Reservar un ID único de forma atómica (seguro con varias sesiones en paralelo)
const hoy = ahora().slice(0, 10).replaceAll('-', '');
mkdirSync(p.tareas, { recursive: true });
let id;
for (let n = 1; n < 1000; n++) {
  const candidato = `T-${hoy}-${String(n).padStart(3, '0')}`;
  try {
    mkdirSync(join(p.tareas, candidato));
    id = candidato;
    break;
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}
if (!id) fallar('No se pudo reservar un ID de tarea');
const dirTarea = join(p.tareas, id);
mkdirSync(join(dirTarea, 'revisiones'));

// 3. Retirar la entrada de la bandeja (queda archivada en la propia tarea)
writeFileSync(join(dirTarea, 'entrada.md'), `<!-- tipo: ${tipo} · origen: ${origen} · ${ahora()} -->\n\n${texto.trim()}\n`, 'utf8');
if (archivoBandeja && archivoBandeja.startsWith(p.bandeja)) {
  mkdirSync(join(p.bandeja, 'procesadas'), { recursive: true });
  renameSync(archivoBandeja, join(p.bandeja, 'procesadas', `${id}-${basename(archivoBandeja)}`));
}

// 4. Worktree aislado en su propia rama
let trabajo = p.app;
let rama = null;
const base = esRepoConCommits(p.app) ? ramaBase(p.app) : null;
if (base) {
  rama = `fabrica/${id}`;
  trabajo = join(p.worktrees, id);
  const r = git(['worktree', 'add', trabajo, '-b', rama, base], p.app);
  if (!r.ok) fallar(`No se pudo crear el worktree: ${r.err}`);
} else {
  console.error('⚠ app/ no es un repo git con commits: se trabajará directamente en app/ (sin aislamiento ni paralelo).');
}

const rutas = { traza: join(dirTarea, 'traza.jsonl'), estado: join(dirTarea, 'estado.json') };
escribirJSON(rutas.estado, { id, proyecto, tipo, origen, creada: ahora(), rama, base, trabajo: relative(RAIZ, trabajo) });
registrar(rutas, 'entrada', 'CREADA', origen);

console.log(JSON.stringify({ id, tipo, origen, rama, base, trabajo: relative(RAIZ, trabajo), tarea: relative(RAIZ, dirTarea) }, null, 2));
