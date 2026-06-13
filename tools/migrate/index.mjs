// Migration orkestrasyonu — 07: oku -> dönüştür -> doğrula -> yaz + mutabakat raporu
// Deterministik: aynı girdi her zaman aynı çıktı (03 §4).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bindTermsInPage } from "./bindTerms.mjs";
import { createTransformer } from "./blocks.mjs";
import {
  CATEGORIES,
  PREFIX_TO_CATEGORY,
  PRODUCT_GROUP_MAP,
  PRODUCT_GROUPS,
  STEM_OVERRIDES,
} from "./categories.mjs";
import { detailToBlocks } from "./detail.mjs";
import { flattenSegments, foldTr, parseInline, slugify } from "./inline.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC_DIR = join(ROOT, "content-source");
const OUT_DIR = join(ROOT, "src", "data");
const SKIP = new Set(["ARCHITECTURE-5.json"]); // 07A §5: spec, içerik değil

const warnings = [];
const notes = []; // bilinçli düşürmeler / kayıtlı kararlar — kapı değildir (15 §1.4)
const fileWarn = (file) => (msg) => warnings.push(`${file}: ${msg}`);
const fileNote = (file) => (msg) => notes.push(`${file}: ${msg}`);

// 12A Parti 1 — Eğitim Yolu editöryel zenginleştirme overlay'i
const ENRICHMENT = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "glossary-enrichment.json"), "utf8"),
);
const enrichedCount = { n: 0, p2: 0 };
const enrichmentMisses = new Set();

// 12A §6 — Yedi Soru genellemesi (terim düzeyi, tüm kategoriler): her glossary
// kaydı Ne/Niçin/Nasıl/Nerede/Ne zaman/Kim/Analoji cevaplarını overlay'den alır.
const SEVEN_QUESTIONS = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "seven-questions.json"), "utf8"),
);
const sevenCount = { n: 0 };
const sevenMisses = [];

function readClusters() {
  const files = readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".json") && !SKIP.has(f))
    .sort();
  return files.map((f) => {
    const stem = f.replace(/^\d+-/, "").replace(/\.json$/, "");
    const num = Number((f.match(/^(\d+)-/) ?? [0, 0])[1]);
    return { file: f, stem, num, data: JSON.parse(readFileSync(join(SRC_DIR, f), "utf8")) };
  });
}

function categoryOf(stem) {
  if (STEM_OVERRIDES[stem]) return STEM_OVERRIDES[stem];
  const prefix = stem.split("-")[0];
  return PREFIX_TO_CATEGORY[prefix] ?? null;
}

const CATEGORY_OWNER = {
  egitim: "Eğitim programı sahibi",
  genel: "Ürün mimarı",
  backend: "Backend mimarisi sahibi",
  kernel: "Kernel mimarisi sahibi",
  scale: "Platform ölçek sahibi",
  layer1: "Ortak servisler sahibi",
  stack: "Ürün portföyü sahibi",
  build: "Teslimat ve operasyon sahibi",
  urunler: "İlgili Domain sahibi",
  crosscut: "Çapraz-kesen politika sahibi",
  dx: "Developer experience sahibi",
  frontend: "Frontend mimarisi sahibi",
  sus: "Sürdürülebilirlik sahibi",
  kararlar: "Mimari karar sahibi",
};

const CATEGORY_REVIEWER = {
  egitim: "Fractional senior mimar",
  genel: "Fractional senior mimar",
  backend: "Senior backend ve PostgreSQL reviewer",
  kernel: "Senior platform ve güvenlik reviewer",
  scale: "Senior SRE reviewer",
  layer1: "Senior platform reviewer",
  stack: "Ürün ve Domain reviewer",
  build: "Senior SRE ve release reviewer",
  urunler: "Domain uzmanı ve senior reviewer",
  crosscut: "İlgili hukuk, güvenlik veya uyum uzmanı",
  dx: "Senior developer experience reviewer",
  frontend: "Senior frontend ve accessibility reviewer",
  sus: "Senior mimar ve bakım reviewer",
  kararlar: "Mimari karar kurulu",
};

