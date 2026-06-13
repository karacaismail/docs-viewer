# 01 — Kilitli Mimari Kararlar

Bu doküman, doc viewer projesinin tartışmaya kapalı kararlarını tek yerde toplar. Her karar gerekçesiyle kayıtlıdır; sapma ancak yeni bir ADR ile mümkündür.

## Karar Tablosu

| Alan | Karar | Gerekçe |
|---|---|---|
| Uygulama tipi | Vite SPA — statik doküman görüntüleyici | Backend'siz, statik host edilebilir; içerik = veri |
| Framework | React 19 + TypeScript strict | Kilitli frontend stack (`HEDEF_MIMARI-8` madde 3.11) |
| Routing | TanStack Router | Type-safe route + search param; page/block anchor sözleşmesi tip güvenli |
| Search engine | MiniSearch | In-memory, client-side, statik JSON index ile uyumlu |
| Search davranışı | Sonuç, ilgili block anchor'a indirir | Sayfa değil block hedeflenir; uzun sayfalarda konum kaybı önlenir |
| Syntax highlighting | Shiki — `codeToTokens` ile token tabanlı render | HTML string render yasağıyla birlikte highlighting sağlayan tek güvenli yol |
| UI primitives | Radix Primitives + saf token CSS (custom design system) | Erişilebilirlik davranışları (focus trap, dismiss) hazır; görsel katman token'lardan. Tailwind ADR-0004 ile çıkarıldı (`01D-adr-0004-token-css.md`) |
| Validation | Zod — schema tek kaynak, tipler `z.infer` ile türetilir | Elle tip yazımı biter; bozuk veri build'i kırar |
| Test | Vitest + Testing Library + Playwright | Test-first süreç; bkz. `05-test-plani.md` |
| İçerik dili | Türkçe cümle yapısı, teknik jargon orijinal İngilizce | Kullanıcı hem açıklamayı anlar hem gerçek terimle tanışır |
| Tema | Sadece dark mode | Tek tema; kontrast WCAG AA ile doğrulanır |
| Min. viewport | 320px, mobile-first | Yatay scroll üretmeden çalışmak kabul kriteridir |
| Repo konumu | Bağımsız private repo `docs-viewer`; monorepo'ya katılım ertelendi | ADR-0001 (`01A-adr-0001-repo-konumu.md`) — revizyon tetikleyicisi tanımlı |
| Storybook | İlk kapsam dışı | ADR-0002 (`01B-adr-0002-storybook.md`) — kontrat testleri semantiği zaten kanıtlıyor; tetikleyiciler tanımlı |
| Yayın modeli | Public repo + GitHub Pages | ADR-0003 (`01C-adr-0003-yayin-modeli.md`) — ADR-0001'in deploy/görünürlük maddelerinin kullanıcı kararıyla revizyonu |
| Glossary zenginleştirme yeri | Overlay dosyası (`glossary-enrichment.json`) | ADR-0005 (`01E-adr-0005-glossary-overlay.md`) — kaynak clusters pristine kalır |
| Min. text size | Efektif taban 1rem (`mobile-first-pattern.md` ZORUNLU kuralı; master prompt'un 0.9rem tabanını sağlar ve sıkılaştırır) | 60+ kullanıcı okunabilirliği; uzlaşma: 09A §1 |

## Yasaklar

Aşağıdakiler bu projede kullanılmaz; her biri anti-stack defteri mantığıyla gerekçelidir.

| Yasak | Gerekçe |
|---|---|
| Next.js | Server/Client component sınırı vibecoding anti-pattern'i; statik üründe gereksiz katman |
| Backend API, database, auth, SSR, SSG | Ürün tanımı statik doküman görüntüleyici; dinamikleşme kapsam dışı |
| Markdown renderer | İçerik structured JSON block modelinden gelir; serbest metin pipeline'ı belirsizlik üretir |
| HTML string render, `dangerouslySetInnerHTML` | XSS yüzeyi; Shiki dahil tüm render token/segment tabanlı yapılır |
| Global tek anlamlı glossary | Aynı terim farklı bağlamlarda farklı açıklama ister; `termId` bağlama özeldir |
| Redux | Server data yok; UI state için React state + hafif store yeterli |
| Flowbite ana UI sistemi | Radix + custom design system kararı ile çelişir; Flowbite yalnızca eski viewer'da kalır |
| Light mode | Tek tema bakım maliyeti; mevcut içerik dark tema için yazılmış |
| God object `engine.js` | Engine tek dosya değil, sorumluluk başına modül (`08-uretim-03-engine.md`) |
| Supabase | Kullanıcı tercihi; ayrıca backend zaten yasak |

## Kritik Teknik Karar: Shiki Token Pipeline

HTML string render yasağı ile syntax highlighting talebini birlikte karşılayan tek yol token tabanlı render'dır:

```txt
Doğru:  JSON code string -> Shiki codeToTokens -> token array -> React CodeBlock renderer
Yanlış: JSON code string -> Shiki codeToHtml -> dangerouslySetInnerHTML
```

Bu karar `11-uretim-06-content-renderer.md` içinde uygulanır ve test planında ayrı kontrat testi olarak korunur.

## Dil Tonu Sözleşmesi

Proje dokümanları ve içerik blokları, emir cümleleri yerine açıklayıcı ve gerekçeli dil kullanır. Teknik kararın ne olduğu, neden tercih edildiği ve hangi problemi çözdüğü anlatılır. Teknik terimler (component, registry, anchor, tooltip) çevrilmez; cümle Türkçe kurulur.


## AI Üretim Karar Paketi (ADR-0014…0021) — Kilitli

10–13 Haziran 2026'da eklenen AI-first üretim kararları (tam listesi `00-INDEX.md` 01N–01U):

- **ADR-0014** Karar/gereksinim dokümanı ayrımı + çelişki mutabakat merdiveni.
- **ADR-0015** Aksiyon taksonomisi + agent yetki modeli (etkin = kullanıcı ∩ capability; agent asla principal değil; DisableProtection yasak).
- **ADR-0016** ChangeSet operation sözleşmesi + migration/rollback yaşam döngüsü (üç geri-alma sınıfı).
- **ADR-0017** Güvenlik sözleşmeleri — RLS uygulama (SET LOCAL), audit forensic, sub_prompt untrusted, PII matrisi.
- **ADR-0018** AI-first UX/UED — iki mod (Otopilot/Atölye), sonuç-önce sentetik önizleme, güven kalibrasyonu, ön-seçim politikası.
- **ADR-0019** ECA motoru — declarative no-code DSL + güvenlik kapısı + n8n delegasyonu.
- **ADR-0020** AI governance & model ops (NIST AI RMF) + operations/runbook + üç kill-switch.
- **ADR-0021** Açık kararlar — namespace, eşzamanlılık (optimistic lock), i18n varsayılanı, tenant kotası, public KVKK rızası.

Not: ADR-0006…0013 (telemetri, terminoloji, granülerlik, ArcheType, Surface, ECharts, LLM-bağlam, MD-export) da `00-INDEX.md`'de kayıtlıdır; bu kütük artık ADR serisinin tamamını `00-INDEX` üzerinden işaret eder.
