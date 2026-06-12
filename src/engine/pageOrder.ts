// Sıralı okuma gezgini (UX-A1): navigation'dan düz, sıralı sayfa listesi türetir.
// Önceki/Sonraki, kategori sınırında bölüm adıyla birlikte döner (60+ okuma akışı).
import { navigation } from "./loadStaticData";

export type FlatNavItem = { slug: string; title: string; categoryLabel: string; section?: string };

const FLAT: FlatNavItem[] = navigation.categories.flatMap((c) =>
  c.groups.flatMap((g) =>
    g.items.map((i) => ({
      slug: i.slug,
      title: i.title,
      categoryLabel: c.label,
      section: (c as { section?: string }).section,
    })),
  ),
);
const INDEX = new Map(FLAT.map((it, i) => [it.slug, i]));

export function pageNeighbors(slug: string): {
  prev?: FlatNavItem;
  next?: FlatNavItem;
  crossesCategory: boolean;
} {
  const i = INDEX.get(slug);
  if (i === undefined) return { crossesCategory: false };
  const prev = FLAT[i - 1];
  const next = FLAT[i + 1];
  return {
    prev,
    next,
    crossesCategory: !!next && next.categoryLabel !== FLAT[i].categoryLabel,
  };
}

export function flatNav(): FlatNavItem[] {
  return FLAT;
}

export function pageAt(slug: string): FlatNavItem | undefined {
  const i = INDEX.get(slug);
  return i === undefined ? undefined : FLAT[i];
}
