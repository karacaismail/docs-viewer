# 01J — ADR-0010 (viewer serisi): Surface Birinci-Sınıf Kavramdır — Beşli Denklem

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

Eski model tanımı üç zincire bağlıyordu: her tanım bir form üretir (yüzey zinciri), varlık = ekran = modül sanılır (birim zinciri), durum makinesi tanıma gömülüdür (süreç zinciri). Ürün felsefesi netleşti: **kod yazmadan module üretmek — diferansiyatör ArcheType'tır**; bu vaat ancak üç zincir kırılırsa tutar.

## Karar

Beşli denklem bağlayıcıdır ve kanonik sayfası `kernel/k-surface`'tir: **her sayfa bir Surface'tir; her Surface bir veya birden çok ArcheType'ı projekte eder; her ArcheType bir Domain'e aittir; Domain hiçbir zaman tek bir birim değil, bir sınırdır; Workflow ArcheType'tan bağımsız versiyonlanır.** Bunlardan üç yetenek doğar ve sözleşmedir: (1) headless ArcheType (`surface: none` — UI opsiyondur), (2) çok-ArcheType Surface (360° ekranlar, Edition-duyarlı projeksiyonlar), (3) tenant-başına pinlenebilir Workflow sürümü. Granülerlik eşlemesi: App=Dağ, Domain=Kaya, Surface=Büyük/Orta Taş. AI-native bağ: her ArcheType otomatik MCP tool'udur; agent capability scope ve SP kırılımı tanımdan türer. SDK iskeleti `archetypes/ + surfaces/ + workflows/` üçlüsüne genişler.

## Sonuçlar

Artılar: dashboard/birleşik ekran/UI'sız varlık hack değil tanım olur; app'ler arası default entegrasyon paylaşılan ArcheType'la (Party) mekanikleşir; süreç değişikliği şema değişikliğinden ayrışır. Eksiler: tanım katmanı üç dosya türüne çıkar — vibecoding yüzeyi büyür; SDK doğrulayıcısı (sdk check) projection bütünlüğünü de denetlemek zorundadır.

## Revizyon 1 — Yapı Ekseni Tamamlandı (11 Haziran 2026)

Hiyerarşinin son hali iki eksendir. **Yapı ekseni:** Domain > ArcheType > **Fragment** (Frappe'deki child table'ın karşılığı — ana kayıtla yaşam döngüsü paylaşan satırlı parça: SiparişKalemleri, Adresler) > **Atom** (Fragment'i oluşturan en küçük bildirimsel bileşen; granülerlik Atom'uyla aynı kavramın yapı görünümü). **Yan eksen:** Workflow (davranış), Surface (projeksiyon), **Contract** (modüller arası API — Domain sınırının tanımlı kapısı). Açık soru olarak kayıtlı: alan seviyesinin adı — "Field" ve "Attribute" adaylarının collision profilleri farklıdır; karar alan-seviyesi tasarımına bırakıldı.
