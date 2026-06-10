# 12A — Glossary Editöryel Planı (12'nin bağlayıcı eki)

Bu doküman, glossary iş yükünü ölçülebilir hale getirir: ne otomatik gelir, ne elle yapılır, hangi sırayla ve hangi bitiş tanımıyla. Sayılar 198 dosyanın taramasından gelir (10 Haziran 2026).

## 1. Envanter — İş Yükünün Tabanı

| Metrik | Değer |
|---|---|
| Otomatik taşınacak term kaydı (`enrich.terms` + terms block) | **679** (migration ölçümü; item-level enrich dahil) |
| Benzersiz label | 391 |
| Birden çok page'de geçen label (bağlamsal varyant) | 29 — bağlamsal glossary tasarımını doğrular (`component` benzeri: aynı kelime, farklı bağlam) |
| Terms'süz dosya | 1 (`70-edu-overview` — müfredat girişi, terim yükü bilinçli düşük) |
| `realWorldAnalogy` aday havuzu (`enrich.lesson.analoji`) | 197 page — page-seviyesi analoji; yalnızca terimin page'in çekirdek kavramı olduğu yerde tohum olarak kullanılır |
| `shortExplanation` kaynağı (`meaning`) | Median 55 karakter — tooltip için yeterli |
| `longExplanation` kaynağı (`why`) | **Median 50 karakter — panel için ince**; editöryel zenginleştirmenin ana nedeni |

Kategori dağılımı (term/dosya): edu 210/28 · s 102/64 · cc 80/14 · scale 47/15 · sus 42/12 · l1+layer1 37/12 · kernel+k 31/8 · fe 13/9 · stack 12/12 · kalan ~38.

## 2. İş Tanımları

Editöryel iş üç ayrı akıştır; karıştırılmaz, ayrı izlenir:

**A — Zenginleştirme:** otomatik kaydın `longExplanation`'ı `meaning + why` birleşiminden doğar ama panel pedagojisi için incedir. Editör kaydı genişletir, `realWorldAnalogy` yazar (analoji havuzundan veya sıfırdan), uygunsa `useCases` ekler. `caseStudies` opsiyoneldir ve page'deki `useCase` block'larıyla **çiftlenmez** — aynı hikaye iki yerde yaşamaz; glossary'deki vaka terimi, page'deki vaka konuyu anlatır.

**B — Segment bağlama:** paragraph metinlerindeki kelimeleri `term` segment'ine çevirmek. Otomatik yapılmaz (07A kuralı: yanlış bağlam riski); migration raporundaki aynı-page birebir eşleşme adayları işlenir. Kural: bir terimin page içindeki **ilk** geçişi bağlanır, tekrarları bağlanmaz (görsel gürültü ve tooltip yorgunluğu — 60+ kullanıcı için kritik).

**C — Yeni terim:** açıklama gerektiren ama `enrich.terms`'te olmayan jargon. Kaynak: editörün okuma geçişi + arama loglarının ileride göstereceği boş sonuçlar.

## 3. Öncelik Sırası — Okuma Akışıyla Aynı

Sıralama ilkesi `03 §1` ile aynıdır: kullanıcı nereden okumaya başlıyorsa zenginleştirme oradan başlar. Pedagojik katmanın değeri eğitim yolunda en yüksek, referans kataloglarında (`s-*`) en düşüktür.

| Parti | Kapsam | Term hacmi | İş |
|---|---|---|---|
| 1 | Eğitim Yolu (28 page) | 210 | A tam + B tam — pedagojik çekirdek; `analoji` havuzunun en verimli olduğu yer |
| 2 | Bağlamsal varyantlar (29 label, ~70 kayıt) | ~70 | A tam — aynı kelimenin farklı bağlam açıklamaları glossary tasarımının vitrini; tutarsızlık burada en görünür |
| 3 | Genel Harita + Kernel + Scale + Atomic | ~85 | A tam + B tam — mimarinin temel kavram seti |
| 4 | Crosscut (`cc-*`) + Sürdürülebilirlik | 122 | A seçmeli (uzunluğu yetersiz olanlar) + B tam |
| 5 | Layer 1 + Stack + DX + Build + FE + LandX | ~110 | A seçmeli + B tam |
| 6 | Ürün Modülleri (`s-*`, 64 page) | 102 | Yalnızca B + A'sız yayın kabul — kayıtlar tooltip seviyesinde yeterli; panel inceliği referans içerikte tolere edilir |

