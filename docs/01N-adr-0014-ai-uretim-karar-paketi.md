# 01N — ADR-0014 (viewer serisi): AI Üretim Karar Paketi — Karar/Gereksinim Ayrımı ve Çelişki Mutabakatı

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026.

## Bağlam

Konuşmalı ArcheType üretimi (müşteri AI'a "kitaplar için tablo/form yarat" der → uçtan uca akış) `akis-raporu-archetype-uretim-v3.md` ve onun eleştirel vizyonunda tanımlandı. İki yapısal sorun çıktı:

1. **Vizyon ile uygulanabilir sözleşme karışıyor.** v3 "nihai" diye işaretlenmişti ama içinde hâlâ açık güvenlik soruları (agent yetki tavanı denetimi, sub_prompt sanitizasyonu, audit delegasyonu) duruyor. Hedef ekip junior + 60+ + vibecoding olduğundan, güvenlik invariant'ları yoruma açık kalırsa kaza üretir (OWASP LLM riskleri: prompt injection, aşırı otonomi).
2. **Yeni kavramların çoğunun corpus'ta zaten ince bir sahibi var** (`97-sus-actions`, `18-layer1-workflow`, `07-kernel-tenancy`, `20-layer1-audit`, `241-k-archetype-bayraklari`). Paralel yeni sayfa açmak tutarsızlık biriktirir.

## Karar

Üç bağlayıcı karar:

**1. İki belge ayrımı.** AI üretim özelliği iki katmanda belgelenir: (A) **Mimari Karar Dokümanı** (prensip seviyesi, iteratif kalabilir) ve (B) **Gereksinim & Kabul Kriterleri** (kapalı-uçlu, kilitli). Güvenlik / yetki / ChangeSet / migration / RLS / sub_prompt sözleşmeleri (B)'de acceptance-criteria seviyesinde yazılır; UX/UED (Otopilot/Atölye, DecisionCard) (A)'da iteratif kalır. v3'ün "nihai" statüsü "Mimari Karar Paketi"ne düşürülür.

**2. Çelişki mutabakat merdiveni.** Eski içerikle yeni iş çakışınca sırayla uygulanır: (i) bağlayıcı ADR / terminoloji anayasası kazanır — gerçekten değişecekse "supersedes ADR-XXXX" diyen yeni ADR yazılır, **sessiz çelişki yasaktır**; (ii) kavramın ince sahibi varsa **genişlet**, paralel sayfa açma; (iii) gerçekten yeni kavram → yeni sayfa + glossary + seven-questions overlay; (iv) sayı/manifest değişimi aynı commit'te `docSync.test.ts`'te güncellenir; (v) test-önce (AGENTS.md §3: testler → tanımlar → gövde); (vi) yasak kelime taraması (`yasaklar.test.ts`); (vii) üç-kopya doc paritesi.

**3. Entegrasyon/sahiplik haritası.** Her yeni kavram mevcut ev sayfasına bağlanır; yeni sayfa yalnız evi olmayanlar için açılır.

| Kavram | Ev sayfa | Karar |
|---|---|---|
| Tipli aksiyon yüzeyi | `sus-actions` (97) | genişlet (least-privilege/capability) |
| Authorization | `kernel-authz` (06) | genişlet (agent capability) |
| ECA / Workflow | `layer1-workflow` (18) | genişlet (DSL + safety gate) |
| Tenancy / RLS | `kernel-tenancy` (07) | genişlet (uygulama sözleşmesi) |
| Audit | `layer1-audit` (20) | genişlet (forensic şema) |
| Bildirimsel korumalar | `k-archetype-bayraklari` (241) | genişlet (PII matrisi) |
| Declarative türetme | `sus-declarative` (98) | bağla |
| Sözleşme + üretilmiş test | `k-sozlesme` (242) | bağla |
| Durable / saga | `sus-durable` (99), `scale-saga` (14) | bağla |
| Studio / konuşmalı üretim | `s-studio` (185), `stack-builder` (203) | genişlet + yeni alt-sayfa |
| 60+ UX | `edu-u15-ux-60-plus` (88) | bağla |
| OWASP / güvenlik | `edu-u19-owasp` (103) | bağla (LLM riskleri) |

Evi olmayan, **yeni sayfa** gerektirenler: ChangeSet şeması/operation sözleşmesi · Otopilot-Atölye akışı · DecisionCard+sub_prompt · sentetik veri politikası · güven kalibrasyonu · migration state machine · AI governance/model-ops · operations/runbook.

## Sonuçlar

Artılar: vizyon ile spec ayrışır (ekip aynı belgeyi okuyup farklı şey geliştirmez); çelişki erken yakalanır; mevcut sayfalar derinleşir, corpus parçalanmaz. Eksiler: her fazda ekstra mutabakat kapısı planı yavaşlatır — tutarsızlık maliyetine karşı bilinçli takas. Bağlam: spec-driven development (2026) ve MADR supersede disipliniyle hizalı; fazlı uygulama planı `eylem-plani-archetype-uretim-fazlar.md`'de.

İlgili: ADR-0007 (terminoloji), ADR-0009 (ArcheType), ADR-0013 (MD export kemik sözleşmesi).
