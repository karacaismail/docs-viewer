// enrich.detail / enrich.info serbest metin parser'ı — 07A §4 + 07B §1
// Desenler: paragraf (\n\n), code fence, md tablo, md heading, 1. liste, - liste

import { parseInline } from "./inline.mjs";

const LANG_NORM = {
  sh: "bash",
  shell: "bash",
  js: "javascript",
  ts: "typescript",
  jsonc: "json",
  openfga: "text",
  txt: "text",
  "": "text",
};
const KNOWN_LANGS = new Set([
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
]);

export function normalizeLang(lang, warn) {
  const l = LANG_NORM[String(lang ?? "").toLowerCase()] ?? String(lang ?? "").toLowerCase();
  if (KNOWN_LANGS.has(l)) return l;
  warn?.(`bilinmeyen code dili '${lang}' -> text`);
  return "text";
}

function parseMdTable(lines, nextId) {
  const cells = (line) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
  const headers = cells(lines[0]);
  const rows = [];
  for (const line of lines.slice(1)) {
    if (/^\|?[\s:|-]+\|?$/.test(line)) continue; // ayraç satırı
    rows.push(cells(line).map((c) => parseInline(c)));
  }
  return { id: nextId("table"), type: "table", columns: headers, rows };
}

// Düz metin parçasını (fence dışı) blok listesine çevirir
function textChunkToBlocks(chunk, nextId, warn) {
  const blocks = [];
  const lines = chunk.split("\n");
  let i = 0;
  const paraBuf = [];
  const flushPara = () => {
    const t = paraBuf.join("\n").trim();
    paraBuf.length = 0;
    if (t) blocks.push({ id: nextId("p"), type: "paragraph", segments: parseInline(t) });
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      flushPara();
      const level = Math.min(Math.max(line.match(/^#+/)[0].length, 2), 4);
      blocks.push({ id: nextId("h"), type: "heading", level, text: line.replace(/^#+\s*/, "") });
      i += 1;
    } else if (/^\|.*\|\s*$/.test(line)) {
      flushPara();
      const tbl = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        tbl.push(lines[i]);
        i += 1;
      }
      blocks.push(parseMdTable(tbl, nextId));
    } else if (/^\d+\.\s/.test(line)) {
      flushPara();
      const steps = [];
      while (
        i < lines.length &&
        (/^\d+\.\s/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && steps.length))
      ) {
        if (/^\d+\.\s/.test(lines[i])) steps.push(lines[i].replace(/^\d+\.\s*/, ""));
        else steps[steps.length - 1] += ` ${lines[i].trim()}`; // girintili devam → düzleştir (07B §1)
        i += 1;
      }
      blocks.push({
        id: nextId("steps"),
        type: "stepList",
        steps: steps.map((s) => ({ title: "", segments: parseInline(s) })),
      });
    } else if (/^[-*]\s/.test(line)) {
      flushPara();
      const items = [];
      while (i < lines.length && (/^[-*]\s/.test(lines[i]) || /^\s{2,}[-*\S]/.test(lines[i]))) {
        if (/^[-*]\s/.test(lines[i])) items.push(lines[i].replace(/^[-*]\s*/, ""));
        else if (items.length) {
          items[items.length - 1] += ` — ${lines[i].trim().replace(/^[-*]\s*/, "")}`;
          warn?.("girintili liste düzleştirildi");
        }
        i += 1;
      }
      blocks.push({
        id: nextId("list"),
        type: "list",
        ordered: false,
        items: items.map((s) => parseInline(s)),
      });
    } else if (line.trim() === "") {
      flushPara();
      i += 1;
    } else {
      paraBuf.push(line);
      i += 1;
    }
  }
  flushPara();
  return blocks;
}

const FENCE_RE = /```(\w*)\n([\s\S]*?)```/g;

export function detailToBlocks(text, nextId, warn) {
  if (typeof text !== "string" || !text.trim()) return [];
  const blocks = [];
  let last = 0;
  FENCE_RE.lastIndex = 0;
  for (;;) {
    const m = FENCE_RE.exec(text);
    if (m === null) break;
    if (m.index > last) blocks.push(...textChunkToBlocks(text.slice(last, m.index), nextId, warn));
    blocks.push({
      id: nextId("code"),
      type: "codeBlock",
      language: normalizeLang(m[1], warn),
      code: m[2].replace(/\n$/, ""),
    });
    last = m.index + m[0].length;
  }
  if (last < text.length) blocks.push(...textChunkToBlocks(text.slice(last), nextId, warn));
  return blocks;
}
