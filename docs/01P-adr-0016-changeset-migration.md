# 01P — ADR-0016 (viewer serisi): ChangeSet Operation Sözleşmesi ve Migration Yaşam Döngüsü

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3'ü uygular. **Çelişki notu:** Faz 2 planı "yeni sayfa" diyordu; 240-sayfa kilidi (contentValidation `.toBe(240)` + docSync) nedeniyle reconciliation merdiveni gereği **yeni sayfa açmak yerine sahip sayfalar genişletildi**: `k-sozlesme` (242, ChangeSet) ve `edu-u12` (85, migration state machine).

## Bağlam

"AI önerir, motor uygular" omurgası bir veri yapısı gerektirir: ChangeSet. v3 onu kavramsal bıraktı. Üretimde AI'ın ürettiği migration'lar etkisini anlamadan veri kaybı doğurabilir; bu yüzden değişiklik tipli zarf + deterministik kapı + tanımlı geri-alma ister. Sektör: expand-contract (ekle→çift-yaz→backfill→daralt) zero-downtime standardı; saga telafisi snapshot restore değildir (gönderilmiş e-posta geri alınamaz).

## Karar

1. **ChangeSet zarfı** tiplidir: `changeSetId, tenantId, baseVersion, createdBy{actorType}, source, intent, operations[], riskLevel, requiresApproval, validationResults, rollbackPlan, auditContext`. Geçersiz ChangeSet asla uygulanmaz (invariant).
2. **Her operation yedi alanla** tanımlı: precondition, invariant, validation, risk, rollback, audit, preview.
3. **Üç geri-alma sınıfı:** (1) tersine çevrilebilir, (2) expand-contract, (3) telafi-edilemez (snapshot/restore son çare). remove_field = yıkıcı → soft-delete 30 gün + snapshot.
4. **Migration durum makinesi** (drafted→…→archived) + **geri-alma durum makinesi** (rollback_requested→…→closed); geri-alınamaz aksiyonlar akış sonuna konur.

## Sonuçlar

Artılar: AI yazma-yolu tiplenir; veri kaybı kapısı kurulur; üretilmiş uyumluluk testine ({{sus-conformance}}) zemin. Eksiler: operation başına yedi-alan bakım yükü; durum makinesi orkestrasyonu (Faz 5 durable execution ile bağlanır). Supersede yok.

İlgili: ADR-0014, ADR-0015, `k-sozlesme` (242), `edu-u12` (85), `sus-actions` (97), `sus-conformance`.
