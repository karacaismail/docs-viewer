// Doc set ↔ üretilmiş veri tutarlılık kapısı.
// Tekrarlayan hata sınıfını kapatır: kod/içerik değişir, dokümandaki sayı bayat kalır.
// Yalnızca bayatlamaya yatkın olduğu kanıtlanmış sayılar kontrol edilir (dar regex, prose'a tolerans).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const doc = (name: string) => readFileSync(join(ROOT, "docs", name), "utf8");
const num = (s: string, re: RegExp, label: string): number => {
  const m = s.match(re);
  expect(m, `doc deseni bulunamadı: ${label} (${re})`).not.toBeNull();
  return Number(m?.[1]);
};

const sourceFiles = readdirSync(join(ROOT, "content-source")).filter((f) => f.endsWith(".json"));
const pagesIndex = JSON.parse(readFileSync(join(ROOT, "src", "data", "pages-index.json"), "utf8"));
const navigation = JSON.parse(readFileSync(join(ROOT, "src", "data", "navigation.json"), "utf8"));
const adayCount = pagesIndex.pages.filter(
  (p: { meta?: { state?: string } }) => p.meta?.state === "aday",
).length;

const countSvg = (dir: string): number =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) => n + (e.isDirectory() ? countSvg(join(dir, e.name)) : e.name.endsWith(".svg") ? 1 : 0),
    0,
  );
const svgTotal = countSvg(join(ROOT, "public", "assets"));
const cardCount = readdirSync(join(ROOT, "public", "assets", "cards")).filter((f) =>
  f.endsWith(".svg"),
).length;

describe("doc ↔ üretilmiş veri tutarlılığı", () => {
  it("02 §1: cluster dosya sayısı ve aday sayısı diskle eşleşir", () => {
    const d = doc("02-icerik-envanteri.md");
    expect(num(d, /## 1\. Cluster JSON Dosyaları \((\d+) dosya/, "02 toplam")).toBe(sourceFiles.length);
    expect(num(d, /\+ (\d+) aday \+ \d+ karar\/kavram \+ 1 kapsam dışı/, "02 aday")).toBe(adayCount);
  });

  it("03 §1: stack satırı navigation.json grup sayılarıyla eşleşir", () => {
    const stack = navigation.categories.find((c: { id: string }) => c.id === "stack");
    const n = (gid: string) => stack.groups.find((g: { id: string }) => g.id === gid)?.items.length ?? 0;
    const m = doc("03-navigation-ia.md").match(
      /\| (\d+) \((\d+) stack \+ (\d+) distribution \+ (\d+) edition \+ (\d+) landx\)/,
    );
    expect(m, "03 stack satırı deseni").not.toBeNull();
    const [stacks, dist, editions, landx] = [n("stacks"), n("dist"), n("editions"), n("landx")];
    expect([Number(m?.[1]), Number(m?.[2]), Number(m?.[3]), Number(m?.[4]), Number(m?.[5])]).toEqual([
      stacks + dist + editions + landx,
      stacks,
      dist,
      editions,
      landx,
    ]);
  });

  it("07B + 15 + generate.mjs: görsel varlık sayıları diskle eşleşir", () => {
    expect(num(doc("07B-block-kapsama-analizi.md"), /varlıkların tamamı \(`(\d+)`/, "07B varlık")).toBe(
      svgTotal,
    );
    expect(num(doc("07B-block-kapsama-analizi.md"), /ve (\d+) paket kartı/, "07B kart")).toBe(cardCount);
    expect(num(doc("15-icerik-yazari-rehberi.md"), /Mevcut (\d+) varlık/, "15 varlık")).toBe(svgTotal);
    const gen = readFileSync(join(ROOT, "tools", "assets", "generate.mjs"), "utf8");
    expect(num(gen, /\/\/ (\d+) görsel varlığın/, "generate başlık")).toBe(svgTotal);
    expect(num(gen, /(\d+) paket kartı \(cards\/\)/, "generate kart")).toBe(cardCount);
  });

  it("07A: toplam kaynak dosya sayısı diskle eşleşir", () => {
    expect(num(doc("07A-alan-esleme-tablosu.md"), /kavram kaydıyla toplam (\d+)/, "07A toplam")).toBe(
      sourceFiles.length,
    );
  });

  it("05: axe kapsamı sayısı e2e/a11y.spec.ts PAGES dizisiyle eşleşir", () => {
    const spec = readFileSync(join(ROOT, "e2e", "a11y.spec.ts"), "utf8");
    const pages = (spec.match(/^\s*"\/(?:docs\/|sozluk)/gm) ?? []).length;
    expect(
      num(doc("05-test-plani.md"), /axe-core WCAG 2A\/AA taraması \((\d+) temsilî sayfa/, "05 axe"),
    ).toBe(pages);
  });

  it("12A: aday kayıt sayısı pages-index ile eşleşir", () => {
    expect(num(doc("12A-glossary-editoryel-plani.md"), /genişlemesindeki (\d+) aday kayıt/, "12A aday")).toBe(
      adayCount,
    );
  });

  it("pages-index toplamı = kapsam içi kaynak dosya sayısı", () => {
    // ARCHITECTURE-5.json migration kapsamı dışıdır (02 §1)
    expect(pagesIndex.pages.length).toBe(sourceFiles.length - 1);
  });
});

it("02: karar/kavram sayısı aritmetik olarak tutar (toplam - 195 özgün - aday)", () => {
  const d = doc("02-icerik-envanteri.md");
  const kk = num(d, /\+ (\d+) karar\/kavram \+ 1 kapsam dışı/, "02 karar/kavram");
  expect(kk).toBe(pagesIndex.pages.length - 195 - adayCount);
});
