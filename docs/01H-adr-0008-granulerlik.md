# 01H — ADR-0008 (viewer serisi): Granülerlik Zinciri v2 — Sekiz Seviye + SP Katsayıları

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

Eski yedi seviyeli zincirde (kaya→...→atom) iki sorun vardı: tepe seviye 'kaya' hem ürünü hem modülü taşıyor, ekran-benzeri iki seviye karışıyordu; 'atom' ise tip-primitive anlamıyla Faz 0'ın Atomik Tipler'iyle çakışıyordu. Ayrıca frontend/backend için ayrı dil yoktu ve seviye katsayıları kayıtlı değildi.

## Karar

Zincir sekiz seviyedir ve tek doğruluk kaynağı `kernel/k-granulerlik` sayfasıdır: **Dağ** (Application, SP 34+) → **Kaya** (Module/Bounded Context, 21 — kayalardan biri app'in tekil core module'üdür) → **Büyük Taş** (Screen/Service Group, 13) → **Orta Taş** (View/Endpoint Group, 8) → **Küçük Taş** (Section/Use Case, 5) → **Kum Tanesi** (Component/API Endpoint, 3) → **Toz Tanesi** (Property/Validation-Policy, 2) → **Atom** (Rule/Constraint/Logic, 1). Frontend ve backend aynı metafora eşlenir. **Komşuluk kuralı** bağlayıcıdır: bir seviye yalnız bir alt komşusuna bağlanır — ihlal, eksik analiz sinyalidir ve AI-backlog üretiminde denetleyici olarak kullanılır. Granülerlik Atom'u (kural) ile Atomik Tipler (Faz 0, tip primitifleri) ayrı kavramlardır ve içerikte açıkça ayrıştırılır.

## Sonuçlar

Artılar: WBS + otomatik SP üretimi + granülerlik denetimi tek dilde; 'crm dağ yap' gibi LLM iş tarifleri tek anlamlı. Eksiler: eski zinciri kullanan içerik güncellendi (00-overview, legend dönüşümü); sayfa-meta `granularity` değerleri (kaya/taş/kum) eski-ölçek etiketi olarak yaşar — içerik-sayfası iriliği bildirir, yeni iş-zinciriyle karıştırılmaz.

## Revizyon 2 — Tanım Katmanıyla Eşleştirme (11 Haziran 2026)

Granülerlik metaforu ile tanım-katmanı adları (ADR-0009/0010) tek tabloda eşlendi ve **yeni adlar öne çıkan** ilan edildi: Dağ=App · Kaya=Domain(Module) · Büyük Taş=Surface(ekran)/ArcheType işi · Orta Taş=View/Projection · Küçük Taş=Fragment/Section/Use Case · Kum=Component/Endpoint (alan adı açık) · Toz=Property/bayrak · Atom=Atom(Rule). Çift yönlü tooltip sözleşmesi: metafor terimlerinin kısa açıklaması tanım-katmanı karşılığını, tanım-katmanı terimlerininki granül karşılığını söyler. WBS düğüm adları yeni-ad-önde biçimindedir ("Çalışanlar · Domain (Kaya · 21)").
