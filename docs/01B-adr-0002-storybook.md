# 01B — ADR-0002 (viewer serisi): Storybook İlk Kapsam Dışı

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 10 Haziran 2026.

## Bağlam

Master prompt Storybook'u stack listesinde sayar ama "enterprise component review için ayrıca eklenebilir" diyerek opsiyonel bırakır; `11-uretim-06-content-renderer.md` kabul kriteri "(eklendiyse)" kaydıyla muğlaktı. Muğlaklık maliyetlidir: 16 block bileşeni için story yazımı, Storybook build'inin CI'a eklenmesi ve bağımlılık yüzeyinin büyümesi küçümsenecek iş değildir. Karşı olgu: bileşen semantiği zaten kontrat testleriyle kanıtlanıyor (05 §2.3 — DOM assert, a11y assert) ve design system'in tek tüketicisi tek uygulamadır; izole component review'un bugünkü alıcısı yoktur.

## Karar

Storybook **ilk kapsama girmez**. `11`'deki kabul kriteri yalnızca kontrat testlerine dayanır. Block bileşenleri, ileride Storybook eklenirse story yazımını ucuzlatan biçimde kalır: props'u şemadan türeyen, yan etkisiz, registry üzerinden izole render edilebilir bileşenler — bu zaten 08 ve 11'in mevcut kurallarıdır, ek iş üretmez.

## Sonuçlar

Olumlu: bağımlılık yüzeyi ve CI süresi küçük kalır (01 yasaklar tablosunun ruhu); Faz 6 teslimi story yazımına takılmaz. Kabul edilen maliyet: bileşenleri görsel olarak tek tek inceleme aracı yoktur; görsel doğrulama Playwright smoke + gerçek içerikle yerel önizlemeden gelir.

## Revizyon Tetikleyicisi

Şu koşullardan herhangi biri oluştuğunda yeniden açılır: design system viewer dışında ikinci bir tüketici kazanır (ADR-0001'deki `packages/tokens` senkronu fiilen başlar); block sayısı 25'i aşar; veya PR review'da görsel regresyon tartışmaları ayda birden fazla tekrar eder hale gelir.
