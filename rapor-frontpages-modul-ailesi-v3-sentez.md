# Rapor — Frontpages Modül Ailesi (v3 · Sentez + Uygulandı)

> **Durum: UYGULANDI (2026-06-16).** Bu rapor artık yalnız fikir değil; aşağıdaki 7 modül `content-source`'a kanonik sayfa olarak işlendi, 2 çekirdek daraltıldı, migrate + test (92/92) yeşil. Ayrıntı: §9 Uygulama Kaydı.

**Soru:** App değil **module** seviyesinde frontpages geliştirmesi. Enterprise-grade app'ler için SEO/pazarlama taksonomisinden **kaç modül**, **neden**, **nasıl**, **hangileri**, her birinin **kapsam ve çerçevesi** ne olmalı? Hangi app'lerde aktifleşir?

**Tarih:** 2026-06-16 · **Bağlam:** docs-viewer meta-framework (kernel + ArcheType + Surface + çok-kiracılı + üretici çekirdek). Bu rapor `rapor-frontpages-discoverability-modulu.md` (1 modül tezi) ve `rapor-pazarlama-modul-ailesi.md` (~9 modül tezi) raporlarını **uzlaştırır** ve mevcut kataloga göre **düzeltir**.

---

## 0. Net hüküm (TL;DR)

1. **Kaç modül: 7 yeni L1 odak modülü + 2 mevcut L1 çekirdek (`l1-seo`, `l1-analytics`) + 1 stack ürün modülü.** Consent **yeni modül değildir** — katalogda zaten var olan `cc-privacy` ve `cc-notification-consent` crosscut modüllerine **bağlanır**. Yani "yeni inşa edilecek" yüzey = **6 L1 + 1 stack**; çekirdekler hazır, consent mevcut.
2. **"1 modül" fazla iri, "2 modül" yeterince ayrışmamış.** Gerçek enterprise platformlar (Drupal, WordPress, Magento, Shopify) bu yeteneği **ayrı modüllere** böler; tek "SEO+pazarlama" modülü yoktur. Ayrıştırma kriteri **dört testle** sabit: tek sorumluluk + bağımsız aç/kapa + ayrı capability-manifesti + ayrı PII/yasal sınır.
3. **İki bounded-context omurgadır:** *keşfedilebilirlik* (render, PII üretmez) ve *ölçüm* (veri, PII sınırı). Tüm aile bu iki sınırın altına dizilir. Bu ayrım kataloğa zaten `l1-seo` ↔ `l1-analytics` ikizi olarak işlenmiş.
4. **Framework farkı (killer):** `pSEO` + `schema.org üretimi` + `AEO/GEO/LLMO`. ArcheType→Surface üretici çekirdeği, rakiplerin elle yaptığı programatik SEO ve yapılandırılmış veriyi **üreterek** verir.
5. **Ön koşul:** "SSR yok → build-time prerender" hattı. Keşfedilebilirlik ailesinin tamamı buna bağlıdır; hat yoksa SEO/AEO çalışmaz.

---

## 1. Neden modül **ailesi**? (mimari gerekçe + platform dersi)

### 1a. Mimari gerekçe (AGENTS.md sözleşmesi)
Granülerlik zincirinde **Module = Kaya** seviyesidir ve her Kaya **tek bir bounded-context**'tir. Bir modülün sınırı şu dördünden en az biri değiştiğinde **kırılır**:

- **Sorumluluk** farklılaşıyorsa (render ≠ ölçüm ≠ yasal kapı),
- **Aç/kapa** bağımsızsa (bir app sitemap ister ama deney istemez),
- **Capability-manifesti** farklıysa (dosya yazma ≠ network allowlist ≠ consent kapısı),
- **PII/yasal sınır** farklıysa (meta render PII üretmez; analytics üretir → retention+audit).

Bu dördü frontpages yeteneği içinde **eşzamanlı** değişir → tek modül **god-module** olur, komşuluk kuralını ihlal eder.

### 1b. Platform dersi (gerçek dünyada hep ayrı modül)

| Yetenek | Drupal | WordPress | Magento | Shopify |
|---|---|---|---|---|
| On-page/meta/schema | Metatag + Schema.org | Yoast/RankMath | native SEO | SEO app |
| Sitemap/robots | Simple XML Sitemap | (Yoast) | native | native |
| Redirect/URL | Redirect + Pathauto | Redirection | URL Rewrites | URL redirects |
| Tag container | Google Tag | GTM4WP | GTM ext | GTM (theme/app) |
| Analytics | Google Analytics | Site Kit | GA ext | native/GA |
| Consent (CMP) | EU Cookie/Klaro | Complianz/CookieYes | GDPR ext | Customer Privacy |
| Ürün feed | Commerce Feeds | Product Feed PRO | Google Shopping ext | Google & YouTube channel |

