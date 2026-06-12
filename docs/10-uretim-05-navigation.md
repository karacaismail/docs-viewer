# 10 — Üretim Yönergesi 5: Navigation ve Routing

Bu faz, `03-navigation-ia.md`'deki bilgi mimarisini bileşenlere ve route'lara bağlar. Navigasyon tamamen `navigation.json`'dan üretilir; kategori adı, sayısı veya sırası koda gömülmez.

## Üretilecek Dosyalar

```txt
src/app/router.tsx                       -> TanStack Router route ağacı
src/components/navigation/
  RailOne.tsx                            -> kategori listesi (desktop)
  RailTwo.tsx                            -> accordion page listesi (desktop)
  NavigationAccordion.tsx                -> Radix Accordion sarmalayıcı
  MobileNavigationSheet.tsx
  MobileRailTwoDrawer.tsx
```

## Routing Yönergeleri

1. Route yapısı `/docs/$section/$page` tek dinamik route'tur; kök `/` ilk kategorinin ilk page'ine redirect eder. Route param'ları TanStack Router'ın type-safe API'siyle tanımlanır — string interpolation ile link kurulmaz, `Link`/`navigate` tip kontrolünden geçer.
2. Block anchor hash'te taşınır; router hash'i state'e almaz, sayfa mount/navigasyon sonrası `scrollToBlockAnchor` çağrılır. Hash çözülemezse sessizce sayfa başı (engine kuralı).
3. Bilinmeyen `$section/$page` kombinasyonu engine'in `PageNotFound` fallback'ini render eder; router seviyesinde ayrı 404 mantığı yazılmaz.
4. Navigasyon sonrası focus, page başlığına (`h1`, `tabIndex=-1`) taşınır ve screen reader'a sayfa değişimi duyurulur.

## Rail Davranışları

1. **RailOne** seçimi route'u değiştirmez; yalnızca RailTwo içeriğini değiştirir. Route, ancak RailTwo'da bir page seçilince değişir. Aktif kategori `aria-current` ile işaretlenir; ikonlu dar sütunda her item'ın erişilebilir adı `aria-label` ile verilir.
2. **RailTwo** Radix Accordion üzerine kurulur; `aria-expanded`/`aria-controls` Radix'ten gelir. Aktif page'in grubu otomatik açık gelir; kullanıcı kapattığı grubu route değişiminde zorla yeniden açmayız — istisna, yeni aktif page'in kapalı grupta olmasıdır.
3. **Eğitim Yolu** kategorisi düz sıralı listedir (accordion yok); item sırası müfredat sırasıdır ve `order` alanından gelir.
4. **Mobile:** RailOne sheet'te, RailTwo content üstü drawer'da yaşar. Page seçimi her iki katmanı da kapatır; kategori seçimi sheet'i kapatıp drawer'ı açar. Dokunma hedefleri minimum 44px'tir.

## Edge Case'ler

64 page'lik `urunler` kategorisinde RailTwo listesi uzundur; grup başlıkları sticky yapılır ve drawer içi scroll bağımsızdır. Boş grup (`items` üretilmemiş) navigation'da hiç render edilmez — migration raporu zaten uyarır. Derin link ile gelen kullanıcıda RailOne/RailTwo aktif durumu route'tan türetilir; ayrı bir "seçili kategori" state'i tutulmaz (tek doğruluk kaynağı URL'dir).

## Kabul Kriterleri

Faz 5 test listesi yeşildir; tüm navigasyon yalnızca keyboard ile kullanılabilir; URL paylaşıldığında alıcı aynı görünümü (kategori + page + anchor) elde eder.

## UX Revizyonu — Sıralı Okuma ve Yön Bulma (2026-06: 60+ öğrenen odağı)

Eğitim dokümanı yapısı gereği gezinme yalnız rastgele erişim değil, sıralı okuma da destekler. `src/engine/pageOrder.ts` navigation'ı düz listeye indirger; `pageNeighbors(slug)` önceki/sonraki sayfayı (kategori sınırında `crossesCategory` işaretiyle) döner ve ContentArea'nın sayfa altı gezgini ("← Önceki / Sonraki →", sınırda "Sıradaki bölüm: <kategori>") buradan beslenir. Sayfa üstünde breadcrumb (`SECTION › Kategori`, `pageAt(slug)`) konum duygusu verir. Rail 1 alt bilgisi (RailFooter): "Devam et: <son sayfa>" (localStorage `son-ziyaret`), `/sozluk` bağlantısı, A−/A+ yazı boyutu kontrolü (`yazi-boyutu`, %100/%112,5/%125 kök font), geri bildirim (GitHub issue) ve `llms.txt` bağlantıları, build tarihi (`__BUILD_DATE__` vite define). `/sozluk` route'u (`sozlukRoute`) tüm sözlüğü A-Z dizin olarak sunar; 404 sayfası arama ve sözlük çıkışları verir.
