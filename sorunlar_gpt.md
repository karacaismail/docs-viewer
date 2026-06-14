# Mimari ve Eğitim Dokümantasyonu Sorun Raporu

Tarih: 12 Haziran 2026  
İncelenen kaynak: `/Users/karaca/DEV/mimari/projector`  
Yayımlanan arayüz: `https://karacaismail.github.io/docs-viewer/`

## Kapsam ve yöntem

Bu rapor yalnızca inceleme sonucudur. Proje kaynaklarında veya kod tabanında değişiklik yapılmamıştır.

İncelemede:

- `content-source` altındaki 241 JSON dokümanı,
- dokümanların durum, küme, tekrar ve içerik dağılımları,
- eğitim serisi ve mimari terminoloji sayfaları,
- teknoloji kararları, güvenlik, çok kiracılık, olaylaşma ve uyumluluk anlatıları,
- yayımlanan dokümantasyonun masaüstü görünümü

değerlendirilmiştir.

Önem dereceleri:

- **P0:** Aynı sistemi birbiriyle çelişen biçimde tarif ediyor veya doğrudan yanlış uygulama üretebilir.
- **P1:** Mimari kararın uygulanabilirliğini, güvenliğini veya sürdürülebilirliğini ciddi biçimde zayıflatıyor.
- **P2:** Öğrenilebilirlik, bakım, doğrulanabilirlik veya dokümantasyon kalitesi sorunu oluşturuyor.

## Yönetici özeti

Dokümantasyonun güçlü bir ürün ve platform vizyonu var. Modüler monolit başlangıcı, PostgreSQL merkezli sade çalışma profili, sözleşme düşüncesi, Surface ile iş modelini ayırma çabası ve Türkçe mimari anlatım doğru yönde.

Ancak mevcut bütün, henüz "oturmuş mimari" değildir. Temel problem terminoloji eksikliği değil; aynı terimlerin farklı model katmanlarında farklı anlamlara gelmesi, aday fikirlerle bağlayıcı kararların ayrılmaması ve iddiaların çalışan bir referans dilimle doğrulanmamasıdır.

En kritik sonuçlar:

1. **Bağlayıcı tek kaynak yok.** Aynı konuda FastAPI/Prisma/SQLAlchemy, Flowbite yasağı/Flowbite zorunluluğu, PostgreSQL FTS/Meilisearch/SQLite, REST/GraphQL seçenekleri birbirini çürütüyor.
2. **Granülerlik, DDD ve UI modeli birbirine karışmış.** Domain, ArcheType, Surface, Fragment, View ve Module aynı hiyerarşinin elemanlarıymış gibi kullanılıyor; oysa bazıları yapısal, bazıları sunum, bazıları dağıtım eksenidir.
3. **ArcheType anlatısı DDD aggregate ile otomatik CRUD tablo modelini eşitliyor.** Bu, iş kurallarının ve invariant'ların kolayca atlanmasına yol açar.
4. **Güvenlikte mutlak ve teknik olarak yanlış garantiler var.** RLS, ham SQL, audit, yetki kesişimi ve otomatik API/MCP üretimi olduğundan daha güvenli gösteriliyor.
5. **Kapsam başlangıç ekibine göre aşırı büyük.** Çok sayıda ürün, GraphQL ve REST, WASM, polyglot hook, MCP, global politika çözümleyici, bitemporal veri ve marketplace aynı anda hedefleniyor.
6. **Eğitim serisi kendi sözünü yerine getirmiyor.** "10 ünite" denirken 25+ ünite var; ünite şablonu 10. üniteden sonra uygulanmıyor; Git ve test çok geç öğretiliyor.
7. **Eğitim, AI ile kod üretme talimatı veriyor ama doğrulama sistemi vermiyor.** Kabul kriteri, test kanıtı, tehdit modeli, rollback ve inceleme kapıları çoğu görevde yok.
8. **Dokümanların çok büyük kısmı olgun değil.** Yalnızca 11 sayfa açıkça `ok`; 134 sayfa `wip`, 26 sayfa `aday`, 69 sayfa durum bilgisiz, 1 sayfa `critical`.
9. **Mimari kanıt eserleri eksik.** Sistem bağlamı, container/component/deployment görünümleri, kritik runtime akışları, context map ve çalışan walking skeleton yok.
10. **İddialar kaynaklandırılmıyor.** 135 bini aşan kelimelik külliyatta URL ve somut dış kaynak kullanımı son derece az.

## P0 bulguları

### P0-01 — Bağlayıcı kararlar birbirleriyle çelişiyor

Backend karar sayfası FastAPI + SQLAlchemy 2.0 + Pydantic'i bağlayıcı olarak anlatıyor. Buna karşılık eğitim ve frontend kararlarında Prisma kullanılıyor; bazı sayfalarda FastAPI/Django ikilisi seçenek olarak duruyor.

Flowbite için daha açık bir çelişki var:

- `AGENTS.md` ve `devpanel.md`: Flowbite kullanılmamalı.
- `54-fe-core-ui`, `22-layer1-misc`, `28-stack-cms`, `49-landx-l3`, `53-fe-monorepo`, `41-file-layout`, `165-cc-identity-models`: Flowbite veya Flowbite Pro kullanıyor ya da kilitli karar gibi anlatıyor.

