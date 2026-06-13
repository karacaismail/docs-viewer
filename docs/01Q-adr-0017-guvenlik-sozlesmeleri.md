# 01Q — ADR-0017 (viewer serisi): Güvenlik Sözleşmeleri — RLS Uygulama, Audit Forensic, sub_prompt, PII Matrisi

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3'ü uygular. **Çelişki notu:** Faz 3 planı "yeni sayfa (sub_prompt sözleşmesi)" diyordu; 240-sayfa kilidi gereği reconciliation merdiveniyle **sahip sayfalar genişletildi**: `k-tenancy` (07, RLS), `l1-audit` (20, forensic), `s-studio` (185, sub_prompt), `k-archetype-bayraklari` (241, PII).

## Bağlam

"Var" denen korumalar (RLS, audit, PII) prensip seviyesindeydi; uygulama sözleşmesi yoktu. Sektör 2026: PgBouncer transaction pooling'de `SET` bağlam sızdırır (yalnız `SET LOCAL`); bağlam yoksa sıfır satır güvenli varsayılan; migration `app_migrator` BYPASSRLS auditli. Prompt injection OWASP LLM #1 (üç yıl); savunma katmanlı, untrusted input asla instruction değil; Meta Rule of Two (untrusted işle / hassas eriş / dış değiştir — en çok ikisi).

## Karar

1. **RLS uygulama sözleşmesi:** tenant context transaction içinde `SET LOCAL`; migration user `BYPASSRLS` + auditli; bağlam yoksa sıfır satır; her sorgu tipi (search/filter/sort/export) RLS'e tabi; background job + MCP context açıkça enjekte.
2. **Audit forensic şema:** human_actor_id, agent_id, model_id, prompt_template_version, tool_id, approval_id, change_set_id, before/after_hash, risk_score, source_channel, delegation_reason — aktör/agent/uygulama ayrımı.
3. **sub_prompt = untrusted input** (instruction değil): aynı ChangeSet kapısından geçer, dört korumaya dokunamaz; red-team corpus reddedilir + `blocked_prompt_injection` audit; MCP çıktısı da untrusted.
4. **PII sınıflandırma matrisi:** sınıf × (liste/detay/public/silme) davranışı; `pii` bayrağı tek bit değil.

## Sonuçlar

Artılar: çapraz-tenant sızıntı kapısı; olay-sonrası forensic; prompt injection katmanlı savunma; KVKK silme/maskeleme bayrağa bağlı. Eksiler: SET LOCAL disiplini + capability bakım yükü; tek savunma prompt injection'ı bitirmez. Supersede yok.

İlgili: ADR-0014, ADR-0015, ADR-0016, `k-tenancy` (07), `l1-audit` (20), `s-studio` (185), `k-archetype-bayraklari` (241), `cc-privacy` (96), `edu-u19` (103).
