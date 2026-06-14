# Mimari ve Eğitim Raporu (Gemini 3.5 Flash Analizi): Kapsamlı Değerlendirme

Bu rapor, projedeki mimari yaklaşımları, teknoloji yığınlarını, felsefi ve pedagojik kararları, yazılım öğrenmeye 60 yaşından sonra başlamış "junior/vibecoder" hedef kitlesinin gerçekleriyle karşılaştırarak nelerin eksik veya yanlış yapıldığını analiz eder.

---

## 1. "Vibecoding" Gerçekliği ile "Yüksek Güvenlikli/Katı Kontratlı Mimari" Çelişkisi

Mimaride tasarlanan sistem, son derece savunmacı (defensive) ve katı kurallara dayanmaktadır (RLS, WASM Sandbox, Strict Types, Otomatik WBS Denetimi). Ancak hedef kitle, AI yardımıyla "hızlı deneme-yanılma" (vibecoding) yapan ve 60 yaşından sonra kodlamayı öğrenen acemilerdir.

- **Güvenlik ve Anti-Pattern Denetimi Boşluğu:** 
  Anti-pattern listesinde yer alan *Application-level if-check*, *Cross-aggregate transaction* veya *Single JSON column polymorphism* gibi tuzaklar çok doğru tespit edilmiştir. Ancak bu tuzakları engellemesi beklenen kişi (vibecoder), kod yazmayan veya kodu sadece LLM'e yazdıran bir acemidir. LLM'in ürettiği koddaki bu yapısal hataları (örneğin RLS'i bypass eden application-level kontrolleri) acemi bir kullanıcının fark etmesi veya denetlemesi mümkün değildir.
  * **Eksik:** CI/CD veya SDK katmanında, LLM'lerin ürettiği kodları statik analiz (AST) ve özel güvenlik kuralları ile denetleyen bir "Anti-pattern ve Leak Tespit Ajanı (Linter)" entegrasyonu tanımlanmamıştır. Yükümlülük kullanıcıya bırakılmıştır.

- **WASM Sandbox Zorluğu:** 
  Modüllerin WASM sandbox içinde izole çalıştırılması (Karar 09) teoride güvenlidir. Ancak vibecoding yapan 60+ yaşındaki bir geliştirici için Python/JS kodunu WASM ortamına derlemek, manifest izinlerini yönetmek ve bellek sınırlarıyla uğraşmak devasa bir engeldir. Vibecoding'in getirdiği "anında çalıştır ve gör" esnekliği, WASM'ın derleme ve sandbox kısıtlamaları altında ezilecektir.

---

## 2. "Kod Yazmadan Modül Üretmek" vs. "Python Hook Yazma" Paradoksu

- **Çelişki:** Mimarinin temel felsefesi "kod yazmadan modül üretmek" olarak tanımlanmışken (Karar 10 ve `k-surface`), hemen ardından SDK'nın `hooks/` klasörü altında `before_insert`, `on_submit` gibi Python fonksiyonlarının (`order_hooks.py`) gövdelerinin AI tarafından doldurulacağı belirtilmiştir.
- **Sorun:** İş mantığı (Business Logic) her zaman kod gerektirir. Eğer iş mantığı Python dosyaları içine yazılacaksa, bu "no-code" değil, geleneksel "low-code" veya "declarative metadata" yaklaşımıdır. 
- **Eksik:** Geliştiricinin (veya AI'ın) Python kodu yazmasına gerek kalmadan, iş mantığını ve basit validasyonları da bildirimsel (declarative) olarak YAML/JSON içinde tanımlayabileceği bir "Kural Motoru (Rule Engine)" mimaride eksiktir. Her basit mantık için Python dosyası üretilmesi, projenin "sıfır kod" iddiasını zayıflatmaktadır.

---

## 3. Otomatik Story Point ve Sert Granülerlik Engelleri

- **Granülerlik Katılığı:** `k-granulerlik` içinde "Kaya doğrudan Kum Tanesi'ne bağlanamaz, aradaki taşlar eksikse plan reddedilir" kuralı mevcuttur. 
- **Vibecoding Engelleyicisi:** Yeni öğrenen biri LLM'e "Müşteri formuna telefon alanı ekle" talimatını verdiğinde (Büyük Taş'tan Kum Tanesi'ne atlama), sistemin bu planı doğrudan reddetmesi kullanıcıda bıkkınlık yaratır. Acemi kullanıcı, mimari terimleri (Orta Taş, Küçük Taş) bilmek veya bunlarla vakit kaybetmek istemez.
- **Eksik:** Hatalı veya eksik granülerlik planlarını reddetmek yerine, aradaki katmanları (örneğin eksik olan Fragment veya Projection tanımlarını) AI'ın arka planda *çıkarsayıp (infer)* otomatik üreten ve kullanıcıya hissettirmeden arayı kapatan bir "Geçiş Katmanı (Adaptive Bridge)" tasarlanmamıştır.

---

## 4. GraphQL Tercihinin Getirdiği Teknik Karmaşıklık

- **Sorun:** Karar 07'de GraphQL varsayılan API olarak belirlenmiştir. GraphQL; şema tasarımı, N+1 sorgu problemleri ve karmaşık client yapıları nedeniyle yeni başlayanlar için anlaşılması en zor API teknolojilerinden biridir. SDK bu API'yi otomatik üretse bile, custom hook yazarken veya veritabanı sorgularını optimize ederken (SQLAlchemy ile) N+1 problemleri acemi geliştiricilerin karşısına çıkacaktır.
- **Eksik:** GraphQL'in karmaşıklığını gizleyecek, veritabanı katmanında N+1 problemlerini otomatik çözen (auto-dataloader injection) bir soyutlama kernel seviyesinde netleşmemiştir.

---

## 5. Pedagojik Hata Yönetimi (Error Translation) Eksikliği

- **Sorun:** Mimaride PostgreSQL RLS (Row-Level Security), pgBouncer SET LOCAL işlemleri, bitemporal veri yapıları gibi karmaşık veritabanı kurguları mevcuttur. 
- **Eksik:** Bir hata durumunda (örneğin tenant sızıntısı engellendiğinde veya bitemporal anahtar çakışmasında) veritabanının veya ORM'in üreteceği ham hata mesajları (örn: `Key (id, sys_period)=(...) already exists` veya `RLS policy violation`) 60+ yaşındaki bir junior için tamamen anlaşılmazdır. Sistemin bu derin altyapı hatalarını yakalayıp, kullanıcının anlayacağı dilde ("Bu kaydın geçmişini değiştiremezsiniz, yeni bir sürüm oluşturmalısınız") açıklayan ve çözüm sunan bir "Hata Tercümanı / Pedagojik Hata Katmanı" yoktur.

---

## Sonuç ve Özet

Mevcut mimari, deneyimli mühendisler ve kurumsal sistemler için kusursuz bir "modüler monolit" kılavuzudur. Ancak, yazılıma 60 yaşından sonra vibecoding ile başlayan geliştiriciler için **fazla teorik, fazla korumacı ve aşırı kurallıdır**.

Sistemin başarısı için:
1. Kuralları **ihlal edildiğinde planı reddeden** değil, **eksikleri kendisi tamamlayan** bir AI mimari asistanına,
2. Teknik hataları kullanıcıya göstermeden önce sadeleştiren bir **pedagojik arayüze (mental translator)**,
3. WASM ve GraphQL gibi yüksek bariyerli teknolojilerin acemilerden tamamen gizlendiği bir **soyutlama derinliğine** ihtiyaç vardır.