Benzer çatışmalar:

- Arama: PostgreSQL FTS + pgvector, SQLite + pgvector ve Meilisearch + pgvector farklı yerlerde varsayılan.
- Kuyruk/worker: PostgreSQL queue, arq, Celery, Redis, Kafka, DBOS, Temporal ve BullMQ arasında profil ve karar ayrımı yok.
- Kimlik: özel Authlib/passkey yaklaşımı, Logto, Authentik, WorkOS ve Keycloak aynı mimari düzlemde.
- i18n: `react-intl` ile `react-i18next/i18next-icu`.
- Yetkilendirme: CASL JSON, OpenFGA/ReBAC ve PostgreSQL RLS arasında otorite sırası tanımsız.

**Etkisi:** Junior geliştirici veya AI ajanı, hangi metne denk geldiyse onu "doğru karar" kabul eder. Aynı ürün içinde uyumsuz kütüphaneler ve çift otorite oluşur.

**Gerekli düzeltme:** Her teknoloji konusu için tek bir karar kaydı bulunmalı ve kayıt şu alanları taşımalıdır:

- durum: `accepted`, `candidate`, `deprecated`, `example`,
- geçerli profil: local, default production, scale, shared-hosting,
- karar tarihi ve sürüm,
- alternatifler ve neden elendikleri,
- geçiş koşulu,
- bağlayıcı kaynak bağlantısı.

### P0-02 — Mimari eksenler tek bir granülerlik zincirine zorlanmış

Dokümanlarda şu zincirlerin hepsi bulunuyor:

- `App > Domain > ArcheType > Fragment > Field > Dust > Atom`
- `Domain > ArcheType > Fragment > Atom`
- `App > Domain(Module) > Surface > View > Fragment > Component/Endpoint > Property > Atom`

Başka bir yerde Surface "bir veya daha fazla ArcheType'ın projeksiyonu" olarak, yani ArcheType'tan bağımsız bir yatay eksen olarak tanımlanıyor. Buna rağmen Surface ve ArcheType aynı "Büyük Taş" seviyesine yerleştiriliyor. WBS zincirinde Surface/View bazen var, bazen yok.

Burada en az dört farklı şey karışıyor:

- iş alanı parçalama modeli,
- UI kompozisyon modeli,
- dağıtım/paketleme modeli,
- iş planlama ve tahmin modeli.

**Etkisi:** Ekip, UI ekranını domain sınırı; tabloyu aggregate; backlog seviyesini yazılım bağımlılığı sanabilir. Mimari izlenebilirlik yerine yapay ara öğeler üretilir.

**Gerekli düzeltme:** Tek zincir kaldırılmalı; en az şu ayrı metamodel eksenleri çizilmelidir:

1. İş modeli: Bounded Context → Aggregate → Entity/Value Object → Rule.
2. Deneyim modeli: Journey/Workflow → Surface → View/Section → UI Component.
3. Sözleşme modeli: Capability → Command/Query/Event → DTO/Schema.
4. Paketleme modeli: Platform → App → Module/Package → Deployment Unit.
5. Planlama modeli: Initiative → Epic → Feature → Story → Task.

Bu eksenler arasında açık kardinaliteler kurulmalıdır. Örneğin bir Surface birden fazla Query kullanabilir; bir Aggregate birden fazla Surface tarafından projekte edilebilir.

### P0-03 — `Module`, `Domain`, `Core`, `Stack`, `App`, `Edition` ve `Distribution` sınırları kesin değil

`Module` en az şu anlamlarda kullanılıyor:

- kurulabilir eklenti,
- bounded context/domain,
- ürün modülü,
- her uygulamadaki değişmez core module.

`Domain` ise hem DDD alanı hem de DNS/custom-domain anlamında geçiyor.

`App`, bir veya daha çok Stack'i paketliyor; Stack satılabilir paket; Edition varyant; Distribution ise Edition + config + content olarak anlatılıyor. `Stack ⊂ Edition ⊂ Distribution` gösterimi, tür ilişkisi mi içerme ilişkisi mi olduğu belli olmayan yanıltıcı bir küme gösterimidir.

**Etkisi:** Bağımlılık yönü, sahiplik, kurulum birimi, sürümleme ve lisans sınırı netleşmez.

**Gerekli düzeltme:** Bir metamodel tablosu hazırlanmalı; her kavram için kimlik, sahibi, yaşam döngüsü, kardinalite, bağımlılık yönü, dağıtım ve veri sahipliği açıklanmalıdır. DNS anlamındaki `Domain`, örneğin `InternetDomain` veya `HostDomain` olarak ayrılmalıdır.

### P0-04 — ArcheType, DDD aggregate ve otomatik CRUD birbirine eşitleniyor

ArcheType çoğu yerde "bir tablo + controller + REST/GraphQL + UI + audit + tenancy" biçiminde sunuluyor. Bu, DDD aggregate tanımı değildir. Aggregate:

- transactional tutarlılık sınırıdır,
- invariant'ları korur,
- davranışı ve izin verilen durum geçişlerini tanımlar,
- bir tabloya bire bir karşılık gelmek zorunda değildir.

