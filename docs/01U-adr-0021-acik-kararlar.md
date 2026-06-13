# 01U — ADR-0021 (viewer serisi): Açık Kararların Çözümü — Namespace, Eşzamanlılık, i18n, Kota, Public KVKK

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. v3 §11 ve fazlı plan'da açık kalan beş kararı kapatır; öncelik kuralı gereği her karar ilgili sahip sayfaya entegre edildi.

## Bağlam

v3 ve eylem planı dört kararı (soft-delete 30g, ECA derinlik 6, sentetik 6 satır, MCP yetki tavanı) çözmüş ama beşini açık bırakmıştı. Açık karar = uygulamada gri alan, tutarsızlık ve geç-fark-edilen hata.

## Karar

1. **Namespace:** ArcheType adları tenant-scoped; rezerve-kelime kayıt defteri; çakışmada AI son-ek önerir.
2. **Eşzamanlılık:** ChangeSet `baseVersion` ile optimistic lock; çakışmada merge-uyarısı (son-yazan-kazanır değil).
3. **i18n:** gün-1 locale-anahtarlı etiket; varsayılan tek locale TR.
4. **Kota/abuse:** tenant başına ArcheType/kayıt üst sınırı + token-rate circuit breaker; noisy-neighbor izolasyonu; plana göre değişir.
5. **Public KVKK:** public form veri topluyorsa aydınlatma + açık rıza bu sürümde zorunlu; yayın sihirbazına gömülü; rıza audit'e yazılır.

## Sonuçlar

Olumlu: gri alanlar kapanır; ad çakışması, kayıp güncelleme, i18n migration acısı, noisy-neighbor ve KVKK ihlali baştan önlenir. Maliyet: rezerve-kelime/kota/rıza bakımı + i18n yapısının baştan kurulması. Supersede yok.

İlgili: ADR-0017, ADR-0018, `k-sozlesme` (242), `edu-u24` (108), `scale-ratelimit` (91), `cc-privacy` (96).
