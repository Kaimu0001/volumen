// 依存追加の理由: Atom 1.0 を文字列連結で組むと、タイトルの & < " や日本語の
// XMLエスケープ漏れでフィードが壊れる。仕様書 §8 は Atom 指定だが、@astrojs/rss は
// RSS 2.0 を出力するため使えない。そのため Atom 対応の軽量ライブラリ feed を採用した。
import type { APIRoute } from 'astro';
import { Feed } from 'feed';
import { AUTHOR, SITE_DESCRIPTION, SITE_DOMAIN, SITE_NAME } from '../consts';
import { getPublishedNotes, noteHref } from '../lib/notes';

const FEED_LIMIT = 20;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL(`https://${SITE_DOMAIN}`);
  const notes = (await getPublishedNotes()).slice(0, FEED_LIMIT); // 新しい順

  // 最終更新日: 記事が無いときも <updated> は必須なので、固定の過去日にする（実行時刻は使わない）
  const updated = notes.length
    ? new Date(Math.max(...notes.map((n) => (n.data.updatedAt ?? n.data.publishedAt).valueOf())))
    : new Date(0);

  const feed = new Feed({
    id: new URL('/', origin).href,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    link: new URL('/', origin).href,
    language: 'ja',
    updated,
    copyright: `${SITE_DOMAIN} — ${AUTHOR}`,
    feedLinks: { atom: new URL('/feed.xml', origin).href },
    author: { name: AUTHOR },
  });

  for (const note of notes) {
    const url = new URL(noteHref(note), origin).href;
    feed.addItem({
      id: url,
      link: url,
      title: note.data.title,
      // 本文は入れず、要約（description）のみ
      description: note.data.description,
      date: note.data.updatedAt ?? note.data.publishedAt,
      published: note.data.publishedAt,
    });
  }

  return new Response(feed.atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