Her ArcheType için otomatik CRUD üretmek, `update any field` yaklaşımını teşvik eder. Bu yaklaşım aggregate davranışını, alan doğrulamasını ve yetkili command'ları atlayabilir.

**Etkisi:** Anemik domain modeli, mass-assignment, field-level authorization ve tutarsız durum geçişleri doğar.

**Gerekli düzeltme:** Yazma tarafı varsayılan olarak Action/Command tabanlı ve kapalı olmalıdır. Genel CRUD yalnızca düşük riskli yönetim verilerinde, açık allowlist ile açılmalıdır. ArcheType ile Aggregate aynı kavramsa invariant ve transaction sınırı zorunlu alan olmalı; değilse iki terim ayrılmalıdır.

### P0-05 — RLS ve ham SQL için verilen güvenlik garantileri doğru değil

Dokümanda `SET LOCAL` ve transaction kullanıldığında tenant sızıntısının "imkânsız" olduğu; ham SQL sorgularına otomatik `WHERE` ekleneceği izlenimi veriliyor.

Sorunlar:

- Keyfi ham SQL güvenli biçimde genel amaçlı olarak yeniden yazılamaz.
- PostgreSQL'de superuser, `BYPASSRLS` rolleri ve normalde tablo sahibi RLS'yi aşabilir.
- Tablo sahibi için `FORCE ROW LEVEL SECURITY` ayrıca düşünülmelidir.
- `SECURITY DEFINER`, bağlantı rolleri, migration rolleri, pool temizliği ve transaction dışı erişim ayrıca tehdit yüzeyidir.
- `SET LOCAL` yalnızca ayarın transaction sonuna kadar sürmesini tarif eder; politikanın doğru kurulduğunu garanti etmez.

**Etkisi:** Dokümanın garantisine güvenen ekip, uygulama ve veritabanı rollerini yanlış yapılandırabilir ve tenant verisi sızdırabilir.

**Gerekli düzeltme:** Ham DB erişimi yasaklanmalı veya yalnızca güvenli repository/DB API'si üzerinden mümkün olmalıdır. RLS için saldırgan modeli, rol matrisi, pool temizleme testi, migration erişimi, `FORCE RLS`, policy testleri ve negatif entegrasyon testleri tanımlanmalıdır. "İmkânsız" ifadesi kaldırılmalıdır.

### P0-06 — Otomatik REST/GraphQL/MCP açılımı varsayılan saldırı yüzeyini büyütüyor

Her ArcheType'ın otomatik olarak REST, GraphQL ve MCP tool olarak açılması kolaylık gibi sunuluyor. Bu yaklaşım:

- object-level authorization,
- property-level authorization,
- function-level authorization,
- mass assignment,
- GraphQL sorgu maliyeti ve kaynak tüketimi,
- AI ajanında excessive agency,
- hassas alanların yanlışlıkla dışarı açılması

risklerini varsayılan hâle getirir.

**Etkisi:** Metadata'ya eklenen tek bir alan veya operasyon, fark edilmeden üç ayrı dış arayüze yayılabilir.

**Gerekli düzeltme:** Dışa açılım `default deny` olmalıdır. Alan ve action allowlist'i, ayrı input/output DTO'ları, tenant/authz politikası, rate limit, sorgu maliyeti, kullanıcı onayı, idempotency ve audit zorunlu kılınmalıdır. MCP araçları yalnızca sınırlı amaçlı command'lardan üretilmelidir.

### P0-07 — Eğitim serisinin kapsam ve durum bilgisi yanlış

Eğitim ana sayfası:

- 10 ünite,
- yaklaşık 10 saat,
- yalnızca bu dokümanla yazılım mimarı olma

vaadinde bulunuyor. Ancak içerik haritasında 25 ana ünite ve ek üniteler var. Ayrıca bazı eski metinler "ilk 5 hazır, 06-10 yakında" derken 06-10 mevcut ve `ok`.

Eğitim şablonu her ünitede önkoşul, hedef, terim, açıklama, örnek, kontrol listesi ve mini proje vaat ediyor. Bu yapı esas olarak U01-U10'da uygulanmış; U11-U25 ile ek ünitelerin önemli kısmı kısa WIP iskeleti.

**Etkisi:** Öğrenci gerçek ilerlemeyi, eksik içeriği ve öğrenme süresini değerlendiremez. "Bu belgeyle mimar oldun" mesajı yetkinlik konusunda yanlış güven üretir.

**Gerekli düzeltme:** Süre ve ünite sayısı tek kaynaktan üretilmeli. Tamamlanmamış üniteler eğitim rotasına "hazır" olarak girmemeli. Hedef, "bağımsız yazılım mimarı yetiştirme" yerine ölçülebilir başlangıç yetkinlikleriyle ifade edilmelidir.

## P1 bulguları

### P1-01 — Mevcut durum, hedef durum, fikir ve örnek ayrılmamış

Aynı sayfada şu tür ifadeler yan yana bulunabiliyor:

- bugün çalışan davranış,
- hedef mimari,
- aday teknoloji,
- örnek kod,
- zorunlu kural,
- uzak gelecek vizyonu.

