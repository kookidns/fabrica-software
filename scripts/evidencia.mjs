#!/usr/bin/env node
// Estación de CÓDIGO: genera evidencia visual neutral de una tarea para los revisores.
// No la produce el constructor, sino la fábrica, siempre igual. Por eso los revisores pueden usarla sin
// romper el contexto limpio.
//
// Uso: node scripts/evidencia.mjs <proyecto> <ID> [--ronda N] [--comparar-main] [--lighthouse]
//
// Hace: build de la carpeta de trabajo → servidor estático local → Chrome headless (vía CDP, sin dependencias)
//   - capturas de página completa a 375, 768 y 1024 px
//   - desbordamiento horizontal y elementos que se salen del ancho
//   - tamaño de cada elemento enfocable (marca los < 44×44 px)
//   - recorrido con Tab a 375 px: orden, nombre accesible, contorno de foco y capturas
//   - errores de consola
//   - --comparar-main: compara capturas de main y de la rama byte a byte (con los terceros bloqueados)
//   - --lighthouse: 3 ejecuciones de Lighthouse móvil con npx (fuera del proyecto) y la mediana
// Salida: tareas/<ID>/evidencia-ronda<N>/ (evidencia.json, resumen.md, *.png)
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { RAIZ, fallar, rutasTarea, leerJSON, escribirJSON, registrar, ahora } from './lib.mjs';

const [proyecto, id, ...resto] = process.argv.slice(2);
const opcion = (n) => resto.includes(n);
const valor = (n, d) => { const i = resto.indexOf(n); return i >= 0 ? resto[i + 1] : d; };
const ronda = Number(valor('--ronda', '1'));
const r = rutasTarea(proyecto, id);
const estado = leerJSON(r.estado);
if (!estado?.trabajo) fallar('estado.json no indica la carpeta de trabajo');
const trabajo = join(RAIZ, estado.trabajo);
if (!existsSync(trabajo)) fallar(`No existe la carpeta de trabajo: ${trabajo}`);
const salida = join(r.tarea, `evidencia-ronda${ronda}`);
rmSync(salida, { recursive: true, force: true });
mkdirSync(salida, { recursive: true });

const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p));
if (!CHROME) fallar('No encuentro Chrome ni Edge (define CHROME_PATH)');

const VISTAS = [
  { nombre: '375', width: 375, height: 812, mobile: true },
  { nombre: '768', width: 768, height: 1024, mobile: false },
  { nombre: '1024', width: 1024, height: 768, mobile: false },
];
const TERCEROS = ['*openstreetmap.org*', '*tile.osm*', '*googleapis*', '*gstatic*'];
const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------- build y servidor estático ----------
function build(dir, outDir) {
  const cmd = `npm run build${outDir ? ` -- --outDir "${outDir}" --emptyOutDir` : ''}`;
  const b = spawnSync(cmd, { cwd: dir, encoding: 'utf8', shell: true });
  if (b.status !== 0) fallar(`Falló el build en ${dir}:\n${b.stdout}\n${b.stderr}`);
  return outDir ?? join(dir, 'dist');
}

