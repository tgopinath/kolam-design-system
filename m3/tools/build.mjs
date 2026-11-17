// Regenerates the default colour roles in m3/kolam-m3.css from the Kolam primary (Ocean Azure),
// and prints the WCAG contrast check for every scheme. Run: node m3/tools/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../kolam-m3.js');
const file = new URL('../kolam-m3.css', import.meta.url);
const css = readFileSync(file, 'utf8');
const colors = M.cssFor(M.KOLAM_PRIMARY, 'html.k-android').replace(/\}(?=.)/g, '}\n');
const out = css.replace(/\/\*@@colors-start\*\/[\s\S]*?\/\*@@colors-end\*\//, `/*@@colors-start*/\n${colors}\n/*@@colors-end*/`);
writeFileSync(file, out);
let fails = 0;
for (const hex of [M.KOLAM_PRIMARY, ...process.argv.slice(2)]) {
  const s = M.scheme(hex);
  for (const k of ['light', 'dark', 'lightHigh', 'darkHigh']) M.checkContrast(s[k]).forEach(r => { if (!r.pass) { fails++; console.log('FAIL', hex, k, `${r.fg} on ${r.bg}`, r.ratio, '<', r.min); } });
}
console.log(fails ? `${fails} contrast failures` : 'Contrast: every checked role pair passes WCAG AA in light, dark and both high-contrast schemes.');
process.exit(fails ? 1 : 0);
