// İçerik doğrulama kapısı (05 §2.4) — üretilmiş gerçek veri tüm şemalardan geçer;
// kırık referans build'i kırar.
import { describe, expect, it } from "vitest";
import { NavigationSchema, PagesFileSchema, GlossarySchema, SearchIndexSchema } from "../src/schemas";
import { validateStaticData } from "../src/engine/validateStaticData";
import navigation from "../src/data/navigation.json";
import pagesFile from "../src/data/pages.json";
import glossary from "../src/data/glossary.json";
import searchIndex from "../src/data/search-index.json";

describe("içerik doğrulama kapısı", () => {
  it("navigation.json şemadan geçer", () => {
    const r = NavigationSchema.safeParse(navigation);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
  });

  it("pages.json şemadan geçer (197 page, 16 block type)", () => {
    const r = PagesFileSchema.safeParse(pagesFile);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
    expect(r.success && r.data.pages.length).toBe(197);
  });

  it("glossary.json şemadan geçer", () => {
    const r = GlossarySchema.safeParse(glossary);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
  });

  it("search-index.json şemadan geçer", () => {
    expect(SearchIndexSchema.safeParse(searchIndex).success).toBe(true);
  });

  it("çapraz referans bütünlüğü: navigation/glossary -> pages", () => {
    expect(validateStaticData(navigation, pagesFile, glossary)).toEqual([]);
  });

  it("block ID'leri page içinde benzersiz (03 §4)", () => {
    for (const p of (pagesFile as { pages: { id: string; blocks: { id: string }[] }[] }).pages) {
      const ids = p.blocks.map((b) => b.id);
      expect(new Set(ids).size, p.id).toBe(ids.length);
    }
  });
});
