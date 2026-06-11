# devpanel.md — Developer Panel Gereksinim Analizi

> **Kapsam:** Meta-framework kernel'inin **Developer Panel**'i (Drupal admin / Frappe Desk / Django Admin sınıfı — geliştirici odaklı).
> **Kapsam DIŞI (şimdilik):** Son-kullanıcı **Yönetim Paneli** (WordPress/Shopify kullanıcısı hedef kitle için) — ayrı gereksinim analizi, daha sonra.
> Bağlayıcı sözleşmeler: ADR-0007 (kernel/core/app/module), ADR-0008 (granülerlik + eşleştirme), ADR-0009 (ArcheType), ADR-0010 (Surface/Domain/Workflow), be-kararlar (24/24), be-sdk, k-granulerlik, k-surface.

---

## 1. Amaç ve Persona

Developer Panel, **tanım katmanının görsel yüzüdür**: ArcheType/Surface/Workflow YAML'ları tek doğruluk kaynağı kalır; panel onları okur, düzenler, doğurduklarını gösterir. Panel hiçbir zaman tanımın önüne geçmez — *"UI yapar, tanım yazar"*.

| Persona | İhtiyaç |
|---|---|
| Jr-öncesi vibecoder | Eğitim Yolu'ndan gelir; AI'ın ürettiğini ANLAYIP onaylayacağı yüzey — her ekran k-granulerlik/k-surface diliyle konuşmalı |
| AI agent (MCP) | Panelin yaptığı her şeyin MCP/CLI eşdeğeri — panel, agent'ın yapabildiklerinin insan-görünümü |
| Framework geliştiricisi | Kernel iç durumu: migration kuyruğu, outbox/DLQ, sandbox, conformance |
| Müşteri-talebi taşıyan geliştirici | "App üzerinde özelleştirme istedi": brand colors, custom fields, custom forms, custom modules — §4 |

## 2. Tasarım İlkeleri (DX anayasası)

1. **AI-first:** Her ekranın bir MCP tool karşılığı vardır; her panel aksiyonu, eşdeğer `sdk …` komutunu ve MCP çağrısını görünür üretir ("Copy as CLI / as MCP call"). Komut paleti (⌘K) doğal dil kabul eder: *"crm dağ yap"*, *"listing orta taş yap"* → granülerlik denetleyicisinden geçen scaffold önizlemesi.
2. **Tanım-öncelikli:** Görsel editörler YAML'ın projeksiyonudur; her görsel değişiklik diff olarak gösterilir ve commit'lenebilir. Elle YAML > görsel editör çakışmasında YAML kazanır.
3. **Test-önce:** Scaffold akışları test dosyasını İLK üretir (be-sdk sırası); kırmızı test paneli kapatılamaz bir bölgedir.
4. **Granülerlik dili:** Her iş öğesi seviye rozetiyle gezer — `ArcheType (Büyük Taş · 13)` biçiminde, yeni ad önde, metafor parantezde (ADR-0008 Rev.2). Komşuluk kuralı UI'da zorlanır: seviye atlayan plan kaydedilemez.
5. **Klavye-öncelikli, 320px-akışkan, WCAG AA, dark-first; i18n gün-1 (E7).** Telemetri yok (ADR-0006) — panel kullanım verisi de toplanmaz.
6. **Tek panel, çok app:** Üstte app/tenant değiştirici; Party gibi paylaşılan ArcheType'lar "kernel" rozetiyle ayrışır.

## 3. Bilgi Mimarisi ve Modül Gereksinimleri

