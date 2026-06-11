# 01F — ADR-0006 (viewer serisi): Telemetri Yok — Arama Logları Dahil

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü. 12A §2-C'de duran çelişkinin resmî kaydıdır.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

12A §2-C, yeni glossary terimi keşfi için "arama loglarının ileride göstereceği boş sonuçlar"ı kaynak gösteriyordu. Oysa mimari kilitli kararları (01) statik SPA + backend yok der: arama tamamen client-side MiniSearch'tür, log toplayacak sunucu ve depo yoktur. Üçüncü taraf analitik eklemek hem yeni bir runtime bağımlılığı (anti-stack defteri) hem de KVKK yüzeyi açar — viewer'ın kendi içeriği KVKK modülü satan bir kataloğun vitrinidir; vitrinin izleyici toplaması ürün mesajıyla çelişir.

## Karar

Viewer hiçbir telemetri toplamaz: arama sorguları, sayfa görüntüleme, tıklama — hiçbiri kaydedilmez, hiçbir üçüncü tarafa gönderilmez. `localStorage` yalnızca kullanıcının kendi cihazında kalan yerel durum için kullanılır (checklist ilerlemesi); bu veri ağa çıkmaz. Yeni terim keşfi (12A §2-C) editörün okuma geçişiyle ve kullanıcı geri bildirimiyle beslenir; "boş arama sonucu" sinyali bilinçli olarak feda edilir.

## Sonuçlar

Artılar: sıfır KVKK yüzeyi, sıfır üçüncü taraf bağımlılığı, statik yayın modeli (ADR-0003) bozulmaz. Eksiler: içerik boşlukları ancak insan geri bildirimiyle görünür — kabul edilen maliyettir. İleride telemetri istenirse bu ADR revize edilmeden eklenemez.
