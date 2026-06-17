# Plan — Faz 2 / Option 4: Tam Açık İlişki & Parent Annotasyonu

**Karar:** Option 4 (300 sayfaya gerçek `parent` + tipli ilişki + eksik `granularity`). **Bu belge yalnız PLANDIR — uygulama yok.** Plan, 12 paralel salt-okuma agent'ının katalog İÇERİĞİ taramasına dayanır.

---

## 0. Net hüküm (TL;DR) + kapsam düzeltmesi

1. **İş, "mevcut `related[]`'i tiplemek" değil.** Okuma şunu gösterdi: çoğu sayfada `related[]` **yok**; çapraz-ref'ler blok içinde `{{ref:...}}` olarak gömülü. Yani Option 4 = **parent + tipli ilişki + eksik granularity'yi sıfırdan AUTHOR etmek** (~300 sayfa). Gerçek emek bu.
2. **Üç veri boşluğu doldurulacak:** `parent` (hiç yok), `relations:[{type,target}]` (yok; ham `related[]` kısmen var ama tipsiz), `granularity` (~%50 boş — breadcrumb için şart).
3. **Sıra zorunlu:** önce **temel** (şema + migrate + bileşen + kırmızı testler), sonra **pilot 1 cluster**, sonra **dalga dalga annotasyon**, en sonda **render aç**. Annotasyonu temelden önce yapmak = doğrulanamaz veri.
4. **Ön koşul borcu:** `module↔archetype` yeniden-etiketlemesi `parent` ve `granularity`'yi doğrudan etkiler (s-* "App mı, Module mı, ArcheType mı?"). Bu çözülmeden s-* parent'ları kısmen `?` kalır.

---

## 1. Veri gerçeği (okuma bulguları)

| Bulgu | Detay |
|---|---|
| `related[]` | Kısmî: yeni sayfalar (l1-*, edu-*, adr son) taşıyor; eski/çekirdek çoğu taşımıyor → ilişki blok içi `{{ref:}}`'den çıkarılmalı |
| `parent` | **Hiçbir sayfada yok** — tamamen yazılacak |
| `granularity` | ~%50 dolu (kaya/orta-tas/buyuk-tas); ADR/build/dx/be/sus/genel çoğu **boş** |
| Gözlemlenen ilişki tipleri | `uses`, `depends-on`, `extends`, `sibling`, `belongs-to`, `supersedes`, `used-by` (ters) |
| Net parent desenleri | prefix/cluster'a göre tutarlı (bkz. §3) |

**Parent deseni (prefix → tipik parent):**

| Prefix | Granülerlik (tipik) | Tipik parent | İlişki imzası |
|---|---|---|---|
| `s-*` | buyuk-tas / kaya | App/Stack (hangi ürün ailesi) | uses→l1-*, depends-on→diğer s-*, uses→cc-* |
| `l1-*` | kaya / orta-tas | Layer 1 (in-tree) | uses→scale-*, uses→cc-*, sibling→l1-* |
| `k-*`/kernel | kaya | Kernel domain | uses→kernel-schema/k-surface, depends-on→be-* |
| `scale-*` | orta-tas | Scale | depends-on→scale-*/k-bus, uses→outbox |
| `cc-*` | orta-tas / kaya | Crosscut (used-by çok katman) | depends-on→cc-*, used-by→s-*/l1-* |
| `stack-*` | kaya | Stack (kompozisyon) | composes→s-* (belongs-to ters) |
| `dist-*` | kaya | Distribution | composes→stack-*/s-*; bazıları izole (ilişkisiz) |
| `edition-*` | kaya | Edition (stack varyantı) | extends→stack-* |
| `edu-*` | orta-tas | App (pedagoji) | sibling→edu-*, uses→konu sayfaları |
| `adr-*` | — (boş) | Karar verdiği domain | decides→hedef sayfa; supersedes→eski adr |
| `be-*`,`fe-*`,`dx-*`,`build-*`,`sus-*` | — (boş) | İlgili teknik/ süreç alanı | uses/depends-on referans |

---

## 2. Veri modeli (şema) — temel adım

Kaynak şemaya **opsiyonel** iki alan (geriye uyumlu; eski sayfalar kırılmaz):

