# AGENTS.md — Meta-Framework İş Tarifi Sözleşmesi (LLM Bağlam Paketi)

Bu dosya, bu projede çalışan HER AI ajanının bağlayıcı sözleşmesidir. "crm dağ yap" da dense, "crm app'i yaz" da dense **aynı plana** düşersin. Kanonik kaynaklar: https://karacaismail.github.io/docs-viewer/ (özellikle kernel/k-granulerlik, kernel/k-surface, kernel/k-terminoloji, backend/be-kararlar, backend/be-sdk).

## 1. Sözlük (bağlayıcı)

- **Kernel** = sistemin kalbi/beyni (Linux kernel gibi). **Core** = bir app'in kalbi (Drupal core gibi; app başına TEK, değişmez core module).
- **App** = kernel üstünde, bir veya birden çok stack'i (gerekirse edition katmanıyla) TEK PANELDE paketleyen ürün; tek stack tek başına app olabilir. Tüm app'ler birbirine varsayılan entegre gelir (paylaşılan ArcheType'lar, örn. Party).
- **Module** = genişletme birimi (Drupal dili). YASAK KELİME: "plugin". 
- **SDK** = kernel üstü geliştirme altyapısı (sözleşme + tipli iskelet üretici + CLI + yerel dev-env). Geliştirme yüzeyi: ArcheType ve theme tek-komutla üretilir (sdk archetype = tek komut + çok-aşamalı AI sorusu; sdk theme = scaffold); app (Dağ) ve module (Kaya/Domain) geliştirici kompozisyon eforudur — tek-komut buildable değildir. Runtime'ı kernel sağlar; SDK ve AI kernel iç API'sine dokunamaz. Geliştirici klonlar, tek komutla (sdk up) tüm ortamı kurar.
- **Theme** = yatay sunum buildable'ı (token seti + Surface şablonları). Edition'ı (aynı kod, gelişmiş UI/UX) görsel olarak GERÇEKLEŞTİRİR; kodu/iş mantığını/core module'ü değiştirmez. Theme ≠ Edition (Edition = satılabilir paket, Theme = sunum mekanizması).
- **ArcheType** = bildirimsel varlık tanımı; tablo+API+MCP tool+varsayılan Surface'i ÜRETİR. YASAK KELİME: "doctype" (Frappe'nin kendi kavramına atıf hariç). Depolama HİBRİT: varsayılan paylaşılan şema + JSONB değişken alanlar + FK ilişkiler (dinamik DDL yok, tablo-per-tip yok); yalnız yüksek-hacimli ArcheType opt-in fiziksel tabloya terfi eder. Tip dispatch'i runtime metadata/Strategy ile — `if (type==...)` YASAK. Granülerlikte Büyük Taş'tır; tekil bildirimsel varlık (ör. iyzico entegrasyonu, SEO) — bunlar module (Kaya/Domain) DEĞİL. module ArcheType'ları kompoze eden bir bounded-context'tir.
- Yapı ekseni: **Domain > ArcheType > Fragment > Atom**. Fragment = ana kayıtla yaşayan satırlı parça (eski dünyadaki child table). Atom = en küçük bildirimsel bileşen (kural/kısıt).
- Yan eksen: **Workflow** (durum makinesi; ArcheType'tan bağımsız versiyonlanır, tenant'a pinlenir) · **Surface** (her sayfa bir Surface'tir; 1+ ArcheType'ı projekte eder; `surface: none` = headless) · **Contract** (Domain sınırının API kapısı).
- Taksonomi: **Stack** ⊂ **Edition** (aynı kod, gelişmiş UI/UX + GTM) ⊂ **Distribution** (edition + config + sektör içeriği).
- **SaaS Products** = bu kataloğun şemsiyesi: Stacks + Editions + Distributions paketleri VE Ürün Modülleri (s-*) birlikte SaaS ürünleridir; modüller paketleri oluşturan yapı taşlarıdır ve kendileri de SaaS ürünüdür.

## 2. Granülerlik Zinciri — Eş Anlam Tablosu (komut çözümleme anahtarı)

| Tanım katmanı (öne çıkan) | Metafor (eş anlamlı) | Frontend | Backend | SP |
|---|---|---|---|---|
| App | Dağ | Application | Application | 34+ |
| Domain (Module) | Kaya | Module | Module / Bounded Context | 21 |
| Surface (ekran) · ArcheType işi | Büyük Taş | Page/Screen | Service Group | 13 |
| View / Projection | Orta Taş | Sub Page/View | Endpoint Group | 8 |
| Fragment / Section / Use Case | Küçük Taş | Block/Section | Use Case | 5 |
| Component / Endpoint (alan*) | Kum Tanesi | Component | API Endpoint | 3 |
| Property / bayrak | Toz Tanesi | Property | Validation/Policy | 2 |
| Atom (Rule) | Atom | Rule | Business Rule | 1 |

\* alan seviyesinin adı (Field/Attribute) AÇIK karardır — şimdilik "alan" de.

## 3. Komut Grameri

