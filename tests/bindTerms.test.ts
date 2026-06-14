// Parti 1-B doğrulaması (12A §2-B + §3a): üretilmiş gerçek veri üzerinde
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import glossary from "../src/data/glossary.json";
import type { Page, Segment } from "../src/schemas";

const PAGES_DIR = "src/data/pages";
const pages: Page[] = readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8")).page as Page);
const termIds = new Set((glossary as unknown as { terms: { id: string }[] }).terms.map((t) => t.id));

// 12A §2-B revizyonu kapsamı: paragraph + definitionList tanımları + callout gövdesi
function termSegmentsOf(p: Page): Extract<Segment, { type: "term" }>[] {
  return p.blocks
    .flatMap((b) => {
      if (b.type === "paragraph" || b.type === "callout") return b.segments;
      if (b.type === "definitionList") return b.items.flatMap((it) => it.definition);
      return [];
    })
    .filter((s): s is Extract<Segment, { type: "term" }> => s.type === "term");
}

describe("term segment bağlama (Parti 1-B)", () => {
  const edu = pages.filter((p) => p.categoryId === "egitim");

  it("egitim sayfalarının neredeyse tamamında term segmenti var", () => {
    const bound = edu.filter((p) => termSegmentsOf(p).length > 0);
    expect(bound.length).toBeGreaterThanOrEqual(edu.length - 1);
  });

  it("ilk-geçiş kuralı: aynı termId bir page'de en fazla bir kez bağlanır", () => {
    for (const p of edu) {
      const ids = termSegmentsOf(p).map((s) => s.termId);
      expect(new Set(ids).size, p.id).toBe(ids.length);
    }
  });

  it("her bağlı termId glossary'de çözülür (referans bütünlüğü)", () => {
    for (const p of edu) for (const s of termSegmentsOf(p)) expect(termIds.has(s.termId), p.id).toBe(true);
  });

  it("bağlama yalnız aynı page'in kaydına yapılır (cross-page yasak)", () => {
    for (const p of edu) {
      const re = new RegExp(`-${p.id.slice(5)}(-2)*$`);
      for (const s of termSegmentsOf(p)) expect(re.test(s.termId), p.id).toBe(true);
    }
  });

  it("B akışı tüm kategorilerde aktif: egitim dışında da bağlı page var (12A §3a genelleme)", () => {
    const other = pages.filter((p) => p.categoryId !== "egitim");
    const bound = other.filter((p) => termSegmentsOf(p).length > 0);
    expect(bound.length).toBeGreaterThan(other.length / 2);
  });

  it("cross-page yasağı tüm kategorilerde geçerli: her bağlı termId kendi page'ine aittir", () => {
    for (const p of pages) {
      const re = new RegExp(`-${p.id.slice(5)}(-2)*$`);
      for (const s of termSegmentsOf(p)) expect(re.test(s.termId), p.id).toBe(true);
    }
  });
});
