# 07B — Block Type Kapsama Analizi

Bu doküman, hedef block modelinin (master prompt'un 13 type'ı + `07A` ile eklenen `image`, `list`, `lessonHeader`) mevcut içeriğin **gerçek desenlerini** yüzde yüz karşılayıp karşılamadığını doğrular. Yöntem: 198 dosyanın tamamında tüm string alanlar (block gövdeleri, tablo hücreleri, `enrich.info/detail/terms/lesson/stories`, item değerleri) desen bazlı tarandı — iç içe liste, diyagram, markdown kalıntısı, link, HTML, uzun tablo, emoji. Tarama tarihi: 10 Haziran 2026. Sonuç önden: model, aşağıdaki dört şema kararıyla birlikte **tam kapsar**; otomatik dönüşüm dışında kalan yük 8 dosyada sınırlıdır.

## 1. Kapsama Matrisi — Soru Bazlı Bulgular

### İç içe listeler
Block düzeyindeki 52 `list`'in item'larında iç içe yapı **yok** (tamamı düz string). Girintili liste yalnızca 3 dosyanın `enrich.detail` markdown'ında var (`163-cc-compliance-matrix`, `166-cc-resolver-ops`, `130-l1-search-deep`). Karar: `list` block'u tek seviye kalır; bu 3 dosyada migration ikinci seviyeyi üst item'ın devam cümlesine düzleştirir ve raporda işaretler — 3 dosya için şemaya nesting karmaşıklığı eklemek maliyetine değmez.

