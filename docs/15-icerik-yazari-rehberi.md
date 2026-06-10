# 15 — İçerik Yazarı Rehberi (günlük workflow)

Bu doküman, viewer yayına girdikten sonra içerikle çalışan kişinin el kitabıdır. Temel ilke 14 §3'ten gelir: içerik güncellemesi yalnızca JSON + migration hattından akar, viewer koduna dokunulmaz. Yazar kod bilmek zorunda değildir; bilmesi gereken sözleşmeler bu sayfadadır.

## 1. Yeni Page Eklemek

1. `content-source/` altına yeni cluster JSON dosyası açılır (ADR-0001 §1). Dosya adı sözleşmesi: `NN-kategori-konu.json` — kategori prefix'i `03 §1` tablosundaki Rail 1 eşlemesine uyar; numara yalnızca insan-okur sıralamadır, hiçbir kimliğe sızmaz (07A §2).
2. Zorunlu alanlar doldurulur: `id`, `title`, `subtitle`, `cluster`, `order`, `icon` (Phosphor adı), `tags`, `blocks`. Pedagojik katman (`enrich.info`, `lesson`, `terms`, `stories`) yeni içerikte de teşvik edilir — glossary ve useCase üretimi bu alanlardan beslenir (07A §4).
3. Block'lar `04 §3` type setiyle yazılır. Serbest metin alanlarında markdown alışkanlığı sınırlıdır: bold/backtick/listeler parse edilir (07B §1), ama yeni içerikte doğrudan yapılandırılmış block kullanmak tercihtir — parse bir telafi mekanizmasıdır, yazım biçimi değil.
4. Migration çalıştırılır; mutabakat raporu yeni page'in kategori/grup atamasını, üretilen ID'leri ve uyarıları gösterir. Rapor uyarısız değilse PR açılmaz.
5. Yerel önizlemede kontrol: sayfa Rail 2'de doğru grupta mı, anchor'lar çalışıyor mu, 320px'te taşma var mı.
6. İçerik PR'ı açılır: yalnızca `content-source/` + üretilmiş `src/data/` dosyaları (12A §5.4 — içerik PR'ı kod PR'ından ayrıdır). CI içerik doğrulama kapısı (05 §2.4) referans bütünlüğünü zorlar.

## 2. Mevcut Page'i Güncellemek

Metin düzeltmesi serbesttir; **block silmek ve ID değiştirmek serbest değildir**. ID kararlılığı kuralı (03 §4): yayınlanmış block ID'sine dış bağlantılar ve search index işaret eder. Bir block'un içeriği kökten değişiyorsa eski block kaldırılıp yeni ID ile yeni block eklenir; eski ID'ye gelen hash sessizce sayfa başına düşer — bu davranış bilinçlidir, kırık sayfa üretmez. Page slug'ı hiç değiştirilmez; başlık değişse de slug kalır.

## 3. Glossary Kaydı Eklemek / Zenginleştirmek

İki ayrı yazım yeri vardır ve karıştırılmaz. **Yeni terim** (kayıt + meaning + why) kaynaktaki page'in `enrich.terms`'üne yazılır — glossary migration'da üretilir, elle düzenlenmez (04 §1 "generated" işareti). **Zenginleştirme** (analogy, useCases, ek bağlam paragrafı) ise `tools/migrate/glossary-enrichment.json` overlay'ine yazılır — anahtar `foldTurkish(label)`'dır, kategori kapsamı migration'da tanımlıdır (12A §3a sapma kaydı: editöryel katman tek dosyada diff'lenebilir kalır, kaynak clusters bozulmaz). Bağlam kuralı: terim hangi page'de açıklanıyorsa o page'in kaydıdır; aynı kelimenin başka bağlamı varsa diğer page kendi kaydını taşır (12 §"Çözümleme"). Parti sırası ve bitiş tanımı `12A`'dadır. Paragraph içinde terimi etkileşimli yapmak için bağlama **otomatiktir** (12A §3a): migration, page'in kendi teriminin paragraph'taki ilk birebir geçişini `term` segment'ine çevirir — yazarın tek yapması gereken, terimi page metninde label'ıyla birebir kullanmaktır. Render'da terim noktalı underline + `!` (kısa açıklama) + `?` (uzun açıklama paneli) ikilisiyle görünür (12 §3).

## 4. Görsel Eklemek

Görsel dosyası `public/assets/` altına konur, block `image` type'ı ile `src/alt/caption` taşır (07A §3). `alt` zorunludur ve anlam taşır. Mevcut 83 varlık `npm run assets` üreticisinden gelir (07B §1 kapanışı) — elle çizilmiş SVG bir varlığın yerini alacaksa aynı dosya adına yazılır, üretici o dosyayı yeniden üretmeden önce şablon dışına alınmalıdır. İçerik doğrulama testi her `src`'nin diskte var olmasını zorlar; kayıp src CI'ı kırar.

## 5. Yeni Block Type İhtiyacı

Yazar mevcut type'larla ifade edemediği bir yapıyla karşılaşırsa içeriği en yakın type ile (çoğunlukla `paragraph` + `list`) yazar ve ihtiyacı issue olarak açar. Yeni type kararı geliştirme işidir ve sırası değişmez (14 §3): önce kontrat testi, sonra şema, sonra bileşen, sonra registry kaydı. Yazar bu süreci beklemeden yayınlayabilir — içerik sonradan yeni type'a taşınır.

## 6. Üslup Sözleşmesi (her içerik PR'ında geçerli)

Türkçe cümle, İngilizce jargon korunur (01 §"Dil Tonu"); emir kipi yerine açıklayıcı dil; `lesson-yazim-rehberi.md` pedagojik üslubun kaynağıdır. Okunabilir metin 1rem altına inmediği için (09A §1) "küçük not" yazma alışkanlığı yoktur — not, `callout` block'udur. Çift yazım üretmemek için terimlerin imlasında mevcut glossary kaydı esas alınır; fold mekanizması (13A) yazım tutarsızlığını aramada telafi eder ama içerikte tutarlılık yazarın sorumluluğudur.
