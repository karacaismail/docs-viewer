import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PAGES_DIR = "src/data/pages";
const pages = readdirSync(PAGES_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(join(PAGES_DIR, file), "utf8")).page);

const GOVERNANCE_FIELDS = [
  "owner",
  "reviewer",
  "maturity",
  "lastVerified",
  "evidence",
  "prerequisites",
  "nonGoals",
  "failureModes",
  "acceptanceCriteria",
  "operationalImpact",
  "externalReviewRequired",
] as const;

const USE_CASE_FIELDS = [
  "preconditions",
  "authorization",
  "mainFlow",
  "alternativeFlows",
  "failureFlows",
  "invariants",
  "audit",
  "privacy",
  "slo",
  "acceptanceTests",
] as const;

describe("yönetişim ve kullanım hikâyesi sözleşmeleri", () => {
  it("her sayfa sahiplik, olgunluk, kanıt ve operasyon alanlarını taşır", () => {
    const missing: string[] = [];
    for (const page of pages) {
      for (const field of GOVERNANCE_FIELDS) {
        if (!(field in page)) missing.push(`${page.slug}.${field}`);
      }
      expect(page.owner.trim(), page.slug).not.toBe("");
      expect(page.reviewer.trim(), page.slug).not.toBe("");
      expect(page.operationalImpact.trim(), page.slug).not.toBe("");
      expect(page.nonGoals.length, page.slug).toBeGreaterThan(0);
      expect(page.failureModes.length, page.slug).toBeGreaterThan(0);
      expect(page.acceptanceCriteria.length, page.slug).toBeGreaterThan(0);
    }
    expect(missing).toEqual([]);
  });

  it("her kullanım hikâyesi olumsuz akış, invariant ve çalıştırılabilir kabul testi taşır", () => {
    const missing: string[] = [];
    let count = 0;
    for (const page of pages) {
      for (const block of page.blocks) {
        if (block.type !== "useCase") continue;
        count += 1;
        for (const field of USE_CASE_FIELDS) {
          if (!(field in block)) missing.push(`${page.slug}#${block.id}.${field}`);
        }
        expect(block.preconditions.length, block.id).toBeGreaterThan(0);
        expect(block.mainFlow.length, block.id).toBeGreaterThan(0);
        expect(block.alternativeFlows.length, block.id).toBeGreaterThan(0);
        expect(block.failureFlows.length, block.id).toBeGreaterThan(0);
        expect(block.invariants.length, block.id).toBeGreaterThan(0);
        expect(block.acceptanceTests.length, block.id).toBeGreaterThan(0);
      }
    }
    expect(count).toBeGreaterThan(300);
    expect(missing).toEqual([]);
  });

  it("kabul edilen P0 boşluklarının kanonik sayfaları yayınlanır", () => {
    const slugs = new Set(pages.map((page) => page.slug));
    const expected = [
      "egitim/edu-yetkinlik-modeli",
      "build/build-referans-uygulama",
      "build/build-enterprise-readiness",
      "backend/be-v1-kapsam-disi",
      "sus/sus-ai-uretim-sozlesmesi",
      "build/build-uzman-denetimi",
      "build/build-risk-defteri",
      "backend/be-destek-matrisi",
      "build/build-bilinmeyen-bilinmeyenler",
      "build/product-rakip-haritasi",
    ];
    for (const slug of expected) expect(slugs.has(slug), slug).toBe(true);
  });
});