| # | Modül | Gereksinim özeti | Bağlı sözleşme |
|---|---|---|---|
| P1 | **ArcheType Studio** | Listele/aç; YAML editör + görsel alan listesi; bayrak yönetimi (pii/bitemporal/retention/audit); "doğurdukları" sekmesi: tablo, GraphQL/REST, varsayılan Surface, MCP tool, üretilmiş testler; Fragment alt-editörü | k-archetype-bayrakları, k-sozlesme |
| P2 | **Surface Builder** | Projeksiyon seç (1+ ArcheType), alan/biçim, `edition_overrides`, `surface:none` (headless) anahtarı; canlı önizleme | k-surface, ADR-0010 |
| P3 | **Workflow Designer** | Durum makinesi düzenleyici; sürümleme + tenant pinleme görünümü; telafi (compensation) zorunlu alanı | layer1-workflow, sus-versioning |
| P4 | **Module Manager** | Manifest/izin beyanı görüntüleme; WASM sandbox durumu; kur/etkinleştir/kaldır — "Chrome extension kadar basit" akış (d09); Module Registry | kernel-plugin sayfası, d09 |
| P5 | **Domain & Contract Haritası** | Kaya sınırları, Contract listesi (kim kime hangi event/endpoint), ihlal uyarıları | k-surface, sus-boundaries |
| P6 | **API Explorer** | Varsayılan GraphQL playground; REST/OpenAPI sekmesi (kurulumda açıldıysa); şema-pinleme/sürüm seçici | d07, k-sozlesme |
| P7 | **Data Browser** | Tenant-scoped veri gezgini (RLS farkındalıklı); PII alanları maskeli; satır-düzey audit geçmişi | d03, E9 |
| P8 | **Migration Paneli** | ArcheType diff → üretilen migration önizleme; LLM-review kuyruğu (d02 açık araştırma); uygula/geri al | d02 |
| P9 | **Test Runner** | Üretilmiş kontrat testleri + `sdk check` sonucu; "komşu tenant okuyamaz" sınıfı sonuçlar ayrı vitrin | k-sozlesme |
| P10 | **WBS / Backlog** | k-wbs ağacının canlısı: gerçek tanımlardan türeyen SP kırılımı; komşuluk denetleyicisi; "AI'a tarif et" kutusu | k-granulerlik, ADR-0008 |
| P11 | **Observability** | Structured log akışı (trace_id/tenant filtreli), outbox/DLQ panosu, mail zinciri sağlığı (sağlayıcı başarı oranı) | E2, be-mail-zinciri |
| P12 | **AI Konsolu** | MCP tool kataloğu (ArcheType başına otomatik), agent capability scope editörü, blast-radius önizleme | d11, layer1-audit |
| P13 | **Tema / Token Editörü** | Tenant brand-colors (token bazlı), canlı kontrast denetimi (AA) | §4-a |

## 4. Müşteri Özelleştirme Senaryoları (kullanıcı talebi → panel karşılığı)

| Talep | Panel akışı | Sınır |
|---|---|---|
| **a. Brand colors** | P13: token seti (palette/spacing/radius) tenant-başına override; canlı önizleme + AA kontrast bekçisi; çıktı = theme token dosyası | Kod yok; token dışına CSS yazılamaz |
| **b. Custom fields** | P1: Custom Field ekle (tenant-scoped, E8 esnekliği) — Frappe'deki custom field/property setter deseni; PII/retention bayrakları burada da zorunlu seçim | ArcheType core şeması değişmez; tenant katmanında yaşar |
| **c. Custom forms** | P2: Surface override — aynı ArcheType'a tenant-özel projeksiyon (alan sırası/görünürlük/bölümler); edition_overrides ile aynı mekanizma | Veri modeline dokunmaz; yalnız projeksiyon |
| **d. Custom modules** | P4 + `sdk module new` scaffold (test-önce); manifest izin beyanı zorunlu; WASM sandbox'ta koşar; pazaryeri lisans şablonu (MIT-SDK sınırı) | Kernel'e dokunamaz; beyan dışı izin yok |

## 5. Örnek Bileşen Envanteri (yapı — props/state/davranış)

