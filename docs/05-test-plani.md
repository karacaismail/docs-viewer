# 05 — Test Planı (Faz 0 — geliştirmeden önce kurulur)

Test-first kuralı bu projede istisnasızdır: önce test altyapısı ve test listesi, sonra schema, sonra data, sonra implementasyon. Hiçbir block modülü şema testi olmadan merge edilmez. Snapshot test kullanılmaz; semantik assert tercih edilir, çünkü snapshot'lar stil refactor'larında gürültü üretir, kontrat testleri kalıcıdır.

## 1. Araçlar ve Kurulum Sırası

Vitest + `@testing-library/react` birim/bileşen katmanını, Playwright + `@axe-core/playwright` e2e ve a11y katmanını taşır. Faz 0'ın çıktısı: çalışan `vitest` komutu, ilk yeşil placeholder test, CI workflow iskeleti ve bu dokümandaki test listesinin issue/checklist olarak açılması.

*Uygulama durumu (10 Haziran 2026):* katman `projector/` içinde kuruludur — `tests/` (9 dosya, 41 birim/kontrat testi), `e2e/viewer.spec.ts` + `e2e/a11y.spec.ts` (`playwright.config.ts`'te desktop + mobile-320 projeleri), coverage eşiği `vite.config.ts`'te tanımlı (ölçülen: %98.6 satır / %85.1 dal). Katman ilk CI koşusunda dört gerçek hata yakalamıştır (aria-required-children, kontrollü panelde focus dönüşü, glossary sonucunda hash beklentisi, devDeps kaybı) — varlık gerekçesinin kanıtı olarak kayıtlıdır.

## 2. Test Piramidi

| Katman | Kapsam | Kural |
|---|---|---|
| 1. Şema testleri | Her Zod şeması: geçerli örnek kabul, eksik alan / yanlış type / bilinmeyen block type red | Şema değişikliği = test değişikliği aynı PR'da |
| 2. Birim testleri | Engine saf fonksiyonları: normalize, resolve, search document üretimi, anchor çözümü | Sınır değerler: boş dizi, eksik referans, duplicate ID |
| 3. Bileşen kontrat testleri | Her block bileşeni: verilen veri → beklenen DOM semantiği (heading seviyesi, tablo başlıkları, liste rolleri) | A11y assert'leri dahil |
| 4. İçerik doğrulama | `src/data/` altındaki gerçek JSON, registry'deki tüm şemalardan geçer; tüm `pageId`/`termId`/`blockId` referansları çözülür | CI'da zorunlu kapı — bozuk içerik build'i kırar |
| 5. E2E + a11y | Playwright: 320px yatay scroll, klavye akışı (Ctrl+K → ok → Enter → block anchor), focus trap + focus dönüşü, drawer, boş sonuç durumu; axe-core WCAG 2A/AA taraması (3 temsilî sayfa + panel açıkken), critical/serious = 0 | CI'da zorunlu kapı — `e2e/viewer.spec.ts`, `e2e/a11y.spec.ts` |

## 3. Faz Bazlı Test Listesi

Her üretim fazı kendi test grubunu önce yazar; aşağıdaki liste fazların "tanımlanmış test sözleşmesi"dir.

### Schema (Faz 1)
Geçerli page/block/glossary/search/navigation örnekleri kabul edilir; her block type için eksik zorunlu alan red edilir; bilinmeyen block type red edilir; `z.infer` tipleri derlemede kullanılabilir durumdadır.

### Data migration (Faz 2)
Migration script'i deterministiktir (iki çalıştırma = aynı çıktı); üretilen tüm dosyalar şemalardan geçer; kaynak cluster sayısı ile üretilen page sayısı mutabakat tablosuyla eşleşir; duplicate page/block ID üretilmez; her navigation item'ı gerçek bir page'e işaret eder.

### Engine (Faz 3)
`resolvePage` bilinen slug'ı çözer, bilinmeyen slug'da fallback model döner; `resolveTerms` bağlamsal termId eşleşmesini doğru yapar, çözülemeyen term'i düz metne düşürür; `resolveSearchDocuments` block ve glossary kayıtlarını düzleştirir; `scrollToBlockAnchor` bulunamayan hash'te hata fırlatmaz.

### Layout (Faz 4)
320px viewport'ta yatay scroll oluşmaz; drawer/panel açıkken arka plan scroll kilitlenir; Escape açık katmanı kapatır; panel kapanınca focus tetikleyiciye döner. *Kanıt: `e2e/viewer.spec.ts` — mobile-320 ve panel sözleşmesi testleri.*

### Navigation (Faz 5)
Rail 1 seçimi Rail 2 içeriğini değiştirir; accordion `aria-expanded` / `aria-controls` ilişkileri doğrudur; aktif page `aria-current` taşır; mobile sheet/drawer keyboard ile açılıp kapanır.

### Content renderer (Faz 6)
Registry'deki her block type render edilir; bilinmeyen type test ortamında hata üretir; codeBlock token tabanlı render edilir ve çıktıda `dangerouslySetInnerHTML` bulunmaz (kaynak taraması + DOM assert); highlightedLines ve satır numaraları doğru hücrelere düşer; copy aksiyonu panoya kodun kendisini yazar.

### Glossary (Faz 7)
Term segment'i noktalı underline ile render edilir; tooltip hover, focus ve tap ile açılır; `?` kontrolü explanation panel'i açar; panel focus trap uygular; aynı label farklı pageId'lerde farklı içerik gösterir.

### Search (Faz 8)
Index, tanımlı tüm alanları kapsar; sonuç seçimi doğru slug + hash'e navigate eder; hedef block scroll edilip geçici highlight alır; ArrowUp/ArrowDown/Enter/Escape sözleşmesi çalışır; boş sonuç durumu erişilebilir şekilde duyurulur. Türkçe normalizasyon (13A §4): fold birim testleri (İ/I combining-dot vakası dahil), `surdurulebilirlik`→`Sürdürülebilirlik` ve `dokuman`→üç yazım varyantı entegrasyon testleri, `id` sorgusunun `ıd` üretmediğinin kanıtı.

### A11y + kabul (Faz 9)
axe-core taraması kritik ihlal vermez; dark tema kontrast oranları AA eşiğini geçer; tüm ana akışlar yalnızca keyboard ile tamamlanır. *Kanıt: `e2e/a11y.spec.ts` (axe), 09A token ölçümleri (kontrast), `e2e/viewer.spec.ts` (klavye).*

## 4. CI Kapıları

PR birleşmesi için tamamı yeşil olmalıdır. Fiilî zincir (`projector/.github/workflows/deploy.yml`): `biome ci` (lint + format — anti-stack kararı: ESLint+Prettier yerine Biome) → migrate (içerik üretimi + mutabakat raporu) → `tsc --noEmit` → `vitest run --coverage` (şema + birim + kontrat + içerik doğrulama + coverage eşiği: ≥%80 satır, ≥%75 dal) → production build → kök-base e2e build → `playwright test` (e2e + axe) → `size-limit` (250KB eager JS) → Pages artifact → deploy. Yerel hook'lar lefthook'tadır (husky reddi — anti-stack): pre-commit biome, pre-push vitest.

Deploy hedefi, ADR-0001'in öngördüğü Hetzner yerine kullanıcı kararıyla **GitHub Pages**'tir (public repo); bu sapma ADR-0003 adayıdır. Hetzner atomik rsync hattı (releases/<sha> + current symlink) ve n8n release orkestrasyonu, ileride taşınırsa geçerli şablon olarak bu paragrafta kalır.
