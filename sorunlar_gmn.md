# Mimari ve Eğitim Anlayışı: Eksikler ve Çelişkiler Raporu

Projenin felsefesi, teknoloji yığını ve eğitim dokümanları (Ayşe Teyze/60+ yaş hedef kitlesi ve vibecoding yaklaşımı bağlamında) incelendiğinde, mimari kurgu ile hedef kitlenin gerçekliği arasında yapısal uyuşmazlıklar ve eksiklikler tespit edilmiştir.

Aşağıda temel sorun alanları ve mimari açıkları listelenmiştir:

## 1. Bilişsel Yük Paradoksu: "Sürücü Kursunda Uçak Mühendisliği"
- **Sorun:** `edu-overview` dokümanında hedef kitle "hiç yazılım bilmeyen, 60+ yaşında araba kullanmayı öğrenen Ayşe Teyze" olarak tanımlanıyor. Ancak öğretilen kavramlar (*ArcheType, Bitemporal, Multi-tenancy, Crypto-shredding, WBS Granülerliği*) endüstri standartlarında Enterprise/Senior Mimar seviyesindedir. 
- **Eksiklik:** Teoride "günlük dille anlatım" hedeflense de, kavramların doğası acemi bir zihin için çok ağırdır. Temel girdi/çıktı döngüsü (ekranda bir düğmeye basıp sonuç görmek) hissettirilmeden, doğrudan "ArcheType tabanlı bildirimsel veri modellemesi" anlatılmaktadır. Pratik-teori dengesi pratik aleyhine bozulmuştur.

