// Bağlamsal glossary çözümü — eşleşme yalnız termId üzerinden (12 §Çözümleme)

import type { GlossaryTerm } from "../schemas";
import { glossaryTerms } from "./loadStaticData";

const byId = new Map(glossaryTerms.map((t) => [t.id, t]));
const byPage = new Map<string, GlossaryTerm[]>();
for (const t of glossaryTerms) {
  const list = byPage.get(t.pageId) ?? [];
  list.push(t);
  byPage.set(t.pageId, list);
}

export function resolveTerm(termId: string): GlossaryTerm | undefined {
  return byId.get(termId);
}

export function termsOfPage(pageId: string): GlossaryTerm[] {
  return byPage.get(pageId) ?? [];
}

/** Global sözlük görünümü (UX-C10) için tüm terimler. */
export function allTerms(): GlossaryTerm[] {
  return glossaryTerms;
}
