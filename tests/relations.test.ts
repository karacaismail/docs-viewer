// ADR-0023 Faz 2 — tipli ilişki + parent + breadcrumb kapısı.
// Şema sözleşmesi + üretilmiş veride: her relations.target ve parent pages-index'te yaşar;
// parent zinciri döngüsüzdür; breadcrumb parent zincirini yansıtır.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pagesIndex from "../src/data/pages-index.json";
import { PageObjectSchema } from "../src/schemas";

const PAGES_DIR = "src/data/pages";
const pageFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"));
const indexIds = new Set((pagesIndex as { pages: { id: string }[] }).pages.map((p) => p.id));

const base = {
  id: "page-x",
  slug: "kernel/x",
  title: "X",
  summary: "x",
  categoryId: "kernel",
  owner: "o",
  reviewer: "r",
  maturity: "taslak" as const,
  lastVerified: null,
  evidence: [],
  prerequisites: [],
  nonGoals: ["n"],
  failureModes: ["f"],
  acceptanceCriteria: ["a"],
  operationalImpact: "i",
  externalReviewRequired: false,
  blocks: [],
};

describe("Faz 2 — tipli ilişki + parent şeması", () => {
  it("parent + relations + breadcrumb opsiyoneldir; tip enum'u geçerlidir", () => {
    const ok = PageObjectSchema.safeParse({
      ...base,
      parent: "page-kernel",
      relations: [
        { type: "uses", target: "page-k-schema" },
        { type: "depends-on", target: "page-k-bus" },
      ],
      meta: { breadcrumb: [{ id: "page-kernel", title: "Kernel", granularity: "kaya" }] },
    });
    expect(ok.success).toBe(true);
  });

  it("geçersiz ilişki tipi reddedilir", () => {
    const bad = PageObjectSchema.safeParse({
      ...base,
      relations: [{ type: "knows", target: "page-y" }],
    });
    expect(bad.success).toBe(false);
  });

  it("alansız (eski) sayfa hâlâ geçerli — geriye uyumlu", () => {
    expect(PageObjectSchema.safeParse(base).success).toBe(true);
  });
});

describe("Faz 2 — üretilmiş veri bütünlüğü", () => {
  const pages = pageFiles.map(
    (f) =>
      JSON.parse(readFileSync(join(PAGES_DIR, f), "utf8")).page as {
        id: string;
        parent?: string;
        relations?: { type: string; target: string }[];
        meta?: { breadcrumb?: { id: string }[] };
      },
  );

  it("her relations.target pages-index'te yaşar", () => {
    const missing: string[] = [];
    for (const p of pages)
      for (const r of p.relations ?? []) if (!indexIds.has(r.target)) missing.push(`${p.id} -> ${r.target}`);
    expect(missing).toEqual([]);
  });

  it("her parent pages-index'te yaşar", () => {
    const missing = pages
      .filter((p) => p.parent && !indexIds.has(p.parent))
      .map((p) => `${p.id} -> ${p.parent}`);
    expect(missing).toEqual([]);
  });

  it("parent zinciri döngüsüzdür", () => {
    const byId = new Map(pages.map((p) => [p.id, p]));
    const cycles: string[] = [];
    for (const p of pages) {
      const seen = new Set<string>();
      let cur: string | undefined = p.id;
      while (cur) {
        if (seen.has(cur)) {
          cycles.push(p.id);
          break;
        }
        seen.add(cur);
        cur = byId.get(cur)?.parent;
      }
    }
    expect(cycles).toEqual([]);
  });

  it("breadcrumb son üyesi sayfanın kendisidir (varsa)", () => {
    const bad = pages
      .filter((p) => p.meta?.breadcrumb && p.meta.breadcrumb.length > 0)
      .filter((p) => p.meta?.breadcrumb?.at(-1)?.id !== p.id)
      .map((p) => p.id);
    expect(bad).toEqual([]);
  });
});
