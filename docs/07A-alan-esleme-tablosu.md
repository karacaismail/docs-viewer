# 07A — Eski Şema → Yeni Block Model Alan Eşleme Tablosu

Bu doküman, migration script'inin (`07-uretim-02-data-migration.md`) yazılmasından önce şart olan resmî alan eşlemesini verir. Tablolar tahmine değil taramaya dayanır: 198 JSON dosyasının tamamı programatik olarak analiz edilmiştir (10 Haziran 2026; 10–11 Haziran'da eklenen 26 aday katalog kaydı ve 12 karar/kavram kaydıyla toplam 236 — yeniler aynı şemayı izler, aday olanlar `state: aday` + `badge` ile işaretlidir). 197 özgün dosya ortak cluster şemasını izler; `ARCHITECTURE-5.json` farklı bir yapıdadır (`$schema`, `meta`, `milestones`…) ve içerik değil spec olduğundan migration kapsamı dışıdır.

## 1. Eski Cluster Şemasının Resmî Dökümü (kanıt: alan frekansları)

| Alan | Tip | Adet/197 | İçerik |
|---|---|---|---|
| `id` | string | 197 | Cluster kimliği |
| `title` / `subtitle` | string | 197 / 196 | Başlık ve özet |
| `cluster` | string | 197 | Eski group ID |
| `order` | int | 197 | Group içi sıra |
| `icon` | string | 197 | Phosphor ikon adı |
| `tags` | string[] | 197 | Etiketler |
| `blocks` | Block[] | 197 | **Mevcut veri zaten block tabanlı** — 21 eski block type |
| `enrich` | object | 197 | Pedagojik katman: `info`, `detail`, `terms`, `lesson`, `stories` |
| `granularity` / `state` | string | 129 / 129 | Kaya/taş/kum ölçeği; wip/done durumu |
| `related` | string[] | 95 | İlgili cluster ID'leri |
| `layer` / `badge` | string | 38 / 37 | Katman etiketi; rozet |

Kritik bulgu: dönüşüm "serbest metin → block" değil, büyük ölçüde **"eski block modeli → yeni block modeli"** çevirisidir. Serbest metin parse'ı yalnızca `enrich.info/detail` ve `paragraph.text` içindeki inline işaretler için gerekir.

## 2. Top-Level Alan Eşlemesi

| Eski alan | Yeni hedef | Kural |
|---|---|---|
| `id` | `page.id` | `page-<konu>` formatına normalize edilir; eski ID → yeni ID tablosu raporda tutulur |
| `title` | `page.title` | Birebir |
| `subtitle` | `page.summary` | Birebir |
| `cluster` | `page.categoryId` | `03-navigation-ia.md` §1 prefix kuralı + override tablosu |
| `order` | `navigation.items[].order` | Page'e değil navigation'a taşınır |
| `icon` | `navigation.items[].icon` | Page içeriği değil, menü meta verisi |
| `tags` | `page.tags` | Birebir; search boost alanı |
| `granularity`, `state`, `badge` | `page.meta` (yeni opsiyonel alan) | Şema genişletmesi gerekir (bkz. §6); viewer'da rozet olarak gösterilebilir |
| `layer` | düşer | Bilgi `categoryId`'de zaten var; çakışma raporda loglanır |
| `related` | `page.related[]` (yeni opsiyonel alan) | Sayfa sonunda "İlgili sayfalar" `cardGrid`'i otomatik üretilir; çözülemeyen referans CI uyarısı |

## 3. Block Type Eşlemesi (eski 21 → yeni model)

