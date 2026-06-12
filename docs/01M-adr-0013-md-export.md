# 01M — ADR-0013 (viewer serisi): MD Dışa Aktarma — Kemikleştirilmiş Sözleşme

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026. **Kemikleştirilmiş özellik:** gelecekteki geliştirmeler bu sözleşmeyi kıramaz; kıran değişiklik CI'da durur.

## Karar (sözleşme)

Her sayfanın sağ üstünde MD butonu bulunur; "İlgili sayfalar" öncesi içerik (başlık + özet + tüm block'lar) `engine/blocksToMarkdown` saf fonksiyonuyla çevrilir ve `<stem>.md` olarak iner. Çeviri kuralları: ref→site linki, term→düz metin, tablo pipe-escape, codeBlock fence, görsel mutlak URL, dipte `Kaynak:` satırı.

## Kemikler (CI kapıları)

1. **Şema-kapsam kapısı:** test, `BlockSchema` union'ındaki HER type için dönüştürücünün boş olmayan çıktı verdiğini örnek haritasıyla doğrular — yeni block type eklenip MD eşlemesi unutulursa kırmızı.
2. **Golden fixture:** sabit sentetik sayfanın çıktısı `tests/__fixtures__/golden-page.md` ile birebir karşılaştırılır; biçim değişikliği ancak bilinçli ritüelle (`GOLDEN_UPDATE=1 vitest run`) ve diff'i görünür kılarak yapılır.
3. **Gerçek-veri smoke:** üretilmiş 200+ sayfanın tamamı exception'sız çevrilir; her çıktı `# ` ile başlar ve `Kaynak:` içerir — içerik evrimi özelliği sessizce bozamaz.
4. **e2e indirme doğrulaması:** buton tıklanır, inen dosyanın ADI (`kernel-authz.md`) ve İÇERİĞİ assert edilir — UI/akış regresyonu canlı zincirde yakalanır.

## Sonuçlar

Artılar: özellik dört bağımsız açıdan korunur (şema, biçim, veri, UI); LLM-bağlam kanalı (ADR-0012'nin 4. yolu) güvence altında. Eksiler: yeni block type maliyetine MD eşlemesi + örnek eklemek dahildir — bilinçli sürtünme.
