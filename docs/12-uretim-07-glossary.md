# 12 — Üretim Yönergesi 7: Glossary, Tooltip ve Explanation Panel

Bu faz projenin pedagojik katmanıdır: içerikte geçen teknik terimlerin bağlama özel açıklamalarla zenginleştirilmesi. Temel ilke, global tek anlamlı sözlük yasağıdır — `term-component-render-engine` ile `term-component-design-system` ayrı kayıtlardır ve aynı kelimeyi farklı örneklerle açıklar.

## Üretilecek Dosyalar

```txt
src/components/glossary/
  GlossaryTerm.tsx        -> term segment render'ı: noktalı underline + etkileşim
  TermTooltip.tsx         -> kısa açıklama (Radix Tooltip/Popover)
  TermInlineActions.tsx   -> ! ve ? kontrolleri
  ExplanationPanel.tsx    -> sağdan açılan uzun açıklama paneli (Radix Dialog)
```

## Etkileşim Sözleşmesi

1. **Görsel işaret:** term, noktalı underline ile ayırt edilir; renk değil yalnızca renk+desen birlikte kullanılır (renk körlüğü için underline şarttır).
2. **Kısa açıklama:** hover ve keyboard focus tooltip'i açar. Mobile'da hover yoktur; tap, kısa açıklama + aksiyonları içeren kompakt popover açar. Tooltip yalnızca hover'a bağlı bırakılmaz — bu a11y sözleşmesinin parçasıdır.
3. **İki kontrol:** `!` kısa açıklamayı/dikkat notunu gösterir; `?` explanation panel'i açar. Kontroller dokunma hedefi sözleşmesine (≥44px) uyar ve erişilebilir ad taşır ("component teriminin kısa açıklaması" gibi).
4. **Explanation panel** sağdan açılır: mobile ~%85, desktop ~%50 viewport genişliği. Açıkken arka plan scroll kilitlidir; Escape kapatır; kapanınca focus tetikleyen term'e döner. Panel içeriği glossary kaydının tüm pedagojik alanlarını yapılandırılmış bölümlerle sunar: longExplanation, realWorldAnalogy, useCases, caseStudies.
5. **Panel içinde gezinme:** panel içeriğindeki metin de term segment'leri içerebilir; ancak panel üstüne panel açılmaz — yeni term seçimi mevcut panelin içeriğini değiştirir ve bu değişim duyurulur.

## Çözümleme Kuralları

`resolveTerms` (engine) eşleşmeyi `termId` üzerinden yapar; label üzerinden bulanık eşleşme yoktur. Term kaydının `pageId`'si ile kullanıldığı page tutarsızsa içerik doğrulama uyarı üretir — bu, yanlış bağlam açıklamasının sessizce render edilmesini önler. Çözülemeyen `termId` düz metne düşer; kullanıcı kırık etkileşim görmez.

## İçerik Üretim Notu

Glossary'nin çekirdeği migration'dan otomatik gelir: 679 kayıt (`enrich.terms` + terms block'ları) bağlamsal glossary kayıtlarına dönüştürülür (`07A-alan-esleme-tablosu.md` §4). Editöryel iş üç akıştır — zenginleştirme, segment bağlama, yeni terim — ve parti sırası, hacim, bitiş tanımı ve efor tahminiyle birlikte `12A-glossary-editoryel-plani.md`'de tanımlıdır; o doküman bu yönergenin bağlayıcı ekidir. Yazım üslubu `lesson-yazim-rehberi.md` ve dil tonu sözleşmesine uyar: Türkçe cümle, İngilizce jargon korunur, realWorldAnalogy günlük hayattan somut bir karşılık verir.

## Kabul Kriterleri

Faz 7 test listesi yeşildir; aynı label'lı iki term farklı page'lerde farklı içerik gösterir; tooltip üç giriş yöntemiyle de (hover, focus, tap) erişilebilir; panel focus trap + Escape + focus dönüşü sözleşmesini Playwright testiyle kanıtlar.

## UX Revizyonu — Global Sözlük Dizini (2026-06: 60+ öğrenen odağı)

`/sozluk` route'u 709 bağlamsal terimin tamamını A-Z gruplu dizin olarak sunar (`GlossaryIndexPage`): TR-katlamalı ad süzme + kategori açılır listesi (slug önekiyle), her kayıtta kısa açıklama, bağlam sayfası linki ve mevcut "?" panelini açan düğme (UiState `open("panel", termId)` — panel global olduğundan ek altyapı gerekmez). Rail 1 alt bilgisi ve 404 sayfası buraya bağlanır; axe kapsamı bu sayfayı içerir (05'te 8. temsilî sayfa).

**Yedi soru genellemesi (12A §6, 12 Haziran 2026):** her terim kaydı `sevenQuestions` (Ne/Niçin/Nasıl/Nerede/Ne zaman/Kim/Analoji) taşır; panel "Yedi soruda" bölümü olarak gösterir. Kapı: `tests/sevenQuestions.test.ts`.
