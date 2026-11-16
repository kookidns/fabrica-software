#!/usr/bin/env node
// Estación de código: calcula el riesgo de una tarea con reglas deterministas.
// Uso: node scripts/riesgo.mjs <proyecto> <ID>
// Escribe tareas/<ID>/riesgo-codigo.json con { nivel: BAJO|ALTO, motivos, archivos, lineas }.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, escribirJSON, esRepoConCommits, git, leerJSON, registrar, rutasTarea } from './lib.mjs';

const MAX_LINEAS_BAJO = 300;
const ZONAS_SENSIBLES = [
  [/(^|\/)(migrations?|prisma|supabase|db|database)(\/|$)|\.sql$|schema\./i, 'base de datos o migraciones'],
  [/(^|\/)(auth|login|session|middleware|permissions?|rls)[^/]*/i, 'autenticación o permisos'],
  [/(^|\/)(api|server|backend|functions|edge-functions|actions)(\/|$)/i, 'backend / API'],
  [/(pay|stripe|billing|checkout|invoice)/i, 'pagos o facturación'],
  [/(^|\/)\.env|secret|credential/i, 'secretos o variables de entorno'],
  [/(^|\/)(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock)$/i, 'dependencias'],
  [/(^|\/)(\.github|\.gitlab-ci|vercel\.json|netlify\.toml|Dockerfile)/i, 'CI o despliegue'],
  [/(^|\/)(vite|astro|next|tsconfig|tailwind|eslint)\.config|tsconfig\.json$/i, 'configuración de build'],
];

// Zonas propias del proyecto: brain/zonas-sensibles.txt (las escribe el arquitecto)
function zonasDelProyecto(brain) {
  const ruta = join(brain, 'zonas-sensibles.txt');
  if (!existsSync(ruta)) return [];
  return readFileSync(ruta, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const p = l.replaceAll('\\', '/').replace(/^\.?\//, '');
      const re = p
        .replace(/[.+^${}()|[\]]/g, '\\$&')
        .replace(/\*\*/g, '\u0000')
        .replace(/\*/g, '[^/]*')
        .replace(/\u0000/g, '.*');
      return [new RegExp(`^${re}${p.endsWith('/') ? '' : '$'}`), `zona sensible del proyecto (${l})`];
    });
}

const [proyecto, id] = process.argv.slice(2);
const r = rutasTarea(proyecto, id);
ZONAS_SENSIBLES.push(...zonasDelProyecto(r.brain));
const estado = leerJSON(r.estado, {});
const trabajo = join(RAIZ, estado.trabajo ?? '');
const motivos = [];
let archivos = [];
let lineas = 0;

if (!estado.rama || !esRepoConCommits(trabajo)) {
  motivos.push('sin git/worktree: no se puede medir el cambio');
} else {
  const rango = `${estado.base}...HEAD`;
  const nombres = git(['diff', '--name-only', rango], trabajo).out;
  const sinCommit = git(['status', '--porcelain'], trabajo).out;
  if (sinCommit) motivos.push('hay cambios sin commit en el worktree');
  archivos = [...new Set(nombres.split('\n').filter(Boolean))];
  // Líneas cambiadas, sin contar archivos generados (lockfiles), que inflan el tamaño sin aportar riesgo propio
  const GENERADOS = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/;
  lineas = git(['diff', '--numstat', rango], trabajo).out
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('\t'))
    .filter(([, , archivo]) => !GENERADOS.test(archivo))
    .reduce((s, [mas, menos]) => s + (Number(mas) || 0) + (Number(menos) || 0), 0);

  if (archivos.length === 0) motivos.push('la rama no tiene cambios respecto a la base');
  for (const [patron, motivo] of ZONAS_SENSIBLES) {
    const tocados = archivos.filter((f) => patron.test(f));
    if (tocados.length) motivos.push(`${motivo}: ${tocados.slice(0, 5).join(', ')}`);
  }
  if (lineas > MAX_LINEAS_BAJO) motivos.push(`cambio grande: ${lineas} líneas (> ${MAX_LINEAS_BAJO})`);
}

const resultado = { nivel: motivos.length ? 'ALTO' : 'BAJO', motivos, archivos, lineas };
escribirJSON(join(r.tarea, 'riesgo-codigo.json'), resultado);
registrar(r, 'riesgo-codigo', resultado.nivel, motivos.join(' | '));
console.log(JSON.stringify(resultado, null, 2));