Durum rozeti bulunsa bile metnin hangi bölümü için geçerli olduğu belli değil. `wip` veya `aday` sayfaları "tek doğru", "zorunlu", "kilitli" gibi bağlayıcı dil kullanabiliyor.

**Gerekli düzeltme:** Her sayfada açıkça `Current`, `Target`, `Decision`, `Candidate`, `Example`, `Deprecated` bölümleri veya tek bir belge türü olmalıdır. Bağlayıcı kural yalnızca accepted ADR ya da canonical specification içinde bulunmalıdır.

### P1-02 — Mimari sürücüler ve kalite senaryoları tanımlı değil

SLO, RTO ve RPO gibi değerler yer yer geçiyor; ancak kararları yöneten öncelikli senaryolar yok:

- Kaç tenant?
- Tenant başına veri ve trafik?
- İlk ürünün kritik kullanıcı yolculuğu?
- Kabul edilebilir gecikme ve kesinti?
- Veri yerleşimi ve silme yükümlülüğü?
- En yüksek riskli tehdit?
- Başlangıç ekibinin gerçek işletme kapasitesi?

Bu sorular yanıtlanmadan Kafka, WASM, GraphQL, bitemporal model veya global policy resolver kararı değerlendirilemez.

**Gerekli düzeltme:** 5-10 öncelikli quality attribute scenario yazılmalı; her önemli karar en az bir senaryoya bağlanmalıdır.

### P1-03 — Çalışan bir referans mimari dilimi yok

Külliyat çok sayıda soyut kural içeriyor fakat tek bir uçtan uca örnek şu bütünü göstermiyor:

- App ve bounded context,
- Aggregate/ArcheType,
- command ve query,
- Surface,
- tenant ve authz,
- migration,
- outbox/event,
- test,
- deploy,
- gözlemlenebilirlik.

**Etkisi:** İddialar birbirleriyle entegre hâlde sınanmıyor; çelişkiler yalnızca gerçek ürün geliştirilirken ortaya çıkıyor.

**Gerekli düzeltme:** İlk ürün için küçük bir walking skeleton hazırlanmalı. Yeni genel kural, bu referans dilimde uygulanıp test edilmeden canonical sayılmamalıdır.

### P1-04 — Platform kapsamı ekip kapasitesiyle uyumsuz

Dokümantasyon aynı dönemde şunları hedefliyor:

- çok sayıda ürün ve sektör,
- REST ve GraphQL,
- PostgreSQL'den Redis/Kafka ölçeğine geçiş,
- WASM sandbox,
- Python ve TypeScript hook'ları,
- MCP araç üretimi,
- bitemporal veri,
- global mevzuat çözümleyici,
- marketplace,
- PWA/mobil,
- çoklu dağıtım profilleri.

"Basit varsayılan" söylemi, zorunlu yüzeyin büyüklüğüyle çelişiyor. Beş yıllık ve çok ekipli yol haritası, junior/vibecoding başlangıç ekibi için uygulama planı değildir.

**Gerekli düzeltme:** İlk ürün, ilk tenant tipi ve ilk deployment profili seçilmeli. Kullanılmayan yetenekler mimariden çıkarılmalı veya açık extraction trigger gelene kadar ertelenmelidir.

### P1-05 — Kernel "küçük" deniyor fakat sorumluluk ve blast radius büyük

Kernel çevresinde kimlik, yetki, tenancy, schema, event bus, module registry, MCP, audit ve scale primitive'leri bulunuyor. Bazı kayıt akışları bu katmanların çoğuna otomatik bağlanıyor.

**Etkisi:** Kernel değişikliği sistemin büyük bölümünü etkiler. "İnce kernel" ifadesi gerçek değişim yüzeyini gizler.

**Gerekli düzeltme:** Kernel için açık API bütçesi, bağımlılık kuralları, değişiklik yönetişimi, uyumluluk politikası ve hata izolasyonu tanımlanmalıdır. İş alanı bilgisi Kernel'e girmemelidir.

### P1-06 — Global Party modeli paylaşılan çekirdek bağımlılığı yaratıyor

Onlarca uygulamanın aynı Party ArcheType üzerinden varsayılan entegre olması:

- veri sahibi kim,
- şema değişikliğini kim onaylar,
- hangi uygulama hangi alanı görebilir,
- tenantlar ve hukuki amaçlar arasında veri paylaşımı nasıl sınırlanır,
- uygulama bağımsız kaldırıldığında ne olur

sorularını açık bırakıyor.

**Gerekli düzeltme:** Context map, authoritative owner, versioned contract ve yerel projection modeli kurulmalıdır. "Varsayılan entegre" yerine açık yetki ve amaçla etkinleştirme tercih edilmelidir.

### P1-07 — Metadata/config yaklaşımının sınırları belirtilmemiş

Metadata'dan UI, API, yetki, audit, workflow, arama ve AI aracı üretmek sistem içinde yeni bir programlama dili oluşturur. Fakat şu konular eksik:

