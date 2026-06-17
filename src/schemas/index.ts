// Şemanın tek kaynağı — tipler z.infer ile türetilir (06; elle tip yazımı yok)
import { z } from "zod";

const id = (prefix: string) =>
  z.string().refine((s) => s.startsWith(prefix), { message: `ID '${prefix}' ile başlamalı` });

// ---- Segment'ler (04 §4 + 07B §2 link + migration keşfi: ref) ----
export const SegmentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("strong"), text: z.string() }),
  z.object({ type: z.literal("code"), text: z.string() }),
  z.object({ type: z.literal("term"), text: z.string(), termId: id("term-") }),
  z.object({ type: z.literal("link"), text: z.string(), href: z.string().url() }),
  z.object({ type: z.literal("ref"), text: z.string(), refId: z.string() }),
]);
export type Segment = z.infer<typeof SegmentSchema>;
const segments = z.array(SegmentSchema);

// ---- Block'lar (04 §3 — 16 type) ----
export const CODE_LANGUAGES = [
  "python",
  "sql",
  "yaml",
  "typescript",
  "javascript",
  "json",
  "css",
  "html",
  "bash",
  "http",
  "text",
] as const;

const base = z.object({ id: id("block-") });
export const BlockSchema = z.discriminatedUnion("type", [
  base.extend({ type: z.literal("heading"), level: z.number().int().min(2).max(4), text: z.string() }),
  base.extend({ type: z.literal("paragraph"), segments: segments.min(1) }),
  base.extend({
    type: z.literal("callout"),
    variant: z.enum(["info", "tip", "warning", "danger", "tr"]),
    title: z.string().optional(),
    segments,
  }),
  base.extend({
    type: z.literal("definitionList"),
    items: z.array(z.object({ term: z.string(), definition: segments })),
  }),
  base.extend({
    type: z.literal("stepList"),
    steps: z.array(z.object({ title: z.string(), segments })),
  }),
  base.extend({
    type: z.literal("checklist"),
    title: z.string().optional(),
    storageKey: z.string().optional(), // varsa ilerleme localStorage'da kalıcıdır (07A §3 kapanışı)
    items: z.array(z.object({ segments })),
  }),
  base.extend({
    type: z.literal("table"),
    caption: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(segments)),
  }),
  base.extend({
    type: z.literal("codeBlock"),
    title: z.string().optional(),
    language: z.enum(CODE_LANGUAGES),
    code: z.string(),
    showLineNumbers: z.boolean().optional(),
    highlightedLines: z.array(z.number().int().positive()).optional(),
    copyEnabled: z.boolean().optional(),
  }),
  base.extend({
    type: z.literal("cardGrid"),
    columns: z.number().int().positive().optional(),
    cards: z.array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        tone: z.string().optional(),
        segments,
      }),
    ),
  }),
  base.extend({
    type: z.literal("comparisonTable"),
    caption: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(segments)),
  }),
  base.extend({
    type: z.literal("useCase"),
    title: z.string(),
    scenario: segments,
    outcome: segments.optional(),
    preconditions: z.array(z.string()).min(1),
    authorization: z.string().min(1),
    mainFlow: z.array(z.string()).min(1),
    alternativeFlows: z.array(z.string()).min(1),
    failureFlows: z.array(z.string()).min(1),
    invariants: z.array(z.string()).min(1),
    audit: z.string().min(1),
    privacy: z.string().min(1),
    slo: z.string().min(1),
    acceptanceTests: z.array(z.string()).min(1),
  }),
  base.extend({ type: z.literal("caseStudy"), title: z.string(), story: segments }),
  base.extend({ type: z.literal("divider") }),
  base.extend({
    type: z.literal("image"),
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
  base.extend({ type: z.literal("list"), ordered: z.boolean().optional(), items: z.array(segments) }),
  base.extend({
    type: z.literal("wbsChart"),
    title: z.string().optional(),
    caption: z.string().optional(),
  }),
  base.extend({
    type: z.literal("lessonHeader"),
    unit: z.string(),
    title: z.string(),
    level: z.string(),
    durationMin: z.number(),
    prereq: z.array(z.string()),
    goals: z.array(z.string()),
  }),
]);
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block["type"];

// ---- Page (04 §2) ----
// ADR-0023 Faz 2 — tipli ilişki taksonomisi (related düz listesinin üstüne).
export const RelationTypeSchema = z.enum([
  "belongs-to",
  "uses",
  "depends-on",
  "extends",
  "sibling",
  "supersedes",
]);
export type RelationType = z.infer<typeof RelationTypeSchema>;

