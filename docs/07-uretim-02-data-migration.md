# 07 — Üretim Yönergesi 2: Data Migration

Bu faz, mevcut 197 cluster JSON dosyasını (`02-icerik-envanteri.md`) yeni block-based modele dönüştüren build-time script'ini üretir. Alan alan dönüşüm kuralları `07A-alan-esleme-tablosu.md`'de, içerik desenlerinin kapsama doğrulaması ve detail-parser'ın işlemek zorunda olduğu markdown kalıntıları (fence, tablo, heading, link) `07B-block-kapsama-analizi.md`'de tanımlıdır; ikisi bu yönergenin bağlayıcı ekleridir ve script bu tablolara karşı yazılır. Migration tek seferlik değildir; kaynak dosyalar yaşadığı sürece tekrarlanabilir bir üretim hattıdır. Script'in kendi testleri implementasyondan önce yazılır.

## Üretilecek Varlıklar

```txt
tools/
  migrate/
    index.ts              -> orkestrasyon: oku -> dönüştür -> doğrula -> yaz
    readClusters.ts       -> kaynak dosya keşfi (content-source/, ADR-0001) + kategori/prefix eşlemesi
    transformCluster.ts   -> tek cluster -> page + blocks dönüşümü
    extractSegments.ts    -> serbest metin -> segment dizisi
    buildNavigation.ts    -> kategori/grup/item ağacı üretimi
    buildSearchIndex.ts   -> page + glossary -> search documents
    report.ts             -> mutabakat raporu (kaynak/çıktı sayıları, uyarılar,
                             kayıp varlıklar, glossary parti listeleri — 12A §5)
  mapping-overrides.json  -> prefix kuralının istisnaları (tek tablo)
```

Çıktılar `src/data/` altına yazılır ve "generated" işareti taşır.

## Dönüşüm Kuralları

1. **Cluster → page:** `id` → `page-<konu>`, `title`/`subtitle` → title/summary, `cluster`+prefix → categoryId, `tags` korunur. Dosya adındaki numara prefix'i hiçbir kimliğe sızmaz.
2. **`enrich.detail` ve benzeri serbest metin alanları** mevcut veride Markdown benzeri işaret (`**bold**`, listeler) içerir. Bu metin parse edilip block/segment'e dönüştürülür: paragraf sınırları `paragraph` block'u, kalın işaretler `strong` segment, numaralı/maddeli yapılar `stepList`/`definitionList` block'u olur. Markdown çalışma zamanına asla taşınmaz — dönüşüm tamamen build-time'dadır.
3. **Heading üretimi:** her page'in mantıksal bölümleri (info/detail/use case alanları) `heading` block'larıyla bölümlenir; block ID'leri heading konusundan türetilir.
4. **Deterministiklik:** ID üretimi kaynak içeriğin sırasına ve adına bağlı, rastgelelik içermeyen bir fonksiyondur. Aynı girdi her zaman aynı çıktıyı verir; bu, `03-navigation-ia.md` §4 ID kararlılığı kuralının ön şartıdır.
5. **Glossary üretimi (07A §4 ile revize):** glossary boş başlamaz — 191 dosyadaki `enrich.terms` kayıtları (`term/meaning/why/abbrev_*`) otomatik olarak bağlamsal glossary kayıtlarına dönüştürülür; termId `term-<slug(term)>-<pageId>` formülüyle deterministiktir. Editöryel iş iki şeydir: yeni terim yazmak ve `paragraph` metinlerindeki kelimeleri `term` segment'ine bağlamak. Otomatik segment dönüşümü yapılmaz — yanlış bağlam eşleşmesi pedagojik katmanı bozar; script yalnızca aynı page içindeki birebir kelime eşleşmelerini aday olarak raporlar.
6. **Mutabakat:** rapor, kategori başına kaynak/çıktı sayılarını ve atlanan dosyaları listeler. Çift kopya kaynaklar (`aa0a-*`, `atonote-*`) atlanır ve raporda gerekçesiyle görünür.

## Edge Case'ler

Aynı konuya çakışan iki numara (`100-edu-u16-test` / `100-sus-metadata` gibi numara çakışmaları) kimlikte numara kullanılmadığı için sorun üretmez; konu adı çakışırsa script hata verir ve override tablosu karar ister. Parse edilemeyen serbest metin parçası sessizce düşürülmez — `paragraph` içinde düz `text` segment'i olarak korunur ve rapora uyarı düşer.

## Kabul Kriterleri

Üretilen dört dosya tüm Zod şemalarından geçer; içerik doğrulama kapısı (referans bütünlüğü) yeşildir; mutabakat raporunda açıklanmamış kayıp yoktur; script iki kez çalıştırıldığında `git diff` boştur.
