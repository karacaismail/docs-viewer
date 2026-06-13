# Doc Viewer — Doküman Seti İndeksi

Bu set, `mimari/` klasöründeki mevcut içeriğin (≈198 cluster JSON + mimari analiz raporları) **Enterprise Grade Static JSON Documentation Viewer** master prompt'una uygun şekilde yeniden yapılandırılması için üretilmiştir. Set iki katmandan oluşur: kararlar ve bilgi mimarisi (01–04), faz bazlı üretim yönergeleri (05–14).

Üretim sırası test-first kuralına göre düzenlenmiştir: önce test planı, sonra schema, sonra data, sonra development. Bu sıra `HEDEF_MIMARI-8.md` madde 9'daki istisnasız kuralla uyumludur.

## Okuma ve Üretim Sırası

| # | Dosya | İçerik | Faz |
|---|---|---|---|
| 01 | `01-kilitli-kararlar.md` | Kilitli mimari kararlar, yasaklar, gerekçeler | Zemin |
| 01A | `01A-adr-0001-repo-konumu.md` | ADR-0001: bağımsız `docs-viewer` repo kararı + setin ADR şablonu | Zemin |
| 01B | `01B-adr-0002-storybook.md` | ADR-0002: Storybook ilk kapsam dışı — gerekçe ve revizyon tetikleyicileri | Zemin |
| 01C | `01C-adr-0003-yayin-modeli.md` | ADR-0003: public repo + GitHub Pages — ADR-0001 deploy/görünürlük revizyonu | Zemin |
| 01D | `01D-adr-0004-token-css.md` | ADR-0004: Tailwind yerine saf token CSS | Zemin |
| 01E | `01E-adr-0005-glossary-overlay.md` | ADR-0005: glossary zenginleştirme overlay dosyası | Zemin |
| 01F | `01F-adr-0006-telemetri.md` | ADR-0006: telemetri yok — arama logları dahil | Zemin |
| 01G | `01G-adr-0007-terminoloji.md` | ADR-0007: kernel/core ayrımı + module dili (plugin reddi) | Zemin |
| 01H | `01H-adr-0008-granulerlik.md` | ADR-0008: granülerlik zinciri v2 — Dağ→Atom, SP katsayıları, komşuluk kuralı | Zemin |
| 01I | `01I-adr-0009-archetype.md` | ADR-0009: ArcheType adlandırması — eski adın tam reddi (Frappe bagajından arınma) | Zemin |
| 01J | `01J-adr-0010-surface.md` | ADR-0010: Surface birinci-sınıf — beşli denklem (App/Domain/ArcheType/Surface/Workflow) | Zemin |
| 01K | `01K-adr-0011-echarts.md` | ADR-0011: ECharts — lazy-chunk'lı WBS görselleştirme bağımlılığı | Zemin |
| 01L | `01L-adr-0012-llm-baglam.md` | ADR-0012: LLM bağlam paketi — AGENTS.md/CLAUDE.md/llms.txt | Zemin |
| 01M | `01M-adr-0013-md-export.md` | ADR-0013: MD dışa aktarma — kemikleştirilmiş sözleşme (4 CI kapısı) | Zemin |
| 01N | `01N-adr-0014-ai-uretim-karar-paketi.md` | ADR-0014: AI üretim karar paketi — karar/gereksinim ayrımı + çelişki mutabakat merdiveni + sahiplik haritası | Zemin |
| 01O | `01O-adr-0015-aksiyon-taksonomisi-yetki.md` | ADR-0015: aksiyon taksonomisi + agent yetki modeli (kesişim kuralı, step-up, DisableProtection yasağı) | Zemin |
| 01P | `01P-adr-0016-changeset-migration.md` | ADR-0016: ChangeSet operation sözleşmesi + migration/rollback yaşam döngüsü (üç geri-alma sınıfı) | Zemin |
| 01Q | `01Q-adr-0017-guvenlik-sozlesmeleri.md` | ADR-0017: güvenlik sözleşmeleri — RLS uygulama (SET LOCAL), audit forensic, sub_prompt untrusted, PII matrisi | Zemin |
| 01R | `01R-adr-0018-ai-first-ux.md` | ADR-0018: AI-first UX/UED — iki mod (Otopilot/Atölye), sonuç-önce sentetik önizleme, güven kalibrasyonu, ön-seçim politikası | Zemin |
| 01S | `01S-adr-0019-eca-dsl.md` | ADR-0019: ECA motoru — declarative no-code DSL + güvenlik kapısı (döngü/yan-tenant/derinlik-6/idempotency) + n8n delegasyonu | Zemin |
| 01T | `01T-adr-0020-governance-runbook.md` | ADR-0020: AI governance & model ops (NIST AI RMF) + operations/runbook + üç kill-switch | Zemin |
| 02 | `02-icerik-envanteri.md` | Mevcut kaynak dosyaların envanteri ve kaderi | Zemin |
| 03 | `03-navigation-ia.md` | Rail 1 / Rail 2 bilgi mimarisi, slug ve ID sözleşmeleri | Zemin |
| 04 | `04-veri-modeli.md` | navigation / pages / glossary / search-index JSON sözleşmeleri | Zemin |
| 05 | `05-test-plani.md` | Tüm fazların test planı — geliştirmeden önce kurulur | Faz 0 |
| 06 | `06-uretim-01-schema.md` | Zod schema üretim yönergesi | Faz 1 |
| 07 | `07-uretim-02-data-migration.md` | Mevcut cluster JSON → block model migration yönergesi | Faz 2 |
| 07A | `07A-alan-esleme-tablosu.md` | Eski şema → yeni model alan eşleme tablosu (197 dosya taramasına dayalı, 07'nin bağlayıcı eki) | Faz 2 |
| 07B | `07B-block-kapsama-analizi.md` | Block type kapsama doğrulaması: gerçek içerik desenleri taraması, link segment ve enum kararları (07'nin bağlayıcı eki) | Faz 2 |
| 08 | `08-uretim-03-engine.md` | Render engine üretim yönergesi | Faz 3 |
| 09 | `09-uretim-04-layout.md` | AppShell ve layout üretim yönergesi | Faz 4 |
| 09A | `09A-token-degerleri.md` | Somut token değerleri: palet (ölçülmüş AA kontrastları), type scale, spacing, Shiki teması (09'un bağlayıcı eki) | Faz 4 |
| 10 | `10-uretim-05-navigation.md` | Navigation bileşenleri üretim yönergesi | Faz 5 |
| 11 | `11-uretim-06-content-renderer.md` | Content renderer ve block bileşenleri yönergesi | Faz 6 |
| 12 | `12-uretim-07-glossary.md` | Glossary, tooltip ve explanation panel yönergesi | Faz 7 |
| 12A | `12A-glossary-editoryel-plani.md` | Editöryel plan: 679 otomatik kayıt envanteri + uygulama durumu (§3a), 6 parti öncelik sırası, bitiş tanımı, efor tahmini (12'nin bağlayıcı eki) | Faz 7 |
| 13 | `13-uretim-08-search.md` | MiniSearch tabanlı arama yönergesi | Faz 8 |
| 13A | `13A-turkce-arama-normalizasyonu.md` | İ/I lowercase tuzağı + diacritic fold: `processTerm` sözleşmesi, gerçek veri doğrulamasıyla (13'ün bağlayıcı eki) | Faz 8 |
| 14 | `14-uretim-09-a11y-ve-kabul.md` | Accessibility sözleşmesi ve kabul kriterleri | Faz 9 |
| 15 | `15-icerik-yazari-rehberi.md` | İçerik yazarının günlük workflow'u: page ekleme, güncelleme, glossary, görsel, üslup | Operasyon |

## Bağlayıcılık

Her yönerge dokümanı, master prompt'taki ilgili bölümün bu codebase'e uygulanmış halidir. Bir yönerge ile master prompt çelişirse master prompt kazanır; bir yönerge ile `01-kilitli-kararlar.md` çelişirse kilitli kararlar kazanır. Her faz, kendi dokümanındaki kabul kriterleri yeşil olmadan bir sonraki faza geçmez.
