// Captures the M3 demo at Pixel size (412×915) in light and dark: node m3/tools/shots.mjs
// Saves 600-wide JPEGs to m3/shots and reports console errors from every page.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..', '..'); // the kolam-design-system folder
const SHOTS = path.join(ROOT, 'm3', 'shots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(ROOT, '.shots-'));
const port = 5700 + Math.floor(Math.random() * 200), dbg = port + 1000;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${dbg}`, `--user-data-dir=${tmp}/profile`, 'about:blank'], { stdio: 'ignore' });
const errors = [];
try {
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    try { const p = (await (await fetch(`http://127.0.0.1:${dbg}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
    if (!ws) await sleep(250);
  }
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = {};
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) errors.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.0.0 Mobile Safari/537.36' });
  const origin = `http://127.0.0.1:${port}`;
  const grab = async (hash, file, { scheme = 'light', js, wait = 2500 } = {}) => {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    await send('Page.navigate', { url: `${origin}/m3/index.html?shot=${file}${hash}` }); await sleep(wait);
    if (js) { await send('Runtime.evaluate', { expression: js, awaitPromise: true }); await sleep(900); }
    const s = await send('Page.captureScreenshot', { format: 'png' });
    const png = path.join(tmp, file + '.png');
    fs.writeFileSync(png, Buffer.from(s.result.data, 'base64'));
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '--resampleWidth', '600', png, '--out', path.join(SHOTS, file + '.jpg')], { stdio: 'pipe' });
  };
  // No ?app=android here: the Android WebView user agent alone must switch the mode on.
  for (const scheme of ['light', 'dark']) {
    await grab('#/components', `components-${scheme}`, { scheme, wait: 3500 });
    await grab('#/components', `components-2-${scheme}`, { scheme, js: "scrollTo(0, document.querySelector('.md-search-bar').getBoundingClientRect().top + scrollY - 120)" });
    await grab('#/components', `components-3-${scheme}`, { scheme, js: "scrollTo(0, document.querySelector('.md-tabs').getBoundingClientRect().top + scrollY - 160); document.querySelector('#snack').click()" });
    await grab('#/colour', `colour-${scheme}`, { scheme });
    await grab('#/type', `type-${scheme}`, { scheme });
    await grab('#/kolam', `kolam-skin-${scheme}`, { scheme });
    await grab('#/kolam', `kolam-skin-2-${scheme}`, { scheme, js: "scrollTo(0, document.querySelector('.k-card').getBoundingClientRect().top + scrollY - 120)" });
    await grab('#/components', `dialog-${scheme}`, { scheme, js: "document.querySelector('#openDlg').click()" });
  }
  // A plain desktop browser must stay Kolam (mode off).
  await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36' });
  await grab('', 'web-browser-off', { scheme: 'light' });
  const off = await send('Runtime.evaluate', { expression: "document.documentElement.classList.contains('k-android')", returnByValue: true });
  console.log('Mobile Chrome (not WebView) k-android:', off.result.result.value);
  console.log('captured', fs.readdirSync(SHOTS).length, 'shots in', SHOTS);
  console.log(errors.length ? 'Console errors:\n' + [...new Set(errors)].join('\n') : 'No console errors.');
  ws.close();
} finally {
  const exited = new Promise(r => chrome.once('exit', r));
  chrome.kill(); server.kill();
  await Promise.race([exited, sleep(5000)]);
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
