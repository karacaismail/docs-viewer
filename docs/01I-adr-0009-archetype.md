# 01I — ADR-0009 (viewer serisi): DocType → ArcheType

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

Bildirimsel varlık-tanımı kavramı Frappe'den ödünç "DocType" adıyla anılıyordu. İki sorun: (1) vibecoding'de LLM'ler bu adla Frappe API'si varsayımları (frappe.get_doc vb.) taşır — AI bizim SDK sözleşmemize değil Frappe alışkanlığına bakar; (2) "Type" eki Faz 0'ın Atomik Tipler'iyle kelime paylaşır.

## Karar

Kavramın adı **ArcheType**'tır (yazım bilinçli: Arche+Type — DocType paralelliği; sözlük yazımı "archetype"ten ayrışır). 578 geçiş içerik/doc/araç katmanında çevrildi. Değişmeyenler: sayfa slug'ları ve dosya yolları (`edu-u03-doctype`, `edu-u25-doctype-vs-ddd`, `k-schema-doctype.svg` — ADR-0007 link-kararlılığı deseni) ve Frappe'nin KENDİ kavramını anlatan atıflar ("Frappe'deki adıyla DocType"). Glossary kayıtları ve overlay anahtarları taşındı; SDK ağacı `archetypes/` oldu.

## Sonuçlar

Artılar: Frappe bagajsız AI bağlamı; özgün marka; granülerlik diliyle temiz cümle ("Employee ArcheType'ı Büyük Taş'lık iştir"). Eksiler: eski slug'larda "doctype" yaşar — bilinçli kabul; Blueprint adayı elendiğinden `kind:` alan beyanı kararı SDK implementasyonuna bırakıldı.
