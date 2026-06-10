// Inline segment parser — 07A §3 (paragraph), 07B §1-2 (link, ref)
// Markdown runtime'a taşınmaz; tüm parse build-time'dadır.

const TR_MAP = { ı: "i", İ: "i", I: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g", ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c" };

export function slugify(s) {
  return String(s)
    .replace(/[ıİIşŞğĞüÜöÖçÇ]/g, (c) => TR_MAP[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "x";
}

// **bold** | `code` | [text](url) | {{ref:stem}} → segment dizisi
const INLINE_RE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\{\{ref:([a-z0-9-]+)\}\}/g;

export function parseInline(text) {
  const out = [];
  if (typeof text !== "string" || text.length === 0) return out;
  let last = 0;
  let m;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "strong", text: m[1] });
    else if (m[2] !== undefined) out.push({ type: "code", text: m[2] });
    else if (m[3] !== undefined) out.push({ type: "link", text: m[3], href: m[4] });
    else if (m[5] !== undefined) out.push({ type: "ref", text: m[5], refId: m[5] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out.length ? out : [{ type: "text", text }];
}

// 13A fold'unun build-time karşılığı — enrichment anahtarı eşlemesi için
export function foldTr(s) {
  return String(s).replace(/[İIı]/g, "i").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function flattenSegments(segments) {
  return (segments ?? []).map((s) => s.text ?? "").join("");
}
