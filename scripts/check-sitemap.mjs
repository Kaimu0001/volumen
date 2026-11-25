// ビルド後(dist)の sitemap が noindex ページを含んでいないことを検査する。依存なし。
// sitemap の noindex 除外は astro.config.mjs の filter 頼みで、壊れても警告が出ないため、
// ここで機械的にアサートする。あわせて、robots.txt と sitemap-index の参照が生きていることも見る。
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const ORIGIN = 'https://volumen.dev';

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const errors = [];
const read = (rel) => readFileSync(join(DIST, rel), 'utf8');

if (!existsSync(join(DIST, 'sitemap-index.xml'))) {
  console.error('sitemap-index.xml がありません（先に build すること）');
  process.exit(1);
}

// sitemap-index が参照する sitemap を全部集める
const sitemapFiles = [...read('sitemap-index.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace(ORIGIN + '/', ''),
);
const urls = new Set();
for (const f of sitemapFiles) {
  if (!existsSync(join(DIST, f))) {
    errors.push(`sitemap-index が参照する ${f} が存在しない`);
    continue;
  }
  for (const m of read(f).matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
}

// 公開URL -> dist 内のHTML
const pages = walk(DIST)
  .filter((f) => f.endsWith('.html'))
  .map((f) => relative(DIST, f).split(sep).join('/'));
const urlOf = (rel) => {
  const p = rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
  return `${ORIGIN}/${p}`.replace(/\/$/, p === '' ? '/' : '');
};

let noindexCount = 0;
for (const rel of pages) {
  // "noindex, follow" のような複合指定も noindex として扱う
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(read(rel));
  const url = urlOf(rel);
  if (noindex) {
    noindexCount++;
    if (urls.has(url)) errors.push(`noindex なのに sitemap に載っている: ${url}`);
  } else if (!urls.has(url)) {
    errors.push(`indexable なのに sitemap に無い: ${url}`);
  }
}
for (const u of urls) {
  const rel = pages.find((p) => urlOf(p) === u);
  if (!rel) errors.push(`sitemap にあるが dist に HTML が無い: ${u}`);
}

// robots.txt がサイトマップを参照している
if (!existsSync(join(DIST, 'robots.txt')) || !read('robots.txt').includes(`Sitemap: ${ORIGIN}/sitemap-index.xml`)) {
  errors.push('robots.txt が sitemap-index.xml を参照していない');
}

console.log(`sitemap: ${urls.size} URLs, noindex pages: ${noindexCount}, html pages: ${pages.length}`);
if (errors.length > 0) {
  console.error(`FAILED ${errors.length}:\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('sitemap ok');
