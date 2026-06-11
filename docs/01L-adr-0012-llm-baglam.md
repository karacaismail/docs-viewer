# 01L — ADR-0012 (viewer serisi): LLM Bağlam Paketi — Sözleşmenin Ajan Yüzeyi

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

Terminoloji/granülerlik sözleşmeleri insan-okur sitede yaşıyordu; bir LLM'in "crm dağ yap" ile "crm app'i yaz" komutlarını aynı plana düşürmesi, sözleşmenin onun bağlamına girmesine bağlıdır.

## Karar

Sözleşme üç standart ajan-yüzeyine paketlenir ve içerikle senkron tutulur: (1) repo kökünde **AGENTS.md** — tam sözleşme: sözlük, eş anlam tablosu, komut grameri, çözümleme adımları, çıktı/iskelet sözleşmesi, yasaklar; vibecoding araçları (Claude Code, Cursor vb.) repo açılışında otomatik okur; (2) **CLAUDE.md** — AGENTS.md'ye yönlendiren tek satır; (3) sitede **/llms.txt** (llms.txt standardı) — özet kurallar + kanonik sayfa linkleri; URL'le çalışan her LLM'e tek-link bağlam. Gelecek adım (kod fazı): `sdk context` komutu ve kernel MCP'sinde sözleşmenin resource olarak sunulması — paket o gün üretilir hale gelir, elle senkron biter.

## Sonuçlar

Artılar: iki dil (metafor/tanım-katmanı) her araçta tek sözleşmeye düşer; yeni ajan sıfır kurulumla kurallı başlar. Eksiler: içerik değişince AGENTS.md/llms.txt elle senkron ister (sdk context'e kadar) — tutarlılık denetimi mevcut çelişki-avı rutinine eklenir.
