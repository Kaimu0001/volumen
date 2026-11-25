/**
 * build.format: 'file' では Astro.url.pathname が /about.html や /index.html になる。
 * 公開URLの形（/about, /）に正規化する。Header と BaseLayout で共通に使う。
 */
export function normalizePath(raw: string): string {
  return (
    raw
      .replace(/\/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '') || '/'
  );
}

/** ナビ項目 href が現在のパスに該当するか（配下のページも含む） */
export function isCurrentPath(current: string, href: string): boolean {
  return current === href || current.startsWith(`${href}/`);
}