Partiler yayını bloklamaz: glossary çekirdeği ilk yayında tam mevcuttur; zenginleştirme yayın sonrası da sürebilir. Yalnızca Parti 1, ilk yayının kabul kapsamındadır — eğitim deneyimi inceltilmemiş panelle çıkmaz.

## 3a. Uygulama Durumu (10 Haziran 2026)

Ölçülen otomatik hacim 679 kayıttır (613 tahmini, block-level terms dahil edilince büyüdü). **Parti 1'in A akışı tamamlandı:** 199 benzersiz Eğitim Yolu terimi için elle yazılmış `realWorldAnalogy` + `useCases` overlay'i (`tools/migrate/glossary-enrichment.json`) ve tüm kayıtlarda iki paragraflı `longExplanation` (kavram ¶ gerekçe; çekirdek terimlerde üçüncü bağlam paragrafı). Kapsama: **214/215 (%99)**, mutabakat raporunda metrik olarak izleniyor. `caseStudies` bilinçli boş bırakıldı (§2-A kuralı: page'deki useCase block'larıyla çiftlenmez).

Sapma kaydı: §2-A "kaynaktaki `enrich.terms`" yerine **overlay dosyası** kullanıldı — 28 kaynak dosyaya dağılmak yerine editöryel katman tek dosyada diff'lenebilir kalır ve kaynak clusters bozulmaz; migration overlay'i `foldTurkish(label)` anahtarıyla yalnız `egitim` kategorisine uygular. Bu karar ADR-0005 olarak kayıtlıdır (`01E-adr-0005-glossary-overlay.md`); 15 §3 buna göre güncellenmiştir.

**Parti 1-B durumu:** segment bağlama uygulandı — ikinci sapma kaydıyla. §2-B'nin "otomatik yapılmaz" kuralının gerekçesi yanlış bağlam riskiydi; **aynı page'in kendi glossary kaydına, birebir kelime eşleşmesiyle** bağlama bu riski yapısal olarak taşımaz (kayıt zaten o page'in bağlamıdır). Bu daraltılmış kapsam migration'da otomatize edildi (`tools/migrate/bindTerms.mjs`): yalnız paragraph block'ları, page başına terim başına ilk geçiş, ≥3 karakter label, uzun label önceliği; cross-page ve fuzzy bağlama yasak kalır. Ölçüm: **70 bağlı terim, 22/28 egitim page'i** (kalan 6 page'de label'lar paragraph metninde birebir geçmiyor — definitionList/callout içinde yaşıyorlar; oraya bağlama §2-B kapsamı dışıdır). Doğrulama: `tests/bindTerms.test.ts` (ilk-geçiş, referans bütünlüğü, cross-page yasağı, kategori kapsamı) + `e2e/viewer.spec.ts` ikili kontrol testi. Terimler ayrıca sayfa üstü chip'lerle erişilebilir kalır. Parti 2–6 başlamadı.

## 4. Kayıt Başına Bitiş Tanımı (Done Definition)

Zenginleştirilmiş sayılan kayıt: `shortExplanation` tek cümle (~160 karakter tavan, tooltip taşmaz); `longExplanation` en az iki paragraf — kavram + bu bağlamda ne işe yaradığı; `realWorldAnalogy` günlük hayattan somut karşılık (12 §"İçerik Üretim Notu" üslubuyla); uygunsa 2+ `useCases`. Dil tonu sözleşmesi (01) ve `lesson-yazim-rehberi.md` bağlayıcıdır: Türkçe cümle, jargon İngilizce, emir kipi yok.

## 5. Süreç ve Ölçüm

1. Migration raporu parti listelerini üretir (kategori → kayıt listesi + ince `why` işareti + analoji tohumu); editöryel iş bu rapordan ilerler, elle envanter tutulmaz.
2. İlerleme iki metrikle izlenir: zenginleştirilmiş kayıt oranı (parti bazında) ve bağlı page oranı (≥1 term segment'i olan page yüzdesi). İkisi de CI'da bilgi amaçlı raporlanır; kapı değildir — içerik doğrulama kapısı yalnızca referans bütünlüğünü (her `termId` çözülür) zorlar.
3. Tahmini efor, planlama içindir ve bağlayıcı değildir: A kaydı ~10 dk (Parti 1 ≈ 35 saat), B page'i ~10 dk (197 page ≈ 33 saat). Parti 1+2+3 toplamı ~50 saat — tek editörle 2-3 haftalık yarı zamanlı iş.
4. Her parti tek PR ailesiyle gider; içerik PR'ı kod PR'ından ayrıdır ve yalnızca `src/data/` dosyalarına dokunur (14 §3 ilkesi: içerik güncellemesi viewer koduna dokunmaz).
