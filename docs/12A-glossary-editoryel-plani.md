# 12A — Glossary Editöryel Planı (12'nin bağlayıcı eki)

Bu doküman, glossary iş yükünü ölçülebilir hale getirir: ne otomatik gelir, ne elle yapılır, hangi sırayla ve hangi bitiş tanımıyla. Sayılar 198 dosyanın taramasından gelir (10 Haziran 2026).

## 1. Envanter — İş Yükünün Tabanı

| Metrik | Değer |
|---|---|
| Otomatik taşınacak term kaydı (`enrich.terms` + terms block) | **613** |
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

Partiler yayını bloklamaz: glossary çekirdeği (613 otomatik kayıt) ilk yayında tam mevcuttur; zenginleştirme yayın sonrası da sürebilir. Yalnızca Parti 1, ilk yayının kabul kapsamındadır — eğitim deneyimi inceltilmemiş panelle çıkmaz.

## 4. Kayıt Başına Bitiş Tanımı (Done Definition)

Zenginleştirilmiş sayılan kayıt: `shortExplanation` tek cümle (~160 karakter tavan, tooltip taşmaz); `longExplanation` en az iki paragraf — kavram + bu bağlamda ne işe yaradığı; `realWorldAnalogy` günlük hayattan somut karşılık (12 §"İçerik Üretim Notu" üslubuyla); uygunsa 2+ `useCases`. Dil tonu sözleşmesi (01) ve `lesson-yazim-rehberi.md` bağlayıcıdır: Türkçe cümle, jargon İngilizce, emir kipi yok.

## 5. Süreç ve Ölçüm

1. Migration raporu parti listelerini üretir (kategori → kayıt listesi + ince `why` işareti + analoji tohumu); editöryel iş bu rapordan ilerler, elle envanter tutulmaz.
2. İlerleme iki metrikle izlenir: zenginleştirilmiş kayıt oranı (parti bazında) ve bağlı page oranı (≥1 term segment'i olan page yüzdesi). İkisi de CI'da bilgi amaçlı raporlanır; kapı değildir — içerik doğrulama kapısı yalnızca referans bütünlüğünü (her `termId` çözülür) zorlar.
3. Tahmini efor, planlama içindir ve bağlayıcı değildir: A kaydı ~10 dk (Parti 1 ≈ 35 saat), B page'i ~10 dk (197 page ≈ 33 saat). Parti 1+2+3 toplamı ~50 saat — tek editörle 2-3 haftalık yarı zamanlı iş.
4. Her parti tek PR ailesiyle gider; içerik PR'ı kod PR'ından ayrıdır ve yalnızca `src/data/` dosyalarına dokunur (14 §3 ilkesi: içerik güncellemesi viewer koduna dokunmaz).
