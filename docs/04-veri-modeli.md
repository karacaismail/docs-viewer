# 04 — Veri Modeli Sözleşmeleri

Bu doküman, dört statik veri dosyasının yapısal sözleşmesini tanımlar. Alan listeleri yapıyı gösterir; örnek veri doldurulmaz. Şemaların tek doğruluk kaynağı Zod tanımlarıdır (`06-uretim-01-schema.md`); buradaki tablolar o şemaların insan-okur özetidir.

## 1. Veri Dizini

```txt
src/
  data/
    navigation.json        -> Rail 1/2 ağacı (yapısı: 03-navigation-ia.md §5) — eager
    pages-index.json       -> page metadata'sı (id, slug, title, summary, meta, related) — eager
    pages/<stem>.json      -> page gövdesi (blocks) — page-başına lazy chunk (14 #15)
    glossary.json          -> terim core'u (label + shortExplanation; tooltip/chip) — eager
    glossary-detail.json   -> panel içeriği (long/analogy/useCases) — lazy
    search-index.json      -> MiniSearch kaynak dokümanları — lazy
```

Eager/lazy bölünmesi performans bütçesinin (14 #15) yapısal karşılığıdır ve `size-limit` CI kapısıyla korunur. Tüm dosyalar migration tarafından üretilir, elle düzenlenmez ("generated — elle düzenleme yasak" işareti).

## 2. Page Modeli

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| `id` | string (`page-*`) | evet | Kalıcı kimlik |
| `slug` | string | evet | Route eşleşmesi |
| `title` | string | evet | |
| `summary` | string | evet | Rail 2 ve search'te görünür |
| `categoryId` | string | evet | Rail 1 referansı |
| `tags` | string[] | hayır | Search boost alanı |
| `sourceId` | string | hayır | Eski cluster id'si — `{{ref:x}}` ve `related` çözüm anahtarı (kaynak veri eski id ile referans verir, 07A §3a) |
| `meta` | { granularity?, state?, badge? } | hayır | Eski şemadan taşınan rozet bilgisi (07A §2) |
| `related` | string[] (pageId) | hayır | Sayfa sonu "İlgili sayfalar" cardGrid'i |
| `blocks` | Block[] | evet | Sıralı içerik |

## 3. Block Modeli

Her block iki ortak alan taşır: `id` (benzersiz, anchor hedefi) ve `type` (discriminated union ayracı). Desteklenen type'lar ve type'a özgü alanlar:

| Type | Özgü alanlar |
|---|---|
| `heading` | `level (2-4)`, `text` |
| `paragraph` | `segments[]` |
| `callout` | `variant (info/tip/warning/danger/tr)`, `title?`, `segments[]` — variant seti mevcut içerik envanterinden (07A §6) |
| `definitionList` | `items[]: { term, definition: segments[] }` |
| `stepList` | `steps[]: { title, segments[] }` |
| `checklist` | `items[]: { text, checked? }` |
| `table` | `caption?`, `columns[]`, `rows[][]` (hücre = segments; kaynak hücre objesi `{text, state?, enrich?}` migration'da düzleştirilir — 07A §3) |
| `codeBlock` | `title?`, `language`, `code`, `showLineNumbers?`, `highlightedLines?`, `copyEnabled?` |
| `cardGrid` | `cards[]: { icon?, title, segments[] }` |
| `comparisonTable` | `caption?`, `columns[]`, `rows[]` (boyut/karşılaştırma semantiği) |
| `useCase` | `title`, `scenario: segments[]`, `outcome?: segments[]` |
| `caseStudy` | `title`, `story: segments[]` |
| `divider` | — |
| `image` | `src`, `alt`, `caption?` — mevcut içerikte 83 kullanım (07A §3) |
| `list` | `ordered?`, `items[]: segments[]` — düz liste; stepList'ten ayrı semantik |
| `lessonHeader` | `unit`, `title`, `level`, `durationMin`, `prereq[]`, `goals[]` — eğitim üniteleri |

Bilinmeyen `type` build hatasıdır; runtime'a asla sızmaz (fail loudly).

## 4. Segment Modeli (inline içerik)

Paragraph ve benzeri block'ların metni segment dizisidir; Markdown veya HTML yoktur:

| Segment type | Alanlar | Amaç |
|---|---|---|
| `text` | `text` | Düz metin |
| `term` | `text`, `termId` | Glossary etkileşimi — noktalı underline + tooltip + panel |
| `strong` | `text` | Vurgu |
| `code` | `text` | Inline kod |
| `link` | `text`, `href` | Yalnızca dış bağlantı; `target=_blank` + `rel=noopener` (07B §2) |
| `ref` | `text`, `refId` | İç sayfa bağlantısı — kaynak içerikteki `{{ref:x}}` sözdiziminden (07A §3a keşfi); runtime'da eski cluster id veya stem üzerinden slug'a çözülür, çözülemezse düz metne düşer |

`termId` çözülemezse segment düz metin gibi render edilir; kullanıcıya hata gösterilmez, CI'da uyarı üretilir.

## 5. Glossary Modeli

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| `id` | string (`term-<kavram>-<baglam>`) | evet | Bağlama özel |
| `pageId` | string | evet | Hangi bağlamda geçerli |
| `label` | string | evet | Görünen terim |
| `shortExplanation` | string | evet | Tooltip + `!` kontrolü |
| `longExplanation` | string | evet | `?` kontrolü — explanation panel |
| `realWorldAnalogy` | string | hayır | Pedagojik katman |
| `useCases` | string[] | hayır | |
| `caseStudies` | { title, story }[] | hayır | |

Global tek anlamlı glossary yasağı burada somutlaşır: `component` kavramı render-engine bağlamında ve design-system bağlamında ayrı kayıtlardır.

Fiziksel saklama mantıksal modeli ikiye böler (§1, 14 #15): ilk dört alan `glossary.json` core'unda (eager — tooltip/chip), `longExplanation` ve sonrası `glossary-detail.json`'da (lazy — panel açılışında, termId anahtarıyla).

## 6. Search Document Modeli

| Alan | Kaynak |
|---|---|
| `id` | `search-<pageId>-<blockId>` |
| `pageId`, `pageTitle`, `slug` | page |
| `blockId`, `blockType` | block |
| `title` | en yakın üst heading |
| `text` | block'un düzleştirilmiş metni (segment'ler birleştirilir) |
| `terms` | block içindeki term label'ları |

Glossary kayıtları da ayrı search document üretir (label + shortExplanation + longExplanation + useCases + caseStudies düzleştirilir). MiniSearch `fields` indekslenecek alanları, `storeFields` sonuçta taşınacak alanları (slug, blockId, pageTitle) tanımlar.

## 7. Şema Evrimi

Veri dosyaları kök seviyede `schemaVersion` alanı taşır. Kırıcı değişiklik versiyonu artırır ve bir dönüştürme script'i eşlik eder; değişiklikler `src/data/MIGRATIONS.md`'de kayıt altına alınır. Bu kural v4 spec'inden (`02_YENI_MIMARI_SPEC.md` §3) devralınmıştır.
