// Yönetişim dürüstlük kapısı (16 B) — "sahte yeşil" hata sınıfını kalıcı kilitler.
// docSync deseni: 142 wip sayfa olgunlaştıkça (AI veya 3 geliştirici elinde),
// "dogrulanmis" iddiası kanıt ve doğrulama tarihiyle tutarlı kalmalı; aksi halde CI kırmızı.
// Tek sözleşme: PageSchema.superRefine. Bu test o sözleşmeyi üretilmiş veride zorlar.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PageSchema } from "../src/schemas";

const PAGES_DIR = "src/data/pages";
const pages = readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8")).page);

describe("yönetişim dürüstlük değişmezleri (sahte yeşil kapısı)", () => {
  it("en az bir 'dogrulanmis' sayfa vardır (kapı boş veride sessizce geçmesin)", () => {
    expect(pages.some((p) => p.maturity === "dogrulanmis")).toBe(true);
  });

  it("'dogrulanmis' her sayfa lastVerified tarihi taşır", () => {
    const ihlal = pages
      .filter((p) => p.maturity === "dogrulanmis" && p.lastVerified === null)
      .map((p) => p.slug);
    expect(ihlal, "kanıt tarihi olmadan doğrulanmış sayfa").toEqual([]);
  });

  it("'dogrulanmis' her sayfa en az bir evidence taşır", () => {
    const ihlal = pages
      .filter((p) => p.maturity === "dogrulanmis" && p.evidence.length === 0)
      .map((p) => p.slug);
    expect(ihlal, "kanıtsız doğrulama").toEqual([]);
  });

  it("lastVerified dolu sayfa 'taslak' olamaz (çelişki)", () => {
    const ihlal = pages.filter((p) => p.lastVerified !== null && p.maturity === "taslak").map((p) => p.slug);
    expect(ihlal, "tarihli ama taslak").toEqual([]);
  });

  it("üretilmiş tüm sayfalar PageSchema dürüstlük refine'ından geçer", () => {
    const hatali = pages.filter((p) => !PageSchema.safeParse(p).success).map((p) => p.slug);
    expect(hatali, "şema honesty refine ihlali").toEqual([]);
  });

  it("şema sözleşmesi sahte yeşil sayfayı reddeder (kapının kendi kanıtı)", () => {
    const saglam = pages.find((p) => p.maturity === "dogrulanmis");
    const sahteYesil = { ...saglam, lastVerified: null, evidence: [] };
    expect(PageSchema.safeParse(sahteYesil).success).toBe(false);
  });
});
