# 14 — Üretim Yönergesi 9: Accessibility Sözleşmesi ve Kabul Kriterleri

Hedef WCAG AA'dır. A11y bu projede son faz "cilası" değildir — her fazın kontrat testlerine gömülüdür; bu doküman dağınık kuralları tek sözleşmede toplar ve projenin nihai kabul listesini verir.

## 1. Accessibility Sözleşmesi

1. **Keyboard:** tüm ana işlevler (navigasyon, search, glossary etkileşimi, kod kopyalama) yalnızca keyboard ile tamamlanır. Focus state her zaman görünürdür ve `color.focus.ring` token'ından gelir.
2. **Katman davranışı:** dialog, drawer, search overlay ve explanation panel focus trap uygular; Escape açık katmanı kapatır; kapanışta focus tetikleyiciye döner. Bu üçlü davranış Radix'ten gelir ve Playwright ile doğrulanır.
3. **Tooltip:** hover, focus ve mobile tap üçlüsüyle erişilebilir; yalnızca hover'a bağlı bilgi yoktur.
4. **Dokunma hedefleri:** interactive element'ler ≥44px hedef alana sahiptir; `!`/`?` gibi küçük görünen kontroller görsel boyuttan bağımsız yeterli hedef alanı taşır.
5. **Aria ilişkileri:** `aria-label`, `aria-expanded`, `aria-controls`, `aria-describedby`, `aria-current`, `role="dialog"`, `role="search"` kullanım yerleri ilgili faz dokümanlarında tanımlıdır; axe taraması + kontrat assert'leri ikisi birden uygulanır.
6. **Dark tema kontrastı:** metin/zemin çiftleri AA oranlarını token seviyesinde garanti eder; kontrast testi token dosyası üzerinde otomatik koşar (tek tek component'te değil — kaynak token olduğu için kontrol de token'da). Başlangıç değerleri ölçülmüş oranlarıyla `09A-token-degerleri.md`'dedir; en düşük ölçüm 5.42 (muted/elevated) ile eşiğin üstündedir.
7. **Screen reader:** sayfa değişimi, arama sonuç sayısı, kopyalama başarısı ve panel içerik değişimi duyurulur; landmark yapısı (banner/nav/main/search) tutarlıdır.
8. **Hareket:** tüm animasyonlar (drawer, highlight, accordion) `prefers-reduced-motion` ayarına saygı duyar.

## 2. Nihai Kabul Kriterleri (release kapısı)

| # | Kriter |
|---|---|
| 1 | Uygulama 320px genişlikte yatay scroll üretmeden çalışır |
| 2 | Tüm içerik `src/data/` JSON dosyalarından gelir; koda gömülü içerik yoktur |
| 3 | Navigation `navigation.json`'dan üretilir; kategori/grup adı koda gömülü değildir |
| 4 | Page içeriği block-based structured JSON'dan render edilir; Markdown ve HTML string render yoktur |
| 5 | Codebase'de `dangerouslySetInnerHTML` ve `codeToHtml` kullanımı sıfırdır (CI taraması) |
| 6 | Code block'lar Shiki token pipeline'ı ile renklendirilir |
| 7 | Search MiniSearch ile client-side çalışır; sonuç page + block anchor'a yönlenir ve hedef block highlight alır |
| 8 | Aynı teknik terim farklı page'lerde farklı açıklama gösterebilir (bağlamsal glossary) |
| 9 | Tooltip hover + focus + tap ile erişilebilir |
| 10 | Explanation panel: scroll kilidi + Escape + focus dönüşü sözleşmesi çalışır |
| 11 | axe-core kritik ihlal vermez; kontrast AA doğrulanmıştır |
| 12 | Next.js, backend, database, auth bağımlılığı yoktur; `npm ls` çıktısı yasak listesiyle çapraz kontrol edilir |
| 13 | Tüm CI kapıları yeşildir: type-check, lint, Vitest, içerik doğrulama, Playwright + axe, build |
| 14 | Migration deterministiktir: script'in ikinci çalıştırması diff üretmez |
| 15 | Performans bütçesi: initial JS < 250KB gzip; Shiki ve search index ayrı chunk'tadır |

Kanıt durumu (10 Haziran 2026): #1, #7, #9, #10, #11 Playwright e2e + axe ile (`e2e/`); #2–#6, #8, #12, #14 Vitest birim/kontrat/tarama testleriyle (`tests/`); #13 CI zinciriyle otomatik kanıtlıdır. #13'teki lint kapısı (Biome) henüz kurulu değildir; #15 uygulama JS'i için sağlanır (uygulama ~8KB + vendor ~148KB gzip) ancak otomatik bundle-size kapısı yoktur ve `content` chunk'ı (~389KB gzip) eager yüklenir — ikisi de bilinen açık kalemdir.

## 3. Sürdürülebilirlik Notu

Release sonrası her içerik güncellemesi yalnızca JSON + migration hattından akar; viewer koduna dokunulmaz. Yeni block type ihtiyacı doğarsa sıra değişmez: önce kontrat testi, sonra şema, sonra bileşen, sonra registry kaydı. Bu döngü `02_YENI_MIMARI_SPEC.md`'nin strangler-fig ilkesinin devamıdır: hiçbir değişiklik mevcut yeşil testleri kırmadan ilerleyemez.
