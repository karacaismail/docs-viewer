# 01O — ADR-0015 (viewer serisi): Aksiyon Taksonomisi ve Agent Yetki Modeli (AI maruz kalır, içermez)

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3 sahiplik haritasını uygular (`sus-actions` genişletilir; paralel sayfa açılmaz).

## Bağlam

`sus-actions` (97) tipli aksiyon yüzeyini kurdu ama **yetki tavanını** tanımlamadı: agent ne kadar yapabilir, hangi aksiyon onay/geri-alma ister belirsizdi. OWASP "excessive agency" üç kökten doğar: aşırı işlev, aşırı yetki, aşırı otonomi. 2026 konsensüsü nettir: agent etkin yetkisi kullanıcı ∩ capability **kesişimidir** (asla birleşim); delegasyon kimliğe bürünmeyi yener (confused-deputy önlenir); yüksek-riskli yan etkiler out-of-band step-up ister.

## Karar

1. **Agent asla principal değildir.** Her oturum bir insan/servis aktörü **adına** çalışır. `etkin = kullanıcı_rolü ∩ agent_capability ∩ tool_scope ∩ aksiyon_riski ∩ ortam`. Merkezî politika kapısı her çağrıda bu kesişimi hesaplar.
2. **Aksiyon taksonomisi bağlayıcıdır** (sus-actions tablosu): Read/Suggest/Draft/Validate düşük-risk, AI'a açık; ApplySchema/Migration/DeleteField/PermissionChange/PublishPublic motor + insan onayı; **DisableProtection** (RLS/PII/audit/şema kapatma) **yasak** — capability allowlist'ine asla giremez.
3. **Step-up:** dış etkili/parasal/hukuki/yıkıcı aksiyonlar out-of-band onay ister.
4. **AGENTS.md uzlaştırması:** planlama serbesttir (AI her planı önerebilir), **uygulama capability-gated**'dir. "crm dağ yap" planı sınırsız üretilir; ama uygulanması aksiyon yüzeyinin yetki tavanına tabidir.

## Sonuçlar

Artılar: excessive agency üç kökten kapatılır; confused-deputy önlenir; audit aktör/agent ayrımına zemin hazırlanır (Faz 3). Eksiler: her tool çağrısı politika kapısından geçer (ms düzeyinde maliyet); capability matrisi bakım yükü doğurur. Supersede yok — ADR-0014 §3'ü uygular, `sus-actions`'ı genişletir.

İlgili: ADR-0014, ADR-0007, `sus-actions` (97), `kernel-authz` (06).
