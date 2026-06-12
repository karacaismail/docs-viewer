// Yedi Soru genellemesi kapısı (12A §6): her glossary terimi
// Ne/Niçin/Nasıl/Nerede/Ne zaman/Kim/Analoji cevaplarının TAMAMINI taşır.
// Kapsam iddiası dokümanda yaşar; bu test iddiayı üretilmiş veriyle eşler (docSync ruhu).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const glossary = JSON.parse(readFileSync(join(ROOT, "src", "data", "glossary.json"), "utf8"));
const detailFile = JSON.parse(readFileSync(join(ROOT, "src", "data", "glossary-detail.json"), "utf8"));
const overlay = JSON.parse(readFileSync(join(ROOT, "tools", "migrate", "seven-questions.json"), "utf8"));

const FIELDS = ["ne", "nicin", "nasil", "nerede", "ne_zaman", "kim", "analoji"] as const;

describe("yedi soru genellemesi (12A §6)", () => {
  it("kapsam tam: her terimin sevenQuestions kaydı var (709 hedefi diskten okunur)", () => {
    const missing = glossary.terms
      .map((t: { id: string }) => t.id)
      .filter((id: string) => !detailFile.details[id]?.sevenQuestions);
    expect(missing).toEqual([]);
    expect(glossary.terms.length).toBeGreaterThan(0);
  });

  it("her kayıtta 7 alanın tamamı dolu ve cevaplar cümle uzunluğunda (≥15 karakter)", () => {
    const thin: string[] = [];
    for (const t of glossary.terms as { id: string }[]) {
      const sq = detailFile.details[t.id]?.sevenQuestions;
      if (!sq) continue; // kapsam testi ayrı yakalar
      for (const f of FIELDS) {
        if (typeof sq[f] !== "string" || sq[f].trim().length < 15) thin.push(`${t.id}.${f}`);
      }
    }
    expect(thin).toEqual([]);
  });

  it("overlay'de sahipsiz anahtar yok: her byTermId anahtarı glossary'de yaşar", () => {
    const known = new Set((glossary.terms as { id: string }[]).map((t) => t.id));
    const orphans = Object.keys(overlay.byTermId).filter((k) => !known.has(k));
    expect(orphans).toEqual([]);
  });
});