| Bileşen | Props (öz) | State | Davranış kuralları |
|---|---|---|---|
| `CommandPalette` | `commands[], onAI(prompt)` | açık/öneri listesi | ⌘K; doğal dil → granülerlik denetleyicisi → scaffold önizleme; her komut CLI eşdeğerini gösterir |
| `EntityTable` | `archetype, columns?, filter` | sıralama/sayfa/seçim | TanStack Table; sanal kaydırma ≥100k satır; PII kolonları maskeli rozet |
| `YamlEditor` | `value, schema, readOnly?` | diff, hatalar | CodeMirror 6 + zod/JSON-schema doğrulama; kaydet = diff onayı |
| `SchemaDiffViewer` | `before, after` | — | Alan ekle/sil/değiş renk kodlu; üretilecek migration özeti satır altında |
| `SurfaceCanvas` | `surfaceDef` | seçili projeksiyon | Sürükle = YAML patch üretir; headless ise boş-durum kartı |
| `WorkflowGraph` | `states[], transitions[]` | seçim/sürüm | Geçişler tanımdan; izinsiz geçiş çizilemez; sürüm seçici pinleme gösterir |
| `PermissionMatrix` | `roles[], actions[]` | hücre overrides | İki-düzlem (E1): entitlement satırı kilitli görünür |
| `TokenThemeEditor` | `tokens, onChange` | önizleme teması | AA kontrast altı değer kaydedilemez |
| `MigrationQueue` | `pending[]` | onay durumu | LLM-review etiketi (öneri ≠ karar — d02 ilkesi) |
| `LogStream` | `filter{trace,tenant,level}` | takip modu | SSE; satır → trace zinciri açılır |
| `DlqBoard` | `items[]` | seçim | Tek tık yeniden işle; nedeni ve yaşını gösterir |
| `CapabilityScopeEditor` | `agent, scopes[]` | taslak | Blast-radius önizleme; geniş yarıçap ek onay ister |
| `KbdHint / EmptyState / ConfirmDanger` | — | — | Tutarlı boş-durum/teyit dili; tüm yıkıcı işlemler isim-yazarak onay |

## 6. Teknoloji Kararı Önerisi

**Çerçeve: React** (Vue değil). Gerekçe: viewer zaten React (tek zihinsel model, jr-öncesi için tek öğrenme yolu); hedef kütüphane ekosistemi (TanStack, Radix, shadcn) React-doğal; AI eğitim verisinde React+TS hacmi vibecoding isabetini artırır. Vite SPA + TanStack Router/Query — Next.js yok (kilitli karar).

**UI katmanı — "her şey aynı kalıp" endişesine cevap:** Hazır-temalı kit yerine **headless primitive + sahiplenilmiş kod**:

| Aday | Değerlendirme | Karar |
|---|---|---|
| **Radix UI** | Headless, a11y-doğru primitive'ler; viewer'da kanıtlı | ✅ Temel katman |
| **shadcn/ui** | Bağımlılık değil kopyala-sahiplen; Radix üstü; KENDİ token setimizle (09A ailesi) tema — Flowbite-tekdüzeliğinin tam tersi | ✅ Başlangıç şablonu, sonra bizimdir |
| **TanStack Table / Query** | Headless tablo + sunucu-durumu; EntityTable'ın kalbi | ✅ |
| **Ark UI** | Çok-framework headless; Radix'e güçlü alternatif | 🔄 Yedek (Radix yetmezse) |
| **Headless UI** | Dar bileşen seti | ➖ Gerek yok (Radix kapsıyor) |
| **daisyUI / HyperUI / Tailwind UI** | Hazır görsel kalıplar — "aynı kalıp" riski; HyperUI/TailwindUI kopyala-yapıştır parçacık | ➖ Tema dili bizden; gerekirse parçacık ilhamı |
| **Flowbite** | — | ⛔ Kapsam dışı (talep) |

Tamamlayıcılar: Tailwind v4 (token köprüsü 09A'dan), `react-hook-form` + **zod** (şema tek kaynak), CodeMirror 6, ECharts (yalnız ADR-0011 kapsamı genişletilerek), SSE (realtime), zustand (yerel UI durumu — Redux yasak). Lisans notu: panel kernel reposunda **AGPL**; panelin yeniden kullanılabilir bileşen kiti ileride MIT-SDK tarafına ayrıştırılabilir (açık karar).

## 7. Prototip Kapsamı (Faz-P0) ve Kabul

**P0 ekranları:** ArcheType Studio (okuma + bayrak görüntüleme + doğurdukları) · Surface Builder (okuma + headless anahtarı) · CommandPalette ("crm dağ yap" → scaffold ÖNİZLEME, yazma yok) · EntityTable (örnek ArcheType verisi) · Tema Editörü (token önizleme).
**Kabul:** her P0 ekranının MCP/CLI eşdeğeri görünür; komşuluk kuralı ihlali UI'da engellenir; 320px akışkan; axe ciddi ihlal 0; test-önce iskelet (bileşen kontrat testleri bileşenden önce).

**Açık kararlar:** alan seviyesinin adı (Field/Attribute — ADR-0010 Rev.1; P1 ekran metinleri bu karara kadar "alan" der) · panel bileşen kitinin lisans ayrışması · Yönetim Paneli (son kullanıcı) gereksinimleri — bilinçle ertelendi.
