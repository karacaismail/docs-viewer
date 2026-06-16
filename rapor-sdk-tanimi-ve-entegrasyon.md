# Rapor — SDK Tanımı (Geliştirici Cephesi) ve Projeye Entegrasyon Haritası

**Soru:** SDK tanımları dokümanlarda eksik. SDK = bir app geliştirmek için **geliştirme altyapısı**; klon→tek-komut→tüm ortam; sonra **[app, module, theme]** geliştirilir; hedefler **[frontend, backend, mobile(ios/android), chrome extension]**. iOS/Android SDK ve Firebase/Stripe/Shopify/HubSpot/Salesforce/Twilio gibi. **SDK nasıl olmalı? Bu projedeki tanımlar nerelere entegre edilmeli?**

**Tarih:** 2026-06-16 · **Bağlam:** docs-viewer meta-framework. Bu bir **rapor** (fikir fazı); `ekle.` gelmeden `content-source` değişmez.

---

## 0. Net hüküm (TL;DR)

1. SDK kavramı projede **var ama dar**: `k-terminoloji` SDK'yı "app/module geliştirme kiti — vibecoding iskelet üretimi" diye tanımlıyor; `be-sdk` yalnız `sdk app create` akışını veriyor; `dx-cli` `create-module`. **Eksik olan dört şey:** (a) **theme** üçüncü buildable; (b) **çok-hedef** (frontend/mobile/extension, şu an backend-ağırlık); (c) **klon→tek-komut→tüm geliştirme ortamı** onboarding'i; (d) **SDK ⊃ SDK_APP ⊃ Modules(core+custom)** konteyner çerçevesinin açıkça yazılması.
2. **SDK = kernel üstündeki geliştirme altyapısıdır** (runtime'ı kernel verir; SDK *sözleşme + iskelet + CLI + dev-env*'i verir). Granülerlik: **Kernel (runtime kalbi) → SDK (geliştirme altyapısı) → SDK_APP (crm/hrms/ecommerce) → Modules [Core (sabit) + Custom (1..N)]**. **Theme** yatay buildable'dır (sunum katmanı; Edition'ı gerçekler).
3. **Üç buildable, tek CLI:** `sdk app create` (var) · `sdk module create` (≈ dx-cli `create-module`, var) · **`sdk theme create` (YOK — eklenecek)**.
4. **Tek-komut bootstrap:** `git clone` → `sdk up` (veya `npx <kit>`) → Docker Compose ile v1 profili (Debian + Postgres + FastAPI/GraphQL + Keycloak OIDC) ayağa kalkar; macOS'ta geliştir, Hetzner/Debian'da çalıştır. Bu, `be-deploy-profilleri` ile aynı profili kullanır.
5. **Hedefler katmanı:** backend + web-frontend **v1**; **mobile(ios/android)** ve **chrome extension** AGENTS.md ilkesiyle **interface olarak** tasarlanır, destek-matrisi kanıtı tamamlanmadan runtime/satış vaadi olmaz (roadmap).
6. **Entegrasyon:** 5 mevcut sayfa genişletilir (`k-terminoloji`, `be-sdk`, `dx-cli`, `dx-marketplace`, `adr-0007`) + AGENTS.md sözlüğü + **1 yeni sayfa** (`fe-theme` — theme buildable). İsteğe bağlı: `be-sdk-hedefler` (çok-hedef) ayrı sayfa.

---

## 1. Mevcut durum ↔ boşluk

| Kavram | Şu an nerede | Durum |
|---|---|---|
| SDK tanımı | `k-terminoloji` (kv: "app/module geliştirme kiti") | var, **dar** (theme/çok-hedef/dev-env yok) |
| `sdk app create` | `be-sdk` (Tanımla→İskelet→Vibecode→Doğrula→Paketle) | var, sağlam |
| `module` scaffolding | `dx-cli` (`create-module`, hook contract, test harness) | var |
| Marketplace + versiyon | `dx-marketplace` | var (module odaklı) |
| AI-yüzey sınırı | `be-sdk` (archetypes/hooks/tests; kernel kapalı) | var, korunmalı |
| Terminoloji ADR | `adr-0007` (Kernel/Core/Module) | var, SDK satırı zayıf |
| **theme buildable** | — | **YOK** |
| **çok-hedef (mobile/extension)** | dağınık (`fe-*` web; "Chrome extension kadar basit" sadece kurulum benzetmesi) | **eksik/birleşmemiş** |
| **klon→tek-komut→tüm ortam** | — (be-sdk env'i hazır varsayıyor) | **YOK** |
| **SDK ⊃ APP ⊃ Modules diyagramı** | k-terminoloji'de örtük | **açık değil** |

---

## 2. SDK nasıl olmalı (model)

### 2.1 Tanım
SDK, **bir app'i (ve modüllerini, temalarını) geliştirmek için gereken altyapının tamamıdır**: bildirimsel sözleşmeler (ArcheType/Surface/Workflow/Manifest şemaları) + iskelet üretici + CLI + yerel geliştirme ortamı + test/doğrulama kapıları + paketleme. Runtime'ı **kernel** sağlar; SDK runtime'ı *kullandırır*, yeniden yazdırmaz (AI ve geliştirici kernel iç API'sine dokunamaz — `be-sdk` sınırı).