const OPERATIONAL_IMPACT = {
  egitim: "Ekip yetkinliği ve güvenli üretim kararlarını etkiler.",
  genel: "Ürün kapsamı, öncelik ve yatırım kararlarını etkiler.",
  backend: "Veri bütünlüğü, API uyumu ve üretim işletimini etkiler.",
  kernel: "Tüm app'lerin güvenlik, izolasyon ve geriye uyumluluk temelini etkiler.",
  scale: "Kapasite, gecikme, hata bütçesi ve kurtarma davranışını etkiler.",
  layer1: "Birden çok app'in ortak servis davranışını etkiler.",
  stack: "Paketleme, entegrasyon ve ürün deneyimini etkiler.",
  build: "Release, destek, geri alma ve üretim sürekliliğini etkiler.",
  urunler: "İlgili Domain'in iş kuralları, uyum ve kullanıcı akışlarını etkiler.",
  crosscut: "Birden çok Domain'i kesen güvenlik, hukuk veya operasyon politikasını etkiler.",
  dx: "Geliştirici üretkenliği, paket güvenliği ve entegrasyon kalitesini etkiler.",
  frontend: "Kullanılabilirlik, erişilebilirlik ve istemci güvenliğini etkiler.",
  sus: "Uzun dönem bakım, upgrade ve sözleşme uyumluluğunu etkiler.",
  kararlar: "Bağlayıcı mimari kararları ve sonraki uygulama adımlarını etkiler.",
};

function governanceOf(data, stem, categoryId) {
  const state = data.state ?? "";
  const maturity =
    data.maturity ??
    (state === "ok" || state === "done"
      ? "dogrulanmis"
      : state === "aday"
        ? "aday"
        : state === "critical"
          ? "incelemede"
          : "taslak");
  const sensitive =
    /auth|security|guven|tenan|privacy|kvkk|gdpr|compliance|money|tax|payroll|clinic|legal|backup|deploy|risk|readiness|identity|sso/.test(
      stem,
    );
  return {
    owner: data.owner ?? CATEGORY_OWNER[categoryId] ?? "Ürün mimarı",
    reviewer: data.reviewer ?? CATEGORY_REVIEWER[categoryId] ?? "Fractional senior mimar",
    maturity,
    lastVerified:
      data.lastVerified === null
        ? null
        : (data.lastVerified ?? (maturity === "dogrulanmis" ? "2026-06-13" : null)),
    evidence:
      data.evidence ?? (maturity === "dogrulanmis" ? ["CI şema, referans ve içerik doğrulama kapıları"] : []),
    prerequisites: data.prerequisites ?? [],
    nonGoals: data.nonGoals ?? ["Bu sayfa tek başına üretim onayı veya uzman incelemesi yerine geçmez."],
    failureModes: data.failureModes ?? [
      "Tanım, ölçülebilir kabul testi ve sorumlu reviewer olmadan doğrudan üretime uygulanır.",
    ],
    acceptanceCriteria: data.acceptanceCriteria ?? [
      "Sahip ve reviewer atanmıştır; ilgili otomatik kapılar yeşildir; açık varsayımlar kayıtlıdır.",
    ],
    operationalImpact:
      data.operationalImpact ?? OPERATIONAL_IMPACT[categoryId] ?? "Ürün kararlarını etkiler.",
    externalReviewRequired:
      data.externalReviewRequired ?? (sensitive || ["backend", "kernel", "crosscut"].includes(categoryId)),
  };
}

