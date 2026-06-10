# 13 — Üretim Yönergesi 8: Search (MiniSearch)

Search ilk kapsamın zorunlu parçasıdır ve tamamen client-side çalışır. Engine MiniSearch'tür; kaynak veri build-time üretilen `search-index.json`'dur. Sonucun hedefi sayfa değil block'tur: seçim, ilgili page'e gider ve block anchor'a iner.

## Üretilecek Dosyalar

```txt
src/components/search/
  SearchButton.tsx       -> topbar tetikleyici (+ Cmd/Ctrl-K kısayolu)
  SearchOverlay.tsx      -> tüm viewport üstü katman (Radix Dialog, role="search")
  SearchInput.tsx
  SearchResults.tsx      -> klavye ile gezilebilir sonuç listesi
src/engine/
  resolveSearchDocuments.ts  -> (Faz 3'te iskeleti kuruldu) index kurulum verisi
```

## Index Yönergeleri

1. MiniSearch yapılandırmasında `fields` indekslenecek alanları tanımlar: pageTitle, title, text, terms, blockType ve glossary alanları (label, shortExplanation, longExplanation, useCases, caseStudies düzleştirilmiş halde). `storeFields` sonuç render'ı için gerekenleri taşır: slug, pageId, blockId, pageTitle, title, blockType.
2. Alan ağırlıkları boost ile verilir: pageTitle ve glossary label en yüksek, heading title orta, gövde metni taban ağırlık. Türkçe içerik için arama davranışı `prefix: true` ve düşük `fuzzy` toleransıyla ayarlanır; agresif fuzziness alakasız sonuç üretir — eşik testle kalibre edilir.
3. **Türkçe normalizasyon:** İ/I lowercase tuzağı ve diacritic toleransı, indeksleme ve sorgu tarafına aynı `processTerm` fold fonksiyonunun verilmesiyle çözülür; sözleşme, adım sırası ve gerçek veri doğrulaması `13A-turkce-arama-normalizasyonu.md`'dedir ve bu yönergenin bağlayıcı ekidir.
4. Index kurulumu lazy'dir: `search-index.json` ve MiniSearch ancak overlay ilk açıldığında yüklenir (ayrı chunk). 197 page ölçeğinde in-memory index milisaniyeler içinde kurulur; ön-serileştirme gerekirse MiniSearch'ün `loadJSON` yolu sonradan eklenebilir — ilk kapsamda değil ve eklenirse aynı `processTerm` fold fonksiyonunun verilmesi zorunludur (13A §3).

## Overlay Davranışı

1. Overlay `role="search"` taşır, açılışta input'a focus verir, arka plan scroll'u kilitler. Sorgu debounce edilir; sonuçlar page bazında gruplanır ve her sonuç pageTitle + en yakın heading + eşleşen metin parçası gösterir.
2. Klavye sözleşmesi: ArrowDown/ArrowUp sonuçlar arasında gezer (input'tan ayrılmadan, `aria-activedescendant` ile), Enter seçili sonucu açar, Escape overlay'i kapatır. Sonuç sayısı değişimi `aria-live` ile duyurulur; boş sonuç durumu görünür ve duyurulur.
3. Sonuç seçimi `/docs/<slug>#<blockId>`'ye navigate eder, overlay kapanır, hedef block scroll edilir ve kısa süreli visual highlight alır. Highlight, `prefers-reduced-motion` durumunda animasyonsuz statik vurguya düşer.
4. Glossary sonucu seçilirse hedef, terimin tanımlandığı bağlam page'idir; panel otomatik açılmaz — kullanıcı bağlamı önce sayfada görür.

## Edge Case'ler

Aynı block birden çok alandan eşleşirse tek sonuç gösterilir (doc ID zaten benzersiz). Index'teki bir kayıt artık var olmayan bir block'a işaret ediyorsa (eski URL senaryosu) anchor kuralı devreye girer: sayfa açılır, başa scroll edilir, hata gösterilmez — ama bu durum içerik doğrulamada zaten yakalanmalıdır. Çok kısa sorgular (≤2 karakter) prefix araması yapmaz; gürültü engellenir.

## Kabul Kriterleri

Faz 8 test listesi yeşildir; search chunk'ı ana bundle dışındadır; Playwright senaryosu "sorgu yaz → ok ile seç → Enter → doğru block highlight'lı görünür" akışını uçtan uca kanıtlar.
