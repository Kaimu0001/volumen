import { defineCollection } from 'astro:content';
// astro:content からの z は Astro 7 で非推奨のため astro/zod を使う
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './consts';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(120),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      category: z.enum(CATEGORIES),
      // /tags/[tag] は1セグメントのルートのため、URLを壊す / ? # は - に置き換える（CI/CD -> CI-CD）
      tags: z.array(z.string().transform((t) => t.replace(/[/?#]/g, '-'))).default([]),
      draft: z.boolean().default(false),
      // OGP画像の上書き専用。一覧・記事本文には表示しない
      cover: image().optional(),
    }),
});

// 読書記録。読了日・評価・一言感想は必須（notes に混ぜると全部が任意項目になるため別スキーマ）。
// 本文は使わない（一覧のみ）。
const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string().max(60),
    author: z.string().max(40).optional(),
    readAt: z.coerce.date(),
    rating: z.number().int().min(1).max(5),
    summary: z.string().max(80),
    draft: z.boolean().default(false),
  }),
});

// ガジェット。スペックは「項目: 値」の組。本文を「使った感想」として表示する。
// 写真は alt を必須にする（全画像にalt）。
const gadgets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gadgets' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(120),
      usedSince: z.coerce.date(),
      specs: z.array(z.object({ label: z.string().max(20), value: z.string().max(60) })).min(1),
      photo: z.object({ src: image(), alt: z.string().min(1) }).optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { notes, books, gadgets };
