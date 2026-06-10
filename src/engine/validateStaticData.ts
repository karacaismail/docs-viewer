// Fail loudly — dev'de açılışta şema + çapraz referans doğrulaması (08 §1).
// Prod'a bozuk veri CI kapısından zaten ulaşamaz (05 §2.4).
import { NavigationSchema, PagesFileSchema, GlossarySchema } from "../schemas";

export interface ValidationIssue { where: string; message: string }

export function validateStaticData(
  navigation: unknown,
  pagesFile: unknown,
  glossary: unknown,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nav = NavigationSchema.safeParse(navigation);
  if (!nav.success) issues.push(...nav.error.issues.map((i) => ({ where: `navigation:${i.path.join(".")}`, message: i.message })));
  const pf = PagesFileSchema.safeParse(pagesFile);
  if (!pf.success) issues.push(...pf.error.issues.slice(0, 20).map((i) => ({ where: `pages:${i.path.join(".")}`, message: i.message })));
  const gl = GlossarySchema.safeParse(glossary);
  if (!gl.success) issues.push(...gl.error.issues.slice(0, 20).map((i) => ({ where: `glossary:${i.path.join(".")}`, message: i.message })));

  if (nav.success && pf.success) {
    const pageIds = new Set(pf.data.pages.map((p) => p.id));
    for (const c of nav.data.categories)
      for (const g of c.groups)
        for (const it of g.items)
          if (!pageIds.has(it.pageId))
            issues.push({ where: `navigation:${c.id}/${g.id}`, message: `kırık pageId referansı: ${it.pageId}` });
  }
  if (gl.success && pf.success) {
    const pageIds = new Set(pf.data.pages.map((p) => p.id));
    for (const t of gl.data.terms)
      if (!pageIds.has(t.pageId))
        issues.push({ where: `glossary:${t.id}`, message: `kırık pageId: ${t.pageId}` });
  }
  return issues;
}
