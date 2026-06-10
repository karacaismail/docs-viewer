# 06 — Üretim Yönergesi 1: Schema Katmanı

Schema-first ilkesi gereği bu faz, veri modelinin (`04-veri-modeli.md`) Zod karşılığını üretir. TypeScript tipleri elle yazılmaz; tamamı `z.infer` ile şemadan türetilir. Bu fazın testleri (`05-test-plani.md` Faz 1) implementasyondan önce yazılır.

## Üretilecek Dosyalar

```txt
src/schemas/
  navigation.schema.ts
  page.schema.ts        -> block + segment union'ları dahil
  glossary.schema.ts
  search.schema.ts
  index.ts              -> tüm şemalar + türetilmiş tipler tek noktadan export
```

## Yönergeler

1. Block union'ı `z.discriminatedUnion("type", [...])` ile kurulur; her block type ayrı şema sabitidir. Yeni block type eklemek union listesine bir satır eklemektir — başka dosyaya dokunulmaz. Union, master prompt'un 13 type'ına ek olarak içerik envanterinin zorunlu kıldığı `image`, `list`, `lessonHeader` type'larını kapsar (`07A-alan-esleme-tablosu.md` §6).
2. Segment union'ı aynı desenle kurulur ve `paragraph`, `callout`, `table` hücresi gibi tüm inline alanlar tarafından paylaşılır. Segment şeması tek yerde tanımlanır; kopyalanmaz.
3. ID alanları düz `z.string()` değil, prefix kontrolü yapan refinement'lardır (`page-`, `block-`, `term-`, `search-`). Yanlış prefix'li ID şema seviyesinde yakalanır.
4. Ortak alanlar (id, type) bir base şemada toplanır ve `extend` ile genişletilir; tekrar eden tanım anti-pattern kabul edilir.
5. `codeBlock.language` serbest string değil, Shiki'de yüklenecek dillerin enum'udur. Enum gerçek içerik envanterinden kurulur (`07A` §6 + `07B` §2 fence taraması): `python, sql, yaml, typescript, javascript, json, css, html, bash, http, text`. Desteklenmeyen dil build'de yakalanır, runtime'da Shiki hatasına dönüşmez.
6. Kök dosya şemaları (`NavigationFile`, `PagesFile`, `GlossaryFile`, `SearchIndexFile`) `schemaVersion` alanını zorunlu tutar.
7. Çapraz referans kontrolleri (navigation→page, term segment→glossary) Zod şemasına gömülmez; bunlar engine'in `validateStaticData` adımında ayrı fonksiyonlardır. Şema yapısal doğruluğu, validator bütünlüğü denetler — sorumluluk ayrımı budur.

## Edge Case'ler

Boş `blocks` dizisi geçerlidir (iskelet page); boş `segments` dizisi geçersizdir (anlamsız paragraph). `highlightedLines` satır numaraları 1-tabanlıdır ve negatif/sıfır değer red edilir. `level` alanı 2–4 aralığına sıkıştırılır; h1 yalnızca page title'dan gelir.

## Kabul Kriterleri

Tüm şema testleri yeşildir; `types.ts` benzeri elle yazılmış tip dosyası yoktur; `tsc --noEmit` temizdir; bilinmeyen block type içeren örnek veri, anlaşılır hata mesajıyla red edilir (hata mesajında page ID ve block index yer alır — fail loudly, ama teşhis edilebilir şekilde).
