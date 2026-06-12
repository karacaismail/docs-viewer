// Sayfa bazlı "son güncelleme" haritası (UX-E18) — content-source git geçmişinden.
// YEREL çalıştırılır ve çıktı commit'lenir; CI'da yeniden üretilmez (shallow clone
// tarihleri bozar, migrate determinizm kapısına girmez). Kullanım: node tools/last-updated.mjs
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// Yalnız pages-index'te yaşayan stem'ler yazılır (ARCHITECTURE-5 gibi yardımcı dosyalar elenir)
const stems = new Set(
  JSON.parse(readFileSync("src/data/pages-index.json", "utf8")).pages.map((p) => p.id.slice(5)),
);
const out = {};
for (const f of readdirSync("content-source").filter((f) => f.endsWith(".json"))) {
  const date = execSync(`git log -1 --format=%cs -- "content-source/${f}"`, { encoding: "utf8" }).trim();
  if (!date) continue; // henüz commit'lenmemiş dosya
  // stem = migrate'in page id'si: dosya adındaki sıra önekini at (örn. 43-build-sequence -> build-sequence)
  const stem = f.replace(/\.json$/, "").replace(/^\d+[A-Z]?-/, "");
  if (!stems.has(stem)) continue; // sayfaya dönüşmeyen yardımcı dosya
  out[stem] = date;
}
writeFileSync("src/data/last-updated.json", `${JSON.stringify(out, null, 1)}\n`);
console.log(`OK: ${Object.keys(out).length} sayfa tarihi yazıldı`);
