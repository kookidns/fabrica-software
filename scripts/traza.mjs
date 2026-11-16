#!/usr/bin/env node
// Estación de código: deja rastro auditable de una estación en tareas/<ID>/traza.jsonl.
// Uso: node scripts/traza.mjs <proyecto> <ID> <estacion> <resultado> ["nota"]
import { fallar, registrar, rutasTarea } from './lib.mjs';

const [proyecto, id, estacion, resultado, nota = ''] = process.argv.slice(2);
if (!estacion || !resultado) fallar('Uso: node scripts/traza.mjs <proyecto> <ID> <estacion> <resultado> ["nota"]');
const linea = registrar(rutasTarea(proyecto, id), estacion, resultado.toUpperCase(), nota);
console.log(`✔ ${id} · ${linea.estacion} → ${linea.resultado}`);
