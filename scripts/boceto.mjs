#!/usr/bin/env node
// Estación del BOCETO VISUAL: ChatGPT (la herramienta de imágenes de Codex, con tu sesión de ChatGPT) dibuja
// cómo debe verse el resultado ANTES de escribir specs o código. El humano lo revisa: pide cambios o lo aprueba.
// El boceto aprobado es el objetivo visual: spec-writer, diseñador, constructor y revisor de UI se miden contra él.
//
// Uso:
//   node scripts/boceto.mjs generar <proyecto> [--tarea <ID>] [--notas "cambios pedidos"] [--formato movil|escritorio|ambos]
//   node scripts/boceto.mjs aprobar <proyecto> [--tarea <ID>] [--version N]      ← SOLO el humano (el guardián lo bloquea a los agentes)
//   node scripts/boceto.mjs estado  <proyecto> [--tarea <ID>]
//
// Sin --tarea trabaja con el boceto del PROYECTO (brain/boceto/). Con --tarea, con el de esa tarea
// (tareas/<ID>/boceto/), dibujado a partir del boceto del proyecto ya aprobado.
import { spawn } from 'node:child_process';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { RAIZ, ahora, encontrarCodex, escribirJSON, fallar, leerJSON, registrar, rutasProyecto, rutasTarea } from './lib.mjs';

const CONFIG = leerJSON(join(RAIZ, 'fabrica.config.json'), {});
const CFG = { modelo: null, obligatorio: true, formatos: 'ambos', timeout_minutos: 15, ...(CONFIG.boceto ?? {}) };
const FORMATOS = ['movil', 'escritorio'];

const [accion, proyecto, ...resto] = process.argv.slice(2);
if (!['generar', 'aprobar', 'estado'].includes(accion)) {
  fallar('Uso: node scripts/boceto.mjs generar|aprobar|estado <proyecto> [--tarea <ID>] [--notas "..."] [--formato movil|escritorio|ambos] [--version N]');
}
const opts = {};
for (let i = 0; i < resto.length; i += 2) opts[resto[i].replace(/^--/, '')] = resto[i + 1];

const p = rutasProyecto(proyecto);
if (!existsSync(p.dir)) fallar(`No existe el proyecto ${proyecto}`);
const rTarea = opts.tarea ? rutasTarea(proyecto, opts.tarea) : null;
const dir = rTarea ? join(rTarea.tarea, 'boceto') : join(p.brain, 'boceto');
const rutaEstado = join(dir, 'estado.json');
mkdirSync(dir, { recursive: true });
const est = leerJSON(rutaEstado, { versiones: [], aprobada: null });
const ambito = rTarea ? `tarea ${opts.tarea}` : 'proyecto';
const sufijo = rTarea ? ` --tarea ${opts.tarea}` : '';

function archivosDeVersion(n) {
  return FORMATOS.map((f) => join(dir, `v${n}-${f}.png`)).filter((f) => existsSync(f));
}
function ultimaVersion() {
  const ns = readdirSync(dir).map((f) => f.match(/^v(\d+)-(movil|escritorio)\.png$/)?.[1]).filter(Boolean).map(Number);
  return ns.length ? Math.max(...ns) : 0;
}
function aprobadosDelProyecto() {
  return FORMATOS.map((f) => join(p.brain, 'boceto', `aprobado-${f}.png`)).filter((f) => existsSync(f));
}
function pngsRecientes(desdeMs) {
  const base = join(homedir(), '.codex', 'generated_images');
  const out = [];
  const recorrer = (d) => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const f = join(d, e.name);
      if (e.isDirectory()) recorrer(f);
      else if (/\.png$/i.test(e.name) && statSync(f).mtimeMs >= desdeMs) out.push(f);
    }
  };
  recorrer(base);
  return out.sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
}

