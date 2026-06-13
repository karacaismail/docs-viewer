# 01S — ADR-0019 (viewer serisi): ECA Motoru — Declarative No-code DSL + Güvenlik Kapısı

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3 + öncelik kuralı (birleştir > yeni sayfa): ECA içeriği `layer1-workflow`'a entegre edildi.

## Bağlam

ECA (Event-Condition-Action) güçlü otomasyon ama tehlikeli: serbest kod çalıştıran kural motoru injection, forward-chaining sonsuz döngü ve geri-alınamaz yan etki üretir. Hedef kitle no-code/60+; güvenle kural kurabilmeli. Sektör: declarative JSON DSL (json-rules-engine) okunabilir ve kod gerektirmez; dış etki n8n gibi allowlist'li + human-in-the-loop kanaldan yürütülmeli.

## Karar

1. ECA kuralları **declarative JSON DSL** (event/condition/action); v1'de serbest JS/SQL/shell **yok**.
2. Action bir **allowlist**'ten seçilir; AI önerir, motor doğrular/uygular.
3. **Güvenlik kapısı:** sonsuz döngü, yan-tenant erişimi, geri-alınamaz yan etki, maks zincir derinliği **6**, idempotency key.
4. **Dış etkili aksiyon** (e-posta/webhook/ödeme) allowlist'li **n8n** akışına delege + step-up; ECA yalnız tetikler.
5. **Mod:** Otopilot güvenli ECA otomatik (parasal/hukuki step-up); Atölye her ECA bir kart + sub_prompt.

## Sonuçlar

Olumlu: no-code kullanıcı güvenle otomasyon kurar; döngü/yan-etki kapıda yakalanır; dış etki yetkili kanaldan geçer. Maliyet: serbest-kod esnekliği yok (v1); allowlist + n8n bakımı. Supersede yok.

İlgili: ADR-0014, ADR-0015, ADR-0018, `layer1-workflow` (18), `sus-actions` (97), `sus-durable` (99).
