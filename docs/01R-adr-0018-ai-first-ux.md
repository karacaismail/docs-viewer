# 01R — ADR-0018 (viewer serisi): AI-first UX/UED — İki Mod, Sonuç-önce Önizleme, Güven Kalibrasyonu

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 13 Haziran 2026. ADR-0014 §3 + öncelik kuralı (birleştir > yeni sayfa) uygulanır: UX akışı sahip sayfalara (stack-builder, edu-u15, sus-declarative) entegre edildi; yeni sayfa açılmadı.

## Bağlam

v1/v2 konuşmalı üretimi doğrusal sihirbazdı. Üç sorun: 60+ kitle soyut şema/alan listesini değerlendiremez; LLM self-report güveni güvenilmezdir (RLHF kalibrasyonu bozar, emin-ses ödüllendirir); her kartta AI-önerisi ön-seçili olursa otomasyon yanlılığı (düşünmeden onay) doğar. Sentetik veri için faker deterministik/öngörülebilir/PII-güvenli; LLM ise tutarsız/halüsinasyona açık.

## Karar

1. **İki mod, tek motor:** Otopilot (AI sürer, sonuç-önce, tek tık) ve Atölye (insan sürer, [a,b,c,d] DecisionCard + sub_prompt); insan-kararı kilidi.
2. **Sonuç-önce önizleme:** 6 satır sentetik veri deterministic faker'dan (LLM yalnız domain/alan tespiti), 'örnek veri' etiketli, export-korumalı.
3. **Güven dış sinyalden:** validation/self-consistency/token olasılığı/risk/geçmiş; model self-report tek başına kullanılmaz; eşik ≥0.80 / 0.60-0.80 / <0.60.
4. **Ön-seçim politikası:** PII/parasal/hukuki/yıkıcı kararlarda ön-seçim yok.
5. **Journey state machine** (idle→completed) + hata durumları, öğretici mesaj + geri dönüş.

## Sonuçlar

Olumlu: 60+ sonucu görerek onaylar; güven yanılsaması ve otomasyon yanlılığı azaltılır. Maliyet: deterministic faker + güven sinyal altyapısı; mod tutarlılığı için insan-kararı kilidi. Supersede yok.

İlgili: ADR-0014, ADR-0015, ADR-0016, ADR-0017, `stack-builder` (203), `edu-u15` (88), `sus-declarative` (98), `s-studio` (185).