| Eski type | Adet | Yeni hedef | Dönüşüm kuralı |
|---|---|---|---|
| `heading` | 316 | `heading` | `level` korunur; `icon` alanı düşer (heading'de ikon yeni modelde yok) |
| `paragraph` | 315 | `paragraph` | `text` → segments: `**…**` → `strong` (227 dosyada var), `` `…` `` → `code` (54), kalan → `text` |
| `callout` | 314 | `callout` | `label` → `title`, `body` → segments. Variant eşlemesi: `info`→info, `tip`→info, `warning`→warning, `critical`→danger, `tr`→info + title'a "TR" öneki. Alternatif: variant enum'una `tip` ve `tr` eklenir — karar §6'da |
| `table` | 155 | `table` | `headers` → `columns`, `rows` → segment parse. **Hücre string veya obje olabilir** — `{text, state?, enrich?}` (24 obje hücre; ilk tarama yalnız string göstermişti): `text` (+` (state)`) düzleştirilir, hücre `enrich.terms` glossary'ye akar. `compact`(30), `filterable`(6), `stateColumn`(2) ilk kapsamda düşer, raporda listelenir |
| `image` | 83 | **`image` — YENİ block type gerekli** | Master prompt'ta image yok; 83 kullanım düşürülemez. Şemaya `{src, alt, caption}` ile eklenir |
| `code` | 52 | `codeBlock` | `lang` → `language`, `content` → `code`, `title` korunur. Dil envanteri: python(17), sql(12), yaml(11), typescript(5), http(2), text(2), sh/bash(2), openfga(1). `openfga` Shiki'de yok → `text` fallback; enum bu listeden kurulur |
| `list` | 52 | **`list` — YENİ block type gerekli** | Düz liste (`ordered` flag, 5 adet ordered); `stepList`/`definitionList`'e zorlamak semantiği bozar. `{ordered?, items: segments[][]}` ile eklenir |
| `kv-row` | 34 | `definitionList` | `pairs[].key` → term, `pairs[].value` → definition |
| `feature-list` | 31 | `definitionList` | `name` → term, `desc` → definition; `critical` flag'i definition'a `strong` vurgusu olarak taşınır |
| `divider` | 16 | `divider` | Birebir |
| `checklist` | 11 | `checklist` | `items[].label` → text, `hint` definition'a eklenir; `storageKey` taşınır — ilerleme `localStorage`'da kalıcıdır (11 Haziran kapanışı; ADR-0006: veri cihazda kalır) |
| `lesson-header` | 10 | **`lessonHeader` — YENİ block type gerekli** | Eğitim kimliği: `{unit, title, level, duration_min, prereq, goals}`; eğitim kategorisinin 10 ünitesinde standart |
| `terms` | 10 | glossary'ye taşınır | Block olarak render edilmez; içerdiği kayıtlar `glossary.json`'a gider (bkz. §4), sayfada term segment işaretlemesiyle yaşar |
| `steps` | 10 | `stepList` | `items[].title` → title, `body` → segments |
| `grid` | 9 | `cardGrid` | `items[].{icon,title,body}` birebir; `tone` alanı cardGrid'e opsiyonel eklenir veya düşer |
| `examples` | 7 | `useCase` | `items[].label` → title, `text` → scenario |
| `user-stories` | 6 | `useCase` | `stories[].{persona,context,outcome}` → title=persona, scenario=context, outcome=outcome |
| `ref-grid` | 3 | `cardGrid` | refs → kart + internal link |
| `layer-cards` | 2 | `cardGrid` — **otomatik** | Kart yapısı (`{tag, name, desc, tone, enrich}`) keşifte düzenli çıktı: `tag — name` → title, `desc` → segments; kart `enrich.terms` glossary'ye akar. 'Elle' kararı uygulamada revize edildi |
| `tree` | 2 | `codeBlock(text)` — **otomatik** | `root {name, children, comment}` yapısı düzenli; ASCII ağaca (`├─/└─` + `# comment`) deterministik çevrilir, monospace render çizimi korur (07B diyagram kararıyla aynı ilke) |
| `granularity-legend` | 1 | `heading` + `definitionList` | Tek kullanım; yedi seviyeli tane-büyüklüğü zinciri otomatik üretilir (11 Haziran kapanışı) |
| `blocks[].enrich` | 165 | bitişik block'lara açılır | Block-level enrich (info 42, lesson 59, detail 20, stories 6, terms 5) yeni modelde yok; ilgili block'un hemen ardına callout/useCase olarak deterministik sırayla eklenir |

## 4. `enrich` Katmanı Eşlemesi (pedagojik içerik)

| Eski alan | Adet/197 | Yeni hedef | Kural |
|---|---|---|---|
| `enrich.info` | 192 | Giriş `callout` (variant info) | Page'in ilk block'u olarak |
| `enrich.detail` | 180 | Block dizisi | Build-time parse: `\n\n` → paragraph sınırı (115 dosyada çok paragraf), `1.` listeler (38) → `stepList`, `-` listeler (54) → `list`, `**`/backtick → segment |
| `enrich.terms` | 191 | **`glossary.json` kayıtları — otomatik üretim** | `term` → label, `meaning` → shortExplanation, `why` → longExplanation, `abbrev_tr`/`abbrev_of` → longExplanation'a açılım cümlesi. termId = `term-<slug(term)>-<pageId>` — bağlamsallık otomatik sağlanır (aynı term farklı page'de farklı kayıt) |
| `enrich.lesson` | 197 | `definitionList` block'u ("Bu konu 7 soruda") | Sabit anahtar seti: `ne, nicin, nasil, nerede, ne_zaman, kim, analoji` (+16 dosyada `frontend`, `backend`). Anahtar → Türkçe soru etiketi (term), değer → definition. `analoji` ayrıca glossary `realWorldAnalogy` adayıdır |
| `enrich.stories` | 139 | `useCase` block'ları | Tek tip şekil: `{persona, context, outcome}` → §3'teki user-stories kuralıyla aynı |