- schema ve davranış sürümleme,
- migration ve rollback,
- statik doğrulama,
- debugger ve açıklanabilir hata mesajı,
- test ortamı,
- escape hatch,
- performans sınırı,
- hangi iş kuralının metadata'ya konmaması gerektiği.

**Etkisi:** "Kod yazmadan" başlayan yaklaşım, belirsiz ve zor debug edilen ikinci bir framework'e dönüşür.

**Gerekli düzeltme:** Metadata'nın ifade gücü bilinçli olarak sınırlandırılmalı; karmaşık domain davranışı açık kod ve command'larda kalmalıdır.

### P1-08 — Sabit story point değerleri yanlış ölçüm modeli

Mimari seviyelere 34/21/13/8/5/3/2/1 gibi sabit story point atanıyor ve yaprakların toplamı otomatik tahmin gibi sunuluyor.

Story point:

- artefakt türünün sabit büyüklüğü değildir,
- ekip bağlamına göre göreli tahmindir,
- belirsizlik ve riski içerir,
- hiyerarşik seviyeler arasında matematiksel ölçü birimi gibi toplanamaz.

Bir ekran her zaman 13, endpoint her zaman 3 değildir. Ebeveyn öğeye sabit puan verip çocukları ayrıca toplamak çift sayım ve sahte kesinlik üretir.

**Gerekli düzeltme:** Taş seviyeleri yalnızca kapsam/izlenebilirlik sınıflaması olarak kullanılmalı; tahmin ekip tarafından ayrıştırma sonrasında ayrıca yapılmalıdır.

### P1-09 — Olaylaşma ve ölçek geçişinde anlamsal farklar gizleniyor

"Aynı kodla in-process → Redis Streams → Kafka" anlatısı operasyonel geçişi kolay gösteriyor. Bu sistemlerin:

- teslim garantisi,
- sıralama,
- replay,
- consumer group,
- transaction sınırı,
- gecikme,
- mesaj boyutu,
- hata ve tekrar işleme

semantiği aynı değildir.

**Gerekli düzeltme:** Event port'un garanti ettiği en küçük ortak sözleşme yazılmalı. Her adapter'ın kaybettiği veya eklediği özellikler ve geçişte gereken uygulama değişiklikleri belirtilmelidir.

### P1-10 — Outbox ve projection anlatıları gereğinden kesin

Outbox "tek doğru çözüm", projection ise tutarsızlığı otomatik kontrol edilen bir kolaylık gibi anlatılıyor.

Eksikler:

- polling ve CDC farkları,
- idempotent consumer,
- poison event,
- ordering key,
- event schema evolution,
- rebuild süresi,
- staleness bütçesi,
- read-your-writes,
- başarısız projection telafisi.

**Gerekli düzeltme:** Pattern tercihleri mutlak slogan yerine garanti, maliyet ve başarısızlık modlarıyla açıklanmalıdır.

### P1-11 — Audit ve bitemporal kayıt için mutlak iddialar var

`audit: true` ile değiştirmenin teknik olarak imkânsız olduğu ve bitemporal yapının audit/KVKK sorunlarını "bedava" çözdüğü izlenimi veriliyor.

Veritabanı yöneticisi, ayrıcalıklı rol veya ele geçirilmiş servis hesabı kayıtları değiştirebilir. Bitemporal veri ise:

- saklama maliyetini,
- kişisel veri silme/anonimleştirme çatışmasını,
- sorgu ve migration karmaşıklığını

artırabilir.

**Gerekli düzeltme:** Tehdit modeline göre append-only yetkiler, harici/WORM saklama, hash chain ve periyodik doğrulama seçenekleri değerlendirilmelidir. Bitemporal kullanım yalnızca zaman boyutuna gerçek ihtiyaç olan domain'lerle sınırlandırılmalıdır.

### P1-12 — Mevzuat kuralları yapılandırmaya indirgenmiş

Vergi, veri yerleşimi, retention, yaptırım ve ihlal bildirimi gibi konular bazı örneklerde birkaç JSON kuralı ve "en kısıtlayıcı kural kazanır" mantığıyla modelleniyor.

Mevzuat her zaman doğrusal biçimde "daha kısıtlayıcı" sıralanamaz. Yetki alanı, veri konusu, işlem amacı, istisna, yürürlük tarihi ve hukuki dayanak birlikte değerlendirilir. "Hash = anonimleştirme" de genel olarak doğru kabul edilemez.

**Gerekli düzeltme:** Her politika için kaynak, madde, yetki alanı, yürürlük tarihi, hukuk sahibi, onay, test vakası, simülasyon ve rollback kaydı tutulmalıdır. Hata davranışı operasyon bazında `deny`, `degrade`, `queue` veya `manual review` olmalıdır.

### P1-13 — Performans ve kapasite iddiaları ölçüm bağlamından yoksun

Dokümanlarda ürün ve yük profili olmadan:

- sabit RPS değerleri,
- yüzdelik performans maliyetleri,
- websocket/pod kapasiteleri,
- "Seq Scan kötü, Index Scan hızlı",
- kurulum ve geliştirme süreleri

gibi genellemeler bulunuyor.

Sequential scan küçük tablo veya geniş sonuç kümesinde doğru plan olabilir. Websocket kapasitesi mesaj sıklığı, TLS, payload, bellek, kernel ve redundancy olmadan hesaplanamaz.

