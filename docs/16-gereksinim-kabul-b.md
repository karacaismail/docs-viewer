# 16 — Gereksinim & Kabul Kriterleri (B Belgesi) — Konsolide İndeks

Statü: Kilitli sözleşme indeksi (ADR-0014 §1'in (B) belgesi). Bu doküman yeni kural üretmez; AI üretim hattının dağıtılmış **kapalı-uçlu sözleşmelerini** tek yerden işaret eder. Kanonik kaynak her zaman ilgili içerik sayfası + ADR'dir.

## Amaç

ADR-0014 karar dokümanı (A, iteratif) ile gereksinim dokümanını (B, kilitli) ayırdı. (A) prensip, (B) uygulanabilir sözleşme + kabul kriteridir. Ekip backlog/QA/threat-model/acceptance'ı buradan tek bakışta çıkarır.

## Sözleşme haritası

| Alan | Kanonik sayfa / ADR | Kapalı-uçlu içerik |
|---|---|---|
| Actor & Permission | `kernel/kernel-authz` + ADR-0015 | capability matrisi (rol×aksiyon), kesişim kuralı, agent≠principal |
| Action Surface | `sus/sus-actions` + ADR-0015 | aksiyon taksonomisi (risk/onay/geri-alma), step-up, DisableProtection yasağı |
| ChangeSet | `kernel/k-sozlesme` + ADR-0016 | zarf şeması + operation başına 7-alan |
| Migration & Rollback | `egitim/edu-u12-migration` + ADR-0016 | yaşam döngüsü + rollback state machine + 3 geri-alma sınıfı |
| RLS / Tenancy | `kernel/kernel-tenancy` + ADR-0017 | SET LOCAL sözleşmesi, BYPASSRLS, sıfır-satır default |
| Audit forensic | `layer1/layer1-audit` + ADR-0017 | aktör/agent/model/tool/approval/changeset şeması |
| sub_prompt güvenliği | `urunler/s-studio` + ADR-0017 | untrusted input, Rule of Two, red-team corpus |
| PII / KVKK | `kernel/k-archetype-bayraklari` + `crosscut/cc-privacy` + ADR-0017/0021 | PII matrisi, public açık rıza |
| UX/UED | `stack/stack-builder` + `egitim/edu-u15` + ADR-0018 | iki mod, sentetik önizleme, güven eşikleri, ön-seçim politikası, Explanation Content Contract |
| ECA | `layer1/layer1-workflow` + ADR-0019 | declarative DSL, safety gate (döngü/derinlik-6/idempotency), n8n delegasyonu |
| Governance & Ops | `crosscut/crosscut-observability` + `crosscut/cc-obs-deep` + ADR-0020 | NIST RMF, model pinleme, runbook, üç kill-switch |
| Açık kararlar | ADR-0021 | namespace, eşzamanlılık, i18n, kota, public KVKK |
| Yetkinlik kapısı | `egitim/edu-yetkinlik-modeli` | okudu → gözetimle yaptı → bağımsız yaptı → üretimde işletti |
| Referans uygulama | `build/build-referans-uygulama` | OrderOps ile tenancy/yetki/migration/hata/restore/deploy kanıtı |
| Enterprise release | `build/build-enterprise-readiness` | sekiz boyutlu ölçülebilir release matrisi |
| v1 kapsamı ve destek | `backend/be-v1-kapsam-disi` + `backend/be-destek-matrisi` | tek desteklenen profil; deneysel/yasak ayrımı |
| AI üretim disiplini | `sus/sus-ai-uretim-sozlesmesi` | üreten onaylayamaz; bağımsız oracle + deterministik kapı |
| Uzman ve risk | `build/build-uzman-denetimi` + `build/build-risk-defteri` | kilometre taşı review'ları ve yaşayan risk kaydı |

## Kabul kriteri özeti (acceptance)

- Geçersiz ChangeSet asla uygulanmaz (invariant testi).
- Tenant A↔B sızıntısı tüm sorgu yollarında sıfır (RLS izolasyon testi).
- sub_prompt red-team corpus'unun hiçbiri aksiyona dönmez (`blocked_prompt_injection` audit).
- DisableProtection hiçbir rolde/ capability'de mümkün değildir.
- Yüksek-riskli/dış-etkili aksiyon out-of-band step-up olmadan yürümez.
- ECA döngü/derinlik-6/idempotency kapısını geçmeyen kural canlıya çıkmaz.
- Üç kill-switch (tenant/agent/MCP) çalışır.

## Kapsam dışı (B v1)

Hedef FastAPI sisteminin **çalıştırılabilir testleri** bu repoda değildir (sistem henüz yazılmadı); bu belge onların **kabul kriterlerini** tanımlar, implementasyon hedef repoda yazılır.
