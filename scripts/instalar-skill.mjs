#!/usr/bin/env node
// Instala la skill personal /fabrica en ~/.claude/skills/fabrica/SKILL.md, apuntando a ESTA carpeta de la fábrica.
// Así puedes usar /fabrica desde cualquier chat nuevo de Claude Code: la skill lleva el chat a la fábrica.
// Uso (desde la carpeta de la fábrica): node scripts/instalar-skill.mjs
// Repite el comando si mueves la fábrica de carpeta o después de un `git pull`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { RAIZ, fallar } from './lib.mjs';

const origen = join(RAIZ, 'skill', 'fabrica', 'SKILL.md');
if (!existsSync(origen)) fallar(`No encuentro la plantilla de la skill: ${origen}`);
if (/[\\/](Temp|tmp)[\\/]/i.test(RAIZ)) {
  console.warn(`⚠ La fábrica está en una carpeta temporal (${RAIZ}). Clónala en una carpeta permanente e instala desde allí.`);
}
const destinoDir = join(homedir(), '.claude', 'skills', 'fabrica');
const destino = join(destinoDir, 'SKILL.md');
const contenido = readFileSync(origen, 'utf8').replaceAll('{{FABRICA}}', RAIZ);
mkdirSync(destinoDir, { recursive: true });
writeFileSync(destino, contenido, 'utf8');
console.log(`✔ Skill /fabrica instalada en ${destino}`);
console.log(`  Apunta a la fábrica en: ${RAIZ}`);
console.log('  Abre un chat nuevo de Claude Code (en cualquier carpeta) y escribe: /fabrica');
