#!/usr/bin/env node
// Estación de ESTRUCTURA Y RECURSOS: antes de especificar o programar, ChatGPT (vía Codex, con tu sesión de
// ChatGPT) define la estructura de la página o app como DIAGRAMA (Mermaid) y genera solo los RECURSOS VISUALES
// que irán dentro (ilustraciones, fotos, fondos). El humano pide cambios o lo aprueba. Lo aprobado vive en el
// brain (brain/estructura/aprobado/) y es el objetivo: arquitecto, diseñador, spec-writer, constructor y revisor
// de UI trabajan con ese diagrama y esos recursos.
//
// Uso:
//   node scripts/estructura.mjs generar <proyecto> [--tarea <ID>] [--notas "cambios"] [--recurso <id>]
//   node scripts/estructura.mjs aprobar <proyecto> [--tarea <ID>] [--version N]      ← SOLO el humano (guardián)
//   node scripts/estructura.mjs estado  <proyecto> [--tarea <ID>]
//
// Sin --tarea: estructura del PROYECTO (brain/estructura/). Con --tarea: la de una pantalla nueva
// (tareas/<ID>/estructura/), que parte de la del proyecto ya aprobada.
// --recurso <id>: rehace SOLO esa imagen (con --notas) y conserva el resto de la versión anterior.
import { spawn } from 'node:child_process';
import { copyFileSync, cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { RAIZ, ahora, encontrarCodex, escribirJSON, fallar, leerJSON, registrar, rutasProyecto, rutasTarea } from './lib.mjs';
import { abrirChrome, aWebp, buscarChrome } from './chrome.mjs';

const CONFIG = leerJSON(join(RAIZ, 'fabrica.config.json'), {});
const CFG = { modelo: null, obligatorio: true, max_imagenes: 6, ancho_max: 1600, calidad_webp: 0.82, timeout_minutos: 25, ...(CONFIG.estructura ?? {}) };

const [accion, proyecto, ...resto] = process.argv.slice(2);
if (!['generar', 'aprobar', 'estado'].includes(accion)) {
  fallar('Uso: node scripts/estructura.mjs generar|aprobar|estado <proyecto> [--tarea <ID>] [--notas "..."] [--recurso <id>] [--version N]');
}
const opts = {};
for (let i = 0; i < resto.length; i += 2) opts[resto[i].replace(/^--/, '')] = resto[i + 1];

const p = rutasProyecto(proyecto);
if (!existsSync(p.dir)) fallar(`No existe el proyecto ${proyecto}`);
const rTarea = opts.tarea ? rutasTarea(proyecto, opts.tarea) : null;
const base = rTarea ? join(rTarea.tarea, 'estructura') : join(p.brain, 'estructura');
const rutaEstado = join(base, 'estado.json');
mkdirSync(base, { recursive: true });
const est = leerJSON(rutaEstado, { versiones: [], aprobada: null });
const ambito = rTarea ? `tarea ${opts.tarea}` : 'proyecto';
const sufijo = rTarea ? ` --tarea ${opts.tarea}` : '';
const aprobadoProyecto = join(p.brain, 'estructura', 'aprobado');

const dirVersion = (n) => join(base, `v${n}`);
function ultimaVersion() {
  const ns = readdirSync(base).map((f) => f.match(/^v(\d+)$/)?.[1]).filter(Boolean).map(Number);
  return ns.length ? Math.max(...ns) : 0;
}
function leerRecursos(dir) {
  const datos = leerJSON(join(dir, 'recursos.json'), null);
  return Array.isArray(datos) ? datos : null;
}
function pngsRecientes(desdeMs) {
  const out = [];
  const recorrer = (d) => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const f = join(d, e.name);
      if (e.isDirectory()) recorrer(f);
      else if (/\.png$/i.test(e.name) && statSync(f).mtimeMs >= desdeMs) out.push(f);
    }
  };
  recorrer(join(homedir(), '.codex', 'generated_images'));
  return out.sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
}
function tablaRecursos(recursos, optim) {
  const filas = recursos.map((r) => {
    const o = optim[r.id];
    const archivo = !r.generar ? 'SVG del constructor' : o ? `img/${r.id}.webp (${o.ancho}×${o.alto}, ${o.kb} KB)` : `**falta img/${r.id}.png**`;
    return `| \`${r.id}\` | ${r.seccion ?? ''} | ${r.tipo ?? ''} | ${r.uso ?? ''} | ${r.decorativa ? '(decorativa)' : (r.alt ?? '')} | ${archivo} |`;
  });
  return ['| id | Sección | Tipo | Uso | Texto alternativo | Archivo |', '|---|---|---|---|---|---|', ...filas].join('\n');
}