function transformCluster({ file, stem, data }) {
  const warn = fileWarn(file);
  const counters = {};
  const usedIds = new Set();
  const nextId = (hint) => {
    counters[hint] = (counters[hint] ?? 0) + 1;
    let id = `block-${stem}-${hint}${counters[hint] > 1 ? `-${counters[hint]}` : ""}`;
    while (usedIds.has(id)) id += "x";
    usedIds.add(id);
    return id;
  };
  const terms = [];
  const collectTerms = (list) => {
    for (const t of list ?? []) if (t?.term) terms.push(t);
  };
  const ctx = { nextId, warn, note: fileNote(file), collectTerms, images: [] };
  const tr = createTransformer(ctx);

  const blocks = [];
  // enrich.info → giriş callout (07A §4)
  if (data.enrich?.info) {
    blocks.push({
      id: nextId("ozet"),
      type: "callout",
      variant: "info",
      title: "Özet",
      segments: parseInline(data.enrich.info),
    });
  }
  for (const b of data.blocks ?? []) blocks.push(...tr.transformBlock(b));
  if (data.enrich?.detail) {
    blocks.push({ id: nextId("h-derinlemesine"), type: "heading", level: 2, text: "Derinlemesine" });
    blocks.push(...detailToBlocks(data.enrich.detail, nextId, warn));
  }
  if (data.enrich?.lesson) {
    blocks.push({ id: nextId("h-yedi-soruda"), type: "heading", level: 2, text: "Bu konu yedi soruda" });
    blocks.push(tr.lessonToBlock(data.enrich.lesson));
  }
  if (data.enrich?.stories?.length) {
    blocks.push({ id: nextId("h-hikayeler"), type: "heading", level: 2, text: "Kullanım hikâyeleri" });
    for (const s of data.enrich.stories) blocks.push(tr.storyToUseCase(s));
  }
  collectTerms(data.enrich?.terms);

  const categoryId = categoryOf(stem);
  const pageId = `page-${stem}`;
  const page = {
    id: pageId,
    sourceId: data.id ?? stem, // eski cluster id — {{ref:x}} ve related çözümü için
    slug: `${categoryId}/${stem}`,
    title: data.title ?? stem,
    summary: data.subtitle ?? "",
    categoryId,
    tags: data.tags ?? [],
    meta: {
      ...(data.granularity ? { granularity: data.granularity } : {}),
      ...(data.state ? { state: data.state } : {}),
      ...(data.badge ? { badge: data.badge } : {}),
    },
    ...governanceOf(data, stem, categoryId),
    related: data.related ?? [],
    blocks,
  };

  // Glossary kayıtları — termId = term-<slug(term)>-<stem> (07A §4)
  // longExplanation iki paragraf: kavram (meaning) ¶ gerekçe (why+abbrev) — 12A Done Definition
  const seen = new Set();
  const glossary = terms.map((t) => {
    let tid = `term-${slugify(t.term)}-${stem}`;
    while (seen.has(tid)) tid += "-2";
    seen.add(tid);
    const abbrev = [
      t.abbrev_of ? `Açılımı: ${t.abbrev_of}.` : "",
      t.abbrev_tr ? `Türkçesi: ${t.abbrev_tr}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const rec = {
      id: tid,
      pageId,
      label: t.term,
      shortExplanation: t.meaning ?? "",
      longExplanation: [t.meaning ?? "", [t.why ?? "", abbrev].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join("\n\n"),
    };
    // Overlay iki anahtar düzeyiyle uygulanır (ADR-0005 Revizyon 1):
    // 1) `label@stem` — sayfa-kapsamlı, her kategoride geçerli; bağlamsal varyantların (12A Parti 2)
    //    aynı label altında farklı bağlam açıklaması taşımasını sağlar. Önceliklidir.
    // 2) düz `label` — yalnız Eğitim Yolu (egitim); Parti 1 semantiği değişmeden korunur.
    const scoped = ENRICHMENT.byLabel[`${foldTr(t.term)}@${stem}`];
    const e = scoped ?? (categoryId === "egitim" ? ENRICHMENT.byLabel[foldTr(t.term)] : undefined);
    if (e) {
      if (e.a) rec.realWorldAnalogy = e.a;
      if (e.u?.length) rec.useCases = e.u;
      if (e.l) rec.longExplanation += `\n\n${e.l}`;
      enrichedCount.n += 1;
      if (scoped) enrichedCount.p2 += 1;
    } else if (categoryId === "egitim") {
      enrichmentMisses.add(t.term);
    }
    const sq = SEVEN_QUESTIONS.byTermId[tid];
    if (sq) {
      rec.sevenQuestions = sq;
      sevenCount.n += 1;
    } else {
      sevenMisses.push(tid);
    }
    return rec;
  });

  // Parti 1-B + B-akışı genelleme (12A §3a, 11 Haziran): aynı-page birebir bağlama
  // tüm kategorilerde — bağlam güvencesi page-içi olduğundan kategori sınırı gereksizdi.
  const boundTerms = bindTermsInPage(page, glossary);

  return {
    page,
    glossary,
    boundTerms,
    images: ctx.images,
    oldId: data.id,
    icon: data.icon ?? "ph-file",
    order: data.order ?? 0,
    analojiSeed: Boolean(data.enrich?.lesson?.analoji), // 12A §5.1 parti raporu girdisi
  };
}

function buildNavigation(results) {
  const byCat = new Map(CATEGORIES.map((c) => [c.id, []]));
  for (const r of results) byCat.get(r.page.categoryId)?.push(r);

  const categories = CATEGORIES.map((c) => {
    const pages = byCat.get(c.id) ?? [];
    let groups;
    if (c.id === "urunler") {
      const gmap = new Map(PRODUCT_GROUPS.map((g) => [g.id, []]));
      for (const r of pages) {
        const key = r.page.id.replace(/^page-s-/, "");
        const gid = PRODUCT_GROUP_MAP[key] ?? "diger";
        if (gid === "diger") warnings.push(`urunler grubu eşlenmedi: ${key} -> Diğer`);
        gmap.get(gid).push(r);
      }
      groups = PRODUCT_GROUPS.map((g, gi) => ({
        id: g.id,
        label: g.label,
        order: gi,
        items: sortItems(gmap.get(g.id)),
      })).filter((g) => g.items.length > 0);
    } else if (c.id === "stack") {
      // Taksonomi grupları (03 §2): Stacks / Distributions / Editions + LandX vaka grubu.
      // stack-editions kavram kaydı Editions grubunda yaşar.
      const of = (pred) => sortItems(pages.filter(pred));
      const stacks = of((r) => r.page.id.startsWith("page-stack-") && r.page.id !== "page-stack-editions");
      const dists = of((r) => r.page.id.startsWith("page-dist-"));
      const editions = of(
        (r) => r.page.id.startsWith("page-edition-") || r.page.id === "page-stack-editions",
      );
      const landx = of((r) => r.page.id.startsWith("page-landx-"));
      groups = [
        { id: "stacks", label: "Stacks", order: 0, items: stacks },
        ...(dists.length ? [{ id: "dist", label: "Distributions", order: 1, items: dists }] : []),
        ...(editions.length ? [{ id: "editions", label: "Editions", order: 2, items: editions }] : []),
        ...(landx.length
          ? [{ id: "landx", label: "LandX — sahibinden clone (vaka)", order: 3, items: landx }]
          : []),
      ];
    } else {
      groups = [{ id: "tumu", label: "Tümü", order: 0, items: sortItems(pages, c.id === "egitim") }];
    }
    return {
      id: c.id,
      label: c.label,
      icon: c.icon,
      order: c.order,
      ...(c.section ? { section: c.section } : {}),
      groups,
    };
  })
    .filter((c) => c.groups.some((g) => g.items.length > 0))
    .sort((a, b) => a.order - b.order); // Rail 1 bölümleri bitişik kalsın (03 §1)

  return { schemaVersion: "1.0", categories };
}

function sortItems(results, isEdu = false) {
  const eduOrder = (stem) => {
    if (stem === "edu-overview") return -1;
    if (stem === "edu-faz-haritasi") return -0.5; // Vibecoding × Faz haritası — overview'dan hemen sonra
    const m = stem.match(/edu-u(\d+)/);
    return m ? Number(m[1]) : 999;
  };
  const sorted = [...results].sort((a, b) => {
    if (isEdu) return eduOrder(a.page.id.slice(5)) - eduOrder(b.page.id.slice(5));
    return a.order - b.order || a.page.id.localeCompare(b.page.id, "en");
  });
  return sorted.map((r, i) => ({
    pageId: r.page.id,
    slug: r.page.slug,
    title: r.page.title,
    icon: r.icon,
    order: i,
  }));
}

const TEXT_BLOCKS = new Set([
  "paragraph",
  "callout",
  "definitionList",
  "stepList",
  "checklist",
  "table",
  "list",
  "cardGrid",
  "useCase",
  "caseStudy",
  "codeBlock",
]);

function blockText(b) {
  switch (b.type) {
    case "paragraph":
    case "callout":
      return flattenSegments(b.segments);
    case "definitionList":
      return (b.items ?? []).map((i) => `${i.term}: ${flattenSegments(i.definition)}`).join(" ");
    case "stepList":
      return (b.steps ?? []).map((s) => `${s.title} ${flattenSegments(s.segments)}`).join(" ");
    case "checklist":
      return (b.items ?? []).map((i) => flattenSegments(i.segments)).join(" ");
    case "list":
      return (b.items ?? []).map((i) => flattenSegments(i)).join(" ");
    case "table":
      return [...(b.columns ?? []), ...(b.rows ?? []).flat().map(flattenSegments)].join(" ");
    case "cardGrid":
      return (b.cards ?? []).map((c) => `${c.title} ${flattenSegments(c.segments)}`).join(" ");
    case "useCase":
      return [
        b.title,
        flattenSegments(b.scenario),
        flattenSegments(b.outcome ?? []),
        ...(b.preconditions ?? []),
        b.authorization,
        ...(b.mainFlow ?? []),
        ...(b.alternativeFlows ?? []),
        ...(b.failureFlows ?? []),
        ...(b.invariants ?? []),
        b.audit,
        b.privacy,
        b.slo,
        ...(b.acceptanceTests ?? []),
      ]
        .filter(Boolean)
        .join(" ");
    case "caseStudy":
      return `${b.title} ${flattenSegments(b.story)}`;
    case "codeBlock":
      return `${b.title ?? ""} ${b.code}`;
    default:
      return "";
  }
}

function buildSearchIndex(results, glossary) {
  const docs = [];
  for (const r of results) {
    let lastHeading = r.page.title;
    for (const b of r.page.blocks) {
      if (b.type === "heading") {
        lastHeading = b.text;
        continue;
      }
      if (b.type === "lessonHeader") {
        lastHeading = b.title;
        continue;
      }
      if (!TEXT_BLOCKS.has(b.type)) continue;
      const text = blockText(b).replace(/\s+/g, " ").trim();
      if (!text) continue;
      docs.push({
        id: `search-${r.page.id}-${b.id}`,
        kind: "block",
        pageId: r.page.id,
        pageTitle: r.page.title,
        slug: r.page.slug,
        blockId: b.id,
        blockType: b.type,
        title: lastHeading,
        text: text.slice(0, 800),
      });
    }
  }
  for (const t of glossary) {
    const page = results.find((r) => r.page.id === t.pageId);
    docs.push({
      id: `search-term-${t.id}`,
      kind: "term",
      pageId: t.pageId,
      pageTitle: page?.page.title ?? "",
      slug: page?.page.slug ?? "",
      blockId: "",
      blockType: "term",
      title: t.label,
      text: `${t.label} ${t.shortExplanation} ${t.longExplanation}`.slice(0, 800),
    });
  }
  return { schemaVersion: "1.0", documents: docs };
}

// ---- main ----
if (!existsSync(SRC_DIR)) {
  console.error(`content-source/ bulunamadı: ${SRC_DIR}`);
  process.exit(1);
}
const clusters = readClusters();
const results = [];
const skipped = [];
for (const c of clusters) {
  if (!categoryOf(c.stem)) {
    skipped.push(c.file);
    warnings.push(`kategori çözülemedi, atlandı: ${c.file}`);
    continue;
  }
  results.push(transformCluster(c));
}
// related: eski id VEYA stem → pageId çözümü (kaynak veri eski cluster id kullanır)
const byKey = new Map();
for (const r of results) {
  byKey.set(r.page.id.slice(5), r.page.id); // stem
  byKey.set(r.page.sourceId, r.page.id); // eski id
}
for (const r of results) {
  r.page.related = (r.page.related ?? [])
    .map((x) => {
      const pid = byKey.get(x);
      if (!pid) warnings.push(`${r.page.id}: çözülemeyen related '${x}'`);
      return pid;
    })
    .filter(Boolean);
}
// Aday kayıtlardan geri bağlar (türetilmiş katman — kaynak dosyalara dokunulmaz, 02 §1 dokunulmazlığı):
// aday bir sayfa özgün bir sayfayı related ile gösteriyorsa, hedef sayfanın üretilmiş related listesine
// aday sayfa eklenir; çift yönlü gezinme katalog kayıtlarını keşfedilebilir kılar (03 §2 Edition notu).
const byId = new Map(results.map((r) => [r.page.id, r]));
for (const r of results) {
  const isBacklinkSource =
    r.page.meta?.state === "aday" || ["KARAR", "TASARIM", "KAVRAM"].includes(r.page.meta?.badge);
  if (!isBacklinkSource) continue;
  for (const targetId of r.page.related) {
    const target = byId.get(targetId);
    if (target && !target.page.related.includes(r.page.id)) target.page.related.push(r.page.id);
  }
}
const glossary = results.flatMap((r) => r.glossary);
const navigation = buildNavigation(results);
const searchIndex = buildSearchIndex(results, glossary);
// Kayıp varlık = public/assets'te karşılığı olmayan src (07B §1; üretim: tools/assets/generate.mjs)
const missingAssets = [...new Set(results.flatMap((r) => r.images))].filter(
  (src) => !existsSync(join(ROOT, "public", src)),
);

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OUT_DIR, "pages"), { recursive: true });
const HEADER_KEY = "__generated";
const write = (name, obj) =>
  writeFileSync(
    join(OUT_DIR, name),
    JSON.stringify({ [HEADER_KEY]: "tools/migrate — elle düzenleme yasak (04 §1)", ...obj }, null, 1),
  );
write("navigation.json", navigation);
// Performans bütçesi (14 #15): page gövdeleri ayrı lazy chunk'lar, metadata küçük eager index
write("pages-index.json", {
  schemaVersion: "1.0",
  pages: results.map((r) => ({
    id: r.page.id,
    sourceId: r.page.sourceId,
    slug: r.page.slug,
    title: r.page.title,
    summary: r.page.summary,
    categoryId: r.page.categoryId,
    meta: r.page.meta,
    related: r.page.related,
  })),
});
for (const r of results) {
  write(join("pages", `${r.page.id.slice(5)}.json`), { schemaVersion: "1.0", page: r.page });
}
// Glossary bölünmesi (14 #15): tooltip/chip için core eager; panel içeriği lazy detail
write("glossary.json", {
  schemaVersion: "1.0",
  terms: glossary.map((t) => ({
    id: t.id,
    pageId: t.pageId,
    label: t.label,
    shortExplanation: t.shortExplanation,
  })),
});
write("glossary-detail.json", {
  schemaVersion: "1.0",
  details: Object.fromEntries(
    glossary.map((t) => [
      t.id,
      {
        longExplanation: t.longExplanation,
        ...(t.realWorldAnalogy ? { realWorldAnalogy: t.realWorldAnalogy } : {}),
        ...(t.useCases ? { useCases: t.useCases } : {}),
        ...(t.caseStudies ? { caseStudies: t.caseStudies } : {}),
        ...(t.sevenQuestions ? { sevenQuestions: t.sevenQuestions } : {}),
      },
    ]),
  ),
});
write("search-index.json", searchIndex);

// Mutabakat raporu (07 + 12A §5)
const catCount = {};
for (const r of results) catCount[r.page.categoryId] = (catCount[r.page.categoryId] ?? 0) + 1;
const report = [
  "# Migration Mutabakat Raporu",
  "",
  `Kaynak dosya: ${clusters.length} (+${SKIP.size} kapsam dışı) | Üretilen page: ${results.length} | Atlanan: ${skipped.length}`,
  `Glossary kaydı: ${glossary.length} | Search document: ${searchIndex.documents.length}`,
  "",
  "## Kategori dağılımı",
  ...Object.entries(catCount)
    .sort()
    .map(([k, v]) => `- ${k}: ${v}`),
  "",
  `## Kayıp görsel varlıklar (${missingAssets.length}) — 07B §1 fallback aktif`,
  ...missingAssets.slice(0, 100).map((s) => `- ${s}`),
  "",
  "## Glossary zenginleştirme (12A Parti 1 — Eğitim Yolu)",
  `Zenginleştirilen kayıt: ${enrichedCount.n} (sayfa-kapsamlı: ${enrichedCount.p2}) | Overlay'de karşılığı olmayan label: ${enrichmentMisses.size}`,
  `Segment bağlama (B akışı, tüm kategoriler): ${results.reduce((a, r) => a + (r.boundTerms ?? 0), 0)} bağlı terim | bağlı page: ${results.filter((r) => (r.boundTerms ?? 0) > 0).length}/${results.length} | egitim: ${results.filter((r) => r.page.categoryId === "egitim" && (r.boundTerms ?? 0) > 0).length}/${results.filter((r) => r.page.categoryId === "egitim").length}`,
  ...[...enrichmentMisses].map((l) => `- eşleşmedi: ${l}`),
  "",
  "## Yedi Soru genellemesi (12A §6 — tüm terimler)",
  `Yedi soru kaydı: ${sevenCount.n}/${sevenCount.n + sevenMisses.length} | Eksik: ${sevenMisses.length}`,
  ...sevenMisses.map((l) => `- yedi soru eksik: ${l}`),
  "",
  `## Uyarılar (${warnings.length})`,
  ...[...new Set(warnings)].map((w) => `- ${w}`),
  "",
  `## Bilinçli düşürmeler / Notlar (${notes.length}) — kapı değildir (15 §1.4)`,
  ...[...new Set(notes)].map((w) => `- ${w}`),
].join("\n");
writeFileSync(join(ROOT, "tools", "migrate", "report.md"), report);

// 12A §5.1: parti listeleri — editöryel iş bu rapordan ilerler, elle envanter tutulmaz.
// Parti eşlemesi 12A §3 tablosundan; Parti 2 (bağlamsal varyantlar) kategori değil
// label-çokluğu kümesidir ve ayrı listelenir (kayıtlar kendi kategorilerinin partisinde de görünür).
const PARTI_OF = {
  egitim: 1,
  genel: 3,
  kernel: 3,
  scale: 3,
  crosscut: 4,
  sus: 4,
  layer1: 5,
  stack: 5,
  dx: 5,
  build: 5,
  frontend: 5,
  landx: 5,
  urunler: 6,
};
const labelPages = new Map();
for (const r of results)
  for (const t of r.glossary) {
    if (!labelPages.has(t.label)) labelPages.set(t.label, new Set());
    labelPages.get(t.label).add(r.page.id);
  }
const partiLines = { 1: [], 3: [], 4: [], 5: [], 6: [] };
const variantLines = [];
for (const r of results) {
  const parti = PARTI_OF[r.page.categoryId];
  for (const t of r.glossary) {
    const ince = (t.longExplanation ?? "").length < 160 ? " · **ince why**" : "";
    const seed = r.analojiSeed ? " · analoji tohumu var" : "";
    const line = `- ${t.label} (${r.page.id})${ince}${seed}`;
    if (parti) partiLines[parti].push(line);
    if (labelPages.get(t.label).size > 1) variantLines.push(line);
  }
}
const partiReport = [
  "# 12A §5.1 — Parti Listeleri (editöryel iş kuyruğu)",
  "",
  'Üretici: tools/migrate (otomatik). "ince why" = longExplanation < 160 karakter — A akışı önceliği.',
  ...[1, 3, 4, 5, 6].flatMap((n) => ["", `## Parti ${n} (${partiLines[n].length} kayıt)`, ...partiLines[n]]),
  "",
  `## Parti 2 — Bağlamsal varyantlar (${variantLines.length} kayıt, ${[...labelPages.values()].filter((s) => s.size > 1).length > 0 ? [...labelPages.entries()].filter(([, v]) => v.size > 1).length : 0} label)`,
  ...variantLines,
].join("\n");
writeFileSync(join(ROOT, "tools", "migrate", "parti-report.md"), partiReport);
console.log(
  `OK: ${results.length} page, ${glossary.length} term, ${searchIndex.documents.length} search doc, ${warnings.length} uyarı, ${notes.length} not`,
);
