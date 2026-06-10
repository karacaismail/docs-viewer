// Statik veri yükleme — navigation + pages-index + glossary eager (küçük metadata);
// page gövdeleri page-başına lazy chunk (14 #15), search-index lazy (13 §Index).
import navigationJson from "../data/navigation.json";
import pagesIndexJson from "../data/pages-index.json";
import glossaryJson from "../data/glossary.json";
import type { NavigationFile, Page, PageIndexEntry, GlossaryTerm } from "../schemas";

export const navigation = navigationJson as unknown as NavigationFile;
export const pagesIndex = (pagesIndexJson as unknown as { pages: PageIndexEntry[] }).pages;
export const glossaryTerms = (glossaryJson as unknown as { terms: GlossaryTerm[] }).terms;

// Vite: her page JSON'u kendi async chunk'ı olur
const pageModules = import.meta.glob<{ page: Page }>("../data/pages/*.json", { import: "default" });

export async function loadPageBlocks(stem: string): Promise<Page | undefined> {
  const loader = pageModules[`../data/pages/${stem}.json`];
  if (!loader) return undefined;
  const data = await loader();
  if (import.meta.env.DEV) {
    // Fail loudly per-page (08 §1) — zod yalnız dev'de yüklenir
    const { PageSchema } = await import("../schemas");
    PageSchema.parse(data.page);
  }
  return data.page;
}

// Panel içeriği — tek dosya, ilk panel açılışında lazy, sonra cache (14 #15)
let detailCache: Record<string, import("../schemas").GlossaryDetail> | null = null;
export async function loadTermDetail(termId: string) {
  if (!detailCache) {
    const mod = await import("../data/glossary-detail.json");
    detailCache = (mod.default as unknown as { details: Record<string, import("../schemas").GlossaryDetail> }).details;
  }
  return detailCache[termId];
}

export async function loadSearchIndex() {
  const mod = await import("../data/search-index.json");
  return (mod.default as unknown as { documents: import("../schemas").SearchDoc[] }).documents;
}
