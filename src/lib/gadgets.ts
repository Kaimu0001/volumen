import { getCollection, type CollectionEntry } from 'astro:content';

export type Gadget = CollectionEntry<'gadgets'>;

/** 公開対象（draft 除外）のガジェットを、使い始めた日の新しい順で返す */
export async function getPublishedGadgets(): Promise<Gadget[]> {
  const gadgets = await getCollection('gadgets', ({ data }) => !data.draft);
  return gadgets.sort((a, b) => b.data.usedSince.valueOf() - a.data.usedSince.valueOf());
}
