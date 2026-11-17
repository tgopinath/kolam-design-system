// Headless check of the iOS kit demo: node ios/tools/check.mjs [outDir]
// Opens ios/index.html?app=ios at 393×852 in light and dark, visits every tab, opens the overlays,
// saves screenshots to outDir (default: a temp folder) and fails on any console error or exception.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'kolam-ios-')));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'kolam-ios-prof-'));
const port = 5900 + Math.floor(Math.random() * 90), dbg = port + 1000;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${dbg}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const problems = [];
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
    if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') problems.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
  const shot = async name => {
    const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(r.result.data, 'base64'));
  };
  const base = `http://127.0.0.1:${port}/ios/`;
  for (const scheme of ['light', 'dark']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    await send('Page.navigate', { url: base + '?app=ios#/' }); await sleep(1200);
    const info = await js(`({ ios: document.documentElement.classList.contains('k-ios'), bg: getComputedStyle(document.body).backgroundColor, tabs: document.querySelectorAll('.ios-tab').length })`);
    console.log(scheme, JSON.stringify(info));
    if (!info?.ios) problems.push(scheme + ': k-ios not set with ?app=ios');
    await shot(`${scheme}-1-library`);
    await js(`scrollTo(0, 700)`); await sleep(400); await shot(`${scheme}-2-library-scrolled`);
    const collapsed = await js(`document.querySelector('.ios-navbar').classList.contains('is-collapsed')`);
    if (!collapsed) problems.push(scheme + ': large title did not collapse on scroll');
    for (const t of ['lists', 'overlays', 'settings', 'search']) {
      await js(`location.hash = '#/${t}'`); await sleep(500); await shot(`${scheme}-3-${t}`);
    }
    await js(`location.hash = '#/detail/sheets'`); await sleep(400); await shot(`${scheme}-4-detail`);
    await js(`location.hash = '#/overlays'`); await sleep(400);
    await js(`document.querySelector('[data-o="sheet"]').click()`); await sleep(700); await shot(`${scheme}-5-sheet`);
    await js(`document.querySelector('dialog.ios-sheet .ios-barbtn').click()`); await sleep(500);
    await js(`document.querySelector('[data-o="alert"]').click()`); await sleep(600); await shot(`${scheme}-6-alert`);
    await js(`document.querySelector('dialog.ios-alert button').click()`); await sleep(400);
    await js(`document.querySelector('[data-o="action"]').click()`); await sleep(700); await shot(`${scheme}-7-actionsheet`);
    await js(`document.querySelector('dialog.ios-actionsheet .is-cancel').click()`); await sleep(400);
    await js(`document.querySelector('#menuBtn').click()`); await sleep(600); await shot(`${scheme}-8-menu`);
    await js(`document.querySelector('dialog.ios-menu')?.dispatchEvent(new Event('cancel'))`); await sleep(300);
    await js(`location.hash = '#/lists'`); await sleep(400);
    await js(`(() => { const w = document.querySelectorAll('.ios-swipe')[0]; w.querySelector('[data-del]').focus(); w.scrollIntoView({ block: 'center' }); })()`); await sleep(500); await shot(`${scheme}-9-swipe`);
    console.log(scheme, 'focus:', await js(`document.activeElement?.outerHTML.slice(0, 60)`));
    const open = await js(`document.querySelectorAll('.ios-swipe')[0].classList.contains('is-open')`);
    if (!open) problems.push(scheme + ': swipe actions did not reveal on focus');
  }
  // Web look stays Kolam
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.navigate', { url: base + '?app=web' }); await sleep(1000);
  const web = await js(`document.documentElement.classList.contains('k-ios')`);
  if (web) problems.push('?app=web still shows the iOS look');
  await shot('web-kolam');
  console.log('screenshots:', OUT);
} finally {
  chrome.kill(); server.kill();
  await sleep(300); try { fs.rmSync(prof, { recursive: true, force: true, maxRetries: 5 }); } catch {}
}
if (problems.length) { console.error('PROBLEMS\n' + problems.join('\n')); process.exit(1); }
console.log('OK: no console errors; collapse, overlays and swipe checks passed');