const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2' };
function servir(raiz) {
  return new Promise((res) => {
    const srv = createServer((req, resp) => {
      const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let f = normalize(join(raiz, ruta));
      if (!f.startsWith(normalize(raiz + sep)) && f !== normalize(raiz)) { resp.writeHead(403).end(); return; }
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
      if (!existsSync(f)) { resp.writeHead(404).end(); return; }
      resp.writeHead(200, { 'content-type': TIPOS[extname(f)] ?? 'application/octet-stream' }).end(readFileSync(f));
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

// ---------- Chrome por CDP (WebSocket nativo de Node ≥ 22) ----------
async function abrirChrome() {
  const perfil = mkdtempSync(join(tmpdir(), 'fabrica-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-device-scale-factor=1', 'about:blank']);
  const wsNavegador = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('Chrome no arrancó')), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
  });
  const puerto = new URL(wsNavegador).port;
  const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
  const pagina = lista.find((p) => p.type === 'page');
  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((res) => ws.addEventListener('open', res, { once: true }));
  let n = 0; const pend = new Map(); const oyentes = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) oyentes.forEach((f) => f(m));
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++n; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const cerrar = () => { try { ws.close(); } catch {} proc.kill(); setTimeout(() => rmSync(perfil, { recursive: true, force: true }), 1500); };
  return { cdp, on: (f) => oyentes.push(f), cerrar };
}

async function ir(c, url, vista, bloquear = []) {
  await c.cdp('Network.setBlockedURLs', { urls: bloquear });
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: vista.width, height: vista.height, deviceScaleFactor: 1, mobile: vista.mobile });
  const carga = new Promise((res) => c.on((m) => m.method === 'Page.loadEventFired' && res()));
  await c.cdp('Page.navigate', { url });
  await Promise.race([carga, esperar(15000)]);
  await esperar(1500);
}
const evaluar = async (c, expr) => (await c.cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
async function captura(c, archivo, completa = true) {
  let clip;
  if (completa) { const m = await c.cdp('Page.getLayoutMetrics'); clip = { x: 0, y: 0, width: m.cssContentSize.width, height: m.cssContentSize.height, scale: 1 }; }
  const { data } = await c.cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: completa, ...(clip ? { clip } : {}) });
  writeFileSync(join(salida, archivo), Buffer.from(data, 'base64'));
  return data;
}

const MEDIR = `(() => {
  const nombre = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || el.getAttribute('alt') || '').replace(/\\s+/g, ' ').trim().slice(0, 80);
  const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '');
  const W = document.documentElement.clientWidth;
  const fuera = [...document.querySelectorAll('body *')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.right > W + 0.5; }).slice(0, 20).map(desc);
  // Un elemento de 1×1 o menos es un patrón "visualmente oculto" (skip link, sr-only): se mide al recibir foco, en el recorrido con Tab.
  const oculto = (el) => { const b = el.getBoundingClientRect(); return b.width <= 1 || b.height <= 1; };
  const cortado = [...document.querySelectorAll('body *')].filter((el) => { const s = getComputedStyle(el); return !oculto(el) && el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(s.overflowX + s.textOverflow); }).slice(0, 20).map(desc);
  const enfocables = [...document.querySelectorAll('a[href], button, input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; })
    .map((el) => { const b = el.getBoundingClientRect(); const o = oculto(el); return { el: desc(el), nombre: nombre(el), w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10, ocultoHastaFoco: o, menor44: !o && (b.width < 44 || b.height < 44) }; });
  return { anchoVentana: W, scrollWidth: document.documentElement.scrollWidth, desbordaHorizontal: document.documentElement.scrollWidth > W, fuera, cortado, enfocables };
})()`;

const FOCO = `(() => {
  const el = document.activeElement; if (!el || el === document.body) return { el: 'body' };
  const s = getComputedStyle(el); const b = el.getBoundingClientRect();
  return { el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : ''),
    nombre: (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
    contorno: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor : (s.boxShadow !== 'none' ? 'box-shadow' : 'NINGUNO'),
    visible: b.bottom > 0 && b.top < innerHeight, top: Math.round(b.top), tam: Math.round(b.width) + '×' + Math.round(b.height) };
})()`;

async function tecla(c, key, shift = false) {
  const base = { key, code: key, windowsVirtualKeyCode: key === 'Tab' ? 9 : 13, modifiers: shift ? 8 : 0 };
  await c.cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(key === 'Enter' ? { text: '\r' } : {}) });
  await c.cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await esperar(250);
}