// ---------- generar ----------
async function generar() {
  if (rTarea && !existsSync(join(aprobadoProyecto, 'diagrama.md'))) {
    fallar('Primero aprueba la estructura del PROYECTO: la de la tarea parte de ella.');
  }
  const exe = encontrarCodex(CONFIG.codex);
  if (!exe) fallar('No encuentro Codex (node scripts/agente-codex.mjs --comprobar). La estructura y los recursos los genera ChatGPT vía Codex.');

  const anterior = ultimaVersion();
  const n = anterior + 1;
  const dir = dirVersion(n);
  const notas = opts.notas?.trim() || null;
  const soloRecurso = opts.recurso?.trim() || null;
  if (soloRecurso && !anterior) fallar('--recurso necesita una versión anterior de la que partir.');
  if ((notas || soloRecurso) && anterior) cpSync(dirVersion(anterior), dir, { recursive: true });
  for (const sobra of ['respuesta.json', 'logs']) rmSync(join(dir, sobra), { recursive: true, force: true });
  mkdirSync(join(dir, 'img'), { recursive: true });
  if (soloRecurso && !leerRecursos(dir)?.some((r) => r.id === soloRecurso)) fallar(`El recurso "${soloRecurso}" no existe en v${anterior}.`);

  const rol = readFileSync(join(RAIZ, '.claude', 'agents', 'generador-estructura.md'), 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
  const encargo = soloRecurso
    ? `Rehaz SOLO la imagen del recurso "${soloRecurso}" (img/${soloRecurso}.png). Cambios pedidos: ${notas ?? 'nueva versión'}. Actualiza su "prompt" en recursos.json si cambia; no toques nada más.`
    : notas && anterior
      ? `La versión ${anterior} ya está copiada en esta carpeta. Aplica SOLO estos cambios del humano: ${notas}. Regenera únicamente las imágenes afectadas.`
      : `Crea la estructura desde cero: diagrama.md, recursos.json y las imágenes img/<id>.png de los recursos con "generar": true (como máximo ${CFG.max_imagenes}).`;
  const prompt = `${rol}

---
## Datos de esta ejecución (te los pasa la fábrica)
- Proyecto: ${proyecto} · Brain: ${p.brain} (empieza por index.md)
${rTarea ? `- Tarea: ${opts.tarea}. Lo que hay que estructurar está en ${join(rTarea.tarea, 'entrada.md')}. Estructura del proyecto aprobada: ${aprobadoProyecto}\n` : ''}- Ámbito: estructura del ${ambito}, versión ${n}. Carpeta actual (escribe solo aquí): ${dir}
- Máximo de imágenes a generar: ${CFG.max_imagenes}
- ENCARGO: ${encargo}

## Notas para Codex
- Usa tu herramienta de generación de imágenes para cada PNG. Si la imagen queda en otra carpeta, cópiala a img/<id>.png.
- Tu último mensaje es solo el JSON del formato obligatorio.`;

  const respuesta = join(dir, 'respuesta.json');
  const args = ['exec', '--color', 'never', '-o', respuesta, '-s', 'workspace-write', '-C', dir, '--skip-git-repo-check'];
  if (CFG.modelo) args.push('-m', CFG.modelo);
  args.push('-');
  mkdirSync(join(dir, 'logs'), { recursive: true });
  const log = createWriteStream(join(dir, 'logs', 'codex.log'));
  log.write(`$ ${exe} ${args.join(' ')}\n\n===== PROMPT =====\n${prompt}\n\n===== SALIDA =====\n`);
  const mtimes = Object.fromEntries(readdirSync(join(dir, 'img')).map((f) => [f, statSync(join(dir, 'img', f)).mtimeMs]));
  const inicio = Date.now();
  console.log(`▶ estructura del ${ambito} v${n} → ChatGPT vía Codex${soloRecurso ? ` (solo ${soloRecurso})` : ''}`);

  const codigo = await new Promise((res) => {
    const hijo = spawn(exe, args, { cwd: RAIZ, windowsHide: true });
    const limite = setTimeout(() => hijo.kill(), CFG.timeout_minutos * 60_000);
    hijo.stdout.pipe(log, { end: false });
    hijo.stderr.pipe(log, { end: false });
    hijo.stdin.end(prompt);
    hijo.on('close', (c) => { clearTimeout(limite); log.end(); res(c); });
  });
  const seg = Math.round((Date.now() - inicio) / 1000);

  const recursos = leerRecursos(dir);
  if (!existsSync(join(dir, 'diagrama.md')) || !recursos) {
    if (rTarea) registrar(rTarea, 'estructura', 'ERROR', `v${n} · código ${codigo} · ${seg}s`);
    fallar(`Codex no dejó diagrama.md y recursos.json válidos (código ${codigo}). Registro: ${join(dir, 'logs', 'codex.log')}`);
  }

  // Recuperar imágenes que Codex generó pero no copió (por orden de creación).
  const aGenerar = recursos.filter((r) => r.generar);
  const pendientes = aGenerar.filter((r) => {
    const f = `${r.id}.png`;
    if (!existsSync(join(dir, 'img', f))) return true;
    return soloRecurso === r.id && statSync(join(dir, 'img', f)).mtimeMs === mtimes[f];
  });
  if (pendientes.length) {
    const recientes = pngsRecientes(inicio);
    pendientes.forEach((r, i) => { if (recientes[i]) copyFileSync(recientes[i], join(dir, 'img', `${r.id}.png`)); });
  }

  // Optimizar a WebP (Chrome headless, sin dependencias).
  const optim = {};
  const conPng = aGenerar.filter((r) => existsSync(join(dir, 'img', `${r.id}.png`)));
  if (conPng.length && buscarChrome()) {
    const chrome = await abrirChrome();
    try {
      for (const r of conPng) {
        const b64 = readFileSync(join(dir, 'img', `${r.id}.png`)).toString('base64');
        const w = await aWebp(chrome, b64, Math.min(Number(r.ancho_px) || CFG.ancho_max, CFG.ancho_max), CFG.calidad_webp);
        const buf = Buffer.from(w.datos, 'base64');
        writeFileSync(join(dir, 'img', `${r.id}.webp`), buf);
        optim[r.id] = { ancho: w.ancho, alto: w.alto, kb: Math.round(buf.length / 1024) };
      }
    } finally { chrome.cerrar(); }
  } else if (conPng.length) {
    console.warn('⚠ Sin Chrome: no se generaron los .webp optimizados (quedan solo los PNG).');
  }

  let datos = {};
  try { datos = JSON.parse(readFileSync(respuesta, 'utf8').match(/\{[\s\S]*\}/)?.[0] ?? '{}'); } catch { /* respuesta libre */ }
  const faltan = aGenerar.filter((r) => !existsSync(join(dir, 'img', `${r.id}.png`))).map((r) => r.id);
  writeFileSync(join(dir, 'recursos.md'), [`# Recursos visuales · ${ambito} · v${n}`, '',
    'Los marcados "SVG del constructor" no se generan: el constructor los dibuja en el código.',
    'En la app se usan los `.webp` (optimizados); los `.png` son el original de ChatGPT.', '',
    tablaRecursos(recursos, optim), ''].join('\n'), 'utf8');
  writeFileSync(join(dir, 'version.md'), [`# Estructura del ${ambito} · v${n}`, '',
    `- Generada: ${ahora()} · ChatGPT vía Codex${CFG.modelo ? ` (${CFG.modelo})` : ''} · ${seg}s`,
    soloRecurso ? `- Solo se rehízo el recurso \`${soloRecurso}\`: ${notas ?? ''}` : notas ? `- Cambios pedidos sobre v${anterior}: ${notas}` : '- Primera versión',
    `- Páginas: ${(datos.paginas ?? []).join(', ') || '(ver diagrama)'} · Recursos generados: ${Object.keys(optim).length}/${aGenerar.length}${faltan.length ? ` (faltan: ${faltan.join(', ')})` : ''}`, '',
    '## Resumen', datos.resumen ?? '(sin resumen)', '',
    '## Supuestos', ...(datos.supuestos?.length ? datos.supuestos.map((s) => `- ${s}`) : ['- ninguno declarado']), ''].join('\n'), 'utf8');
  est.versiones.push({ version: n, fecha: ahora(), notas, recurso: soloRecurso, recursos: aGenerar.map((r) => r.id) });
  escribirJSON(rutaEstado, est);
  if (rTarea) registrar(rTarea, 'estructura', 'GENERADA', `v${n}`);

  console.log(`✔ Estructura v${n} lista (${seg}s): ${relative(RAIZ, dir)}`);
  console.log(`   diagrama.md · recursos.md · ${Object.keys(optim).length} imagen(es) en img/${faltan.length ? ` · ⚠ faltan: ${faltan.join(', ')}` : ''}`);
  console.log(`\nSiguiente (estación humana):\n  · Pedir cambios: /fabrica estructura ${proyecto}${rTarea ? ` ${opts.tarea}` : ''} <qué cambiar>   (una sola imagen: --recurso <id>)\n  · Aprobar (lo ejecutas TÚ): node scripts/estructura.mjs aprobar ${proyecto}${sufijo}`);
}

// ---------- aprobar (solo humano) ----------
function aprobar() {
  const n = Number(opts.version ?? ultimaVersion());
  const dir = dirVersion(n);
  if (!n || !existsSync(join(dir, 'diagrama.md'))) fallar(`No hay versión v${n} de la estructura del ${ambito}.`);
  const recursos = leerRecursos(dir) ?? [];
  const faltan = recursos.filter((r) => r.generar && !existsSync(join(dir, 'img', `${r.id}.png`))).map((r) => r.id);
  if (faltan.length) fallar(`La v${n} no tiene todas sus imágenes (faltan: ${faltan.join(', ')}). Rehazlas con --recurso <id> antes de aprobar.`);
  const destino = join(base, 'aprobado');
  rmSync(destino, { recursive: true, force: true });
  cpSync(dir, destino, { recursive: true, filter: (f) => !/[\\/]logs([\\/]|$)/.test(f) && !f.endsWith('respuesta.json') });
  writeFileSync(join(destino, 'APROBADO.md'), [`# Estructura aprobada del ${ambito}`, '', `- Versión: v${n}`, `- Aprobada por el humano: ${ahora()}`, '',
    '## Cómo se usa', '- `diagrama.md` es la estructura objetivo: páginas, navegación, secciones en orden y componentes.',
    '- `recursos.json` / `recursos.md` listan las imágenes; en la app se usan los `img/<id>.webp` con su `alt`.',
    '- Los recursos con `generar: false` los dibuja el constructor en SVG.', ''].join('\n'), 'utf8');
  est.aprobada = n;
  est.aprobada_en = ahora();
  escribirJSON(rutaEstado, est);
  if (rTarea) {
    registrar(rTarea, 'estructura', 'APROBADA', `v${n} (humano)`);
  } else {
    const rutaLog = join(p.brain, 'log.md');
    const entrada = `## ${ahora().slice(0, 10)} · Estructura del proyecto v${n} aprobada\n- Diagrama y ${recursos.filter((r) => r.generar).length} recurso(s) visual(es) en brain/estructura/aprobado/\n- Es el objetivo: arquitectura, diseño, specs, construcción y revisión de UI trabajan con ella\n`;
    if (existsSync(rutaLog)) {
      const t = readFileSync(rutaLog, 'utf8');
      writeFileSync(rutaLog, t.includes('Entradas nuevas arriba.') ? t.replace('Entradas nuevas arriba.', `Entradas nuevas arriba.\n\n${entrada.trimEnd()}`) : `${entrada}\n${t}`, 'utf8');
    }
  }
  console.log(`✔ Estructura del ${ambito} v${n} APROBADA → ${relative(RAIZ, destino)}`);
}

// ---------- estado ----------
function estado() {
  const aprobado = join(base, 'aprobado');
  console.log(JSON.stringify({
    ambito, carpeta: relative(RAIZ, base), versiones: ultimaVersion(), aprobada: est.aprobada ?? null,
    diagrama: existsSync(join(aprobado, 'diagrama.md')) ? relative(RAIZ, join(aprobado, 'diagrama.md')) : null,
    recursos: (leerRecursos(aprobado) ?? []).filter((r) => r.generar).map((r) => relative(RAIZ, join(aprobado, 'img', `${r.id}.webp`))),
    obligatorio_para_tareas: CFG.obligatorio !== false,
  }, null, 2));
}

if (accion === 'generar') await generar();
else if (accion === 'aprobar') aprobar();
else estado();
