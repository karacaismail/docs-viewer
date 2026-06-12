# 11 — Üretim Yönergesi 6: Content Renderer ve Block Bileşenleri

Bu faz, page'in `blocks` dizisini ekrana çeviren renderer'ı ve 17 block bileşenini (master prompt'un 13 type'ı + 07A ile eklenen `image`, `list`, `lessonHeader` + 11 Haziran'da eklenen `wbsChart` — ADR-0011) üretir. Renderer registry üzerinden çözümleme yapar; switch zinciri oluşmaz. Her block bileşeninin kontrat testi bileşenden önce yazılır.

## Üretilecek Dosyalar

```txt
src/components/content/
  ContentArea.tsx          -> page başlığı + summary + renderer + sayfa içi yapı
  ContentRenderer.tsx      -> blocks.map -> registry çözümü -> block render
  SegmentRenderer.tsx      -> segment dizisi -> inline render (text/term/strong/code)
  blocks/
    HeadingBlock.tsx         CalloutBlock.tsx        TableBlock.tsx
    ParagraphBlock.tsx       DefinitionListBlock.tsx CodeBlock.tsx
    StepListBlock.tsx        ChecklistBlock.tsx      CardGridBlock.tsx
    ComparisonTableBlock.tsx UseCaseBlock.tsx        CaseStudyBlock.tsx
    DividerBlock.tsx         ImageBlock.tsx          ListBlock.tsx
    LessonHeaderBlock.tsx
```

## Renderer Yönergeleri

1. `ContentRenderer` her block'u registry'den çözer, block kök elementine `id={block.id}` verir (anchor hedefi) ve `key` olarak block ID kullanır. Anchor highlight stili bu kök element üzerinden token'la verilir.
2. `SegmentRenderer` tüm inline içeriğin tek render yoludur (`text`, `term`, `strong`, `code`, `link`). `term` segment'i `GlossaryTerm` bileşenine devredilir (Faz 7); glossary kaydı çözülemezse düz metin render edilir. `link` yalnızca dış bağlantıdır ve `noopener` + external-link göstergesiyle render edilir.
3. `ImageBlock` kayıp varlık durumunda (07B §1 bulgusu: mevcut 83 src'nin tamamı şu an kayıp) `alt` + `caption` metnini gösteren erişilebilir fallback render eder; kırık görsel ikonu kullanıcıya gösterilmez.
4. Semantik HTML zorunludur: heading'ler gerçek `h2–h4`, tablolar `caption` + `th scope` ile, stepList `ol`, checklist erişilebilir liste yapısıyla. Kontrat testleri DOM semantiğini assert eder, class adlarını değil.
5. `comparisonTable` ve 5+ sütunlu `table` dar ekranda yatay scroll'a düşmek yerine sütun-kart düzenine kırılır; tablo semantiği kaybolacaksa scroll edilebilir bölge `role` ve etiketle işaretlenir.

## CodeBlock ve Shiki Pipeline'ı

1. Pipeline kilitli karardır: `code string -> Shiki codeToTokens -> token array -> React renderer`. `codeToHtml` ve `dangerouslySetInnerHTML` hiçbir koşulda kullanılmaz; CI'da kaynak taraması bu iki ifadeyi yasaklar.
2. Shiki highlighter tek instance olarak lazy yüklenir; tema (`github-dark-default`, 09A §6'da kilitli) ve dil listesi (`schema`'daki enum) açılışta değil ilk codeBlock render'ında getirilir. Shiki WASM/grammar yükü ana bundle'a girmez — ayrı chunk'tır ve performans bütçesini korur.
3. Tokenization asenkron olduğundan CodeBlock yüklenene dek düz `pre/code` içinde ham kodu gösterir; highlighting geldiğinde token render'a geçilir. İçerik hiçbir anda görünmez durumda kalmaz (progressive enhancement).
4. Desteklenen özellikler: `title`, satır numaraları, `highlightedLines` vurgusu, `copyEnabled` ile panoya kopyalama. Kopyalama düğmesi erişilebilir adıyla render edilir ve başarı geri bildirimi screen reader'a duyurulur.
5. Tokenization hatası (bilinmeyen sözdizimi vb.) block'u düşürmez; düz kod görünümü kalır ve dev ortamında uyarı loglanır.

## Kabul Kriterleri

Faz 6 test listesi yeşildir; codebase'de `dangerouslySetInnerHTML` araması sıfır sonuç döner; registry'ye kayıtlı olmayan type dev'de anlaşılır hata üretir; 16 block type'ın tamamı kontrat testlerinde örneklenmiştir (Storybook ilk kapsam dışıdır — ADR-0002, `01B-adr-0002-storybook.md`; bileşenler story-yazımına uygun izole biçimde kalır).

Ek yetenek (11 Haziran 2026): her sayfanın sağ üstündeki **MD dışa aktarma** butonu, 'İlgili sayfalar' öncesi içeriği (başlık + özet + blocks) `engine/blocksToMarkdown` saf fonksiyonuyla Markdown'a çevirip `<stem>.md` olarak indirir; ref segmentleri site linkine çözülür, terimler düz metne iner, tüm 17 block type eşlenir (kontrat: tests/blocksToMarkdown.test.ts).
