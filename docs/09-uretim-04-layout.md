# 09 — Üretim Yönergesi 4: Layout ve AppShell

Layout mobile-first kurulur; 320px en dar sözleşmedir ve yatay scroll üretmemek kabul kriteridir. Tek tema vardır: dark. Bu fazda design token altyapısı da kurulur, çünkü sonraki tüm bileşenler token tüketir.

## Bileşen Hiyerarşisi

```txt
App
  RouterProvider
    AppShell
      MobileTopBar              -> hamburger + başlık + search tetikleyici
      MobileNavigationSheet     -> Rail 1 (mobile)
      MobileRailTwoDrawer       -> Rail 2 (mobile)
      DesktopRailOne            -> sabit sol kategori sütunu
      DesktopRailTwo            -> sabit sol accordion sütunu
      ContentArea               -> aktif page render alanı
      SearchOverlay             -> tüm viewport üstü katman
      ExplanationPanel          -> sağdan açılan üst katman
```

## Token Altyapısı

`src/styles/tokens.css` CSS custom property setini tanımlar; renkler component içinde verilmez. Somut değerler (palet, type scale, spacing, z-index, Shiki teması) ölçülmüş kontrast oranlarıyla birlikte `09A-token-degerleri.md`'de tanımlıdır ve bu yönergenin bağlayıcı ekidir. Token alanları master prompt §14 listesidir: `color.bg.*`, `color.border.*`, `color.text.*`, `color.accent.*`, `color.focus.ring`, `color.feedback.*`, `space.*`, `radius.*`, `shadow.overlay`, `zIndex.{drawer,tooltip,modal}`. Görsel katman saf token CSS'tir — Tailwind ADR-0004 ile çıkarıldı (`01D-adr-0004-token-css.md`); 'token dışı renk yok' kuralı aynen yürürlüktedir. Tipografi tabanı 0.9rem altına inmez; mobile'da component içi spacing `space.compact`, section ritmi `space.section` ile korunur.

## Davranış Kuralları

1. **Breakpoint sözleşmesi:** tek kırılım yeterlidir — dar görünümde iki rail sheet/drawer'a taşınır, geniş görünümde sabit sütun olur. Ara durumlar için ayrı layout üretilmez; karmaşıklık bütçesi navigasyon davranışına harcanır.
2. **Scroll kilidi:** ExplanationPanel, MobileNavigationSheet, MobileRailTwoDrawer ve SearchOverlay açıkken arka plan scroll kilitlenir. Kilit tek bir yardımcı mekanizmadan yönetilir; her bileşen kendi kilidini icat etmez (çakışan kilitler iOS Safari'de klasik regresyondur).
3. **Katman z-index'leri** token'dan gelir; sihirli sayı yasaktır. Aynı anda en fazla bir üst katman açık olur — yeni katman açılırken öncekinin kapanması AppShell seviyesinde tek bir state makinesiyle yönetilir.
4. **Panel genişlikleri:** ExplanationPanel mobile'da viewport'un ~%85'i, desktop'ta ~%50'sidir. Drawer/panel animasyonları `prefers-reduced-motion` ayarına saygı duyar.
5. **Focus yönetimi** Radix primitive'lerine devredilir: Dialog/Sheet focus trap, Escape ile kapanma ve tetikleyiciye focus dönüşü Radix sözleşmesidir; üstüne custom focus kodu yazılmaz.

## Edge Case'ler

URL ile doğrudan derin sayfaya girişte (hash dahil) mobile'da hiçbir drawer otomatik açılmaz; içerik doğrudan görünür. Rotasyon/resize sırasında açık drawer durumu korunur, kilitli scroll sızdırmaz. 320px'te uzun kelimeler (URL, kod) `overflow-wrap` ile kırılır — yatay scroll'un tipik kaynağı budur.

## Kabul Kriterleri

Faz 4 test listesi yeşildir; 320–2560px aralığında yatay scroll yoktur; axe taraması landmark yapısını (banner, navigation, main, search) doğrular.
