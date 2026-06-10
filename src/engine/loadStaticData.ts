// Statik veri yükleme — search-index lazy (13 §Index), kalanı eager.
import navigationJson from "../data/navigation.json";
import pagesJson from "../data/pages.json";
import glossaryJson from "../data/glossary.json";
import type { NavigationFile, Page, GlossaryTerm } from "../schemas";

export const navigation = navigationJson as unknown as NavigationFile;
export const pages = (pagesJson as unknown as { pages: Page[] }).pages;
export const glossaryTerms = (glossaryJson as unknown as { terms: GlossaryTerm[] }).terms;

export async function loadSearchIndex() {
  const mod = await import("../data/search-index.json");
  return (mod.default as unknown as { documents: import("../schemas").SearchDoc[] }).documents;
}
