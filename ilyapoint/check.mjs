#!/usr/bin/env node
// IlyaPoint deck checker (no dependencies). Run from the deck root: node ilyapoint/check.mjs
// Enforces media/file size limits and basic format rules so the deck stays GitHub Pages friendly.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MAX_FILE = 75 * 1024 * 1024;
const MAX_DECK = 500 * 1024 * 1024;
const root = process.argv[2] ?? process.cwd();
const errors = [];
const warnings = [];
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

let total = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    if (f === '.git' || f === 'node_modules') continue;
    const p = join(d, f);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else {
      total += st.size;
      if (st.size > MAX_FILE) errors.push(`${relative(root, p)} is ${mb(st.size)} (limit ${mb(MAX_FILE)})`);
    }
  }
};
walk(root);
if (total > MAX_DECK) errors.push(`deck is ${mb(total)} (limit ${mb(MAX_DECK)})`);

const indexPath = join(root, 'index.html');
if (!existsSync(indexPath)) errors.push('missing index.html');
else {
  const html = readFileSync(indexPath, 'utf8');
  if (!/<main[^>]*class="[^"]*\bip-deck\b/.test(html)) errors.push('index.html has no <main class="ip-deck">');
  const body = html.replace(/<template[\s\S]*?<\/template>/g, '');
  const sections = body.match(/<section[^>]*class="[^"]*\bip-slide\b[\s\S]*?<\/section>/g) ?? [];
  sections.forEach((s, i) => {
    const ids = [...s.matchAll(/\sdata-id="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((id, j) => ids.indexOf(id) !== j);
    if (dup.length) errors.push(`slide ${i + 1}: duplicate data-id ${[...new Set(dup)].join(', ')}`);
  });
  for (const m of html.matchAll(/\ssrc="(media\/[^"]+)"/g)) {
    if (!existsSync(join(root, decodeURIComponent(m[1])))) errors.push(`missing media file ${m[1]}`);
  }
  if (!existsSync(join(root, 'ilyapoint/ilyapoint.js'))) errors.push('missing vendored player ilyapoint/ilyapoint.js');
}
if (total > MAX_DECK * 0.8 && total <= MAX_DECK) warnings.push(`deck is ${mb(total)}, approaching the ${mb(MAX_DECK)} limit`);

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
console.log(`ok: ${mb(total)} total`);
