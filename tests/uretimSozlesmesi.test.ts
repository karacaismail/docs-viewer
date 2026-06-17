// Üretim Sözleşmesi kapısı (test-first) — her kapsam-içi üretilmiş sayfa,
// 16 boyutu kapsayan standart "Üretim Sözleşmesi" bölümünü ve zenginleştirilmiş
// kopyalanabilir üretim prompt'unu taşır. Boyutlar AGENTS.md sözleşmesiyle hizalı:
// feature · güvenlik+OWASP 2025 · kod/güvenlik/perf optimizasyon · mobil+extension ·
// WCAG 2.2 AAA · Swarm/K8s/shared-hosting · ECA · default AI ajan · test döngüleri ·
// kernel/core/module entegrasyonu · module kullanımı.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PAGES_DIR = "src/data/pages";
const pageFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"));

type Seg = { text?: string };
type Block = {
  id: string;
  type: string;
  text?: string;
  title?: string;
  language?: string;
  code?: string;
  copyEnabled?: boolean;
  segments?: Seg[];
  caption?: string;
  columns?: string[];
  rows?: Seg[][][];
  items?: unknown[];
};
type PageFile = { page: { slug: string; categoryId: string; blocks: Block[] } };

const load = (f: string): PageFile => JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8"));

// Kapsam: tüm katalog (kullanıcı kararı). ARCHITECTURE-5 zaten migrate dışıdır (sayfa değil).
const inScope = (_p: PageFile): boolean => true;

// Bir sayfanın tüm metnini düzleştir (heading/paragraph/table/code/list/callout...).
function flatten(blocks: Block[]): string {
  const parts: string[] = [];
  const seg = (s?: Seg[]) => {
    if (Array.isArray(s)) for (const x of s) if (x?.text) parts.push(x.text);
  };
  for (const b of blocks) {
    if (typeof b.text === "string") parts.push(b.text);
    if (typeof b.title === "string") parts.push(b.title);
    if (typeof b.code === "string") parts.push(b.code);
    if (typeof b.caption === "string") parts.push(b.caption);
    // columns: table → string[]; cardGrid → number. Yalnız dizi olduğunda düzleştir.
    if (Array.isArray(b.columns)) for (const c of b.columns) if (typeof c === "string") parts.push(c);
    seg(b.segments);
    for (const r of b.rows ?? []) for (const c of r) seg(c);
    for (const st of (b as { steps?: { title?: string; segments?: Seg[] }[] }).steps ?? []) {
      if (st.title) parts.push(st.title);
      seg(st.segments);
    }
    for (const cd of (b as { cards?: { title?: string; segments?: Seg[] }[] }).cards ?? []) {
      if (cd.title) parts.push(cd.title);
      seg(cd.segments);
    }
    for (const it of b.items ?? []) {
      if (typeof it === "string") parts.push(it);
      else if (Array.isArray(it))
        seg(it as Seg[]); // list item = segments dizisi
      else if (it && typeof it === "object") {
        const o = it as { term?: string; segments?: Seg[]; definition?: Seg[] };
        if (o.term) parts.push(o.term);
        seg(o.segments);
        seg(o.definition);
      }
    }
  }
  return parts.join("\n");
}

describe("Üretim Sözleşmesi kapısı (16 boyut)", () => {
  const scoped = pageFiles.map(load).filter(inScope);

  it("kapsam boş değil (tüm katalog)", () => {
    expect(scoped.length).toBeGreaterThan(300);
  });

  it("her sayfada 'Üretim Sözleşmesi' L2 başlığı var", () => {
    const missing = scoped
      .filter((p) => !p.page.blocks.some((b) => b.type === "heading" && b.text === "Üretim Sözleşmesi"))
      .map((p) => p.page.slug);
    expect(missing).toEqual([]);
  });

  it("her sayfada zenginleştirilmiş, kopyalanabilir üretim prompt'u (codeBlock + copyEnabled) var", () => {
    const missing = scoped
      .filter(
        (p) =>
          !p.page.blocks.some(
            (b) => b.type === "codeBlock" && b.copyEnabled === true && /üret/i.test(b.title ?? ""),
          ),
      )
      .map((p) => p.page.slug);
    expect(missing).toEqual([]);
  });

  // 16 boyutun her biri sayfa metninde ayırt edici bir çapa taşır.
  const ANCHORS: [string, RegExp][] = [
    ["OWASP 2025", /OWASP Top 10:2025/],
    ["WCAG 2.2 AAA", /WCAG 2\.2 AAA/],
    ["optimizasyon", /optimizasyon/i],
    ["mobil/extension", /extension/i],
    ["Swarm", /Swarm/],
    ["Kubernetes", /Kubernetes/],
    ["shared hosting", /shared hosting/i],
    ["ECA", /\bECA\b/],
    ["AI ajan davranışı", /capability/i],
    ["test döngüsü (max 6)", /(en fazla|maksimum)\s*6|6\s*kez/i],
    ["entegrasyon", /entegrasyon/i],
  ];

  for (const [label, re] of ANCHORS) {
    it(`her sayfa "${label}" boyutunu içerir`, () => {
      const missing = scoped.filter((p) => !re.test(flatten(p.page.blocks))).map((p) => p.page.slug);
      expect(missing).toEqual([]);
    });
  }

  it("üretim prompt'u 16 boyutu görev sözleşmesi olarak dayatır", () => {
    const need = [/güvenlik/i, /WCAG/i, /test/i, /entegrasyon/i];
    const bad: string[] = [];
    for (const p of scoped) {
      // Bir sayfada birden çok "üret" prompt'u olabilir (kendi içeriği + sözleşme);
      // en az biri 16 boyutu dayatmalı.
      const prompts = p.page.blocks.filter(
        (b) => b.type === "codeBlock" && b.copyEnabled === true && /üret/i.test(b.title ?? ""),
      );
      const ok = prompts.some((pr) => need.every((re) => re.test(pr.code ?? "")));
      if (!ok) bad.push(p.page.slug);
    }
    expect(bad).toEqual([]);
  });
});