**Gerekli düzeltme:** Her sayı benchmark tarihi, donanım, veri hacmi, sorgu, concurrency ve ölçüm yöntemiyle verilmelidir. Kaynaksız sayılar hedef değil örnek olarak işaretlenmelidir.

### P1-14 — Kararların önemli kısmı ADR seviyesinde doğrulanmamış

Yerel ADR'lerin önemli bölümü doküman görüntüleyicinin bilgi mimarisi ve UI davranışına odaklanıyor. Hedef platformun büyük kararları için düzenli olarak şu kayıtlar bulunmuyor:

- bağlam ve problem,
- seçenekler,
- trade-off,
- güvenlik/operasyon etkisi,
- doğrulama spike'ı,
- karar sahibi,
- yeniden değerlendirme tetikleyicisi.

Bir karar listesinde "24/24 karar verildi" denirken aynı yerde migration LLM ve RLS context için açık araştırma soruları bulunması da olgunluk ifadesiyle çelişiyor.

## P2 bulguları

### P2-01 — Eğitim sırası hedef kitle için uygun değil

Temel programlama, hata ayıklama, terminal, paket yöneticisi, bağımlılık, fonksiyon, veri yapıları ve kontrol akışı yeterince yerleşmeden metadata, veritabanı, REST/GraphQL, tenancy, güvenlik ve event bus anlatılıyor.

Git U17, test U16 iken deployment U10'da. Buna karşın mimari yaklaşım "ilk günden test" istiyor.

**Önerilen sıra:**

1. Bilgisayar, dosya, terminal ve güvenli çalışma alanı.
2. Küçük programlama temelleri ve hata okuma.
3. Git, küçük commit ve geri alma.
4. Test ve kabul kriteri.
5. HTTP/API ve veri modelleme.
6. Tek tenantlı küçük uygulama.
7. Auth, tenancy ve güvenlik.
8. Olaylaşma, ölçek ve ileri mimari.

### P2-02 — Yetkinlik yalnızca öz değerlendirme kutularıyla ölçülüyor

"Anladım" kontrol listesi üretim yetkinliğini kanıtlamaz. Rubric, beklenen çıktı, otomatik test, kod inceleme, hata senaryosu ve capstone eksik.

**Gerekli düzeltme:** Her ünitede gözlenebilir teslim, kabul kriteri, örnek çözüm, sık hata, doğrulama komutu ve değerlendirme rubric'i olmalıdır. Kritik güvenlik konuları mentor/senior incelemesi olmadan tamamlanmış sayılmamalıdır.

### P2-03 — AI ajanına verilen görevler doğrulama kapısı taşımıyor

63 dosyada AI ajana yönelik 81 civarında doğrudan görev ifadesi bulunuyor. Redis, Kafka, S3, DBOS, auth ve compliance gibi alanlarda bile görev çoğu zaman bir uygulama prompt'u olarak bitiyor.

Eksik zorunlu bölümler:

- değiştirilebilecek dosya/sınır,
- mimari sözleşme,
- kabul kriteri,
- üretilecek test,
- beklenen komut çıktısı,
- güvenlik kontrolü,
- rollback,
- insan inceleme noktası.

**Gerekli düzeltme:** Tek bir "AI görev sözleşmesi" şablonu kullanılmalıdır. Ajan çıktısı hiçbir zaman test ve inceleme kanıtı olmadan tamamlanmış sayılmamalıdır.

### P2-04 — "Her cümlede ! ve ?" vaadi gerçek davranışla uyumlu değil

Eğitim ana sayfası her cümlede açıklama ve soru kontrolü olduğunu söylüyor. İçerik üretim yaklaşımı ise terimin yalnızca seçili ilk eşleşmesine glossary binding yapıyor. Yayımlanan eğitim ana sayfasında vaat edilen cümle bazlı kontroller görünmüyor.

**Gerekli düzeltme:** Ya özellik gerçekten uygulanmalı ya da vaat, "seçili terimlerde açıklama" biçiminde düzeltilmelidir.

### P2-05 — Doküman durum modeli yetersiz ve görünür değil

Dağılım:

| Durum | Sayfa |
|---|---:|
| `wip` | 134 |
| `aday` | 26 |
| `ok` | 11 |
| `critical` | 1 |
| durum yok | 69 |

Yani yalnızca 11/241 sayfa açıkça tamam kabul ediliyor. Buna rağmen WIP metinleri bağlayıcı mimari gibi okunabiliyor. Arayüzde `kaya`, `wip`, `aday` gibi rozetlerin anlamı açıklanmıyor.

**Gerekli düzeltme:** Durumsuz belge kabul edilmemeli. `draft → review → accepted → deprecated` yaşam döngüsü, sahip ve gözden geçirme tarihi zorunlu olmalıdır.

### P2-06 — Şablon tekrarları sahte tamamlanmışlık oluşturuyor

Yaklaşık:

- 57 ürün dosyasında aynı Layer-2 ürün açıklaması,
- 53 dosyada aynı squad cümlesi,
- 52 dosyada aynı geçiş süresi örneği,
- 34 dosyada benzer rakip karşılaştırma gerekçesi