### 2.2 Hiyerarşi (kullanıcının diyagramı + mevcut sözlük)

```
Kernel (runtime kalbi)
  └─ SDK (geliştirme altyapısı: sözleşme + iskelet + CLI + dev-env)
       └─ SDK_APP  [crm · hrms · ecommerce · ...]   (granül: Dağ)
            └─ Modules (uygulamanın modül kaydı)
                 ├─ Core Module     (sabit; her app'te bir, değişmez)
                 └─ Custom Module 1..N (takılıp çıkarılabilir)
       ┄ Theme (yatay buildable: sunum/skin katmanı; Edition'ı gerçekler)
```

Bu, mevcut sözlükle uyumlu: App=Dağ, Core=app'in değişmez çekirdeği, Module=genişletme birimi. Eklenen tek yeni kavram **Theme**'dir (§3).

### 2.3 Üç buildable — tek CLI yüzeyi

| Komut | Üretir | Mevcut karşılık |
|---|---|---|
| `sdk app create <ad>` | SDK_APP iskeleti: core module + ilk ArcheType'lar + Surface'ler + manifest | `be-sdk` (var) |
| `sdk module create <ad>` | Custom module iskeleti: hook contract + test harness + manifest | `dx-cli` `create-module` (var) |
| **`sdk theme create <ad>`** | **Theme iskeleti: token seti + Surface şablonları + a11y/perf bütçesi** | **YOK — eklenecek** |

Hepsi **test-first** (be-sdk sırası: testler ÖNCE → archetypes/surfaces/workflows → manifest → saf hook).

### 2.4 Hedefler (targets) — ne v1, ne interface
SDK bir app için şu hedeflerin temelini verir:

| Hedef | Durum | Not |
|---|---|---|
| **Backend** | v1 | FastAPI içi GraphQL, Postgres, Keycloak OIDC (AGENTS v1 profili) |
| **Frontend (web)** | v1 | React 19 + TanStack Router + Radix (anti-stack: Next.js/Redux/Flowbite YASAK) |
| **Mobile (iOS/Android)** | interface (roadmap) | Contract/headless API üstünde; destek-matrisi kanıtı olmadan runtime/satış vaadi yok |
| **Chrome extension** | interface (roadmap) | Aynı Contract yüzeyi; "kurulum Chrome extension kadar basit" zaten hedef benzetmesi |

> AGENTS.md ilkesi birebir korunur: "Diğer taşıyıcılar interface olarak tasarlanabilir, destek matrisi kanıtı tamamlanmadan runtime seçeneği/satış vaadi olamaz."

### 2.5 Tek-komut geliştirme ortamı (onboarding)
`git clone <kit>` → **tek komut** (`sdk up` / `npx <kit> init`) → tüm dev-env: Docker Compose ile Debian + Postgres (+ kuyruk/arama/event aynı Postgres, varsayılan-basit) + FastAPI/GraphQL + Keycloak OIDC referansı + seed. macOS M-serisi'nde geliştir, Hetzner/Debian + GitHub private repo ile deploy. Bu hat `be-deploy-profilleri` profiliyle **aynıdır** — SDK onu reçeteler.

### 2.6 Analoji (konumlandırma)
- **Platform/runtime SDK gibi:** iOS SDK, Android SDK — cihaz/OS için app üretim temeli.
- **Servis SDK gibi:** Firebase, Stripe, PayPal, Twilio, WhatsApp Business, Google Ads, Meta Marketing — tipli istemci + sözleşme.
- **Uygulama-platform SDK gibi:** Shopify, HubSpot, Salesforce — app/extension/theme'i kendi marketplace'inde üretip dağıtma. **Bizim SDK bu üçünün kesişimidir:** kernel-runtime + tipli sözleşme + app/module/theme üretimi + marketplace.

---

## 3. Theme — eksik üçüncü buildable (Edition ile ilişki)

**Çakışma riski:** Sözlükte **Edition** = "aynı kod, gelişmiş UI/UX + GTM". **Theme** bunu *gerçekleyen artefakttır*: token seti + Surface şablonları + bileşen stilleri. Yani **Edition bir pakettir (ne satılır), Theme onun sunum mekanizmasıdır (nasıl görünür)**. Kural: Theme kod/iş mantığı değiştirmez; yalnız sunumu (token, layout, a11y/perf bütçesi içinde) değiştirir. Bir Edition bir Theme'i pinler; Distribution = Edition + config + sektör içeriği (Theme dahil).

