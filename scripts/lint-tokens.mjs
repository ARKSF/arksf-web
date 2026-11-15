// Token guard (runs before every build: `npm run build`, or alone: `npm run lint:tokens`).
// Fails when a style outside src/styles/tokens.css uses a raw design value instead of a token:
//   colours (hex, rgb/rgba/hsl, named colours), font family/size/weight, line height, letter spacing,
//   corner radius, shadows, z-index, spacing (padding/margin/gap in px/rem/em), easing curves and durations,
//   and @media breakpoints other than the three listed in tokens.css.
// Checks .css files in src/styles, <style> blocks and style="" attributes in .astro files.
// Components must use semantic tokens, not the primitives in layer 1 of tokens.css (spacing scale excepted),
// and every var(--…) must exist.
// Sizes of individual elements (width, height, top, translate...) may stay raw: they belong to that component.
// A justified exception: add /* lint-allow */ on that line.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const TOKENS = join(SRC, 'styles', 'tokens.css');
const rel = (p) => relative(ROOT, p).split(sep).join('/');

const tokensCss = readFileSync(TOKENS, 'utf8');
const BREAKPOINTS = [...tokensCss.matchAll(/^\s+(\d+px)\s+\S/gm)].map((m) => m[1]);

// Every defined token, and the primitives (layer 1) that components must not use directly.
// The spacing scale (--space-4 … --space-120) is shared on purpose and allowed everywhere.
const [primitiveCss] = tokensCss.split('2. SEMANTIC ─');
const DEFINED = new Set([...tokensCss.matchAll(/^\s+--([\w-]+)\s*:/gm)].map((m) => m[1]));
const PRIMITIVES = new Set([...primitiveCss.matchAll(/^\s+--([\w-]+)\s*:/gm)].map((m) => m[1]).filter((n) => !n.startsWith('space-')));

const COLOR_PROPS = /^(color|background|background-color|background-image|border|border-[\w-]*color|border-(top|right|bottom|left)|outline|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)$/;
const NAMED = /\b(white|black|red|green|blue|gr[ae]y|yellow|orange|purple|pink|brown|navy|gold|silver)\b/i;
const VAR_ONLY = (v) => /^(var\(--[\w-]+\)|inherit|initial|unset|normal|none|0|auto)$/.test(v);

function checkDecl(prop, value) {
  const p = prop.toLowerCase();
  const v = value.trim();
  const out = [];
  for (const m of v.matchAll(/var\(--([\w-]+)/g)) {
    if (!DEFINED.has(m[1])) out.push(`unknown token --${m[1]}`);
    else if (PRIMITIVES.has(m[1])) out.push(`primitive --${m[1]} (use a semantic token)`);
  }
  if (/#[0-9a-fA-F]{3,8}\b/.test(v)) out.push('raw hex colour');
  if (/\b(rgba?|hsla?|oklch|lab|lch|color-mix)\(/.test(v)) out.push('raw colour function');
  if (COLOR_PROPS.test(p) && NAMED.test(v.replace(/var\([^)]*\)/g, ''))) out.push('named colour');
  if (['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'border-radius', 'z-index'].includes(p) && !VAR_ONLY(v)) out.push(`literal ${p}`);
  if ((p === 'box-shadow' || p === 'filter' && /shadow/.test(v)) && !VAR_ONLY(v)) out.push('literal shadow');
  if (/^(padding|margin|gap|row-gap|column-gap)(-|$)/.test(p) && /(?<![\w.-])-?\d*\.?\d+(px|rem|em)\b/.test(v)) out.push('raw spacing');
  if (/^(transition|animation)/.test(p)) {
    if (/cubic-bezier\(/.test(v)) out.push('raw easing curve');
    if (/(?<![\w.-])\d*\.?\d+m?s\b/.test(v)) out.push('raw duration');
  }
  return out;
}

const problems = [];
function checkCss(file, css, lineOffset = 0) {
  const lines = css.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes('lint-allow')) return;
    const clean = line.replace(/\/\*.*?\*\//g, '');
    for (const m of clean.matchAll(/@media[^{]*/g)) {
      for (const w of m[0].matchAll(/(\d+px)/g)) {
        if (!BREAKPOINTS.includes(w[1])) problems.push(`${rel(file)}:${lineOffset + i + 1}  breakpoint ${w[1]} is not listed in src/styles/tokens.css`);
      }
    }
    const declText = clean.replace(/@media[^{]*/g, '');
    for (const m of declText.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
      for (const issue of checkDecl(m[1], m[2])) problems.push(`${rel(file)}:${lineOffset + i + 1}  ${issue}: ${m[1]}: ${m[2].trim()}`);
    }
  });
}

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css)$/.test(name) && p !== TOKENS) files.push(p);
  }
})(SRC);

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.css')) { checkCss(file, text); continue; }
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const offset = text.slice(0, m.index).split(/\r?\n/).length - 1;
    checkCss(file, m[1], offset);
  }
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/\sstyle="([^"]*)"/g)) {
      if (line.includes('lint-allow')) continue;
      for (const d of m[1].split(';')) {
        const [prop, ...rest] = d.split(':');
        if (!rest.length) continue;
        for (const issue of checkDecl(prop.trim(), rest.join(':'))) problems.push(`${rel(file)}:${i + 1}  ${issue} in style attribute: ${d.trim()}`);
      }
    }
  });
}

if (problems.length) {
  console.error(`Token guard: ${problems.length} raw value(s). Use a token from src/styles/tokens.css (or add one there):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`Token guard: ${files.length} files clean (breakpoints ${BREAKPOINTS.join(', ')}).`);
