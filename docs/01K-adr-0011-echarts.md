# 01K — ADR-0011 (viewer serisi): ECharts — WBS Görselleştirme Bağımlılığı

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

Granülerlik zincirinin (ADR-0008) görsel WBS sunumu istendi: soldan sağa kanban-kolonlu ağaç, etkileşimli aç/kapa. Anti-stack defteri yeni runtime bağımlılığını kayıt ister.

## Karar

`echarts` eklendi; üç sınırla: (1) yalnız `wbsChart` bileşeninde ve **dinamik import**'la — manualChunks istisnasıyla kendi lazy chunk'ında yaşar, eager bütçeye (250KB kapısı) girmez; (2) fine-grained kullanım (`echarts/core` + TreeChart + CanvasRenderer + Tooltip — shiki deseni); (3) canvas yoksa erişilebilir iç-içe liste fallback'i zorunludur ve kontrat testlidir. Veri bileşen-içi örnek settir; gerçek backlog verisi SDK fazında block alanına taşınabilir.

## Sonuçlar

Artılar: tek sayfalık görselleştirme için ekosistem-standardı araç; bütçe ve a11y korunur. Eksiler: vendor dışı +~330KB raw lazy chunk (yalnız k-wbs ziyaretinde iner); ikinci bir chart ihtiyacında bu ADR genişletilmeden yeni chart kütüphanesi eklenemez.
