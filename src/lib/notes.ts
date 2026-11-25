import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;

/** 公開対象（draft 除外）の記事を新しい順で返す */
export async function getPublishedNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  return notes.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/** タグ -> 記事一覧。タグ名は出現順ではなく名前順に並べる */
export function groupByTag(notes: Note[]): Map<string, Note[]> {
  const map = new Map<string, Note[]>();
  for (const note of notes) {
    for (const tag of note.data.tags) {
      map.set(tag, [...(map.get(tag) ?? []), note]);
    }
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'ja')));
}

export const noteHref = (note: Note) => `/notes/${note.id}`;
export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag)}`;