Biçim: `<hedef> <seviye> yap|yaz|üret|planla`. **Seviye adı iki dilden de gelebilir** — yukarıdaki tablo eş anlamlıdır:
- "crm **dağ** yap" ≡ "crm **app**'i yaz" → CRM app'ini Dağ→Atom zinciriyle planla: Domain'lere (Kaya) böl, her Domain'de ArcheType'ları (BT) çıkar, SP'leri yapraktan topla.
- "listing **orta taş** yap" ≡ "listing **view**'ını üret" → bir Büyük Taş altındaki liste view'ı + endpoint grubu.
- "employee **archetype**'ı yaz" ≡ "employee **büyük taş** yap" → ArcheType tanımı + Fragment/alan/bayrak/Atom yaprakları + üretilecek Surface notu.
- "theme **yap**|**üret**" → bir Edition'ın sunum katmanını (token + Surface şablon) iskeletler; iş mantığına dokunmaz, yalnız sunum + a11y/perf bütçesi. (Komşuluk: theme yatay eksende Surface sunumudur; granülerlik zincirine atlama eklemez.)

**Çözümleme adımları (her komutta):** (1) seviyeyi tablodan çöz; (2) KOMŞULUK KURALI: her seviye yalnız bir alt komşusuna bağlanır — "Kaya doğrudan Kum'a bağlanamaz"; zincirde atlama varsa planı REDDET ve eksik ara seviyeleri iste; (3) plan ağacını SP'lerle ver; (4) onaydan sonra iskelet üret — SIRA: önce testler, sonra tanımlar, sonra hook gövdeleri.

## 3b. Yetki Tavanı — planlama serbest, uygulama capability-gated (ADR-0015)

Planlamada sınır yoktur: her seviyede plan/iskelet önerebilirsin. Ama **uygulama** tipli aksiyon yüzeyinden geçer ve yetki tavanına tabidir. AI ajan **asla principal değildir**, bir aktör **adına** çalışır; etkin yetki = kullanıcı ∩ agent_capability ∩ tool_scope ∩ aksiyon_riski (asla birleşim). DisableProtection sınıfı (RLS/PII/audit/şema-güvenliği kapatma) hiçbir koşulda önerilemez/uygulanamaz. Yüksek-riskli/dış-etkili aksiyonlar out-of-band step-up onayı ister. Detay: sus-actions + ADR-0015.

## 4. Çıktı Sözleşmeleri

İskelet (be-sdk): `tests/` İLK üretilir (kırmızı başlar) → `archetypes/*.yaml` → `surfaces/*.yaml` → `workflows/*.yaml` → `manifest.yaml` (izin beyanı; WASM sandbox). AI'ın dokunabildiği yüzey YALNIZ bunlar + saf hook fonksiyonları; kernel iç API'sine dokunulmaz.

Zorunlu bayrak disiplini: para alanı = Money (Decimal; float YASAK) · kişisel veri = `pii: true` (+retention) · tarihçeli değer = `bitemporal: true` · her şey audit'li. Varsayılan-basit ilkesi: tek Postgres (kuyruk/arama/event dahil); Redis/Kafka/S3/k8s yalnız opsiyon. API varsayılanı GraphQL (FastAPI endpoint'i); REST+OpenAPI kurulum opsiyonu.

Her iş paketi ayrıca şunları taşır: `owner`, işi üretmeyen `reviewer`, olgunluk, kanıtlar, ön koşullar, kapsam dışı, başarısızlık biçimleri, kabul kriterleri, operasyon etkisi ve dış uzman incelemesi gereği. Kullanım hikâyesi yalnız mutlu akış değildir; önkoşul, yetki, ana/alternatif/hata akışları, invariant, audit, gizlilik, SLO ve çalıştırılabilir kabul testleri zorunludur.

AI kendi ürettiği kodu veya testi son onay olarak kabul edemez. Çıktı kaynakları ve varsayımları listeler; temiz bağlamlı bağımsız eleştiri, deterministik kapılar ve insan reviewer olmadan merge/release kararı verilmez. Yetkinlik sırası: okudu → gözetimle yaptı → bağımsız yaptı → üretimde işletti. Yüksek riskli kilometre taşları fractional senior mimar ve ilgili güvenlik/PostgreSQL-SRE/hukuk-Domain uzmanı review'ı olmadan geçmez.

v1 teslim profili tektir: FastAPI içi GraphQL, Debian + Docker Compose, PostgreSQL kuyruk/outbox, kernel kimliği ve yalnız Keycloak OIDC federation referansı. Diğer taşıyıcılar interface olarak tasarlanabilir fakat destek matrisi kanıtı tamamlanmadan runtime seçeneği veya satış vaadi olamaz.

## 5. Yasaklar (CI kapılı)

"doctype" ve "plugin" kelimeleri içerikte kullanılmaz (ArcheType / module de). Next.js, Redux, Flowbite kullanılmaz. Test-önce sırası atlanmaz. Komşuluk kuralı ihlal eden backlog üretilmez.
