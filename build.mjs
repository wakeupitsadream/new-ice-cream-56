// Сборка сайта.
//   dist/index.html + dist/assets/* — версия для хостинга (Vercel): шрифты, скрипт и фото отдельными файлами с хешем в имени.
//   dist/standalone.html — всё в одном файле, открывается без интернета (только при локальной сборке).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT = 'dist';
const SITE = (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '');
const STANDALONE = !process.env.VERCEL;

const read = p => fs.readFileSync(p);
const dataURI = (p, mime) => `data:${mime};base64,${read(p).toString('base64')}`;
const hash = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(`${OUT}/assets`, { recursive: true });
const emitted = new Map();
function emit(file) { // copy to dist/assets with a content hash, return the relative URL
  if (emitted.has(file)) return emitted.get(file);
  const buf = read(file), ext = path.extname(file), url = `assets/${path.basename(file, ext)}.${hash(buf)}${ext}`;
  fs.writeFileSync(`${OUT}/${url}`, buf); emitted.set(file, url); return url;
}

/* ---------- fonts: кириллица + латиница + отдельный крошечный файл со знаком ₽ ---------- */
const RANGE = {
  cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  rub: 'U+20BD',
};
const FONTS = [
  { family: 'Unbounded', weight: '900', preload: true, files: {
    cyrillic: 'node_modules/@fontsource/unbounded/files/unbounded-cyrillic-900-normal.woff2',
    latin: 'node_modules/@fontsource/unbounded/files/unbounded-latin-900-normal.woff2',
    rub: 'src/fonts/unbounded-rub.woff2' } },
  { family: 'Onest', weight: '100 900', preload: true, files: {
    cyrillic: 'node_modules/@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2',
    latin: 'node_modules/@fontsource-variable/onest/files/onest-latin-wght-normal.woff2',
    rub: 'src/fonts/onest-rub.woff2' } },
  { family: 'JetBrains Mono', weight: '500', preload: false, files: {
    cyrillic: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-cyrillic-500-normal.woff2',
    latin: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2',
    rub: 'src/fonts/jbm-rub.woff2' } },
];
const fontCSS = inline => FONTS.flatMap(f => Object.entries(f.files).map(([sub, file]) =>
  `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${inline ? dataURI(file, 'font/woff2') : emit(file)}) format('woff2');unicode-range:${RANGE[sub]}}`)).join('\n');
const preloads = FONTS.filter(f => f.preload).map(f => `<link rel="preload" href="${emit(f.files.cyrillic)}" as="font" type="font/woff2" crossorigin>`).join('\n');

/* ---------- script ---------- */
const bundle = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none' });
const js = bundle.outputFiles[0].text;

/* ---------- structured data ---------- */
const ld = {
  '@context': 'https://schema.org', '@type': 'IceCreamShop', name: 'New Ice Cream 56',
  description: 'Корпусное мороженое в форме фруктов, стики, трайфлы и шоколадные наборы ручной работы.',
  telephone: '+7 999 105-63-83', priceRange: '250–1800 ₽', areaServed: 'Оренбург',
  address: { '@type': 'PostalAddress', addressLocality: 'Оренбург', addressRegion: 'Оренбургская область', addressCountry: 'RU' },
  sameAs: ['https://www.instagram.com/new_ice_cream56'],
  ...(SITE ? { url: `${SITE}/`, image: `${SITE}/og.jpg` } : {}),
};

/* ---------- html ---------- */
const src = fs.readFileSync('src/index.html', 'utf8').replace('__LDJSON__', () => JSON.stringify(ld));
function page(inline) {
  const img = n => inline ? dataURI(`src/img/${n}.webp`, 'image/webp') : emit(`src/img/${n}.webp`);
  const fill = s => s.replace(/__IMG_(\w+)__/g, (_, n) => img(n));
  const seo = SITE ? [`<link rel="canonical" href="${SITE}/">`, `<meta property="og:url" content="${SITE}/">`,
    `<meta property="og:image" content="${SITE}/og.jpg">`, '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">'].join('\n') : '';
  const script = fill(js);
  let html = src
    .replace('/*FONTS*/', () => fontCSS(inline))
    .replaceAll('__LOGO__', inline ? dataURI('src/brand/logo.webp', 'image/webp') : emit('src/brand/logo.webp'))
    .replace('__FAVICON__', inline ? dataURI('src/brand/favicon.png', 'image/png') : 'favicon.png')
    .replace('__TOUCH__', inline ? dataURI('src/brand/apple-touch-icon.png', 'image/png') : 'apple-touch-icon.png');
  html = fill(html);
  if (inline) return html.replace('<!--HEAD-->', '').replace('<!--BUNDLE-->', () => `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>`);
  const jsFile = `assets/app.${hash(Buffer.from(script))}.js`; fs.writeFileSync(`${OUT}/${jsFile}`, script);
  return html.replace('<!--HEAD-->', () => `${preloads}\n<script defer src="${jsFile}"></script>\n${seo}`).replace('<!--BUNDLE-->', '');
}

fs.writeFileSync(`${OUT}/index.html`, page(false));
for (const f of ['favicon.png', 'apple-touch-icon.png', 'og.jpg']) if (fs.existsSync(`src/brand/${f}`)) fs.copyFileSync(`src/brand/${f}`, `${OUT}/${f}`);
const kb = f => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';
console.log(`dist/index.html ${kb(`${OUT}/index.html`)} · ${emitted.size + 1} assets${SITE ? ` · site ${SITE}` : ''}`);
if (STANDALONE) { fs.writeFileSync(`${OUT}/standalone.html`, page(true)); console.log(`dist/standalone.html ${kb(`${OUT}/standalone.html`)}`); }
