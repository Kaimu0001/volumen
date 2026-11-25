// ビルド後(dist)の内部リンク切れを検出する。依存なし。
// 対象: <a href="/..."> と #fragment。ファイル配置は build.format: 'file' 前提。
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pageIds = new Map(); // dist相対パス -> Set(id)

for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  pageIds.set(relative(DIST, f).split(sep).join('/'), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

/** URLパス -> 実在する dist 相対ファイル（なければ null） */
function resolve(urlPath) {
  const p = decodeURIComponent(urlPath).replace(/^\//, '').replace(/\/$/, '');
  const candidates = p === '' ? ['index.html'] : [p, `${p}.html`, `${p}/index.html`];
  return candidates.find((c) => existsSync(join(DIST, c)) && statSync(join(DIST, c)).isFile()) ?? null;
}

const broken = [];
let checked = 0;

for (const f of htmlFiles) {
  const rel = relative(DIST, f).split(sep).join('/');
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [pathPart, hash] = href.split('#');
    checked++;
    const target = pathPart === '' ? rel : resolve(pathPart.split('?')[0]);
    if (!target) {
      broken.push(`${rel}: ${href} (リンク先なし)`);
      continue;
    }
    if (hash && target.endsWith('.html') && !pageIds.get(target)?.has(decodeURIComponent(hash))) {
      broken.push(`${rel}: ${href} (アンカーなし)`);
    }
  }
}

console.log(`checked ${checked} internal links in ${htmlFiles.length} pages`);
if (broken.length > 0) {
  console.error(`BROKEN ${broken.length}:\n` + broken.map((b) => `  - ${b}`).join('\n'));
  process.exit(1);
}
console.log('broken: 0');
