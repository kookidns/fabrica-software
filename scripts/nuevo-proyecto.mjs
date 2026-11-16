#!/usr/bin/env node
// Estación de código: crea proyectos/<nombre>/ desde la plantilla e inicializa app/ como repo git.
// Uso: node scripts/nuevo-proyecto.mjs <nombre>
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, fallar, git, rutasProyecto } from './lib.mjs';

const nombre = process.argv[2];
const p = rutasProyecto(nombre);
if (existsSync(p.dir)) fallar(`Ya existe ${p.dir}`);

cpSync(join(RAIZ, 'plantillas', 'proyecto'), p.dir, { recursive: true });
const claude = join(p.dir, 'CLAUDE.md');
writeFileSync(claude, readFileSync(claude, 'utf8').replaceAll('{{NOMBRE}}', nombre), 'utf8');

mkdirSync(p.app, { recursive: true });
writeFileSync(join(p.app, 'README.md'), `# ${nombre}\n\nCódigo generado por la AI Factory. Contexto en ../brain/.\n`, 'utf8');
writeFileSync(join(p.app, '.gitignore'), 'node_modules/\ndist/\n.astro/\n.env\n.env.*\n!.env.example\ncoverage/\n', 'utf8');

const pasos = [
  ['init'],
  ['symbolic-ref', 'HEAD', 'refs/heads/main'],
  ['add', '-A'],
  ['commit', '-m', 'Inicio del proyecto (AI Factory)'],
];
for (const args of pasos) {
  const r = git(args, p.app);
  if (!r.ok) fallar(`git ${args.join(' ')} falló: ${r.err}\n  (¿Tienes git instalado y configurado user.name / user.email?)`);
}

console.log(JSON.stringify({ proyecto: nombre, carpeta: p.dir, app: p.app, rama: 'main' }, null, 2));
