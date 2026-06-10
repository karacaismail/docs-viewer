// 13A §4 entegrasyon: Türkçe normalizasyonlu arama gerçek index üzerinde
import { describe, expect, it } from "vitest";
import MiniSearch from "minisearch";
import { foldTurkish } from "../src/engine/foldTurkish";
import searchIndex from "../src/data/search-index.json";
import type { SearchDoc } from "../src/schemas";

const docs = (searchIndex as unknown as { documents: SearchDoc[] }).documents;

function buildIndex() {
  const ms = new MiniSearch<SearchDoc>({
    fields: ["title", "pageTitle", "text"],
    storeFields: ["slug", "blockId", "pageTitle", "title", "kind"],
    processTerm: (t) => foldTurkish(t),
    searchOptions: { boost: { title: 3, pageTitle: 2 }, prefix: (t) => t.length > 2, fuzzy: 0.15 },
  });
  ms.addAll(docs);
  return ms;
}

describe("MiniSearch + foldTurkish entegrasyonu", () => {
  const ms = buildIndex();

  it("diacriticsiz sorgu diacriticli içeriği bulur", () => {
    const r = ms.search("surdurulebilirlik");
    expect(r.length).toBeGreaterThan(0);
  });

  it("İngilizce jargon bulunur (İ/I tuzağı yok)", () => {
    expect(ms.search("idempotency").length).toBeGreaterThan(0);
    expect(ms.search("outbox").length).toBeGreaterThan(0);
  });

  it("sonuç block anchor bilgisi taşır (13 §Index)", () => {
    const r = ms.search("doctype")[0] as unknown as SearchDoc;
    expect(r.slug).toBeTruthy();
  });

  it("glossary kayıtları index'te (kind=term)", () => {
    expect(docs.some((d) => d.kind === "term")).toBe(true);
  });
});
