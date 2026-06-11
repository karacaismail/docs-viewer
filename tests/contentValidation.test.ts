// İçerik doğrulama kapısı (05 §2.4) — üretilmiş gerçek veri tüm şemalardan geçer;
// kırık referans build'i kırar. Lazy mimari: index + page-başına dosyalar (14 #15).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import glossary from "../src/data/glossary.json";
import navigation from "../src/data/navigation.json";
import pagesIndex from "../src/data/pages-index.json";
import searchIndex from "../src/data/search-index.json";
import { validateStaticData } from "../src/engine/validateStaticData";
import {
  GlossarySchema,
  NavigationSchema,
  PageFileSchema,
  PagesIndexFileSchema,
  SearchIndexSchema,
} from "../src/schemas";

const PAGES_DIR = "src/data/pages";
const pageFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"));

describe("içerik doğrulama kapısı", () => {
  it("navigation.json şemadan geçer", () => {
    const r = NavigationSchema.safeParse(navigation);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
  });

  it("pages-index.json şemadan geçer (239 entry)", () => {
    const r = PagesIndexFileSchema.safeParse(pagesIndex);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
    expect(r.success && r.data.pages.length).toBe(239);
  });

  it("239 page dosyasının tamamı şemadan geçer; block ID'ler page içinde benzersiz (03 §4)", () => {
    expect(pageFiles.length).toBe(239);
    for (const f of pageFiles) {
      const data = JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8"));
      const r = PageFileSchema.safeParse(data);
      if (!r.success) console.error(f, r.error.issues.slice(0, 3));
      expect(r.success, f).toBe(true);
      if (r.success) {
        const ids = r.data.page.blocks.map((b) => b.id);
        expect(new Set(ids).size, f).toBe(ids.length);
      }
    }
  });

  it("index ile page dosyaları birebir eşleşir", () => {
    const indexIds = new Set((pagesIndex as { pages: { id: string }[] }).pages.map((p) => p.id));
    for (const f of pageFiles) {
      const stem = f.replace(/\.json$/, "");
      expect(indexIds.has(`page-${stem}`), f).toBe(true);
    }
  });

  it("glossary.json (core) ve search-index.json şemadan geçer", () => {
    expect(GlossarySchema.safeParse(glossary).success).toBe(true);
    expect(SearchIndexSchema.safeParse(searchIndex).success).toBe(true);
  });

  it("glossary-detail.json şemadan geçer ve her core kaydın detail'i var", async () => {
    const { GlossaryDetailFileSchema } = await import("../src/schemas");
    const detail = JSON.parse(readFileSync("src/data/glossary-detail.json", "utf8"));
    const r = GlossaryDetailFileSchema.safeParse(detail);
    if (!r.success) console.error(r.error.issues.slice(0, 3));
    expect(r.success).toBe(true);
    const detailIds = new Set(Object.keys((detail as { details: Record<string, unknown> }).details));
    for (const t of (glossary as { terms: { id: string }[] }).terms)
      expect(detailIds.has(t.id), t.id).toBe(true);
  });

  it("çapraz referans bütünlüğü: navigation/glossary -> pages-index", () => {
    expect(validateStaticData(navigation, pagesIndex, glossary)).toEqual([]);
  });

  it("görsel varlık bütünlüğü: her image src public/assets'te mevcut (07B §1 kapanışı)", () => {
    const missing: string[] = [];
    for (const f of pageFiles) {
      const page = JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8")).page as {
        blocks: { type: string; src?: string }[];
      };
      for (const b of page.blocks)
        if (b.type === "image" && b.src && !existsSync(join("public", b.src))) missing.push(`${f}: ${b.src}`);
    }
    expect(missing).toEqual([]);
  });
});
