// Migration orkestrasyonu — 07: oku -> dönüştür -> doğrula -> yaz + mutabakat raporu
// Deterministik: aynı girdi her zaman aynı çıktı (03 §4).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, PREFIX_TO_CATEGORY, STEM_OVERRIDES, PRODUCT_GROUPS, PRODUCT_GROUP_MAP } from "./categories.mjs";
import { parseInline, slugify, flattenSegments } from "./inline.mjs";
import { detailToBlocks } from "./detail.mjs";
import { createTransformer } from "./blocks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC_DIR = join(ROOT, "content-source");
const OUT_DIR = join(ROOT, "src", "data");
const SKIP = new Set(["ARCHITECTURE-5.json"]); // 07A §5: spec, içerik değil

const warnings = [];
const fileWarn = (file) => (msg) => warnings.push(`${file}: ${msg}`);

function readClusters() {
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".json") && !SKIP.has(f)).sort();
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

function transformCluster({ file, stem, data }) {
  const warn = fileWarn(file);
  const counters = {};
  const usedIds = new Set();
  const nextId = (hint) => {
    counters[hint] = (counters[hint] ?? 0) + 1;
    let id = `block-${stem}-${hint}${counters[hint] > 1 ? "-" + counters[hint] : ""}`;
    while (usedIds.has(id)) id += "x";
    usedIds.add(id);
    return id;
  };
  const terms = [];
  const collectTerms = (list) => { for (const t of list ?? []) if (t && t.term) terms.push(t); };
  const ctx = { nextId, warn, collectTerms, images: [] };
  const tr = createTransformer(ctx);

  const blocks = [];
  // enrich.info → giriş callout (07A §4)
  if (data.enrich?.info) {
    blocks.push({ id: nextId("ozet"), type: "callout", variant: "info", title: "Özet", segments: parseInline(data.enrich.info) });
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
    related: data.related ?? [],
    blocks,
  };

  // Glossary kayıtları — termId = term-<slug(term)>-<stem> (07A §4)
  const seen = new Set();
  const glossary = terms.map((t) => {
    let tid = `term-${slugify(t.term)}-${stem}`;
    while (seen.has(tid)) tid += "-2";
    seen.add(tid);
    const abbrev = [
      t.abbrev_of ? `Açılımı: ${t.abbrev_of}.` : "",
      t.abbrev_tr ? `Türkçesi: ${t.abbrev_tr}.` : "",
    ].filter(Boolean).join(" ");
    return {
      id: tid, pageId, label: t.term,
      shortExplanation: t.meaning ?? "",
      longExplanation: [t.why ?? "", abbrev].filter(Boolean).join(" "),
    };
  });

  return { page, glossary, images: ctx.images, oldId: data.id, icon: data.icon ?? "ph-file", order: data.order ?? 0 };
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
        id: g.id, label: g.label, order: gi,
        items: sortItems(gmap.get(g.id)),
      })).filter((g) => g.items.length > 0);
    } else {
      groups = [{ id: "tumu", label: "Tümü", order: 0, items: sortItems(pages, c.id === "egitim") }];
    }
    return { id: c.id, label: c.label, icon: c.icon, order: c.order, groups };
  }).filter((c) => c.groups.some((g) => g.items.length > 0));

  return { schemaVersion: "1.0", categories };
}

function sortItems(results, isEdu = false) {
  const eduOrder = (stem) => {
    if (stem === "edu-overview") return -1;
    const m = stem.match(/edu-u(\d+)/);
    return m ? Number(m[1]) : 999;
  };
  const sorted = [...results].sort((a, b) => {
    if (isEdu) return eduOrder(a.page.id.slice(5)) - eduOrder(b.page.id.slice(5));
    return (a.order - b.order) || a.page.id.localeCompare(b.page.id, "en");
  });
  return sorted.map((r, i) => ({
    pageId: r.page.id, slug: r.page.slug, title: r.page.title, icon: r.icon, order: i,
  }));
}

const TEXT_BLOCKS = new Set(["paragraph", "callout", "definitionList", "stepList", "checklist", "table", "list", "cardGrid", "useCase", "caseStudy", "codeBlock"]);

