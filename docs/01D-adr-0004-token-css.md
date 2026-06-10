# 01D — ADR-0004 (viewer serisi): Tailwind Yerine Saf Token CSS

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü. Bu ADR, 01 karar tablosundaki "Radix + Tailwind + custom design system" maddesinin Tailwind bileşenini revize eder.

## Durum

Kabul edildi — 10 Haziran 2026 (uygulama sırasında fiilen verildi, bu kayıtla resmîleşti).

## Bağlam

Master prompt ve 01, Tailwind'i stack'te sayıyordu; 09/09A onu "token custom property'lerine bağlanan, palet renkleri kullanılmayan" bir role indirgemişti. Uygulamada görüldü ki bu rolde Tailwind'in kattığı tek şey utility sözdizimidir: tüm renk/spacing/tipografi zaten `tokens.css` custom property'lerinden geliyor, bileşen stilleri semantik class'larla (`globals.css`) yazılıyor. Tailwind eklemek bir derleme katmanı, bir konfigürasyon dosyası ve bağımlılık yüzeyi ekleyip hiçbir kararı değiştirmeyecekti.

## Karar

Tailwind kurulmaz. Görsel katman iki dosyadır: `tokens.css` (09A değerleri — tek doğruluk kaynağı) + `globals.css` (token tüketen semantik class'lar). 09 ve 09A'daki "Tailwind konfigürasyonu property'lere bağlanır" cümleleri bu ADR'ye işaret eden nota çevrildi; "renk component içinde verilmez" ve "Tailwind palet renkleri kullanılmaz" kurallarının ruhu (token dışı renk yok) aynen yürürlüktedir.

## Sonuçlar

Olumlu: bağımlılık ve build adımı azaldı (01 yasaklar tablosunun ruhu); stil hattı tek kaynaklı ve denetlenebilir kaldı; Biome format/lint CSS-in-class karmaşası olmadan çalışıyor. Kabul edilen maliyet: utility-first hız avantajı yok — yeni bileşen stili `globals.css`'e semantik class olarak yazılır (15 §5'teki süreçle aynı disiplin).

## Revizyon Tetikleyicisi

Design system viewer dışında ikinci tüketici kazanırsa (ADR-0001 `packages/tokens` senkronu) veya `globals.css` 1.500 satırı aşıp bakım sorunu üretirse yeniden değerlendirilir — ADR-0002'nin (Storybook) tetikleyicileriyle birlikte okunur.
