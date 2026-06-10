// Slug -> page; bulunamazsa fallback model (08 §4 — UI hata yönetimi yazmaz)
import { pages } from "./loadStaticData";
import type { Page } from "../schemas";

export type ResolvedPage =
  | { kind: "found"; page: Page }
  | { kind: "not-found"; slug: string };

const bySlug = new Map(pages.map((p) => [p.slug, p]));
const byId = new Map(pages.map((p) => [p.id, p]));
const byOldId = new Map(pages.filter((p) => p.sourceId).map((p) => [p.sourceId as string, p]));

export function resolvePage(section: string, pageSlug: string): ResolvedPage {
  const page = bySlug.get(`${section}/${pageSlug}`);
  return page ? { kind: "found", page } : { kind: "not-found", slug: `${section}/${pageSlug}` };
}

export function resolvePageById(pageId: string): Page | undefined {
  return byId.get(pageId);
}

// {{ref:x}} çözümü — eski cluster id veya stem -> slug; çözülemezse undefined (düz metne düşer)
export function resolveRef(refId: string): { slug: string; title: string } | undefined {
  const page = byOldId.get(refId) ?? byId.get(`page-${refId}`);
  return page ? { slug: page.slug, title: page.title } : undefined;
}