**Ders:** Her biri bağımsız kurulur/güncellenir, ayrı yetki ister, ayrı 3. partiye bağlanır. Bizim avantaj: aynı granülerlik **ama üretici çekirdekle** (ArcheType → otomatik meta/schema/sitemap).

---

## 2. Modül ailesi — iki bounded-context altında

Notasyon: **(var)** = katalogda işli çekirdek · **(yeni)** = bu raporun önerdiği odak modül · **(bağ)** = yeni değil, mevcut modüle bağlanır.

### A · Keşfedilebilirlik ailesi — Layer 1, render, **PII üretmez**

| Modül | Kapsam (sorumluluk) | Çerçeve (capability/sınır) | Taksonomi | Analoğu | Öncelik |
|---|---|---|---|---|---|
| **`l1-seo`** (var) | meta/title/canonical/H1, OpenGraph/Twitter, schema.org JSON-LD çekirdek | meta+JSON-LD render; sitemap/robots **yazma**; kernel iç API'ye dokunmaz | On-Page, Schema, OG | Metatag / Yoast | P0 |
| **`l1-sitemap`** (yeni) | `sitemap.xml` (ArcheType'lardan), `robots.txt`, IndexNow ping | dosya **yazma** yetkisi (dar yol); takvimli yenileme | Technical SEO | Simple XML Sitemap | P0 |
| **`l1-redirect`** (yeni) | 301/410 yöneticisi, URL alias/slug (pathauto) | yönlendirme tablosu yazma; döngü/zincir denetimi | Technical SEO | Redirect + Pathauto | P1 |
| **`l1-pseo`** (yeni) | ArcheType + şablon → toplu public sayfa + **kalite kapısı** | üretim hook'u; ince-içerik kapısı zorunlu; prerender'a bağlı | pSEO | (analog yok — framework farkı) | P0 |
| **`l1-aeo`** (yeni) | FAQ/HowTo schema, answer-block, `llms.txt`, temiz semantik HTML | render-only; yetenek odaklı (buzzword değil) | AEO/GEO/LLMO/AIO | (yeni nesil) | P1 |

> i18n/hreflang → mevcut `cc-i18n-standards`'a bağlanır. Mobile-first 320px/PWA + Core Web Vitals perf kapısı **zaten var**, yeni modül değil.

### B · Ölçüm & Tag ailesi — Layer 1, veri, **PII sınırı**

| Modül | Kapsam (sorumluluk) | Çerçeve (capability/sınır) | Taksonomi | Analoğu | Öncelik |
|---|---|---|---|---|---|
| **`l1-analytics`** (var) | GA4/Plausible/Matomo olay, UTM/attribution yakalama, dashboard | network allowlist; ziyaretçi verisi `pii:true`+retention+audit; consent-gated | Web Analytics, Attribution | Google Analytics modülü | P0 |
| **`l1-tagmanager`** (yeni) | Tag container (tercihen **server-side GTM**); tag enjeksiyon/yönetimi | dar allowlist; custom-HTML XSS vektörü → server-side + onaylı tag | (tag taşıyıcısı) | Google Tag / GTM4WP | P1 |
| **`l1-experiment`** (yeni) | CRO / A-B / MVT / feature-flag deney; sonuç ölçümü | Surface varyant + Experiment ArcheType; analytics'e bağlı | CRO, A/B, MVT | Optimizely/GrowthBook | P2 |

> **Consent yeni modül DEĞİL.** Yasal kapı zaten katalogda: `cc-privacy` (KVKK+GDPR somut implementasyon) + `cc-notification-consent` (transactional vs marketing). Tag/analytics bu crosscut'a **ön koşul** olarak bağlanır. (Önceki "l1-consent" önerisi bu raporla **iptal**; çift-yazımı önler.)

### C · E-ticaret pazarlama — Stack (ürün) katmanı

| Modül | Kapsam | Bağ |
|---|---|---|
| **`s-product-feed`** (yeni) | Google Merchant / Meta Catalog ürün feed üretimi | `s-commerce` + mevcut `stack-channel` |

### D · Yeni modül değil — mevcut modüllere bağlanır (katalog doğrulandı)

Lead form → `s-crm` · Email/SMS/WhatsApp/Push → `be-mail-zinciri` / `s-mail` / `fe-ai-rt` · Social/Shopping kanal → `stack-channel` · Affiliate/Referral → `s-loyalty` · Conversational → `k-agent-runtime` · Predictive/personalization → `s-predictive` · i18n/hreflang → `cc-i18n-standards`.

### E · Kapsam dışı (platform modülü değil — insan/ops/3. parti)
Paid Media (SEM/PPC/PMax/Display/Programmatic/Native/CTV/Paid Social) reklam platformlarında yürür — modül yalnız **feed + dönüşüm/UTM endpoint** verir. Influencer/Creator, ABM/Demand-Gen, PR/Brand/ORM, Event/Webinar/AR-VR → pazarlama operasyonu. **ASO** → `fe-mobile` (web değil). Parasite/Barnacle, Black/Grey hat → **yasak** (yalnız white-hat).

---

## 3. Sayım özeti (kesin)

| Kategori | Adet | Modüller |
|---|---|---|
| Mevcut L1 çekirdek | 2 | `l1-seo`, `l1-analytics` |
| Yeni L1 odak | 6 | `l1-sitemap`, `l1-redirect`, `l1-pseo`, `l1-aeo`, `l1-tagmanager`, `l1-experiment` |
| Yeni Stack ürün | 1 | `s-product-feed` |
| Mevcut modüle bağ (yeni değil) | — | consent→`cc-privacy`/`cc-notification-consent`, i18n→`cc-i18n-standards`, lead→`s-crm` … |
| **Toplam frontpages ailesi** | **9 L1 + 1 stack** | (inşa edilecek yeni: **7**) |

---

## 4. Aktivasyon matrisi — hangi app hangi modülü açar (capability-flag)

Kural değişmez: bir app'in **public Surface'i** varsa modül o app'te aktiftir; yalnız iç back-office app'te **kapalı** (en fazla `noindex`).

| Modül | Storefront/Commerce (`s-commerce`) | Classifieds (`dist-sahibinden`) | CMS (`s-cms`) | RealEstate (`dist-realestate`) | Education/Clinic/Restaurant (public) | Marketplace (`stack-channel`) | İç back-office (HRMS/ERP/muhasebe) |
|---|---|---|---|---|---|---|---|
| l1-seo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| l1-sitemap | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| l1-redirect | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ops. |
| l1-pseo | ✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ | — |
| l1-aeo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| l1-tagmanager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ops. |
| l1-analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ops. |
| l1-experiment | ✓ | ✓ | ✓ | ✓ | kısmi | ✓ | — |
| s-product-feed | ✓✓ | ✓ (ilan feed) | — | ✓ | — | ✓✓ | — |
| consent (cc-*) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ops. |

`✓✓` = killer kullanım · `ops.` = opsiyonel (iç ölçüm).

---

## 5. Modül iç tasarımı — ArcheType + manifest deseni (çerçeve)

Her modül aynı sözleşmeyi taşır (be-sdk çıktı sırası): **önce testler** → `archetypes/*.yaml` → `surfaces/*.yaml` → `workflows/*.yaml` → `manifest.yaml`.

- **`l1-seo`** — ArcheType: `SeoProfile`, `StructuredDataMap`, `OgImageTemplate`. Manifest: render-only, deny-by-default.
- **`l1-sitemap`** — ArcheType: `SitemapPolicy`. Manifest: dar dosya-yazma yolu.
- **`l1-redirect`** — ArcheType: `Redirect`, `UrlAlias`. Bayrak: değişiklikler `audit`'li, tenant domain `bitemporal`.
- **`l1-pseo`** — ArcheType: `PseoTemplate` (+ kalite-kapısı kuralı/Atom). Bağ: prerender hattı.
- **`l1-aeo`** — ArcheType: `AnswerBlock`, `FaqSchema`, `LlmsTxtPolicy`.
- **`l1-analytics`** — ArcheType: `AnalyticsConfig` (`pii:true`+retention), `Event/Conversion`, `CampaignUtm`, `AttributionModel`. Manifest: network allowlist + consent-gate.
- **`l1-tagmanager`** — ArcheType: `TagContainer`, `Tag`. Manifest: server-side enjeksiyon + onaylı tag allowlist.
- **`l1-experiment`** — ArcheType: `Experiment` (A/B/MVT), `Variant`.
- **`s-product-feed`** — ArcheType: `ProductFeed`, `FeedChannel`. Bağ: `commerce` + `stack-channel`.

Zorunlu bayrak disiplini her modülde: para=Money · kişisel veri=`pii:true`(+retention) · tarihçeli=`bitemporal:true` · her şey audit'li. AI dokunamaz alan yalnız bu YAML'lar + saf hook fonksiyonları; kernel iç API'sine dokunulmaz.

---

## 6. Yol haritası (dalga sırası)

- **Dalga 1 (P0 / MVP):** prerender hattı (ön koşul) → `l1-seo` (çekirdek daralt) + `l1-sitemap` → `l1-pseo` + kalite kapısı → `l1-analytics` + `cc-privacy` consent bağı.
- **Dalga 2 (P1):** `l1-tagmanager` (server-side GTM) → `l1-redirect` → `l1-aeo` → `s-product-feed`.
- **Dalga 3 (P2 / enterprise):** `l1-experiment` (CRO/MVT) → attribution derinleştirme → tenant özel domain / multi-region SEO.

---

## 7. Riskler / anti-pattern

- **God-module:** SEO+GTM+analytics+consent tek modülde → reddedildi (hiçbir gerçek platform yapmaz).
- **Çift-consent:** Yeni `l1-consent` yazmak `cc-privacy` ile çakışır → consent **mevcut crosscut'a** bağlanır.
- **pSEO ince-içerik:** kalite kapısı zorunlu; boş şablon sayfa Google spam politikasıyla cezalandırılır.
- **Tag-manager XSS:** custom-HTML vektörü → server-side GTM + onaylı tag allowlist; dar manifest.
- **Prerender bağımlılığı:** SSR-yok kararı → hat olmadan aile çalışmaz; önce hat.
- **White-hat sınırı:** parasite/barnacle/black/grey hat dışarıda.

---

## 8. Öneri ve sonraki adım

`l1-seo` + `l1-analytics` çekirdeklerini koru; etraflarına **6 L1 odak modülü** (`l1-sitemap`, `l1-redirect`, `l1-pseo`, `l1-aeo`, `l1-tagmanager`, `l1-experiment`) + **1 stack** (`s-product-feed`) ekleyerek aileyi tamamla. Consent yeni modül değil — `cc-privacy`/`cc-notification-consent`'e bağla. Hepsi capability-flag ile public-Surface'li app'lerde otomatik aktif; prerender ön koşul; pSEO/AEO framework farkı.

---

## 9. Uygulama Kaydı (2026-06-16 · `ekle.` onayı sonrası)

**Eklenen kanonik sayfalar (`content-source/`, her biri test-first geliştirme planı içerir):**

| Dosya | id | Kategori | Sayfa içi plan |
|---|---|---|---|
| 358-l1-sitemap.json | `l1-sitemap` | layer1 | test-first 6 adım + yol haritası |
| 359-l1-redirect.json | `l1-redirect` | layer1 | test-first 6 adım + yol haritası |
| 360-l1-pseo.json | `l1-pseo` | layer1 | test-first 6 adım + kalite kapısı |
| 361-l1-aeo.json | `l1-aeo` | layer1 | test-first 6 adım + Rich Results kapısı |
| 362-l1-tagmanager.json | `l1-tagmanager` | layer1 | test-first 6 adım + XSS/consent kapısı |
| 363-l1-experiment.json | `l1-experiment` | layer1 | test-first 6 adım + istatistik kapısı |
| 364-s-product-feed.json | `s-product-feed` | urunler (cx) | test-first 6 adım + Money/Decimal |

**Daraltılan çekirdekler:** `l1-seo` (artık yalnız meta/on-page/schema/OG; sitemap/redirect/pSEO/AEO kardeşlere ayrıldı) · `l1-analytics` (artık yalnız ölçüm/attribution; tag→l1-tagmanager, deney→l1-experiment, rıza→cc-privacy).

**Her modül sayfasının taşıdığı geliştirme planı (test-first, be-sdk sırası):** ① testler ÖNCE (kırmızı; kabul + edge) → ② `archetypes/*.yaml` → ③ Surface + Contract → ④ Workflow + `manifest.yaml` (WASM sandbox, deny-by-default) → ⑤ saf hook gövdeleri → ⑥ kabul kapısı (deterministik test + bağımsız reviewer; AI kendi çıktısını onaylamaz).

**Entegrasyon:** `categories.mjs` PRODUCT_GROUP_MAP'e `product-feed → cx`; çapraz `related` bağları (çekirdek ↔ aile); `npm run migrate` → 308 sayfa, 0 uyarı.

**Test-first kapı güncellemeleri (yeşil):** `tests/contentValidation.test.ts` 291→308; `docs/02` 309 dosya / 69 karar-kavram, `docs/03` stack 41 (7 landx), `docs/07A` toplam 309. 11 landx terimi için `seven-questions.json` 7-soru kaydı + `last-updated.json` mutabakatı. **Sonuç: 18 test dosyası / 92 test yeşil; tsc temiz; migrate 0 uyarı.**

**Sonraki adım (öneri):** Dalga 1'i (prerender hattı → l1-sitemap/l1-pseo MVP, l1-analytics + cc-privacy consent bağı) gerçek `archetypes/*.yaml` iskeletine dök; her modülün sayfa-içi test planını `tests/` kırmızı testlerine çevir.
