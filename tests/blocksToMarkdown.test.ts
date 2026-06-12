// MD dışa aktarma kontratı: 'İlgili sayfalar' öncesi içerik (başlık+özet+blocks) → Markdown.
// Önce test (14 §3): tüm temel block tipleri + segment çevirileri + ref/site-link çözümü.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pageToMarkdown } from "../src/engine/blocksToMarkdown";
import type { Block, Segment } from "../src/schemas";
import { BlockSchema } from "../src/schemas";

const seg = (text: string): Segment[] => [{ type: "text", text }];
const BASE = "https://example.test/docs-viewer/";

function md(blocks: Block[]): string {
  return pageToMarkdown(
    { title: "Deneme Sayfası", summary: "Kısa özet.", slug: "kernel/deneme" },
    blocks,
    BASE,
  );
}

describe("pageToMarkdown", () => {
  it("başlık + özet + kaynak satırı üretir", () => {
    const out = md([]);
    expect(out).toContain("# Deneme Sayfası");
    expect(out).toContain("> Kısa özet.");
    expect(out).toContain(`${BASE}docs/kernel/deneme`);
  });

  it("heading seviyeleri ve paragraph segmentleri (strong/code/term/link) çevrilir", () => {
    const out = md([
      { id: "b1", type: "heading", level: 2, text: "Bölüm" },
      {
        id: "b2",
        type: "paragraph",
        segments: [
          { type: "text", text: "düz " },
          { type: "strong", text: "kalın" },
          { type: "code", text: "kod" },
          { type: "term", text: "terim", termId: "term-x-y" },
          { type: "link", text: "dış", href: "https://a.b" },
        ],
      },
    ]);
    expect(out).toContain("## Bölüm");
    expect(out).toContain("düz **kalın**`kod`terim[dış](https://a.b)");
  });

  it("callout blockquote, checklist kutuları, codeBlock fence, tablo ve görsel çevrilir", () => {
    const out = md([
      { id: "c1", type: "callout", variant: "tip", title: "İpucu", segments: seg("gövde") },
      { id: "c2", type: "checklist", items: [{ segments: seg("madde") }] },
      { id: "c3", type: "codeBlock", language: "yaml", code: "a: 1" },
      { id: "c4", type: "table", columns: ["K1", "K2"], rows: [[seg("h|x"), seg("y")]] },
      { id: "c5", type: "image", src: "/assets/x.svg", alt: "alternatif" },
    ]);
    expect(out).toContain("> **İpucu:** gövde");
    expect(out).toContain("- [ ] madde");
    expect(out).toContain("```yaml\na: 1\n```");
    expect(out).toContain("| K1 | K2 |");
    expect(out).toContain("h\\|x");
    expect(out).toContain(`![alternatif](${BASE}assets/x.svg)`);
  });

  it("definitionList / stepList / list / divider / wbsChart çevrilir", () => {
    const out = md([
      { id: "d1", type: "definitionList", items: [{ term: "Ad", definition: seg("tanım") }] },
      { id: "d2", type: "stepList", steps: [{ title: "Adım", segments: seg("yap") }] },
      { id: "d3", type: "list", ordered: true, items: [seg("bir")] },
      { id: "d4", type: "divider" },
      { id: "d5", type: "wbsChart", title: "WBS" },
    ]);
    expect(out).toContain("- **Ad** — tanım");
    expect(out).toContain("1. **Adım:** yap");
    expect(out).toContain("1. bir");
    expect(out).toContain("\n---\n");
    expect(out).toContain("Etkileşimli WBS");
  });

  // ── KEMİK 1: şema-kapsam kapısı ──
  // BlockSchema union'ına yeni bir type eklenir de bu örnek haritası + dönüştürücü
  // güncellenmezse bu test KIRMIZI olur: MD export sessizce delinemez.
  it("şema-kapsam: union'daki HER block type için dönüştürücü boş olmayan çıktı verir", () => {
    const SAMPLES: Record<string, Block> = {
      heading: { id: "x", type: "heading", level: 2, text: "t" },
      paragraph: { id: "x", type: "paragraph", segments: seg("t") },
      callout: { id: "x", type: "callout", variant: "info", segments: seg("t") },
      definitionList: { id: "x", type: "definitionList", items: [{ term: "a", definition: seg("b") }] },
      stepList: { id: "x", type: "stepList", steps: [{ title: "a", segments: seg("b") }] },
      checklist: { id: "x", type: "checklist", items: [{ segments: seg("a") }] },
      table: { id: "x", type: "table", columns: ["a"], rows: [[seg("b")]] },
      codeBlock: { id: "x", type: "codeBlock", language: "text", code: "c" },
      cardGrid: { id: "x", type: "cardGrid", cards: [{ title: "a", segments: seg("b") }] },
      comparisonTable: { id: "x", type: "comparisonTable", columns: ["a"], rows: [[seg("b")]] },
      useCase: { id: "x", type: "useCase", title: "a", scenario: seg("b") },
      caseStudy: { id: "x", type: "caseStudy", title: "a", story: seg("b") },
      divider: { id: "x", type: "divider" },
      image: { id: "x", type: "image", src: "/assets/a.svg", alt: "a" },
      list: { id: "x", type: "list", items: [seg("a")] },
      lessonHeader: {
        id: "x",
        type: "lessonHeader",
        unit: "01",
        title: "a",
        level: "kolay",
        durationMin: 5,
        prereq: [],
        goals: ["g"],
      },
      wbsChart: { id: "x", type: "wbsChart" },
    };
    const unionTypes = (
      BlockSchema as unknown as { options: { shape: { type: { value: string } } }[] }
    ).options.map((o) => o.shape.type.value);
    for (const t of unionTypes) {
      expect(SAMPLES[t], `örnek eksik: ${t} — yeni block type MD dönüştürücüye eşlenmeli`).toBeTruthy();
      const out = pageToMarkdown({ title: "T", slug: "a/b" }, [SAMPLES[t]], BASE);
      const body = out.split("# T")[1] ?? "";
      expect(body.includes("---") && body.trim().length > 20, `boş çıktı: ${t}`).toBe(true);
    }
  });

  // ── KEMİK 2: golden fixture — bilinçsiz biçim değişikliği diff'le yakalanır ──
  it("golden: sabit fixture sayfasının MD çıktısı birebir korunur", () => {
    const fixtureBlocks: Block[] = [
      { id: "g1", type: "heading", level: 2, text: "Bölüm" },
      {
        id: "g2",
        type: "paragraph",
        segments: [
          { type: "text", text: "düz " },
          { type: "strong", text: "kalın" },
          { type: "term", text: "terim", termId: "term-a-b" },
        ],
      },
      { id: "g3", type: "callout", variant: "warning", title: "Uyarı", segments: seg("dikkat") },
      { id: "g4", type: "table", columns: ["K1", "K2"], rows: [[seg("a"), seg("b|c")]] },
      { id: "g5", type: "codeBlock", language: "yaml", code: "k: v" },
      { id: "g6", type: "checklist", title: "Liste", items: [{ segments: seg("madde") }] },
      { id: "g7", type: "image", src: "/assets/g.svg", alt: "görsel", caption: "altyazı" },
      { id: "g8", type: "divider" },
    ];
    const out = pageToMarkdown(
      { title: "Golden", summary: "Özet.", slug: "test/golden" },
      fixtureBlocks,
      BASE,
    );
    const goldenPath = join(__dirname, "__fixtures__", "golden-page.md");
    // Bilinçli güncelleme ritüeli (sus-conformance deseni): GOLDEN_UPDATE=1 vitest run
    if (process.env.GOLDEN_UPDATE === "1") writeFileSync(goldenPath, out);
    const golden = readFileSync(goldenPath, "utf8");
    expect(out).toBe(golden);
  });

  // ── KEMİK 3: gerçek-veri smoke — üretilmiş TÜM sayfalar hatasız ve geçerli MD üretir ──
  it("smoke: tüm sayfalar exception'sız çevrilir; çıktı başlıkla başlar, kaynakla biter", () => {
    const dir = join(__dirname, "..", "src", "data", "pages");
    const idx = JSON.parse(readFileSync(join(__dirname, "..", "src", "data", "pages-index.json"), "utf8"));
    const bySlugStem = new Map(
      (idx.pages as { slug: string; title: string; summary?: string }[]).map((p) => [
        p.slug.split("/")[1],
        p,
      ]),
    );
    let count = 0;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const page = JSON.parse(readFileSync(join(dir, f), "utf8")).page;
      const entry = bySlugStem.get(f.replace(".json", "")) ?? { title: page.title, slug: page.slug };
      const out = pageToMarkdown(entry, page.blocks, BASE);
      expect(out.startsWith("# "), f).toBe(true);
      expect(out.includes("Kaynak: "), f).toBe(true);
      // Sınır mührü: 'İlgili sayfalar' bölümü ASLA çıktıya giremez (kullanıcı sözleşmesi)
      expect(out.includes("İlgili sayfalar"), f).toBe(false);
      count += 1;
    }
    expect(count).toBeGreaterThan(200);
  });
});