Bu tablo `07-uretim-02-data-migration.md`'deki bir kuralı revize eder: glossary "tamamen editöryel" değildir. **`enrich.terms` + terms block verisi otomatik taşınır — migration ölçümü 679 bağlamsal kayıt** (item-level enrich dahil; 391 benzersiz label, 29'u çok bağlamlı); editöryel akışlar ve parti planı `12A-glossary-editoryel-plani.md`'dedir. Otomatik label-eşlemenin sınırı 12A §3a'da daraltılarak revize edilmiştir: **aynı page'in kendi kaydına birebir kelime eşleşmesi** yanlış-bağlam riski taşımadığı için migration'da otomatize edilir (paragraph, ilk geçiş); cross-page ve fuzzy eşleme yasak kalır ve yalnızca raporlanır.

## 5. İstisna Dosyalar

| Dosya | Karar |
|---|---|
| `ARCHITECTURE-5.json` | Kapsam dışı — viewer içeriği değil, mimari spec; `docs/adr/` arşivine |
| Çift kopyalar (`aa0a-*`, `atonote-*`) | İlk kopya kaynak, ikincisi atlanır (07 §6 kuralı) |
| `00-overview.json` içindeki 9 ürün kategorisi listesi | `urunler` kategorisinin Rail 2 grup tanımına girdi olur (03 §2) |

## 6. Yeni Modelde Gerekli Şema Değişiklikleri (bu analizden doğan kararlar)

1. Üç yeni block type: `image`, `list`, `lessonHeader` — `04-veri-modeli.md` §3 ve `06-uretim-01-schema.md` union'ına eklenir.
2. `callout.variant` kararı: eşleme (5→3) bilgi kaybetmez ama `tip` (99 kullanım) ile `info` ayrımı görsel olarak yok olur. Öneri: enum `info/tip/warning/danger/tr` olarak genişletilir; render'da tip ve tr kendi ikonunu alır.
3. `page.meta` (granularity, state, badge) ve `page.related[]` opsiyonel alanları eklenir.
4. `codeBlock.language` enum'u gerçek envanterden kurulur: `python, sql, yaml, typescript, bash, http, text` (+`sh`→bash, `openfga`→text normalize).
5. `cardGrid` kartlarına opsiyonel `tone` alanı (7 kullanım) — eklenmezse düşürme kararı rapora yazılır.

Elle dönüşüm yükü uygulamada 5'ten 1'e indi: `layer-cards` ve `tree` kaynak yapıları düzenli çıktığı için otomatikleştirildi (yukarıdaki revize satırlar); son kalan `granularity-legend` da 11 Haziran'da otomatikleşti — elle dönüşüm kuyruğu boş.

## 3a. Uygulama Keşifleri (kod-doğumlu kararlar — bu tabloya geri işlendi)

Migration yazımı sırasında tablo öngörülerini düzelten dört keşif yapıldı ve hepsi yukarıya/04'e işlendi:

1. **`{{ref:x}}` iç-referans sözdizimi:** kaynak içerikte (kv-row değerleri, ref-grid) sayfalar birbirine eski cluster id'siyle atıf veriyor. Yeni `ref` segment type'ı doğdu (04 §4); runtime'da `sourceId`/stem üzerinden slug'a çözülür, çözülemezse düz metne düşer (08 §4 fallback ilkesi).
2. **`page.sourceId` alanı:** `related` ve `{{ref}}` çözümü eski id uzayında çalışmak zorunda — stem (`kernel-authz`) ile eski id (`k-authz`) farklı. Çözüm iki anahtarlıdır; bu alan eklenmeden 165 related referansı kayıptı.
3. **Tablo hücre objesi:** §3 tablosundaki revize satır — ilk örneklem taraması `s-*` dışını kapsamadığı için obje hücreler görünmemişti; üründe `[object Object]` olarak yüzeye çıktı ve düzeltildi.
4. **tree/layer-cards otomasyonu:** 'elle dönüşüm' kararı, kaynak yapıların düzenli çıkması üzerine otomatikleştirildi — pozitif sapma, yukarıdaki satırlarda revize.