**Theme buildable çerçevesi:** `sdk theme create` → `tokens.css` (renk/spacing/tipografi; mevcut `src/styles/tokens.css` 09A deseni) + Surface şablon override'ları + zorunlu a11y (axe) + perf (size-limit) kapıları. Anti-stack: SCSS/Flowbite tartışması kullanıcı kuralıyla — Flowbite YASAK; token-tabanlı.

---

## 4. Entegrasyon haritası — tanımlar nereye

| Sayfa | Eklenecek | Tip |
|---|---|---|
| **`k-terminoloji`** (kanonik sözlük) | SDK kv'sini genişlet: dev-infrastructure tanımı + **SDK⊃APP⊃Modules** diyagramı + üç buildable + hedefler + analoji satırı | genişlet |
| **`be-sdk`** | `sdk app create`'in önüne **klon→tek-komut→dev-env** onboarding adımı; akışa **`sdk module create` + `sdk theme create`**; çok-hedef notu (backend/web v1, mobile/extension interface) | genişlet |
| **`dx-cli`** | CLI'yı app/module/**theme** + tek-komut bootstrap (`sdk up`) kapsayacak şekilde genişlet | genişlet |
| **`fe-theme`** (YENİ, frontend cluster) | Theme buildable: token seti + Surface şablon + a11y/perf kapıları; Edition ilişkisi | **yeni sayfa** |
| **`dx-marketplace`** | Dağıtımı app + module + **theme** kapsayacak şekilde genişlet (üç artefakt) | genişlet |
| **`adr-0007`** | Terminoloji ADR'sine **SDK** ve **Theme** satırı (bağlayıcı) | genişlet |
| **`AGENTS.md`** §1 sözlük | SDK (dev-infrastructure) + Theme tanımı; "theme yap" komut gramerine | genişlet |
| (ops.) **`be-sdk-hedefler`** (YENİ) | Çok-hedef matrisi (backend/frontend/mobile/extension) ayrı sayfa istenirse | opsiyonel yeni |
| `build-app-katalogu` / `overview` | SDK_APP örnek eşlemesi (crm/hrms/ecommerce → Dağ kataloğu) referansı | bağ |
| `sus-lisans` | SDK + theme/module lisans sınırı (MIT/API-boundary zaten var) | dokun |

**Komşuluk kuralı:** SDK, granülerlik zincirinde **App'in üstünde** (Kernel ile App arası geliştirme katmanı) konumlanır; Theme yatay eksende (Surface sunumu) durur — zincire atlama eklemez.

---

## 5. Mimari gerilimler / kararlar

- **Theme vs Edition:** Theme = sunum artefaktı, Edition = satılabilir paket. Theme kod/mantık değiştirmez (yalnız token/layout); aksi `core module değişmezliği`ni bozar. → net sınır §3.
- **Mobile/extension vs v1 profili:** interface olarak tasarla, destek-matrisi kanıtı olmadan runtime/satış vaadi yok (AGENTS). → §2.4 "roadmap".
- **Anti-stack:** Frontend/theme hedefi Next.js/Redux/Flowbite kullanamaz (CI yasak taraması + kullanıcı kuralı). React 19 + TanStack + Radix + token-tabanlı tema.
- **AI-yüzey sınırı korunur:** SDK genişlese de AI yalnız archetypes/hooks/tests/theme-token'lara dokunur; kernel iç API'si kapalı (`be-sdk`).
- **Tek-komut ≠ sihir:** `sdk up` Docker Compose'u reçeteler; deterministik, `be-deploy-profilleri` ile aynı v1 profili.

---

## 6. Öneri ve sonraki adım

SDK'yı "dar app/module kiti" tanımından **kernel üstü geliştirme altyapısı** tanımına yükselt: **SDK⊃SDK_APP⊃Modules(core+custom)** hiyerarşisi + **üç buildable (app/module/theme)** + **çok-hedef (backend/web v1; mobile/extension interface)** + **klon→tek-komut→dev-env** + analoji. Theme'i yeni first-class buildable yap, Edition'ın sunum mekanizması olarak sınırla.

> `ekle.` dersen: `k-terminoloji`/`be-sdk`/`dx-cli`/`dx-marketplace`/`adr-0007`'yi genişletir, **`fe-theme`** sayfasını ekler, AGENTS.md sözlüğünü güncellerim; her sayfaya test-first geliştirme planı koyar, migrate + docSync/contentValidation gatelerini yeşile alır, commit + CI/CD çalıştırırım. İstersen tek paket, istersen önce yalnız `k-terminoloji` + `be-sdk` çekirdek tanımı.