- `parent?: <pageId>` — kompozisyon ebeveyni (App›Module›ArcheType zincirini kurar).
- `relations?: [{ "type": <enum>, "target": <pageId>, "note?": <string> }]` — tipli kenarlar.

İlişki taksonomisi (bağlayıcı enum):

| Tip | Anlam | Ters (otomatik) |
|---|---|---|
| `belongs-to` | X, Y'nin parçası/kompozisyonu | `contains` |
| `uses` | X çalışırken Y'yi çağırır/tüketir | `used-by` |
| `depends-on` | X, Y olmadan çalışmaz (sıkı) | `required-by` |
| `extends` | X, Y'yi özelleştirir/varyantı | `extended-by` |
| `sibling` | aynı düzey/küme akranı | `sibling` (simetrik) |
| `supersedes` | X, Y kararını geçersiz kılar (ADR) | `superseded-by` |

**Geriye uyumluluk:** mevcut `related[]` korunur; migrate onları `relations`'a `type:"sibling"` (varsayılan, tipsiz) olarak terfi eder; sayfa açıkça `relations` verdiyse o kazanır. Böylece annotasyon kademeli olabilir.

---

## 3. Parent atama kuralları + zor vakalar

**Otomatik ilk-geçiş (migrate ya da batch agent):** prefix/cluster'dan §1 tablosuna göre `parent` ve ilişki tipini öner; agent içerikten (`{{ref}}` + ne yaptığı) doğrular/düzeltir.

**Zor vakalar (insan/uzman kararı gerekir, `?` ile işaretle):**
- **ADR'ler** (`adr-*`): parent = karar verdikleri domain; ama bazıları (repo, storybook, telemetri) proje-seviyesi → `parent: docs-viewer` ya da `?`.
- **Distribution izoleleri** (dist-education/clinic/membership/restaurant/legal): ilişkisiz; parent=Distribution, ama composes-hedefleri eksik → doldurulacak.
- **Capability-pattern** (s-ecommerce-models, s-classifieds): parent bir App değil "mimari karar/capability" → özel etiket.
- **s-\* genel** (~70 sayfa): parent "Kernel+Scale+L1 üstünde Layer-2 ürün" diyor — ama bu **App mı yoksa Domain/Module mü?** → `module↔archetype` relabel'ına bağımlı (ön koşul).
- **Paired numaralandırma** (170a cc + 170b s): kasıtlı eşleşme mi? doğrulanmalı.

---

## 4. Migrate + bileşen değişiklikleri (temel adım, koordineli — ben yaparım)

- **Migrate:** `parent`/`relations` tüket; `relations` hedeflerini çöz (çözülemeyen = CI uyarısı, mevcut related deseniyle aynı); ters kenarları (`used-by`/`contains`) otomatik üret; **parent zincirini** hesapla (breadcrumb için) + **döngü denetimi** (parent cycle reddi).
- **Üretilen veri:** her sayfada `breadcrumb: [App,…,self]` + `relationsByType: {uses:[…], depends-on:[…], …}`.
- **Bileşen (React, minimal):** (a) **Breadcrumb** (parent zinciri, granülerlik etiketli) sayfa başında; (b) **Bağlam kutusu** — ilişkileri tipe göre gruplu gösterir ("Ait olduğu", "Kullanır", "Bağımlı", "Genişletir"). Mevcut block-registry desenine uyar; `dangerouslySetInnerHTML` yok.

---

## 5. Test-first plan (önce KIRMIZI)

1. **Şema testleri:** `parent`/`relations` opsiyonel + enum geçerli; geçersiz tip reddedilir; eski sayfalar (alan yok) hâlâ geçer.
2. **Migrate determinizm:** aynı girdi → aynı `breadcrumb`/`relationsByType` (mevcut migrationDeterminism genişler).
3. **Çapraz-ref bütünlüğü (contentValidation):** her `parent` ve `relations.target` pages-index'te yaşar; parent döngüsü yok.
4. **Bileşen testleri:** breadcrumb parent zincirini sırayla render eder; bağlam kutusu tipe göre gruplar; ilişkisiz sayfada kutu gizli.
5. **Kapı:** tüm bunlar kırmızı yazılır → temel kodu yeşile alır; sonra annotasyon dalgaları bu yeşili bozmadan ilerler.

