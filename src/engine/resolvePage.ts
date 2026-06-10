// Slug -> index entry (sync, metadata); gövde loadPageBlocks ile lazy gelir.
// Bulunamazsa fallback model (08 §4 — UI hata yönetimi yazmaz).
import { pagesIndex } from "./loadStaticData";
import type { PageIndexEntry } from "../schemas";

export type ResolvedPage =
  | { kind: "found"; entry: PageIndexEntry }
  | { kind: "not-found"; slug: string };

const bySlug = new Map(pagesIndex.map((p) => [p.slug, p]));
const byId = new Map(pagesIndex.map((p) => [p.id, p]));
const byOldId = new Map(pagesIndex.filter((p) => p.sourceId).map((p) => [p.sourceId as string, p]));

export function resolvePage(section: string, pageSlug: string): ResolvedPage {
  const entry = bySlug.get(`${section}/${pageSlug}`);
  return entry ? { kind: "found", entry } : { kind: "not-found", slug: `${section}/${pageSlug}` };
}

export function resolvePageById(pageId: string): PageIndexEntry | undefined {
  return byId.get(pageId);
}

// {{ref:x}} çözümü — eski cluster id veya stem -> slug; çözülemezse undefined (düz metne düşer)
export function resolveRef(refId: string): { slug: string; title: string } | undefined {
  const entry = byOldId.get(refId) ?? byId.get(`page-${refId}`);
  return entry ? { slug: entry.slug, title: entry.title } : undefined;
}
