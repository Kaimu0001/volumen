import { getCollection, type CollectionEntry } from 'astro:content';

export type Book = CollectionEntry<'books'>;

/** 公開対象（draft 除外）の読書記録を、読了日の新しい順で返す */
export async function getPublishedBooks(): Promise<Book[]> {
  const books = await getCollection('books', ({ data }) => !data.draft);
  return books.sort((a, b) => b.data.readAt.valueOf() - a.data.readAt.valueOf());
}
