# 03 — Navigation Bilgi Mimarisi (Rail 1 / Rail 2)

Bu doküman, iki seviyeli navigasyonun bilgi mimarisini ve URL/ID sözleşmelerini tanımlar. Temel ilke `menu_hiyerarsi_audit.md`'den devralınır: kullanıcı yukarıdan aşağıya okur — önce eğitim, sonra genel resim, sonra katmanlar (atom → kernel → scale → L1 → L2), sonra çapraz konular, sonra üretim, en sonda ileri seviye konular.

## 1. Rail 1 — Ana Kategoriler (sıralı)

| Sıra | Kategori ID | Etiket | İkon (Phosphor) | Kaynak prefix | Yaklaşık page |
|---|---|---|---|---|---|
| 0 | `egitim` | Eğitim Yolu | `ph-graduation-cap` | `edu-*` | 28 |
| 1 | `genel` | Genel Harita | `ph-list-checks` | overview, philosophy, board, atomic | 4 |
| 2 | `kernel` | Kernel — Layer 0 | `ph-cube` | `kernel-*`, `k-*` | 8 |
| 3 | `scale` | Scale Primitives | `ph-trend-up` | `scale-*` | 15 |
| 4 | `layer1` | Layer 1 — In-tree | `ph-stack` | `layer1-*`, `l1-*` | 12 |
| 5 | `stack` | Stack Ürünleri | `ph-package` | `stack-*`, `dist-*`, `edition-*` | 31 (18 stack + 6 distribution + 7 edition + 0 landx) |
| 6 | `urunler` | Ürün Modülleri | `ph-squares-four` | `s-*` | 72 |
| 7 | `crosscut` | Çapraz-Kesen | `ph-arrows-out` | `cc-*`, `crosscut-*` | 17 |
| 8 | `dx` | DX & Services | `ph-puzzle-piece` | `dx-*`, services | 4 |
| 9 | `build` | Build & Deploy | `ph-flag-banner` | build, deploy, file-layout, product-mapping, anti-patterns | 5 |
| 10 | `backend` | Backend Tech-Stack | `ph-database` | `be-*` | 3 |
| 10 | `frontend` | Frontend Tech-Stack | `ph-device-mobile` | `fe-*` | 9 |
| 12 | `sus` | Sürdürülebilirlik | `ph-infinity` | `sus-*` | 12 |

Kategori ataması elle yapılmaz; migration script'i dosya prefix'inden üretir ve istisnalar tek bir mapping tablosunda tutulur. Engine, kategori sayısına ve adına bağımlı kod içermez — `menu_hiyerarsi_audit.md` madde 4.2'deki "tamamen veri-tabanlı" ilkesi korunur.

### Rail 1 Bölümleri

