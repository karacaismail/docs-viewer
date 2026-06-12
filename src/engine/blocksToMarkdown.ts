// Sayfa içeriğini ('İlgili sayfalar' öncesi: başlık + özet + blocks) Markdown'a çevirir.
// Saf fonksiyon — UI'sız (08 §engine sınırı); export butonu ContentArea'dan çağırır.
import type { Block, Segment } from "../schemas";
import { resolveRef } from "./resolvePage";

function escCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function segsToMd(segments: Segment[], base: string): string {
  return segments
    .map((s) => {
      switch (s.type) {
        case "strong":
          return `**${s.text}**`;
        case "code":
          return `\`${s.text}\``;
        case "link":
          return `[${s.text}](${s.href})`;
        case "ref": {
          const r = resolveRef(s.refId);
          return r ? `[${s.text}](${base}docs/${r.slug})` : s.text;
        }
        default:
          return s.text; // text + term (terim düz metin olarak iner)
      }
    })
    .join("");
}

function blockToMd(b: Block, base: string): string {
  switch (b.type) {
    case "heading":
      return `${"#".repeat(b.level)} ${b.text}`;
    case "paragraph":
      return segsToMd(b.segments, base);
    case "callout": {
      const label = b.title ?? b.variant.toUpperCase();
      return segsToMd(b.segments, base)
        .split("\n")
        .map((l, i) => (i === 0 ? `> **${label}:** ${l}` : `> ${l}`))
        .join("\n");
    }
    case "definitionList":
      return b.items.map((it) => `- **${it.term}** — ${segsToMd(it.definition, base)}`).join("\n");
    case "stepList":
      return b.steps
        .map((s, i) => `${i + 1}. ${s.title ? `**${s.title}:** ` : ""}${segsToMd(s.segments, base)}`)
        .join("\n");
    case "checklist":
      return [b.title ? `**${b.title}**` : "", ...b.items.map((it) => `- [ ] ${segsToMd(it.segments, base)}`)]
        .filter(Boolean)
        .join("\n");
    case "table":
    case "comparisonTable": {
      const head = `| ${b.columns.map(escCell).join(" | ")} |`;
      const sep = `| ${b.columns.map(() => "---").join(" | ")} |`;
      const rows = b.rows.map((r) => `| ${r.map((c) => escCell(segsToMd(c, base))).join(" | ")} |`);
      return [b.caption ? `**${b.caption}**` : "", head, sep, ...rows].filter(Boolean).join("\n");
    }
    case "codeBlock":
      return [b.title ? `**${b.title}**` : "", `\`\`\`${b.language}`, b.code, "```"]
        .filter(Boolean)
        .join("\n");
    case "cardGrid":
      return b.cards.map((c) => `- **${c.title}** — ${segsToMd(c.segments, base)}`).join("\n");
    case "useCase":
      return [
        `> **${b.title}**`,
        `> ${segsToMd(b.scenario, base)}`,
        b.outcome ? `> → ${segsToMd(b.outcome, base)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "caseStudy":
      return `> **${b.title}**\n> ${segsToMd(b.story, base)}`;
    case "divider":
      return "---";
    case "image":
      return [
        `![${b.alt}](${b.src.startsWith("/") ? base + b.src.slice(1) : b.src})`,
        b.caption ? `*${b.caption}*` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "list":
      return b.items.map((segs, i) => `${b.ordered ? `${i + 1}.` : "-"} ${segsToMd(segs, base)}`).join("\n");
    case "lessonHeader":
      return [
        `**Ünite ${b.unit} — ${b.title}**`,
        `*${b.durationMin} dk · Seviye: ${b.level} · Ön-koşul: ${b.prereq.join(", ") || "—"}*`,
        ...b.goals.map((g) => `- ${g}`),
      ].join("\n");
    case "wbsChart":
      return `> ${b.title ? `**${b.title}** — ` : ""}Etkileşimli WBS ağacı sitede görüntülenir.`;
    default:
      return "";
  }
}

/** 'İlgili sayfalar' öncesi içerik → Markdown. base: site kökü (BASE_URL dahil, / ile biter). */
export function pageToMarkdown(
  entry: { title: string; summary?: string; slug: string },
  blocks: Block[],
  base: string,
): string {
  const parts = [
    `# ${entry.title}`,
    entry.summary ? `> ${entry.summary}` : "",
    ...blocks.map((b) => blockToMd(b, base)),
    "---",
    `Kaynak: ${base}docs/${entry.slug}`,
  ];
  return `${parts.filter(Boolean).join("\n\n")}\n`;
}
