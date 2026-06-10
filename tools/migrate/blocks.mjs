// Eski 21 block type → yeni model — 07A §3 eşleme tablosu birebir

import { detailToBlocks, normalizeLang } from "./detail.mjs";
import { parseInline, slugify } from "./inline.mjs";

const CALLOUT_VARIANTS = new Set(["info", "tip", "warning", "danger", "tr"]);
const LESSON_LABELS = {
  ne: "Ne?",
  nicin: "Niçin?",
  nasil: "Nasıl?",
  nerede: "Nerede?",
  ne_zaman: "Ne zaman?",
  kim: "Kim?",
  analoji: "Analoji",
  frontend: "Frontend açısı",
  backend: "Backend açısı",
};

function treeToAscii(node, prefix = "", isLast = true, isRoot = true) {
  const lines = [];
  const label = node.name + (node.comment ? `   # ${node.comment}` : "");
  if (isRoot) lines.push(label);
  else lines.push(prefix + (isLast ? "└─ " : "├─ ") + label);
  const kids = node.children ?? [];
  kids.forEach((k, i) => {
    const childPrefix = isRoot ? "" : prefix + (isLast ? "   " : "│  ");
    lines.push(...treeToAscii(k, childPrefix, i === kids.length - 1, false));
  });
  return lines;
}

