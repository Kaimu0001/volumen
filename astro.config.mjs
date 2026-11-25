import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
// 依存追加の理由: /sitemap-index.xml を手書きすると記事追加のたびに更新漏れが起きるため、
// 公式の @astrojs/sitemap でビルド時に自動生成する（仕様書 §8 / §5）。
import sitemap from '@astrojs/sitemap';

const DIST = fileURLToPath(new URL('./dist/', import.meta.url));

/**
 * ビルド済みHTMLに robots noindex があるページはサイトマップに載せない。
 * (404 や、記事1件だけのタグページ。noindex の条件を二重に書かないための判定)
 * sitemap の filter は astro:build:done で呼ばれ、この時点で HTML は dist に出力済み。
 */
function isNoindex(pageUrl) {
  const pathname = decodeURIComponent(new URL(pageUrl).pathname).replace(/\/$/, '') || '/index';
  const file = `${DIST}${pathname.replace(/^\//, '')}.html`;
  if (!existsSync(file)) return false;
  // "noindex, follow" のような複合指定も noindex として扱う
  return /<meta name="robots" content="[^"]*noindex/.test(readFileSync(file, 'utf8'));
}

export default defineConfig({
  site: 'https://volumen.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !isNoindex(page) })],
});