// ---------- programa ----------
const ev = { tarea: id, ronda, generada: ahora(), chrome: CHROME, vistas: {}, tab: null, consola: [], comparacion: null, lighthouse: null };
console.log(`▶ build de ${trabajo}`);
const distRama = build(trabajo);
const { srv, url } = await servir(distRama);
const c = await abrirChrome();
try {
  await c.cdp('Page.enable'); await c.cdp('Runtime.enable'); await c.cdp('Network.enable'); await c.cdp('Log.enable');
  c.on((m) => {
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) ev.consola.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    if (m.method === 'Runtime.exceptionThrown') ev.consola.push(`excepción: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') ev.consola.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ''}`);
  });
  for (const v of VISTAS) {
    console.log(`▶ vista ${v.nombre} px`);
    await ir(c, url, v);
    ev.vistas[v.nombre] = await evaluar(c, MEDIR);
    await captura(c, `pagina-${v.nombre}.png`);
  }
  console.log('▶ recorrido con Tab a 375 px');
  await ir(c, url, VISTAS[0]);
  const pasos = []; let mismoSeguido = 0;
  for (let i = 1; i <= 40; i++) {
    await tecla(c, 'Tab');
    const f = await evaluar(c, FOCO);
    mismoSeguido = pasos.length && pasos.at(-1).el === f.el ? mismoSeguido + 1 : 0;
    pasos.push({ paso: i, ...f });
    if (i <= 14) await captura(c, `tab-${String(i).padStart(2, '0')}.png`, false);
    if (f.el === 'body' && i > 1) break;
    if (mismoSeguido >= 12) { pasos.push({ paso: i, aviso: 'el foco no sale de este elemento tras 12 Tab: posible trampa' }); break; }
  }
  await ir(c, url, VISTAS[0]);
  await tecla(c, 'Tab'); const primero = await evaluar(c, FOCO);
  await tecla(c, 'Enter'); const trasEnter = await evaluar(c, FOCO);
  await tecla(c, 'Tab', true); const mayusTab = await evaluar(c, FOCO);
  ev.tab = { pasos, primerEnfocable: primero, trasEnterEnElPrimero: trasEnter, mayusTabDespues: mayusTab };

  if (opcion('--comparar-main')) {
    console.log('▶ comparando con main (terceros bloqueados)');
    const tmpMain = mkdtempSync(join(tmpdir(), 'fabrica-main-'));
    if (!existsSync(join(r.app, 'node_modules'))) spawnSync('npm ci', { cwd: r.app, shell: true, encoding: 'utf8' });
    build(r.app, tmpMain);
    const { srv: srvMain, url: urlMain } = await servir(tmpMain);
    const filas = [];
    for (const v of [VISTAS[0], VISTAS[2]]) {
      await ir(c, urlMain, v, TERCEROS); const a = await captura(c, `main-${v.nombre}.png`);
      await ir(c, url, v, TERCEROS); const b = await captura(c, `rama-${v.nombre}.png`);
      filas.push({ vista: v.nombre, identicas: a === b });
    }
    srvMain.close(); rmSync(tmpMain, { recursive: true, force: true });
    ev.comparacion = { nota: 'Comparación byte a byte de PNG con terceros bloqueados; "false" no dice cuánto cambia, mira las dos capturas.', filas };
  }
} finally {
  c.cerrar();
}

if (opcion('--lighthouse')) {
  console.log('▶ Lighthouse móvil ×3 (npx, fuera del proyecto)');
  const dirLh = join(salida, 'lighthouse'); mkdirSync(dirLh, { recursive: true });
  const res = [];
  for (let k = 1; k <= 3; k++) {
    const out = join(dirLh, `lh-${k}.json`);
    // Asíncrono a propósito: con spawnSync el bucle de eventos se bloquea y nuestro servidor no respondería a Lighthouse.
    const cmd = `npx --yes lighthouse@12 ${url} --only-categories=performance,accessibility --output=json --output-path="${out}" --chrome-flags="--headless=new" --quiet`;
    await new Promise((res) => {
      const p = spawn(cmd, { cwd: r.tarea, shell: true, stdio: 'ignore', env: { ...process.env, CHROME_PATH: CHROME } });
      const t = setTimeout(() => p.kill(), 180000);
      p.on('exit', () => { clearTimeout(t); res(); });
    });
    const j = leerJSON(out);
    if (j) res.push({ rendimiento: Math.round(j.categories.performance.score * 100), accesibilidad: Math.round(j.categories.accessibility.score * 100) });
  }
  const med = (k) => res.map((x) => x[k]).sort((a, b) => a - b)[Math.floor(res.length / 2)];
  ev.lighthouse = res.length ? { ejecuciones: res, mediana: { rendimiento: med('rendimiento'), accesibilidad: med('accesibilidad') } } : { error: 'Lighthouse no produjo resultados' };
}
srv.close();

