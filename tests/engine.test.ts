// Engine birim testleri (05 — Faz 3 listesi)
import { describe, expect, it } from "vitest";
import { navigation } from "../src/engine/loadStaticData";
import { resolvePage, resolveRef } from "../src/engine/resolvePage";
import { resolveTerm, termsOfPage } from "../src/engine/resolveTerms";

describe("resolvePage", () => {
  it("bilinen slug'ı index entry'ye çözer (sync, metadata)", () => {
    const first = navigation.categories[0].groups[0].items[0];
    const [section, page] = first.slug.split("/");
    const r = resolvePage(section, page);
    expect(r.kind).toBe("found");
    if (r.kind === "found") expect(r.entry.id).toBe(first.pageId);
  });

  it("gövde lazy yüklenir ve block taşır (14 #15)", async () => {
    const { loadPageBlocks } = await import("../src/engine/loadStaticData");
    const p = await loadPageBlocks("kernel-authz");
    expect(p?.blocks.length).toBeGreaterThan(3);
    expect(await loadPageBlocks("olmayan-stem")).toBeUndefined();
  });

  it("bilinmeyen slug fallback model döner — exception değil (08 §4)", () => {
    const r = resolvePage("yok", "boyle-bir-sayfa");
    expect(r.kind).toBe("not-found");
  });
});

describe("resolveRef ({{ref:x}} çözümü)", () => {
  it("bilinen stem'i slug'a çözer", () => {
    expect(resolveRef("k-schema")?.slug).toMatch(/^kernel\//);
  });
  it("çözülemeyen ref undefined döner (düz metne düşer)", () => {
    expect(resolveRef("olmayan-stem")).toBeUndefined();
  });
});

describe("bağlamsal glossary (12 §Çözümleme)", () => {
  it("aynı label farklı page'lerde farklı kayıt taşıyabilir", () => {
    const all = navigation.categories.flatMap((c) => c.groups.flatMap((g) => g.items));
    const labelMap = new Map<string, Set<string>>();
    for (const it of all) {
      for (const t of termsOfPage(it.pageId)) {
        const set = labelMap.get(t.label.toLowerCase()) ?? new Set();
        set.add(t.id);
        labelMap.set(t.label.toLowerCase(), set);
      }
    }
    const multi = [...labelMap.values()].filter((s) => s.size > 1);
    expect(multi.length).toBeGreaterThan(0); // 29 çok bağlamlı label (12A §1)
  });

  it("çözülemeyen termId undefined döner", () => {
    expect(resolveTerm("term-olmayan-xyz")).toBeUndefined();
  });
});