// ---------- generar ----------
async function generar() {
  const pedido = opts.formato ?? CFG.formatos;
  const formatos = pedido === 'ambos' ? FORMATOS : [pedido];
  if (!formatos.every((f) => FORMATOS.includes(f))) fallar(`Formato inválido: ${pedido} (movil | escritorio | ambos)`);
  if (rTarea && aprobadosDelProyecto().length === 0) fallar('Primero aprueba el boceto del PROYECTO: el de la tarea se dibuja a partir de él.');
  const exe = encontrarCodex(CONFIG.codex);
  if (!exe) fallar('No encuentro Codex (node scripts/agente-codex.mjs --comprobar). El boceto lo genera ChatGPT a través de Codex.');

  const n = ultimaVersion() + 1;
  const nombres = formatos.map((f) => `v${n}-${f}.png`);
  const adjuntos = [];
  const notas = opts.notas?.trim() || null;
  if (notas && n > 1) adjuntos.push(...archivosDeVersion(n - 1));
  if (rTarea) adjuntos.push(...aprobadosDelProyecto());

  const rol = readFileSync(join(RAIZ, '.claude', 'agents', 'generador-boceto.md'), 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim();
  const prompt = `${rol}

---
## Datos de esta ejecución (te los pasa la fábrica)
- Proyecto: ${proyecto}
- Brain: ${p.brain} (empieza por index.md; lee vision.md y spec.md, y diseno.md/decisiones.md si tienen contenido)
${rTarea ? `- Tarea: ${opts.tarea}. Lo que hay que dibujar está en ${join(rTarea.tarea, 'entrada.md')}\n` : ''}- Ámbito: boceto del ${ambito}, versión ${n}
- Genera ${formatos.length} imagen(es) y guárdalas en la carpeta actual (${dir}) con estos nombres exactos: ${nombres.join(', ')}
${notas ? `- CAMBIOS PEDIDOS POR EL HUMANO sobre la versión ${n - 1} (adjunta): ${notas}\n` : ''}${adjuntos.length ? `- Imágenes adjuntas como referencia: ${adjuntos.map((a) => relative(RAIZ, a)).join(', ')}\n` : ''}
## Notas para Codex
- Usa tu herramienta de generación de imágenes. Si la imagen se guarda en otra carpeta (p. ej. ~/.codex/generated_images),
  cópiala a la carpeta actual con el nombre exacto.
- No escribas ningún otro archivo. Tu último mensaje es solo el JSON del formato obligatorio.`;

  const respuesta = join(dir, `v${n}-respuesta.json`);
  const args = ['exec', ...adjuntos.map((a) => `--image=${a}`), '--color', 'never', '-o', respuesta,
    '-s', 'workspace-write', '-C', dir, '--skip-git-repo-check'];
  if (CFG.modelo) args.push('-m', CFG.modelo);
  args.push('-');

  mkdirSync(join(dir, 'logs'), { recursive: true });
  const log = createWriteStream(join(dir, 'logs', `v${n}.log`));
  log.write(`$ ${exe} ${args.join(' ')}\n\n===== PROMPT =====\n${prompt}\n\n===== SALIDA =====\n`);
  const inicio = Date.now();
  console.log(`▶ boceto del ${ambito} v${n} → ChatGPT vía Codex (${formatos.join(' + ')})`);

  const codigo = await new Promise((res) => {
    const hijo = spawn(exe, args, { cwd: RAIZ, windowsHide: true });
    const limite = setTimeout(() => hijo.kill(), CFG.timeout_minutos * 60_000);
    hijo.stdout.pipe(log, { end: false });
    hijo.stderr.pipe(log, { end: false });
    hijo.stdin.end(prompt);
    hijo.on('close', (c) => { clearTimeout(limite); log.end(); res(c); });
  });

  // Si Codex dejó la imagen en su carpeta y no la copió, la recuperamos (por orden de creación).
  const faltan = nombres.filter((nm) => !existsSync(join(dir, nm)));
  if (faltan.length) {
    const recientes = pngsRecientes(inicio);
    faltan.forEach((nm, i) => { if (recientes[i]) copyFileSync(recientes[i], join(dir, nm)); });
  }
  const generados = nombres.filter((nm) => existsSync(join(dir, nm)));
  const seg = Math.round((Date.now() - inicio) / 1000);
  if (generados.length === 0) {
    if (rTarea) registrar(rTarea, 'boceto', 'ERROR', `v${n} · código ${codigo} · ${seg}s`);
    fallar(`Codex no generó el boceto (código ${codigo}). Registro: ${join(dir, 'logs', `v${n}.log`)}`);
  }

  let datos = {};
  try { datos = JSON.parse(readFileSync(respuesta, 'utf8').match(/\{[\s\S]*\}/)?.[0] ?? '{}'); } catch { /* respuesta libre */ }
  const md = [`# Boceto del ${ambito} · v${n}`, '', `- Generado: ${ahora()} · ChatGPT vía Codex${CFG.modelo ? ` (${CFG.modelo})` : ''} · ${seg}s`,
    `- Imágenes: ${generados.join(', ')}${generados.length < nombres.length ? ` (faltan: ${nombres.filter((x) => !generados.includes(x)).join(', ')})` : ''}`,
    notas ? `- Cambios pedidos sobre v${n - 1}: ${notas}` : '- Primera versión o regeneración sin notas', '',
    '## Qué muestra', datos.resumen ?? '(sin resumen)', '',
    '## Supuestos', ...(datos.supuestos?.length ? datos.supuestos.map((s) => `- ${s}`) : ['- ninguno declarado']), ''].join('\n');
  writeFileSync(join(dir, `v${n}.md`), md, 'utf8');
  est.versiones.push({ version: n, fecha: ahora(), notas, archivos: generados });
  escribirJSON(rutaEstado, est);
  if (rTarea) registrar(rTarea, 'boceto', 'GENERADO', `v${n}`);

  console.log(`✔ Boceto v${n} listo (${seg}s):`);
  generados.forEach((g) => console.log(`   ${join(dir, g)}`));
  console.log(`\nSiguiente (estación humana):\n  · Pedir cambios: /boceto ${proyecto}${rTarea ? ` ${opts.tarea}` : ''} <qué cambiar>\n  · Aprobar (lo ejecutas TÚ): node scripts/boceto.mjs aprobar ${proyecto}${sufijo}`);
}

// ---------- aprobar (solo humano) ----------
function aprobar() {
  const n = Number(opts.version ?? ultimaVersion());
  const archivos = n ? archivosDeVersion(n) : [];
  if (!archivos.length) fallar(`No hay imágenes de la versión v${n} del boceto del ${ambito}.`);
  for (const f of FORMATOS) rmSync(join(dir, `aprobado-${f}.png`), { force: true });
  for (const a of archivos) copyFileSync(a, join(dir, a.split(/[\\/]/).pop().replace(/^v\d+-/, 'aprobado-')));
  const resumen = existsSync(join(dir, `v${n}.md`)) ? readFileSync(join(dir, `v${n}.md`), 'utf8').split('## Qué muestra')[1]?.split('##')[0]?.trim() : '';
  writeFileSync(join(dir, 'aprobado.md'), [`# Boceto aprobado del ${ambito}`, '', `- Versión: v${n}`, `- Aprobado por el humano: ${ahora()}`,
    `- Imágenes: ${FORMATOS.filter((f) => existsSync(join(dir, `aprobado-${f}.png`))).map((f) => `aprobado-${f}.png`).join(', ')}`, '',
    '## Qué muestra', resumen || '(ver la imagen)', '',
    '## Cómo se usa', 'Es el objetivo visual. La spec, el diseño, la construcción y la revisión de UI se miden contra esta imagen:',
    'estructura, orden de secciones, jerarquía, paleta y tono. No se exige igualdad al píxel, y los datos reales',
    'mandan sobre los textos de ejemplo del boceto.', ''].join('\n'), 'utf8');
  est.aprobada = n;
  est.aprobado_en = ahora();
  escribirJSON(rutaEstado, est);
  if (rTarea) {
    registrar(rTarea, 'boceto', 'APROBADO', `v${n} (humano)`);
  } else {
    const rutaLog = join(p.brain, 'log.md');
    const entrada = `## ${ahora().slice(0, 10)} · Boceto del proyecto v${n} aprobado\n- Archivos: brain/boceto/aprobado-*.png y aprobado.md\n- Es el objetivo visual: spec, diseño, construcción y revisión de UI se miden contra él\n`;
    if (existsSync(rutaLog)) {
      const t = readFileSync(rutaLog, 'utf8');
      writeFileSync(rutaLog, t.includes('Entradas nuevas arriba.') ? t.replace('Entradas nuevas arriba.', `Entradas nuevas arriba.\n\n${entrada.trimEnd()}`) : `${entrada}\n${t}`, 'utf8');
    }
  }
  console.log(`✔ Boceto del ${ambito} v${n} APROBADO → ${join(dir, 'aprobado.md')}`);
}

// ---------- estado ----------
function estado() {
  console.log(JSON.stringify({
    ambito, carpeta: relative(RAIZ, dir), versiones: ultimaVersion(), aprobada: est.aprobada ?? null,
    aprobados: FORMATOS.filter((f) => existsSync(join(dir, `aprobado-${f}.png`))).map((f) => relative(RAIZ, join(dir, `aprobado-${f}.png`))),
    obligatorio_para_tareas: CFG.obligatorio !== false,
  }, null, 2));
}

if (accion === 'generar') await generar();
else if (accion === 'aprobar') aprobar();
else estado();