export function createTransformer(ctx) {
  const { nextId, warn, collectTerms } = ctx;

  // Block-level enrich → bitişik block'lara açılır (07A §3 son satır)
  function expandEnrich(enrich) {
    const out = [];
    if (!enrich || typeof enrich !== "object") return out;
    if (enrich.info)
      out.push({
        id: nextId("note"),
        type: "callout",
        variant: "info",
        title: "Not",
        segments: parseInline(enrich.info),
      });
    if (enrich.detail) out.push(...detailToBlocks(enrich.detail, nextId, warn));
    if (enrich.lesson) out.push(lessonToBlock(enrich.lesson));
    for (const s of enrich.stories ?? []) out.push(storyToUseCase(s));
    if (enrich.terms) collectTerms(enrich.terms);
    return out;
  }

  function lessonToBlock(lesson) {
    const items = Object.entries(lesson)
      .filter(([k, v]) => LESSON_LABELS[k] && typeof v === "string" && v.trim())
      .map(([k, v]) => ({ term: LESSON_LABELS[k], definition: parseInline(v) }));
    return { id: nextId("lesson"), type: "definitionList", items };
  }

  function storyToUseCase(s) {
    return {
      id: nextId("story"),
      type: "useCase",
      title: s.persona ?? "",
      scenario: parseInline(s.context ?? ""),
      outcome: s.outcome ? parseInline(s.outcome) : undefined,
    };
  }

  function transformBlock(b) {
    const out = [];
    const push = (blk) => out.push(blk);
    switch (b.type) {
      case "heading":
        push({
          id: nextId(`h-${slugify(b.text ?? "h")}`),
          type: "heading",
          level: Math.min(Math.max(b.level ?? 2, 2), 4),
          text: b.text ?? "",
        });
        break;
      case "paragraph":
        push({ id: nextId("p"), type: "paragraph", segments: parseInline(b.text ?? "") });
        break;
      case "callout": {
        const variant =
          b.variant === "critical" ? "danger" : CALLOUT_VARIANTS.has(b.variant) ? b.variant : "info";
        push({
          id: nextId("co"),
          type: "callout",
          variant,
          title: b.label ?? undefined,
          segments: parseInline(b.body ?? ""),
        });
        break;
      }
      case "table": {
        if (b.filterable || b.stateColumn) warn("table özelliği düşürüldü: filterable/stateColumn");
        // Hücre string veya obje ({text, state?, enrich?}) olabilir — 07A tablosunun eksiği, burada kapatıldı
        const cellToSegments = (c) => {
          if (typeof c === "string") return parseInline(c);
          if (c && typeof c === "object") {
            if (c.enrich?.terms) collectTerms(c.enrich.terms);
            const txt = c.text ?? "";
            return c.state ? parseInline(`${txt} (${c.state})`) : parseInline(txt);
          }
          return parseInline(String(c ?? ""));
        };
        push({
          id: nextId("table"),
          type: "table",
          caption: b.caption ?? undefined,
          columns: b.headers ?? [],
          rows: (b.rows ?? []).map((r) => r.map(cellToSegments)),
        });
        break;
      }
      case "image":
        push({
          id: nextId("img"),
          type: "image",
          src: b.src ?? "",
          alt: b.alt ?? "",
          caption: b.caption ?? undefined,
        });
        ctx.images.push(b.src ?? "");
        break;
      case "code":
        push({
          id: nextId("code"),
          type: "codeBlock",
          title: b.title ?? undefined,
          language: normalizeLang(b.lang, warn),
          code: b.content ?? "",
        });
        break;
      case "list":
        push({
          id: nextId("list"),
          type: "list",
          ordered: !!b.ordered,
          items: (b.items ?? []).map((it) => parseInline(typeof it === "string" ? it : (it?.text ?? ""))),
        });
        break;
      case "kv-row":
        push({
          id: nextId("kv"),
          type: "definitionList",
          items: (b.pairs ?? []).map((p) => ({ term: p.key ?? "", definition: parseInline(p.value ?? "") })),
        });
        break;
      case "feature-list":
        push({
          id: nextId("feat"),
          type: "definitionList",
          items: (b.items ?? []).map((it) => ({
            term: it.name ?? "",
            definition: it.critical
              ? [{ type: "strong", text: "Kritik. " }, ...parseInline(it.desc ?? "")]
              : parseInline(it.desc ?? ""),
          })),
        });
        for (const it of b.items ?? []) if (it.enrich?.terms) collectTerms(it.enrich.terms);
        break;
      case "divider":
        push({ id: nextId("div"), type: "divider" });
        break;
      case "checklist":
        push({
          id: nextId("chk"),
          type: "checklist",
          title: b.title ?? undefined,
          items: (b.items ?? []).map((it) => ({
            segments: parseInline(it.hint ? `${it.label} — ${it.hint}` : (it.label ?? "")),
          })),
        });
        if (b.storageKey) warn("checklist.storageKey ilk kapsam dışı (07A §3)");
        break;
      case "lesson-header":
        push({
          id: nextId("lh"),
          type: "lessonHeader",
          unit: b.unit ?? "",
          title: b.title ?? "",
          level: b.level ?? "",
          durationMin: b.duration_min ?? 0,
          prereq: b.prereq ?? [],
          goals: b.goals ?? [],
        });
        break;
      case "terms":
        collectTerms(b.terms ?? []); // block render edilmez; glossary'ye gider (07A §3)
        break;
      case "steps":
        if (b.title) push({ id: nextId(`h-${slugify(b.title)}`), type: "heading", level: 3, text: b.title });
        push({
          id: nextId("steps"),
          type: "stepList",
          steps: (b.items ?? []).map((it) => ({
            title: it.title ?? "",
            segments: parseInline(it.body ?? ""),
          })),
        });
        break;
      case "grid":
        push({
          id: nextId("grid"),
          type: "cardGrid",
          columns: b.columns ?? undefined,
          cards: (b.items ?? []).map((it) => ({
            icon: it.icon ?? undefined,
            title: it.title ?? "",
            tone: it.tone ?? undefined,
            segments: parseInline(it.body ?? ""),
          })),
        });
        break;
      case "examples":
        for (const it of b.items ?? []) {
          push({
            id: nextId("uc"),
            type: "useCase",
            title: it.label ?? "",
            scenario: parseInline(it.text ?? ""),
          });
        }
        break;
      case "user-stories":
        if (b.title) push({ id: nextId(`h-${slugify(b.title)}`), type: "heading", level: 3, text: b.title });
        for (const s of b.stories ?? []) push(storyToUseCase(s));
        break;
      case "ref-grid":
        push({
          id: nextId("refs"),
          type: "cardGrid",
          cards: (b.refs ?? []).map((r) => ({ title: r, segments: [{ type: "ref", text: r, refId: r }] })),
        });
        break;
      case "layer-cards":
        push({
          id: nextId("layers"),
          type: "cardGrid",
          cards: (b.cards ?? []).map((c) => ({
            title: c.tag ? `${c.tag} — ${c.name ?? ""}` : (c.name ?? ""),
            tone: c.tone ?? undefined,
            segments: parseInline(c.desc ?? ""),
          })),
        });
        for (const c of b.cards ?? []) if (c.enrich?.terms) collectTerms(c.enrich.terms);
        break;
      case "tree":
        push({
          id: nextId("tree"),
          type: "codeBlock",
          title: b.title ?? undefined,
          language: "text",
          code: b.root ? treeToAscii(b.root).join("\n") : "",
        });
        break;
      case "granularity-legend":
        push({
          id: nextId("legend"),
          type: "callout",
          variant: "info",
          title: b.title ?? "Gösterge",
          segments: [],
        });
        warn("granularity-legend elle dönüşüm bekliyor (07A §3)");
        break;
      default:
        // 07 edge-case kuralı: sessizce düşürme — düz metne indir + uyar
        warn(`bilinmeyen eski block type '${b.type}' — paragraph fallback`);
        push({
          id: nextId("p"),
          type: "paragraph",
          segments: [{ type: "text", text: JSON.stringify(b).slice(0, 200) }],
        });
    }
    // block-level enrich genişlemesi (deterministik sıra: block'un hemen ardı)
    out.push(...expandEnrich(b.enrich));
    return out;
  }

  return { transformBlock, expandEnrich, lessonToBlock, storyToUseCase };
}
