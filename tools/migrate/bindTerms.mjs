// 12A §2-B — Parti 1-B: term segment bağlama.
// Daraltılmış otomasyon kapsamı (12A §3a sapma kaydı): yalnız AYNI page'in kendi
// glossary kayıtları, yalnız paragraph block'ları, birebir kelime eşleşmesi,
// page başına terim başına İLK geçiş. Cross-page / fuzzy bağlama yasak kalır.
import { foldTr } from "./inline.mjs";

const ALNUM = /[\p{L}\p{N}]/u;

function findWholeWord(haystackFolded, needleFolded) {
  let from = 0;
  while (from <= haystackFolded.length - needleFolded.length) {
    const i = haystackFolded.indexOf(needleFolded, from);
    if (i === -1) return -1;
    const before = i === 0 ? "" : haystackFolded[i - 1];
    const after = haystackFolded[i + needleFolded.length] ?? "";
    if (!ALNUM.test(before) && !ALNUM.test(after)) return i;
    from = i + 1;
  }
  return -1;
}

// fold 1:1 uzunluk korur (13A §2) — folded index, orijinal metinde aynı konumdur.
function bindInSegments(segments, label, termId) {
  const needle = foldTr(label);
  for (let s = 0; s < segments.length; s += 1) {
    const seg = segments[s];
    if (seg.type !== "text") continue;
    const i = findWholeWord(foldTr(seg.text), needle);
    if (i === -1) continue;
    const replacement = [];
    if (i > 0) replacement.push({ type: "text", text: seg.text.slice(0, i) });
    replacement.push({ type: "term", text: seg.text.slice(i, i + needle.length), termId });
    if (i + needle.length < seg.text.length)
      replacement.push({ type: "text", text: seg.text.slice(i + needle.length) });
    segments.splice(s, 1, ...replacement);
    return true;
  }
  return false;
}

/** Page'in paragraph'larında, page'in kendi terimlerinin ilk geçişini bağlar. */
export function bindTermsInPage(page, glossaryRecords) {
  let bound = 0;
  // Uzun label önce: "Idempotency key", "Idempotency"den önce denenir (kısmi gölgeleme önlenir)
  const records = [...glossaryRecords].sort((a, b) => b.label.length - a.label.length);
  for (const rec of records) {
    if (foldTr(rec.label).length < 3) continue; // tek/iki karakterlik label'da yanlış pozitif riski
    for (const block of page.blocks) {
      if (block.type !== "paragraph") continue; // 12A §2-B: paragraph metinleri
      if (bindInSegments(block.segments, rec.label, rec.id)) {
        bound += 1;
        break; // ilk geçiş kuralı — sonraki block'lara bakılmaz
      }
    }
  }
  return bound;
}