export const PageObjectSchema = z.object({
  id: id("page-"),
  sourceId: z.string().optional(), // eski cluster id — ref/related çözüm anahtarı
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  categoryId: z.string(),
  tags: z.array(z.string()).optional(),
  meta: z
    .object({
      granularity: z.string().optional(),
      state: z.string().optional(),
      badge: z.string().optional(),
      // ADR-0023 Faz 2 — parent zincirinden üretilen granülerlik breadcrumb'ı (App › … › self).
      breadcrumb: z
        .array(
          z.object({
            id: id("page-"),
            title: z.string(),
            granularity: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  // ADR-0023 Faz 2 — kompozisyon ebeveyni + tipli ilişkiler (her ikisi opsiyonel; geriye uyumlu).
  parent: id("page-").optional(),
  relations: z.array(z.object({ type: RelationTypeSchema, target: id("page-") })).optional(),
  owner: z.string().min(1),
  reviewer: z.string().min(1),
  maturity: z.enum(["taslak", "incelemede", "dogrulanmis", "deneysel", "aday"]),
  lastVerified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  evidence: z.array(z.string()),
  prerequisites: z.array(z.string()),
  nonGoals: z.array(z.string()).min(1),
  failureModes: z.array(z.string()).min(1),
  acceptanceCriteria: z.array(z.string()).min(1),
  operationalImpact: z.string().min(1),
  externalReviewRequired: z.boolean(),
  related: z.array(id("page-")).optional(),
  blocks: z.array(BlockSchema),
});

// Yönetişim dürüstlük değişmezleri (16 B) — "sahte yeşil" hata sınıfını şema
// seviyesinde kapatır. Alanların VARLIĞI yapısal kapıdır; bu refine TUTARLILIĞI
// zorlar: olgunluk iddiası kanıt ve doğrulama tarihiyle çelişemez.
export const PageSchema = PageObjectSchema.superRefine((page, ctx) => {
  if (page.maturity === "dogrulanmis") {
    if (page.lastVerified === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastVerified"],
        message: `'dogrulanmis' sayfa lastVerified tarihi taşımalı (sahte yeşil): ${page.slug}`,
      });
    }
    if (page.evidence.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence"],
        message: `'dogrulanmis' sayfa en az bir evidence taşımalı (kanıtsız doğrulama): ${page.slug}`,
      });
    }
  }
  if (page.lastVerified !== null && page.maturity === "taslak") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maturity"],
      message: `lastVerified dolu ama maturity 'taslak' — çelişki: ${page.slug}`,
    });
  }
});
export type Page = z.infer<typeof PageSchema>;

// ---- Navigation (03 §5) ----
export const NavigationSchema = z.object({
  schemaVersion: z.string(),
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      order: z.number(),
      section: z.string().optional(), // Rail 1 bölüm başlığı (03 §1: BAŞLANGIÇ / İNŞA SIRASI / REFERANS)
      groups: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          order: z.number(),
          items: z.array(
            z.object({
              pageId: id("page-"),
              slug: z.string(),
              title: z.string(),
              icon: z.string().optional(),
              order: z.number(),
            }),
          ),
        }),
      ),
    }),
  ),
});
export type NavigationFile = z.infer<typeof NavigationSchema>;
export type NavCategory = NavigationFile["categories"][number];

// ---- Glossary (04 §5) — core eager (tooltip/chip), detail lazy (panel; 14 #15) ----
export const GlossaryTermSchema = z.object({
  id: id("term-"),
  pageId: id("page-"),
  label: z.string(),
  shortExplanation: z.string(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export const GlossarySchema = z.object({ schemaVersion: z.string(), terms: z.array(GlossaryTermSchema) });

// Yedi soru kalıbı (12A §6): her terim Ne/Niçin/Nasıl/Nerede/Ne zaman/Kim/Analoji taşır
export const SevenQuestionsSchema = z.object({
  ne: z.string(),
  nicin: z.string(),
  nasil: z.string(),
  nerede: z.string(),
  ne_zaman: z.string(),
  kim: z.string(),
  analoji: z.string(),
});
export type SevenQuestions = z.infer<typeof SevenQuestionsSchema>;

export const GlossaryDetailSchema = z.object({
  longExplanation: z.string(),
  realWorldAnalogy: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  caseStudies: z.array(z.object({ title: z.string(), story: z.string() })).optional(),
  sevenQuestions: SevenQuestionsSchema.optional(),
});
export type GlossaryDetail = z.infer<typeof GlossaryDetailSchema>;
export const GlossaryDetailFileSchema = z.object({
  schemaVersion: z.string(),
  details: z.record(z.string(), GlossaryDetailSchema),
});

// ---- Search index (04 §6) ----
export const SearchDocSchema = z.object({
  id: z.string(),
  kind: z.enum(["block", "term"]),
  pageId: z.string(),
  pageTitle: z.string(),
  slug: z.string(),
  blockId: z.string(),
  blockType: z.string(),
  title: z.string(),
  text: z.string(),
});
export type SearchDoc = z.infer<typeof SearchDocSchema>;
export const SearchIndexSchema = z.object({ schemaVersion: z.string(), documents: z.array(SearchDocSchema) });

// Lazy mimari (14 #15): eager index yalnız metadata taşır; gövde pages/<stem>.json'da
export const PageIndexEntrySchema = PageObjectSchema.pick({
  id: true,
  sourceId: true,
  slug: true,
  title: true,
  summary: true,
  categoryId: true,
  meta: true,
  related: true,
  parent: true,
  relations: true,
});
export type PageIndexEntry = z.infer<typeof PageIndexEntrySchema>;
export const PagesIndexFileSchema = z.object({
  schemaVersion: z.string(),
  pages: z.array(PageIndexEntrySchema),
});
export const PageFileSchema = z.object({ schemaVersion: z.string(), page: PageSchema });
