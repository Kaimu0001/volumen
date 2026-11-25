export const SITE_NAME = 'volumen';
export const SITE_DOMAIN = 'volumen.dev';
export const SITE_DESCRIPTION =
  '技術、読書、哲学と心理学、ガジェット。日々の理解を少しずつ書き足していくための私的な書庫です。';
export const AUTHOR = 'カイム';
export const AUTHOR_EN = 'KAIMU';

export const NAV = [
  { label: 'notes', href: '/notes' },
  { label: 'books', href: '/books' },
  { label: 'gadgets', href: '/gadgets' },
  { label: 'about', href: '/about' },
] as const;

export const CATEGORIES = [
  'tech',
  'books',
  'philosophy',
  'psychology',
  'gadgets',
  'career',
  'essay',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** カテゴリの日本語ラベル。一覧・タグ・棚で共通に使う（二重管理しない） */
export const CATEGORY_LABELS: Record<Category, string> = {
  tech: '技術',
  books: '読書',
  philosophy: '哲学',
  psychology: '心理',
  gadgets: '道具',
  career: '仕事',
  essay: '随想',
};

/** トップの「棚」。kana は表示名、en は英字ラベル */
export const SHELF = [
  { kana: '技術', en: 'tech', href: '/notes' },
  { kana: '読書', en: 'books', href: '/books' },
  { kana: '哲学・心理', en: 'philosophy', href: '/notes' },
  { kana: '道具', en: 'gadgets', href: '/gadgets' },
] as const;