Rail 1 düz liste değildir; kategoriler üç bölüm başlığı altında akar (bilişsel yük 13 maddeden 3 kümeye iner): **BAŞLANGIÇ** (Eğitim Yolu, Genel Harita) · **İNŞA SIRASI** (Backend Tech-Stack → Kernel → Scale → Layer 1 → Stack → Build & Deploy — kararlar inşanın girdisidir, bu yüzden bölümün başındadır; Faz 0 Kernel'in ilk maddesi, Faz 6-7 Build & Deploy altındadır) · **REFERANS** (Ürün Modülleri, Çapraz-Kesen, Frontend Tech-Stack, DX & Services, Sürdürülebilirlik). Bölüm bilgisi `navigation.json`'da kategori-başına `section` alanıdır; sırası kategori `order`'ından gelir ve bölümler bitişiktir. Faz 0 (Atomik Tipler) Kernel kategorisinin ilk maddesidir (eski `genel/` linki stem-fallback ile çalışır); Eğitim Yolu'nun ikinci maddesi `edu-faz-haritasi` üniteleri Faz 0-7'ye eşler (vibecoding hazırlık eşiği). `board-rebuilt` ARŞİV rozetlidir.

## 2. Rail 2 — Accordion Grupları

Rail 2, seçili kategorinin page listesini accordion gruplar halinde gösterir. Gruplama kuralları kategoriye göre değişir:

- `egitim`: tek düz liste, ünite sırasına göre (overview → u01 → … → u25). Accordion'a gerek yok; sıralı okuma akışı bölünmez.
- `urunler` (64 page): `00-overview.json`'daki 9 ürün kategorisi accordion grubu olur — Çekirdek Operasyon, Finans & Muhasebe, Tedarik Zinciri & Lojistik, İnsan Kaynakları, Müşteri & Gelir, İçerik & İşbirliği, Veri & Zeka, Platform/Altyapı, Dikey çözümler. Her `s-*` page'i bir gruba atanır; atama tablosu migration'da üretilir ve `navigation.json`'da taşınır.
- `stack`: dört accordion grubu — **Stacks** (`stack-*`: fonksiyonel olarak eksiksiz yatay app paketleri), **Distributions** (`dist-*`: sektör paketi = **edition + config + sektör içeriği** — iç içe halkalar: Stack ⊂ Edition ⊂ Distribution), **Editions** (`edition-*` + `stack-editions` kavram kaydı: aynı core module seti, gelişmiş UI estetiği ve UX akışı — ölçüt: Frappe HRMS fonksiyonu yeter, BambooHR estetiği Edition işidir) ve **LandX — sahibinden clone (vaka)** (`landx-*`: top-level kategori değil, Stack Ürünleri altındaki ürünlerden biri). Taksonomi sözleşmesi ADR-0007 terminolojisiyle birlikte okunur: kernel sistemin kalbi, core app'in kalbi, genişletme birimi module'dür.
- Diğer kategoriler: page sayısı ≤ 17 olduğundan tek accordion grubu veya konu bazlı 2–3 grup yeterlidir; grup başına 10 item üst sınırı hedeflenir (bilişsel yük sınırı).

## 3. Slug ve ID Sözleşmeleri

| Varlık | Format | Not |
|---|---|---|
| Route | `/docs/$section/$page` | `$section` = kategori ID, `$page` = page slug'ın son segmenti |
| Page slug | `<kategori-id>/<konu>` | Dosya adındaki numara prefix'i slug'a girmez (`43-build-sequence.json` → `build/build-sequence`) |
| Page ID | `page-<konu>` | Slug'dan bağımsız, kalıcı; içerik taşınsa da değişmez |
| Block ID | `block-<page-konu>-<block-konu>` | Page içinde benzersiz; anchor navigation bunu kullanır |
| Block anchor | URL hash: `#block-...` | Hash bulunamazsa sayfa başına gidilir, hata gösterilmez |
| Term ID | `term-<kavram>-<baglam>` | Bağlama özel; aynı kavram farklı page'lerde farklı termId taşır |
| Search doc ID | `search-<pageId>-<blockId>` | Index kaydı page + block çiftini benzersiz adresler |

Örnek tam URL:

```txt
/docs/kernel/k-authz#block-k-authz-rls-stratejisi
```

## 4. ID Kararlılığı Kuralları

Block ID'ler bir kez yayınlandıktan sonra değiştirilmez, çünkü dış bağlantılar ve search index bu ID'lere işaret eder. İçerik güncellenirken block silmek yerine yeni ID ile yeni block eklemek, eskisini kaldırmak tercih edilir; silinen ID'ye gelen hash sessizce sayfa başına düşer. Migration script'i ID üretimini deterministik yapar — aynı kaynak dosyadan iki kez çalıştırıldığında aynı ID'ler çıkar; bu, diff alınabilirliği ve search index tutarlılığını garanti eder.

## 5. Navigation JSON Yapısı

`navigation.json` yalnızca yapı taşır, içerik taşımaz:

```txt
navigation.json
  categories[]            -> Rail 1
    id, label, icon, order
    groups[]              -> Rail 2 accordion
      id, label, order
      items[]             -> accordion item
        pageId, slug, title, order
```

Bu yapının Zod şeması `06-uretim-01-schema.md`'de tanımlanır; navigation'da referans verilen her `pageId`'nin `pages.json`'da var olması CI'da doğrulanır (kırık referans build'i kırar).