// ---------- resumen ----------
escribirJSON(join(salida, 'evidencia.json'), ev);
const L = [`# Evidencia de la fábrica · ${id} · ronda ${ronda}`, '', `Generada por \`scripts/evidencia.mjs\` (estación de código) el ${ev.generada}. No la escribe el constructor.`, ''];
for (const [n, v] of Object.entries(ev.vistas)) {
  const peq = v.enfocables.filter((e) => e.menor44);
  L.push(`## ${n} px · \`pagina-${n}.png\``, `- Desbordamiento horizontal: ${v.desbordaHorizontal ? `**SÍ** (scrollWidth ${v.scrollWidth} > ${v.anchoVentana})` : 'no'}`,
    `- Elementos que se salen del ancho: ${v.fuera.length ? v.fuera.join(', ') : 'ninguno'}`, `- Texto cortado: ${v.cortado.length ? v.cortado.join(', ') : 'ninguno'}`,
    `- Enfocables: ${v.enfocables.length}; menores de 44×44: ${peq.length ? peq.map((e) => `${e.el} "${e.nombre}" ${e.w}×${e.h}`).join('; ') : 'ninguno'}`,
    `- Ocultos hasta recibir foco (su tamaño con foco está en el recorrido con Tab): ${v.enfocables.filter((e) => e.ocultoHastaFoco).map((e) => e.el).join(', ') || 'ninguno'}`, '');
}
L.push('## Recorrido con Tab (375 px) · `tab-NN.png`', '| # | elemento | nombre | tamaño con foco | contorno de foco | visible |', '|---|---|---|---|---|---|');
for (const p of ev.tab.pasos) L.push(p.aviso ? `| ${p.paso} | **${p.aviso}** | | | | |` : `| ${p.paso} | ${p.el} | ${p.nombre ?? ''} | ${p.tam ?? ''} | ${p.contorno ?? ''} | ${p.visible ?? ''} |`);
L.push('', `- Primer enfocable: ${ev.tab.primerEnfocable.el}; tras Enter el foco está en: ${ev.tab.trasEnterEnElPrimero.el}; Mayús+Tab después: ${ev.tab.mayusTabDespues.el}`,
  '- Nota: cuando el foco está DENTRO de un iframe de otro origen, aquí se ve como el propio iframe y su contorno no se puede medir desde fuera: mira las capturas `tab-NN.png` de esos pasos.', '');
L.push('## Consola', ev.consola.length ? ev.consola.map((x) => `- ${x}`).join('\n') : '- sin errores ni avisos', '');
if (ev.comparacion) { L.push('## Comparación con main (`main-*.png` / `rama-*.png`)', `- ${ev.comparacion.nota}`); ev.comparacion.filas.forEach((f) => L.push(`- ${f.vista} px: ${f.identicas ? 'idénticas' : '**distintas**'}`)); L.push(''); }
if (ev.lighthouse) L.push('## Lighthouse móvil', ev.lighthouse.error ? `- ${ev.lighthouse.error}` : `- Ejecuciones: ${ev.lighthouse.ejecuciones.map((x) => `${x.rendimiento}/${x.accesibilidad}`).join(', ')} · mediana rendimiento ${ev.lighthouse.mediana.rendimiento}, accesibilidad ${ev.lighthouse.mediana.accesibilidad}`, '');
writeFileSync(join(salida, 'resumen.md'), L.join('\n') + '\n', 'utf8');
registrar(r, 'evidencia', 'OK', `evidencia-ronda${ronda}/ (${Object.keys(ev.vistas).length} vistas, ${ev.tab.pasos.length} pasos de Tab${ev.comparacion ? ', comparación con main' : ''}${ev.lighthouse ? ', Lighthouse' : ''})`);
console.log(`✔ Evidencia en ${salida}`);
process.exit(0);
