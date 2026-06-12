// MD dışa aktarma kontratı: 'İlgili sayfalar' öncesi içerik (başlık+özet+blocks) → Markdown.
// Önce test (14 §3): tüm temel block tipleri + segment çevirileri + ref/site-link çözümü.
import { describe, expect, it } from "vitest";
import { pageToMarkdown } from "../src/engine/blocksToMarkdown";
import type { Block, Segment } from "../src/schemas";

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
});