function blockText(b) {
  switch (b.type) {
    case "paragraph": case "callout": return flattenSegments(b.segments);
    case "definitionList": return (b.items ?? []).map((i) => `${i.term}: ${flattenSegments(i.definition)}`).join(" ");
    case "stepList": return (b.steps ?? []).map((s) => `${s.title} ${flattenSegments(s.segments)}`).join(" ");
    case "checklist": return (b.items ?? []).map((i) => flattenSegments(i.segments)).join(" ");
    case "list": return (b.items ?? []).map((i) => flattenSegments(i)).join(" ");
    case "table": return [...(b.columns ?? []), ...(b.rows ?? []).flat().map(flattenSegments)].join(" ");
    case "cardGrid": return (b.cards ?? []).map((c) => `${c.title} ${flattenSegments(c.segments)}`).join(" ");
    case "useCase": return `${b.title} ${flattenSegments(b.scenario)} ${flattenSegments(b.outcome ?? [])}`;
    case "caseStudy": return `${b.title} ${flattenSegments(b.story)}`;
    case "codeBlock": return `${b.title ?? ""} ${b.code}`;
    default: return "";
  }
}

function buildSearchIndex(results, glossary) {
  const docs = [];
  for (const r of results) {
    let lastHeading = r.page.title;
    for (const b of r.page.blocks) {
      if (b.type === "heading") { lastHeading = b.text; continue; }
      if (b.type === "lessonHeader") { lastHeading = b.title; continue; }
      if (!TEXT_BLOCKS.has(b.type)) continue;
      const text = blockText(b).replace(/\s+/g, " ").trim();
      if (!text) continue;
      docs.push({
        id: `search-${r.page.id}-${b.id}`, kind: "block",
        pageId: r.page.id, pageTitle: r.page.title, slug: r.page.slug,
        blockId: b.id, blockType: b.type, title: lastHeading, text: text.slice(0, 800),
      });
    }
  }
  for (const t of glossary) {
    const page = results.find((r) => r.page.id === t.pageId);
    docs.push({
      id: `search-term-${t.id}`, kind: "term",
      pageId: t.pageId, pageTitle: page?.page.title ?? "", slug: page?.page.slug ?? "",
      blockId: "", blockType: "term", title: t.label,
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
  if (!categoryOf(c.stem)) { skipped.push(c.file); warnings.push(`kategori çözülemedi, atlandı: ${c.file}`); continue; }
  results.push(transformCluster(c));
}
// related: eski id VEYA stem → pageId çözümü (kaynak veri eski cluster id kullanır)
const byKey = new Map();
for (const r of results) {
  byKey.set(r.page.id.slice(5), r.page.id); // stem
  byKey.set(r.page.sourceId, r.page.id);    // eski id
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
const glossary = results.flatMap((r) => r.glossary);
const navigation = buildNavigation(results);
const searchIndex = buildSearchIndex(results, glossary);
const missingAssets = [...new Set(results.flatMap((r) => r.images))];

mkdirSync(OUT_DIR, { recursive: true });
const HEADER_KEY = "__generated";
const write = (name, obj) =>
  writeFileSync(join(OUT_DIR, name), JSON.stringify({ [HEADER_KEY]: "tools/migrate — elle düzenleme yasak (04 §1)", ...obj }, null, 1));
write("navigation.json", navigation);
write("pages.json", { schemaVersion: "1.0", pages: results.map((r) => r.page) });
write("glossary.json", { schemaVersion: "1.0", terms: glossary });
write("search-index.json", searchIndex);

// Mutabakat raporu (07 + 12A §5)
const catCount = {};
for (const r of results) catCount[r.page.categoryId] = (catCount[r.page.categoryId] ?? 0) + 1;
const report = [
  "# Migration Mutabakat Raporu", "",
  `Kaynak dosya: ${clusters.length} (+${SKIP.size} kapsam dışı) | Üretilen page: ${results.length} | Atlanan: ${skipped.length}`,
  `Glossary kaydı: ${glossary.length} | Search document: ${searchIndex.documents.length}`,
  "", "## Kategori dağılımı",
  ...Object.entries(catCount).sort().map(([k, v]) => `- ${k}: ${v}`),
  "", `## Kayıp görsel varlıklar (${missingAssets.length}) — 07B §1 fallback aktif`,
  ...missingAssets.slice(0, 100).map((s) => `- ${s}`),
  "", `## Uyarılar (${warnings.length})`,
  ...[...new Set(warnings)].map((w) => `- ${w}`),
].join("\n");
writeFileSync(join(ROOT, "tools", "migrate", "report.md"), report);
console.log(`OK: ${results.length} page, ${glossary.length} term, ${searchIndex.documents.length} search doc, ${warnings.length} uyarı`);