---

## 6. Paralel batch yürütme planı (annotasyon dalgaları)

**Conflict-free ilke:** her agent ayrı dosya kümesi (cluster/aralık) → çakışma yok; migrate/test/commit **tek elden orkestratör**.

| Dalga | Kapsam | Agent sayısı | Çıktı |
|---|---|---|---|
| **0 · Temel** | şema + migrate + bileşen + kırmızı testler | (ben, koordineli) | yeşil temel |
| **1 · Pilot** | 1 cluster (öneri: `layer1`, ~14 sayfa) tam annotasyon | 1 agent | desen doğrulama + kural kalibrasyonu |
| **2 · Çekirdek** | kernel, scale, crosscut | 3 agent (cluster başına) | ~50 sayfa |
| **3 · Ürün** | `s-*` (urunler) — alt-gruplara böl | 6–8 agent (op/fin/scm/hr/cx/content/data/platform) | ~72 sayfa |
| **4 · Paket** | stack-*, dist-*, edition-* | 3 agent | ~30 sayfa |
| **5 · Süreç/Karar** | adr-*, build-*, be-*, fe-*, dx-*, sus-* | 4 agent | ~80 sayfa |
| **6 · Pedagoji** | edu-* | 2 agent | ~33 sayfa |
| **7 · Render aç** | breadcrumb + bağlam kutusu görünür; gate'ler | (ben) | yayın |

Her dalga sonrası orkestratör: migrate → contentValidation (parent/relation çözülür) → sıralı test → commit/push (CI). Toplam ~20–22 annotasyon agent'ı (dalgalara yayılmış), +temel/render ben.

**Agent sözleşmesi (her batch):** "Yalnız kendi dosyalarına `parent` + `relations` ekle; tipleri §2 taksonomisinden seç; kaynağı blok içi `{{ref}}` + içerik; emin değilsen `note:'?'` ile işaretle; granularity boşsa §1 desenine göre doldur; migrate/git/test YOK."

---

## 7. Ön koşullar + riskler

- **Ön koşul — module↔archetype relabel:** s-*/l1-* parent ve granularity'si buna bağlı; önce kısa bir relabel kararı (hangi s-* App, hangisi Domain/Module, hangisi ArcheType) verilmezse ~70 ürün sayfasında parent `?` kalır. **Öneri: pilot'tan önce bu kararı netleştir.**
- **Risk — kaynak ikiliği:** ilişki hem `related[]` hem `{{ref}}` hem yeni `relations`'ta olabilir → migrate'te tek-doğruluk birleştirme kuralı (relations > related > ref) + dedup.
- **Risk — parent döngüsü / yanlış kompozisyon:** CI döngü kapısı + insan örneklem denetimi.
- **Risk — sayım gate churn:** annotasyon dosya SAYISINI değiştirmez (sadece içerik) → contentValidation count sabit; ama relations hedef çözümü yeni gate ekler.
- **Risk — `?` birikmesi:** belirsiz parent'lar editöryel kuyruğa; render onları "sınıflandırılmamış" gösterir, uydurmaz.
- **Risk — emek:** ~300 sayfa × (parent+ilişki+granularity) gerçek editöryel iş; pilot ölçüp dalga boyutunu kalibre et.

---

## 8. Özet — sıradaki adım (onayınla)

**Önce Dalga 0 (temel):** şema alanları + migrate (parent/relations/breadcrumb/ters/döngü) + minimal breadcrumb & bağlam-kutusu bileşeni + kırmızı testler — hepsini test-first, tek commit, CI yeşil. **Sonra Pilot (layer1)** ile kuralları kalibre et. Pilot doğrularsa Dalga 2→6 paralel agent'larla, her dalga CI-yeşil.

> Karar gereken tek nokta: **Dalga 0'ı şimdi başlatayım mı**, yoksa önce **module↔archetype relabel** mini-kararını mı verelim (s-* parent'larını netleştirmek için)? Önerim: relabel kararı → Dalga 0 → Pilot. Bu plan fikir fazıdır; `uygula` demeden kod/şema yazmadım.
