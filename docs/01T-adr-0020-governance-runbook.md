# 01T — ADR-0020 (viewer serisi): AI Governance & Model Ops + Operations/Runbook

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3 + öncelik kuralı (birleştir > yeni sayfa): governance/runbook içeriği `cc-obs`, `cc-obs-deep`, `edu-u20`'ye entegre edildi.

## Bağlam

Test ve güvenlik fazları (1-3) vardı ama AI governance ve operasyon ayrı ele alınmamıştı. NIST AI RMF GenAI profili (Govern/Map/Measure/Manage) ve LLMOps 2026 pratikleri: model/prompt versiyon pinleme + rollback, eval dataset, drift detection + CI gating, input/output guardrail, maliyet circuit breaker, incident runbook. AI-first sistem bunlar olmadan model drift, maliyet patlaması ve sessiz hatayla kontrol dışına çıkar.

## Karar

1. **NIST AI RMF** dört işlev + dört değerlendirme operasyona indirilir.
2. **Model + prompt versiyon pinleme** (test edilmiş rollback); **eval dataset = kalp**; **drift + CI gating**.
3. **Guardrail:** input (PII/injection) + output (PII/halüsinasyon/toksik); tenant verisi eğitime gitmez.
4. **Maliyet guardrail:** günlük bütçe, tenant kotası, token-rate circuit breaker.
5. **Operasyon:** incident runbook (detection→containment→root cause→remediation→review→guardrail update) + üç kill-switch (tenant/agent/MCP) + feature flag + prompt rollback.

## Sonuçlar

Olumlu: sistem kontrol dışına çıkmaz; olaylar runbook'la yönetilir; maliyet sınırlı. Maliyet: eval/governance altyapısı + runbook bakımı + kill-switch testleri. Supersede yok.

İlgili: ADR-0015, ADR-0017, ADR-0019, `cc-obs` (37), `cc-obs-deep` (115), `edu-u20` (104).
