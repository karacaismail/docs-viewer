# 13A — Türkçe Arama Normalizasyonu (13'ün bağlayıcı eki)

Bu doküman, MiniSearch'ün `processTerm` katmanında uygulanacak Türkçe normalizasyon sözleşmesini tanımlar. Sorun gerçek ve ölçülmüştür: içerikte 43.000'in üzerinde Türkçe diakritikli karakter (ı 18.159, ü 8.352, ş 6.116, İ 753…) ve İngilizce jargon iç içedir — bu, kilitli içerik dili kararının (Türkçe cümle + orijinal İngilizce terim) doğrudan sonucudur.

## 1. İki Problem

### İ/I lowercase tuzağı
JavaScript `toLowerCase()` locale-bağımsızdır: `"İ".toLowerCase()` çıktısı `i + U+0307` (combining dot, 2 code unit) üretir — `"i"` ile **eşleşmez**. `toLocaleLowerCase('tr')` ise ters yönden kırar: İngilizce jargonun `"ID"`'si `"ıd"` olur ve kullanıcının yazdığı `id` ile eşleşmez. İçerik karışık dilli olduğu için iki yerleşik yöntem de tek başına yanlıştır. Kanıt: içerikte hem Türkçe büyük İ'li kelimeler (İlan, İlkeleri) hem `I` ile başlayan İngilizce kısaltmalar (IBAN, IAM, IANA, ICU, I01–I05 modül kodları) birlikte yaşıyor.

### Diacritic toleransı ve içeriğin kendi tutarsızlığı
Kullanıcı Türkçe klavyede olmayabilir (`surdurulebilirlik` yazar, `sürdürülebilirlik` arar). Daha önemlisi tarama, **içeriğin kendisinde** 47 çift-yazım grubu buldu: `doküman/döküman/dokuman`, `farklı/farkli`, `açıklama/aciklama`… Normalizasyon olmadan bu kayıtlar index'te ayrı terimlere bölünür ve sonuç kümesi yazım şansına göre değişir. Fold, sorgu toleransından önce index bütünlüğü meselesidir.

## 2. Karar: Tek Deterministik Fold Fonksiyonu

```txt
fold(term):
  1. İ -> i, I -> i, ı -> i        (lowercase'ten ÖNCE — locale belirsizliği doğmadan)
  2. toLowerCase()                  (artık güvenli: İ/I kalmadı)
  3. Unicode NFD ayrıştırması
  4. Combining mark'ları (Mn kategorisi) at  -> ç→c, ğ→g, ö→o, ş→s, ü→u; U+0307 kalıntısı da temizlenir
```

Adım sırası sözleşmenin parçasıdır: İ/I dönüşümü lowercase'ten önce yapılmazsa combining dot üretilir. Fonksiyon gerçek veri üzerinde doğrulanmıştır (10 Haziran 2026):

| Girdi | Çıktı |
|---|---|
| `İdempotency` | `idempotency` |
| `Sürdürülebilirlik` | `surdurulebilirlik` |
| `ILIŞKI` | `iliski` |
| `ÇOK KİRACILIK` | `cok kiracilik` |
| `IBAN`, `ID` | `iban`, `id` |
| `E-Belge` | `e-belge` |

Türkçe karakterlerin tamamı 1:1 dönüştüğü için string uzunluğu ve karakter pozisyonları korunur — sonuç parçasında eşleşme vurgusu yapılacaksa pozisyon haritalaması bozulmaz.

## 3. MiniSearch Entegrasyonu

1. Fold fonksiyonu MiniSearch kurulumunda `processTerm` olarak verilir. MiniSearch, `processTerm`'ü hem indeksleme hem sorgu tarafında varsayılan olarak uygular; `searchOptions` içinde ayrı bir `processTerm` **tanımlanmaz** — iki tarafın ayrışması bu mimarinin bilinen hata sınıfıdır.
2. Fonksiyon `src/engine/` altında tek modülde yaşar (örn. `foldTurkish.ts`) ve hem MiniSearch konfigürasyonu hem testler aynı import'u kullanır. İleride `loadJSON` ön-serileştirmesine geçilirse (13 §"Index" — ilk kapsam dışı) aynı fonksiyonun verilmesi zorunludur; bu koşul oraya not edilmiştir.
3. Tokenizer varsayılan kalır (Unicode boşluk/noktalama ayrımı): `multi-tenancy` → `multi` + `tenancy` parçaları aranabilir olur; jargon sözleşmesiyle uyumludur.
4. Fold, `13 §2`'deki fuzzy kalibrasyonunu hafifletir: diacritic varyantları artık fuzzy'ye gelmeden birleştiği için fuzzy yalnızca gerçek yazım hatası içindir ve düşük tutulur (testle kalibre kuralı geçerli).
5. Stemming bilinçli olarak **yoktur**: Türkçe eklemeli bir dildir, hafif stemmer'lar hata üretir, tam stemmer bundle bütçesini zorlar; `prefix: true` ek toleransının pratik karşılığını verir (`tenanc` → tenancy) ve jargonun çoğu zaten İngilizcedir. Bu ret, anti-stack defteri mantığıyla buraya kayıtlıdır.

## 4. Test Sözleşmesi (05'in Faz 8 listesine ek)

Fold birim testleri: §2 tablosundaki tüm çiftler + `"İ".toLowerCase()` combining-dot vakasının temizlendiğinin kanıtı. Entegrasyon testleri: `surdurulebilirlik` sorgusu `Sürdürülebilirlik` başlıklı kaydı bulur; `id` sorgusu `ID`/`İd` geçen kayıtları bulur ve `ıd` üretmez; `dokuman` sorgusu üç yazım varyantının tamamını tek sonuç kümesinde döndürür; aynı sorgunun foldlu/foldsuz sonuç sayısı farkı regresyon olarak izlenir.
