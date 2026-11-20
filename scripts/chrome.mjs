// Chrome headless por CDP (WebSocket nativo de Node ≥ 22), sin dependencias.
// Lo usa scripts/estructura.mjs para convertir los recursos generados a WebP optimizado.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function buscarChrome() {
  return [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find((p) => p && existsSync(p)) ?? null;
}

export async function abrirChrome(ejecutable = buscarChrome()) {
  if (!ejecutable) throw new Error('No encuentro Chrome ni Edge (define CHROME_PATH)');
  const perfil = mkdtempSync(join(tmpdir(), 'fabrica-chrome-'));
  const proc = spawn(ejecutable, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank']);
  const wsNavegador = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('Chrome no arrancó')), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
  });
  const puerto = new URL(wsNavegador).port;
  const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
  const ws = new WebSocket(lista.find((p) => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((res) => ws.addEventListener('open', res, { once: true }));
  let n = 0; const pend = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++n; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluar = async (expr) => {
    const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const cerrar = () => { try { ws.close(); } catch { /* ya cerrado */ } proc.kill(); setTimeout(() => rmSync(perfil, { recursive: true, force: true }), 1500); };
  return { cdp, evaluar, cerrar };
}

// Convierte un PNG (base64) a WebP con un ancho máximo, manteniendo la proporción.
export async function aWebp(chrome, pngBase64, anchoMax = 1600, calidad = 0.82) {
  return chrome.evaluar(`(async () => {
    const img = new Image();
    img.src = 'data:image/png;base64,${pngBase64}';
    await img.decode();
    const w = Math.min(${Number(anchoMax)}, img.naturalWidth);
    const h = Math.round(img.naturalHeight * w / img.naturalWidth);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return { ancho: w, alto: h, original: [img.naturalWidth, img.naturalHeight], datos: c.toDataURL('image/webp', ${Number(calidad)}).split(',')[1] };
  })()`);
}