tekrarlanıyor.

Bu metinler ürüne özgü invariant, veri sahipliği, regülasyon, entegrasyon, başarısızlık modu ve kalite senaryosu yerine şablon dolduruyor.

**Gerekli düzeltme:** Ürün kataloğu kısa tutulmalı; mimari sayfa yalnızca ürüne özgü farkları içermelidir. Ortak açıklama merkezi profile bağlanmalıdır.

### P2-07 — Dış kaynak, tarih ve kanıt kullanımı çok az

Yaklaşık 135.675 kelimelik kaynak içerikte yalnızca birkaç dosyada doğrudan URL bulunuyor. Hukuk, güvenlik, teknoloji performansı ve ürün kıyasları çoğunlukla kaynaksız.

**Gerekli düzeltme:** Sayısal veya normatif her iddia için kaynak, erişim tarihi ve geçerli sürüm eklenmelidir. Kişisel yorum ile doğrulanmış dış bilgi ayrılmalıdır.

### P2-08 — Dokümantasyon envanteri güncel değil

README yaklaşık 214 JSON kaynağından söz ederken kaynakta 241 JSON bulunuyor. Migration raporu 240 üretilen ve 1 kapsam dışı sayfa gösteriyor.

`ARCHITECTURE-5.json` canonical kaynaklarla aynı dizinde tutulduğu hâlde çıktı dışında. İçinde eski katman, Flowbite/SCSS ve teknoloji kararları bulunuyor.

**Gerekli düzeltme:** Envanter otomatik üretilmeli. Eski belge `archive/deprecated` alanına alınmalı ve neden geçersiz olduğu açıkça belirtilmelidir.

### P2-09 — 60 yaş sonrası başlayan yetişkinler için bilişsel yük yüksek

Yayımlanan görünüm okunaklı yazı boyutlarına sahip; ancak:

- üç kalıcı panel yaklaşık 496 piksel genişlik kullanıyor,
- eğitim ana sayfası çok uzun,
- bir ekranda çok sayıda navigasyon bağlantısı var,
- jargon ve İngilizce terim yoğun,
- ilerleme, tahmini süre ve kalıcı "sonraki adım" görünürlüğü zayıf,
- yalnızca dark tema hedef kitlenin görme ve kontrast tercihlerini karşılamıyor.

Belgelerin kendi erişilebilirlik modelinde açık/koyu/yüksek kontrast ve font boyutu tercihleri bulunurken doküman görüntüleyici bunları sunmuyor.

**Gerekli düzeltme:** Odak modu, font büyütme, light/high-contrast tema, ünite ilerlemesi, kısa sayfalar, beklenen çıktı ekran görüntüleri ve hata durumundan kurtulma adımları eklenmelidir.

### P2-10 — Metaforlar terminolojinin önüne geçiyor

Dağ, kaya, taş, kum, toz ve atom metaforu hem iş kırılımı hem içerik büyüklüğü rozeti olarak kullanılıyor. `kaya` rozetini gören öğrenci bunun mimari seviye mi, belge boyutu mu olduğunu ayırt edemiyor.

**Gerekli düzeltme:** Önce standart sektör terimi kullanılmalı, metafor parantez içinde yardımcı olmalıdır. Her analojide "bu benzetmenin geçerli olmadığı yer" açıklanmalıdır.

### P2-11 — Yetişkin öğrenen dili yer yer gereksiz biçimde basitleştiriliyor

Tekrarlanan "Ayşe Teyze/Murat Bey" karakterleri erişilebilirlik amacı taşısa da 60+ öğrenciyi çocuklaştırma riski yaratıyor. Yaş, teknik kapasitenin ölçüsü değildir.

**Gerekli düzeltme:** Dil sade fakat yetişkin ve profesyonel tutulmalı; öğrencinin önceki mesleki deneyimini avantaja dönüştüren örnekler kullanılmalıdır.

### P2-12 — Kurulum rotası yeterince kapsayıcı değil

Mac/Linux ağırlıklı doğrudan Node ve PostgreSQL kurulumu, geniş başlangıç kitlesinde ortam farklılığı ve hata üretir. Windows rotası ve tek komutla tekrarlanabilir ortam görünür değil.

**Gerekli düzeltme:** Dev container veya doğrulanmış tek komutlu kurulum, Windows/macOS/Linux yolları, sürüm kontrolü ve beklenen çıktı eklenmelidir.

## Eksik mimari eserler

Dokümantasyonun "mimari doküman" sayılabilmesi için aşağıdaki eserler eksik veya yetersizdir:

1. Sistem bağlamı, aktörler, dış sistemler ve güven sınırları.
2. Varsayılan profil için container ve component görünümü.
3. Local, default production, scale ve shared-hosting deployment görünümleri.
4. Kayıt oluşturma/güncelleme, tenant context, authz, outbox, module install, migration ve AI action sequence'ları.
5. Bounded context map ve veri sahipliği matrisi.
6. Kritik akışlar için tehdit modeli ve abuse case'ler.
7. Öncelikli quality attribute scenario'lar.
8. Current-state ve target-state fark haritası.
9. API/event/schema sürümleme ve uyumluluk matrisi.
10. Failure mode, recovery ve operasyon playbook'ları.
11. Kapasite, maliyet ve ölçüm varsayımları.
12. İş hedefi → mimari karar → uygulama → test izlenebilirliği.
13. Bir uçtan uca referans uygulama/walking skeleton.
14. Açık non-goal listesi ve teknoloji extraction trigger'ları.

