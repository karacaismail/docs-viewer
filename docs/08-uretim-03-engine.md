# 08 — Üretim Yönergesi 3: Render Engine

Engine, statik JSON'u okuyan, doğrulayan ve UI'ın tüketeceği modele dönüştüren katmandır. God object yasağı gereği tek dosya değil, sorumluluk başına modüldür. Engine UI bilmez: CSS, animasyon, Radix state, tooltip davranışı engine sorumluluğu dışındadır.

## Üretilecek Dosyalar

```txt
src/engine/
  index.ts                  -> dış API yüzeyi (tek import noktası)
  loadStaticData.ts         -> JSON import + tip kazandırma
  validateStaticData.ts     -> şema + çapraz referans doğrulama
  normalizeNavigation.ts    -> kategori/grup/item sıralama, aktif yol çözümü
  resolvePage.ts            -> slug -> page; bulunamazsa fallback model
  resolveTerms.ts           -> term segment -> bağlamsal glossary kaydı
  resolveSearchDocuments.ts -> MiniSearch index kurulumu için doküman seti
  foldTurkish.ts            -> Türkçe fold fonksiyonu — processTerm sözleşmesi (13A)
  blockRegistry.ts          -> type -> component eşlemesi (kayıt noktası)
  scrollToBlockAnchor.ts    -> hash -> DOM scroll + highlight tetikleme
```

## Yönergeler

1. **Yaşam döngüsü:** load → validate → normalize → render. Doğrulama uygulama açılışında bir kez yapılır; dev ortamında hata, sayfa yerine teşhis ekranı render eder (hangi dosya, hangi page, hangi alan). Prod build'e bozuk veri zaten CI kapısından ulaşamaz.
2. **Registry deseni:** `blockRegistry` switch/if zinciri değil, type → component map'idir. Renderer bilinmeyen type ile karşılaşırsa dev'de hata fırlatır, prod'da block'u atlar ve console uyarısı üretir. Registry'ye kayıt, block bileşen modülünün kendi tanımıyla yapılır (Open-Closed: yeni block = yeni dosya + bir kayıt satırı).
3. **Saf fonksiyon kuralı:** resolve/normalize fonksiyonları DOM ve React'tan bağımsız saf fonksiyonlardır; girdi-çıktı testleri jsdom gerektirmez. Yalnızca `scrollToBlockAnchor` DOM'a dokunur.
4. **Fallback modeli:** çözülemeyen slug, boş kategori, eksik term gibi durumlar exception değil, tip düzeyinde temsil edilen fallback değerler döndürür (`PageNotFound` modeli, düz metin segment'i). UI katmanı hata yönetimi yazmaz; engine'in döndürdüğü modeli render eder.
5. **Anchor davranışı:** hash varsa block aranır, bulunursa scroll + kısa visual highlight tetiklenir; bulunamazsa sayfa başına gidilir ve kullanıcıya hata gösterilmez. Highlight süresi ve görseli UI token'larından gelir; engine yalnızca hedef elementi işaret eder.
6. **Bellek modeli:** veri statik olduğundan tüm resolve sonuçları modül seviyesinde memoize edilebilir; ancak memoizasyon ölçüm olmadan eklenmez (performans bütçesi: ilk yük JS < 250KB gzip, içerik dosyaları ayrı chunk).

## Kabul Kriterleri

Engine birim testleri (Faz 3 listesi) yeşildir; `src/engine/` içinde React import'u yalnızca registry'nin component tipi referansında vardır; UI dosyalarından engine'e ters bağımlılık yoktur. Engine → UI import yasağının zorlama mekanizması iki katmanlıdır: Biome genel lint kapısı + `tests/yasaklar.test.ts` içindeki sınır taraması (engine dosyaları components'ten import edemez; React referansı yalnız `blockRegistry.ts`'te ve yalnız type-only olabilir) — CI'da otomatik koşar.
