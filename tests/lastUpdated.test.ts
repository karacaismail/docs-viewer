// Sayfa bazlı güncellik sinyali (UX-E18): last-updated.json sözleşmesi.
// Dosya git geçmişinden tools/last-updated.mjs ile yerel üretilir (CI shallow clone
// olduğu için migrate'e dahil DEĞİL — determinizm kapısını bozmasın diye ayrı dosya).
import { describe, expect, it } from "vitest";
import lastUpdated from "../src/data/last-updated.json";
import pagesIndex from "../src/data/pages-index.json";

describe("last-updated.json sözleşmesi", () => {
  const stems = new Set(pagesIndex.pages.map((p: { id: string }) => p.id.slice(5)));

  it("her anahtar pages-index'te yaşayan bir stem'dir", () => {
    for (const k of Object.keys(lastUpdated)) {
      expect(stems.has(k), `bilinmeyen stem: ${k}`).toBe(true);
    }
  });

  it("tüm değerler ISO tarih (YYYY-AA-GG) biçimindedir", () => {
    for (const [k, v] of Object.entries(lastUpdated)) {
      expect(v, `bozuk tarih @ ${k}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("kapsam boş değildir (en az 200 sayfa tarihli)", () => {
    expect(Object.keys(lastUpdated).length).toBeGreaterThan(200);
  });
});