## 2. Vibecoding Felsefesi ile "Katı WBS (Granülerlik)" Çelişkisi
- **Sorun:** `k-granulerlik` sözleşmesinde WBS zincirinden (Dağ -> Kaya -> ... -> Atom) bahsedilirken, "Komşuluk kuralını ihlal eden plan reddedilir" (Kaya doğrudan Kum Tanesi'ne bağlanamaz) denilmektedir. 
- **Eksiklik:** Vibecoding'in temeli serbest, sohbet tarzı, deneysel geliştirmedir. 60 yaşında bir kullanıcı LLM'e "Müşteriler sayfasına bir yaş alanı ekle" dediğinde (Büyük Taş -> Kum Tanesi atlaması), sistemin bunu "Hata: Orta Taş ve Küçük Taş eksik" diyerek reddetmesi, AI'ı bir kolaylaştırıcı değil, sinir bozucu bir denetmene dönüştürür. 
- **Mimari Çözüm Eksikliği:** Kullanıcıyı bu katı kurallara uymaya zorlamak yerine, LLM'in aradaki eksik zincirleri (Orta ve Küçük Taşları) *otomatik* tamamlayıp ("Sizin için ilgili View ve Use Case katmanlarını da oluşturdum, onaylıyor musunuz?") kullanıcıya sunacağı bir "Otomatik WBS Köprüsü" mimarisi eksiktir.

## 3. Katı TDD (Test-Driven Development) ve Öğrenme Eğrisi
- **Sorun:** `be-sdk` içinde, iskelet üretilirken "testlerin ilk olarak ve kırmızı (hata verecek şekilde) üretileceği", test geçmeyene kadar iskeletin pakete dönüşmeyeceği (`sdk check`) kilit bir karar olarak alınmıştır.
- **Eksiklik:** Kodlamaya yeni başlayan birine "Önce başarısız test gör, sonra bunu düzeltecek bildirimi yaz" demek, öğrenme hevesini (vibecoding'in getirdiği anında görsel tatmini) öldürür. Hatalı test loglarını okumak ve düzeltmek yeni başlayanlar için en zor aşamadır.
- **Mimari Çözüm Eksikliği:** "Dev/Eğitim Modu" ile "Prod Modu" arasında bir esneklik katmanı tasarlanmamıştır. Yeni başlayanlar için AI'ın testleri arkada otomatik geçirecek/yazacak bir "AI-TDD Otopilot" mekanizmasına ihtiyaç vardır.

## 4. Teknoloji Yığınının Görünmezliği ve Hata Yönetimi Sızıntısı
- **Sorun:** FastAPI, SQLAlchemy, Alembic, RLS, Postgres Queuer, WASM Sandbox gibi ağır backend kararları SDK arkasına gizlenmiştir (Varsayılan-basit ilkesi).
- **Eksiklik:** "Happy path" (sorunsuz senaryo) dışına çıkıldığında, örneğin yanlış bir ilişkisel veri modeli (ArcheType) kurulduğunda ekrana yansıyacak olan "Postgres RLS policy violation" veya "Alembic migration conflict" hatalarını kullanıcı nasıl çözecek?
- **Mimari Çözüm Eksikliği:** Sistemin alt katmanından fırlatılan ham teknik hataları, 60+ yaş kullanıcının anlayacağı ve LLM ile vibecoding üzerinden onarabileceği pedagojik bir "Mental Çeviri (Mental Translation) / Hata Tercümanı" katmanı tasarlanmamıştır. 

## 5. Metafor Yorgunluğu (Metaforların Teknik Geliştirmeyi Gölgelemesi)
- **Sorun:** Hem mimari soyutlamalar (Kernel, Core, App, Module) hem de doğa metaforları (Dağ, Kaya, Büyük/Orta Taş, Kum) yoğun şekilde kullanılıyor. Kullanıcının aynı anda hem "Bu bir Bounded Context mi?" hem "Bu Kaya mı Büyük Taş mı?" hem de "Bunun SP'si 21 mi?" diye düşünmesi bekleniyor.
- **Eksiklik:** LLM için mükemmel bir dil olan sekiz seviyeli WBS doğa metaforu, insana (özellikle acemiye) dayatılmamalıdır. Kullanıcı sadece "İzin Talebi Sayfası" demeli, LLM arka planda bu sayfanın "Büyük Taş / Surface" sözleşmesini kendisi kurmalıdır. Terminoloji dokümanı kullanıcının değil, sistemin (LLM'in) anlayacağı şekilde içselleştirilmiş; kullanıcıya da bunu ezberletmek zorunlu kılınmış gibi görünmektedir.

**Özet:** Mimari çok sağlam, modüler ve güçlü (Shopify / Drupal esintileri) kurgulanmış. Ancak bu mimarinin **öğretim aracı** olarak kullanılması hedeflenirken, sistemin gücü ve katılığı hedef kitlenin (60+ yaş vibecoding yapan junior'lar) üzerine bir yük olarak bindirilmiş. AI, zorlukları gizleyen bir yastık (buffer) olmak yerine, sistemin kurallarını dikte eden katı bir öğretmene dönüşme riski taşıyor.

---

# Claude (Opus) Analizi — 14 Haziran 2026

> Not: Yukarıdaki Gemini analizi korunmuştur. Aşağısı onun ÜZERİNE, mimari + iş-akışı katmanından tamamlayıcı tespitlerdir. Gemini'nin beş maddesine (bilişsel yük, katı WBS, TDD eğrisi, ham hata sızıntısı, metafor yorgunluğu) katılıyorum; tekrar etmiyorum. Soru: "mimari anlayışı ve terminolojiyi oturttuk, nerede eksik/yanlış yaptık?"

## A. En kritik eksik: "spec → çalışan sistem" köprüsü yok
Ansiklopedi ve AGENTS.md, AI'ın ne ÜRETECEĞİNİ (testler → `archetypes.yaml` → `surfaces.yaml` → `workflows.yaml` → `manifest.yaml`) sözleşmeye bağlıyor. Ama o spec'i ÇALIŞTIRACAK bir kernel/runtime tarif edilmiyor — tüm repo bir doküman görüntüleyici. 60+ geliştirici "crm app yaz" der, AI YAML üretir, sonra hiçbir şey koşmaz. **Okuma spec'e dönüşüyor, spec hiçbir yerde çalışmıyor.** Mimari "ne" katmanında güçlü, "nasıl ayağa kalkar" katmanında boş. Çözüm (içerik/sözleşme olarak): minimum çalıştırılabilir runtime bootstrap referansı + "tek dikey dilim → çalışan ekran" tam örneği.

## B. Seviye başına "Bitti Tanımı" (DoD) yoktu
Dağ→Atom seviyeleri ve komşuluk kuralı var; ama her seviyenin (ArcheType, Surface, Use Case…) ne zaman BİTTİĞİNİ junior'ın kıdemliye sormadan uygulayabileceği makine/insan-doğrulanabilir kapı yoktu. *Bu iterasyonda* `edu-waterfall-yol-haritasi` ile faz-bazlı DoD kısmen kapatıldı; eksik kalan: her ArcheType/Surface için tek tek çalıştırılabilir kabul şablonu.

## C. Reviewer paradoksu (yapısal çelişki)
Sözleşme "uzman denetimi zorunlu; üç geliştirici birbirinin işini onaylamasın" diyor. Ama ekip 3 kişilik ve hepsi 60+ junior — kıdemli yok. "Eleştiren" rolü de junior; junior junior'ı denetleyince derin hatalar kaçar. Eksik olan: **AI'ı çelişkili-eleştiren (adversarial reviewer) + insan onay kapısı** protokolü ve dışarıdan fractional senior tetikleyen net eşik. Şu hâliyle "uzman denetimi" sözleşmesi karşılıksız bir vaat.

## D. Waterfall ↔ iteratif/vibecoding uzlaştırılmamıştı
Doküman iteratif ritüele dayanıyor (`build-iterasyon-ritueli`), kullanıcı ise waterfall istiyor. İkisi birbirini dışlıyormuş gibi duruyordu. *Bu iterasyonda* "şelale = makro disiplin, vibecoding = faz içi mikro döngü" ayrımıyla kısmen uzlaştırıldı; ama bunun governance/test kapılarına gömülmesi (faz geçişinin CI'da zorlanması) hâlâ eksik.

## E. Yetersiz alanlar: eski/yeni içerik tutarsızlığı (somut)
- Yeni sayfalar (331 başlangıç, 333 dikey dilim, 334 iterasyon, 323 readiness, 336 yol haritası) TAM governance alanı taşıyor: owner/reviewer/maturity/acceptanceCriteria/failureModes…
- Eski eğitim dersleri (`70`–`109`, yani u01–u25) yalnız temel alanlara sahip; governance alanlarını migration DEFAULT olarak ekliyor → **yapısal sahte tamlık**. Ders sayfalarının çoğu (u11, u13, u15, u16, u17, u19, u23, u24, u25, u02b) ölçülebilir kabul/yeterlilik kontrolü taşımıyor.
- Sonuç: eğitim hâlâ büyük ölçüde "okuma materyali", "yeterlilik programı" değil. Codex'in tespitiyle örtüşür.
- Öneri: u01–u25 derslerine gerçek (default değil) `acceptanceCriteria` + uygulamalı "yaptım kanıtı" alanı doldurma turu.

## F. Ortam/deploy runbook eksik
Hedef akış M4 Mac → Hetzner Debian/AMD EPYC → GitHub. Görüntüleyicinin kendi CI/CD'si var; ama ÜRETİLEN ürünün yerel→Hetzner deploy yolu adım adım yok. 60+ junior için "nereye, nasıl, geri alma nasıl" yazılı runbook gerekiyor.

## G. Glossary terimleri sayfa-kapsamlı (kavram bütünlüğü riski)
Terimler `term-<slug>-<page>` biçiminde sayfaya pinli. LLM/bağlam güvenliği için iyi; ama öğreniciye "aynı kavram her sayfada ayrı terim" hissi verebilir. Kavramın tek kanonik tanımına giden "ana terim → bağlamsal varyant" ilişkisi öğrenici tarafında görünür değil.

## Sonraki iterasyon önerisi (öncelik sırası)
1. Runtime bootstrap + tek dikey dilim çalışan örneği (A maddesi — en kritik).
2. u01–u25 derslerine gerçek yeterlilik/kabul alanı doldurma (E maddesi — yetersiz alanlar).
3. AI-adversarial-review + insan kapısı protokol sayfası (C maddesi).
4. Üretilen ürün için Hetzner deploy runbook (F maddesi).

> Bu iterasyonda kapatılanlar: mobil header çakışması, MD buton estetiği, yönetişim "sahte yeşil" kapısı, ve B/D maddelerinin makro yol haritası (`edu-waterfall-yol-haritasi`).
