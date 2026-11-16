#!/usr/bin/env node
// Puertas de calidad deterministas de la fábrica.
// Uso: node scripts/verificar.mjs proyectos/<nombre>/app
// Ejecuta, si existen en package.json: lint, typecheck, test y build. Sale con código 1 si alguna falla.

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = resolve(process.argv[2] ?? '.');
const pkgPath = join(dir, 'package.json');

if (!existsSync(dir)) {
  console.error(`✖ No existe la carpeta: ${dir}`);
  process.exit(1);
}

if (!existsSync(pkgPath)) {
  const hasHtml = existsSync(join(dir, 'index.html'));
  console.log(hasHtml
    ? '• Sitio estático sin package.json: no hay puertas automáticas que ejecutar.'
    : '• Sin package.json ni index.html: nada que verificar todavía.');
  process.exit(0);
}

const scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
const puertas = ['lint', 'typecheck', 'test', 'build'];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const resultados = [];

for (const puerta of puertas) {
  if (!scripts[puerta]) {
    resultados.push({ puerta, estado: 'omitida' });
    continue;
  }
  console.log(`\n▶ ${puerta}`);
  const r = spawnSync(npm, ['run', puerta], {
    cwd: dir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, CI: 'true' }, // evita modos "watch" (p. ej. Vitest)
  });
  resultados.push({ puerta, estado: r.status === 0 ? 'ok' : 'FALLÓ' });
}

console.log('\n── Resumen de puertas ──');
for (const { puerta, estado } of resultados) {
  const icono = estado === 'ok' ? '✔' : estado === 'omitida' ? '–' : '✖';
  console.log(`${icono} ${puerta.padEnd(10)} ${estado}`);
}

process.exit(resultados.some((r) => r.estado === 'FALLÓ') ? 1 : 0);