### Diyagram benzeri yapılar
İki kaynakta yaşıyor: 2 adet `tree` block (07A'da zaten elle dönüşüm) ve `enrich.detail` içindeki 42 code fence'in 5'inde ASCII diyagram/akış çizimi (`├ └ →` karakterleri). Karar: ASCII diyagramlar `codeBlock language=text` olarak taşınır — monospace render çizimi korur, ayrı bir diagram block type'ına gerek yoktur. Mermaid benzeri yapılandırılmış diyagram dili içerikte **hiç yok**; ileride ihtiyaç doğarsa yeni block type açılır (Open-Closed).

### Uzun karşılaştırmalar
155 tablonun sütun dağılımı: 2 sütun (47), 3 (68), 4 (33), 5 (6), 6 (1). 20 satırı aşan yalnızca 3 tablo var. Karar: tamamı `table` block'una gider; `comparisonTable` migration'da **hiç üretilmez**, editöryel kullanım için rezerve kalır. 5–6 sütunlu 7 tablo, layout yönergesindeki dar-ekran kuralının (09 §"comparisonTable") `table` için de geçerli olduğunu doğrular — kural her iki type'ı kapsayacak şekilde okunur.

### `enrich.detail` içindeki markdown kalıntıları (07A §4 kuralına bağlayıcı ek)
Tarama, 07A'nın "paragraf + liste + bold/backtick" varsayımından fazlasını buldu; detail parser'ı şunları da işlemek zorundadır:

| Desen | Yaygınlık | Hedef |
|---|---|---|
| Code fence (```) | 42 fence: dilsiz (çoğunluk), sql(19), javascript(3), json(3), css(2), html(2) | `codeBlock`; dilsiz → `text` |
| Markdown tablo (`\|...\|`) | 12 dosya (ağırlıkla yeni `cc-*` ve `s-*` dosyaları) | `table` block parse |
| Markdown heading (`#`) | 3 dosya | `heading` block parse |
| Girintili liste | 3 dosya | Düzleştirme (yukarıda) |
| Markdown link `[x](url)` | 2 dosya, 4 adet (`70-edu-overview`, `31-stack-ai`) | **`link` segment — yeni segment type** (§2) |
| Ok işaretleri (→, =>) | Yaygın (yüzlerce, tüm alanlarda) | Düz metin — özel işlem yok |
| Emoji | 1 dosya (`172-cc-cultural-ux`, içerik örneği olarak meşru) | Düz metin korunur |

### HTML görünümlü etiketler
Taramada görünen `<entity>`, `<id>`, `<jwt>`, `<uuid>` türü ifadeler HTML değil, teknik placeholder notasyonudur (`/api/<entity>/<id>` gibi) ve `code` segment/`codeBlock` içinde düz metin olarak korunur. Gerçek HTML etiketleri (`<html>`, `<p>`, `<script>`…) yalnızca code fence'lerin **içinde** (HTML kod örneği olarak) bulundu. Sonuç: render edilecek HTML içerik **sıfırdır** — HTML string render yasağı içerikle çelişmiyor, doğrulandı.

### Image varlıkları — kırık referans bulgusu
83 `image` block'unun tamamı `/assets/...` yoluna işaret ediyor ve **bu dosyaların hiçbiri repo'da mevcut değil** (muhtemelen eski viewer'ın build çıktısında yaşıyorlardı). Karar üç parçalıdır: migration, `public/assets/`'te karşılığı olmayan src'leri rapora "kayıp varlık" olarak yazar; `image` block şemada kalır (07A kararı geçerli); ImageBlock yüklenemeyen görselde `alt` + `caption` metnini gösteren erişilebilir fallback render eder. *Kapanış (10 Haziran 2026):* varlıkların tamamı (`103` — 83 özgün + 20 aday katalog kartı) `tools/assets/generate.mjs` ile deterministik üretilir — 09A token renkleriyle üç şablon ailesi: 70 ürün kartı (`stack/s-*`: ürün adı + grup rozeti + katman pozisyonu motifi), 13 adlandırılmış diyagram (alt metnin tarif ettiği şema: katman piramidi, outbox akışı, DocType çıktıları, bitemporal eksenler…) ve 20 paket kartı (`cards/`: aday stack/distribution/modül/kavram — tür etiketi + ADAY damgası). Bütünlük iki yerde kapılıdır: migration raporu (kayıp=0) + içerik doğrulama testi (her src `public/assets`'te var). Fallback güvence olarak yürürlükte kalır.

## 2. Şema Etkileri (07A §6'ya ek — 04 ve 06'ya yansıtıldı)

1. **Yeni segment type: `link`** — `{ text, href }`. Yalnızca dış bağlantılar için; `target=_blank` + `rel=noopener` ile render edilir ve external-link göstergesi taşır. İç sayfa bağlantısı bu segment'le yapılmaz (iç gezinme navigation + related + term sözleşmelerinden yürür).
2. **`codeBlock.language` enum genişlemesi:** fence envanterinden gelen `javascript`, `json`, `css`, `html` eklenir. Nihai enum: `python, sql, yaml, typescript, javascript, json, css, html, bash, http, text`.
3. `comparisonTable` migration hedefi değildir; editöryel rezervdir (bu bir şema değişikliği değil, üretim kuralıdır).
4. `list` tek seviye kalır (nesting yok) — bilinçli sadelik kararı.

## 3. Kapsama Sonucu

| Kategori | Hacim | Durum |
|---|---|---|
| Otomatik block-to-block dönüşüm | 21 eski type'ın 18'i, ~1.400 block | Tam kapsanıyor |
| Otomatik markdown parse (detail/info) | 180 dosya; fence/tablo/heading dahil | §1 kurallarıyla kapsanıyor |
| Elle dönüşüm | 5 block (layer-cards 2, tree 2, granularity-legend 1) | 07A kararı değişmedi |
| Düzleştirme + rapor | 3 dosya (girintili liste) | Bilgi kaybı yok, biçim sadeleşir |
| Kayıp varlık | 83 image src | Fallback ile yayın engellenmez |

Model bu dört şema kararıyla birlikte mevcut içeriğin tamamını karşılar. Migration script'i (07) bu dokümanı ve 07A'yı birlikte bağlayıcı ek kabul eder; buradaki desen envanterinin dışında bir yapıyla karşılaşırsa sessizce düşürmez — düz `text` segment'e indirger ve rapora uyarı yazar (07 §"Edge Case" kuralının somutlaması).
