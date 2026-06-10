# 02 — İçerik Envanteri ve Kaynak Dosyaların Kaderi

Bu doküman, `mimari/` klasöründeki mevcut varlıkların sayımını yapar ve her grubun yeni doc viewer'daki rolünü tanımlar. Migration yönergesi (`07-uretim-02-data-migration.md`) bu envanteri girdi kabul eder.

## 1. Cluster JSON Dosyaları (≈198 dosya — birincil içerik kaynağı)

Dosya adlandırması `NN-kategori-konu.json` sözleşmesini izler. Kategori prefix'leri ve sayıları:

| Prefix | Adet | İçerik alanı | Yeni IA'daki hedef kategori |
|---|---|---|---|
| `edu-*` | 28 | Eğitim üniteleri (u01–u25, overview, test) | Eğitim Yolu |
| `s-*` | 64 | Sektör/ürün modülleri (crm, sales, wms, payroll…) | Ürün Modülleri — Layer 2 |
| `scale-*` | 15 | Scale primitives (outbox, saga, cache, realtime…) | Scale Primitives |
| `cc-*` + `crosscut-*` | 17 | Çapraz-kesen konular (i18n, privacy, compliance…) | Çapraz-Kesen |
| `sus-*` | 12 | Sürdürülebilirlik (versioning, bitemporal, conformance…) | Sürdürülebilirlik |
| `stack-*` | 12 | Stack ürün aileleri (commerce, accounting, hrms…) | Stack Ürünleri |
| `fe-*` | 9 | Frontend tech-stack kararları | Frontend Tech-Stack |
| `layer1-*` + `l1-*` | 12 | Layer 1 in-tree servisler (party, file, audit…) | Layer 1 — In-tree |
| `kernel-*` + `k-*` | 8 | Layer 0 kernel domain'leri | Kernel — Layer 0 |
| `landx-*` | 7 | LandX ürün mimarisi (l0–l5) | LandX |
| `dx-*` + `services` | 4 | Plugin DX, marketplace, dış servisler | DX & Services |
| Tekil meta dosyalar | ~10 | overview, philosophy, board, atomic-types, build-sequence, anti-patterns, file-layout, product-mapping, deploy-yap | Genel Harita + Build & Deploy |

Bu dosyalar eski viewer'ın şemasındadır ve **zaten block tabanlıdır** (21 eski block type + `enrich` pedagojik katmanı). Yeni modelde her cluster bir **page**'e dönüşür; dönüşüm büyük ölçüde block-to-block çeviridir, serbest metin parse'ı yalnızca `enrich.info/detail` ve inline işaretler için gerekir. Alan alan kurallar `07A-alan-esleme-tablosu.md`'dedir.

## 2. Mimari .md Raporları (analiz katmanı)

| Dosya grubu | Rol | Kader |
|---|---|---|
| `01_MEVCUT_MIMARI_ANALIZ.md`, `02_YENI_MIMARI_SPEC.md` | v3 zemin tespiti + v4 evrim spec'i | Referans; v4 spec'in registry/schema-first ilkeleri bu sete taşındı |
| `MIMARI-ANALIZ-1…7`, `MIMARI_RAPOR-3` | Ara analizler | ADR arşivi; viewer içeriğine girmez |
| `HEDEF_MIMARI-8.md` (+`aa0a-` kopyası) | Sentez raporu — kilitli kararların kaynağı | Bağlayıcı referans; `01-kilitli-kararlar.md` buradan türedi |
| `menu_hiyerarsi_audit.md` | 13 grup menü önerisi + sıralama ilkeleri | Rail 1 IA'sının temeli (`03-navigation-ia.md`) |
| `lesson-yazim-rehberi.md` | İçerik üslup rehberi | Block içeriği yazım sözleşmesi olarak geçerli kalır |
| `mobile-first-pattern.md`, `performance-budget.md` | UI/performans kuralları | Layout yönergesine girdi |
| `unknown_unknowns_analizi.md`, `gap_celiski_analizi.md`, `ek_arastirma_surdurulebilirlik.md` | Risk/gap analizleri | ADR arşivi |
| Ürün analizleri (`atonota-*`, `arsa-finans-*`, `sonbirarsa-*`, `tempx-*`, `ddd_moduler_monolith.md`, `dddx.md`, `condtechstackform.md`) | Ürün/iş bağlamı | Viewer kapsamı dışı; repo'da `docs/adr/` arşivine adaydır |
| `Modul_Icerikleri.md` (92 KB) | Eski viewer'ın kaynak içeriği | Eski pipeline'a ait; yeni modele taşınmaz, arşiv |
| `AUDIT-REPORT.md`, `v15-*`, `v18-v20-*` | Sürüm raporları | Arşiv |

## 3. HTML Dosyaları

`core-domains.html`, `eksikler.html`, `framework-master.html` eski statik raporlardır. Kaderleri başlık-örtüşme taramasıyla kesinleştirilmiştir (10 Haziran 2026): `framework-master.html` cluster JSON'ların öncülüdür (h1/h2 başlıklarının yarısı JSON havuzuyla birebir örtüşür — 00-overview, philosophy, kernel, scale bölümleri) ve içerik tarafından aşılmıştır; `core-domains.html` aynı kararların erken taslağıdır (kavramsal kapsama kernel/scale/layer1/build cluster'larında mevcut); `eksikler.html` bir backlog anlık görüntüsüdür, doküman içeriği değildir. **Üçü de arşivdir, hiçbiri page adayı değildir** ve viewer repo'suna taşınmaz. İleride bu dosyalarda karşılığı olmayan bir içerik fark edilirse kaynak yine yeni cluster JSON yazımıdır — HTML'den otomatik migration yapılmaz.

## 4. Envanter İlkeleri

İçeriğin tek doğruluk kaynağı cluster JSON'lardır; .md raporları karar geçmişidir, görüntülenecek içerik değildir. Migration script'i bu ayrımı korur: page üretimi yalnızca JSON kaynaklarından yapılır, böylece "hangi içerik nereden geldi" sorusu her zaman izlenebilir kalır. Aynı içeriğin iki kopyası varsa (`HEDEF_MIMARI-8` / `aa0a-HEDEF_MIMARI-8`, `atonota`/`atonote`) yalnızca biri kaynak kabul edilir, diğeri arşivlenir.

Repo karşılığı ADR-0001'de kararlaştırılmıştır (`01A-adr-0001-repo-konumu.md`): cluster JSON'lar bağımsız `docs-viewer` repo'sunun `content-source/` dizinine taşınır ve oradaki kopya tek doğruluk kaynağı olur; bu klasör (`mimari/`) çalışma arşivine düşer. Mimari analiz raporları viewer repo'suna girmez — `HEDEF_MIMARI-8` §12.3 gereği metawork `docs/adr/` arşivinin malzemesidir.