## Önerilen düzeltme sırası

### Aşama 1 — Tek doğru kaynağı oluştur

Yeni teknoloji ve ürün sayfası eklemeyi geçici olarak durdur.

- Canonical sözlük ve metamodel çıkar.
- Çelişen teknoloji kararlarını tek tabloda çöz.
- Her belgeye durum, sahip, tarih ve belge türü ekle.
- Eski/çelişen belgeleri deprecated/archive olarak ayır.
- README ve envanteri otomatik üret.

**Çıkış ölçütü:** Aynı mimari soruya iki bağlayıcı cevap kalmaması.

### Aşama 2 — Mimariyi ilk ürünle doğrula

- Tek ürün ve tek kritik kullanıcı yolculuğu seç.
- Quality attribute scenario'ları yaz.
- Context map, container, component ve deployment görünümlerini oluştur.
- Uçtan uca walking skeleton geliştir.
- Genel mimari iddiaları bu dilim üzerinde test et.

**Çıkış ölçütü:** App, domain, command, Surface, tenancy, authz, event, test ve deploy zincirinin çalışan tek örnekte gösterilmesi.

### Aşama 3 — Güvenlik ve veri yönetişimini sertleştir

- Raw SQL ve RLS rol modelini düzelt.
- REST/GraphQL/MCP dışa açılımını default-deny yap.
- Party veri sahipliğini ve amaç sınırlamasını tanımla.
- Legal policy kaynağı/onayı/sürümü mekanizmasını ekle.
- Audit ve bitemporal iddialarını tehdit modeline bağla.

**Çıkış ölçütü:** Her dış action için açık owner, policy, input/output contract, negatif test ve audit yolu bulunması.

### Aşama 4 — Eğitim rotasını yeniden kur

- Programlama, terminal, Git ve testi öne al.
- Tamamlanmamış üniteleri yayın rotasından ayır.
- Her ünitede aynı yetişkin öğrenme şablonunu uygula.
- AI görevlerine kabul kriteri, test ve insan incelemesi ekle.
- Capstone ve ölçülebilir yetkinlik rubric'i oluştur.

**Çıkış ölçütü:** Öğrencinin "okudum" yerine çalışan ve test edilmiş bir teslimle ilerlemesi.

### Aşama 5 — İleri yetenekleri ölçüme bağla

WASM, Kafka, GraphQL, bitemporal, polyglot hook, marketplace ve global policy engine ancak somut ihtiyaç ve extraction trigger oluştuğunda etkinleştirilmeli.

**Çıkış ölçütü:** Her ileri teknoloji için ölçülmüş problem, kabul edilmiş ADR ve operasyon sahibi bulunması.

## Korunması gereken doğru yönler

Rapor, mevcut yaklaşımın tamamının reddedilmesini önermiyor. Şu yönler korunmalı:

- modüler monolit ile başlama,
- PostgreSQL-first sade çalışma profili,
- gerektikçe ölçek bileşeni çıkarma,
- UI Surface ile domain modelini ayırma niyeti,
- sözleşme ve sürümleme bilinci,
- çok kiracılık ve audit'i sonradan eklenen özellik değil temel kaygı sayma,
- Türkçe ve erişilebilir mimari eğitim üretme hedefi.

Ancak bunlar slogan değil; sınırları, başarısızlık modları, karar sahipleri ve çalışan kanıtları olan mimari kurallara dönüştürülmelidir.

## Sonuç

Ana eksik "daha fazla doküman" değildir. Mevcut 241 sayfalık külliyat zaten büyük. Eksik olan:

- otorite sırası,
- tutarlı metamodel,
- karar ve fikir ayrımı,
- çalışan referans uygulama,
- güvenlikte doğrulanabilir garanti,
- hedef kitleye uygun ölçülebilir eğitim ilerlemesidir.

Öncelik yeni ürün, teknoloji veya metafor eklemek değil; mevcut iddiaları azaltmak, çelişkileri çözmek ve ilk çalışan mimari dilim üzerinde kanıtlamaktır.

## Teknik doğrulama kaynakları

- PostgreSQL Row Security Policies: <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- PostgreSQL `SET` / `SET LOCAL`: <https://www.postgresql.org/docs/current/sql-set.html>
- OWASP API Security Top 10 2023: <https://owasp.org/API-Security/editions/2023/en/0x11-t10/>
- OWASP API3:2023 Broken Object Property Level Authorization: <https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/>
- OWASP LLM08 Excessive Agency: <https://genai.owasp.org/llmrisk2023-24/llm08-excessive-agency/>
- KVKK Veri İhlali Bildirimi: <https://www.kvkk.gov.tr/Icerik/5362/Veri-Ihlali-Bildirimi>
- GDPR, Articles 33-34: <https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02016R0679-20160504>
