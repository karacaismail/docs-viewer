// Slug -> index entry (sync, metadata); gövde loadPageBlocks ile lazy gelir.
// Bulunamazsa fallback model (08 §4 — UI hata yönetimi yazmaz).

import type { PageIndexEntry } from "../schemas";
import { pagesIndex } from "./loadStaticData";

export type ResolvedPage = { kind: "found"; entry: PageIndexEntry } | { kind: "not-found"; slug: string };

const bySlug = new Map(pagesIndex.map((p) => [p.slug, p]));
const byId = new Map(pagesIndex.map((p) => [p.id, p]));
const byOldId = new Map(pagesIndex.filter((p) => p.sourceId).map((p) => [p.sourceId as string, p]));

export function resolvePage(section: string, pageSlug: string): ResolvedPage {
  // Stem-fallback: kategori taşınmalarında (örn. dist -> stack, 03 §2) eski
  // bölümlü derin linkler kırılmaz — sayfa stem'inden çözülür, içerik render edilir.
  const entry = bySlug.get(`${section}/${pageSlug}`) ?? byId.get(`page-${pageSlug}`);
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

// Hover önizleme kartı (UX-D1) — ref hedefinin tam indeks kaydı (summary dahil)
export function resolveRefEntry(refId: string): PageIndexEntry | undefined {
  return byOldId.get(refId) ?? byId.get(`page-${refId}`);
}
