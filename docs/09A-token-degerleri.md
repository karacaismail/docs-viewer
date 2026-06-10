# 09A — Token Değerleri (09'un bağlayıcı eki)

Bu doküman, `09-uretim-04-layout.md`'de adları ve kuralları tanımlanan token'ların somut değerlerini verir. Tüm renk çiftleri WCAG kontrast formülüyle programatik olarak doğrulanmıştır (10 Haziran 2026); tablolardaki oranlar ölçümdür, hedef değildir. Bu, `14-uretim-09-a11y-ve-kabul.md` §1.6 "kontrast token seviyesinde test edilir" kuralının ilk uygulamasıdır — buradaki ölçüm script'i, token dosyasının otomatik kontrast testinin temelidir.

## 1. Metin Tabanı Uzlaşması

İki kaynak farklı taban veriyor: master prompt 0.9rem altına inilmez der, codebase'in ZORUNLU kuralı `mobile-first-pattern.md` ise 1rem (16px) taban koyar. Çelişki yoktur — 1rem, "0.9rem altına inmez" şartını sağlar ve daha sıkıdır. Bu set **1rem'i efektif taban** kabul eder: chip, badge, hint, tooltip, meta satırı dahil hiçbir okunabilir metin 1rem altına inmez. İkon boyutu bu kurala tabi değildir (0.85–1.5rem serbest).

## 2. Renk Paleti (ölçülmüş kontrast oranlarıyla)

### Zemin katmanları

| Token | Değer | Rol |
|---|---|---|
| `color.bg.base` | `#121417` | Sayfa zemini |
| `color.bg.surface` | `#1A1D21` | Rail, kart, panel zemini |
| `color.bg.elevated` | `#22262C` | Overlay, tooltip, codeBlock zemini |

### Metin ve vurgu — AA eşiği 4.5:1, oranlar base / surface / elevated sırasıyla

| Token | Değer | Kontrast (ölçüm) |
|---|---|---|
| `color.text.primary` | `#E8EAED` | 15.31 / 14.03 / 12.61 |
| `color.text.secondary` | `#B6BCC6` | 9.66 / 8.86 / 7.96 |
| `color.text.muted` | `#939BA7` | 6.58 / 6.03 / 5.42 |
| `color.accent.primary` | `#E0B45C` | 9.54 / 8.74 / 7.85 — eski viewer'ın gold mirası |
| `color.accent.hover` | `#EBC57E` | 11.26 / 10.33 / 9.28 |
| `color.focus.ring` | `#7FB8E8` | 8.72 (metin değil; 3:1 non-text eşiğinin de üstünde) |

### Feedback renkleri — callout variant seti `04 §3` ile birebir (info/tip/warning/danger/tr)

| Token | Değer | Kontrast (surface) |
|---|---|---|
| `color.feedback.info` | `#7FB3E3` | 7.62 |
| `color.feedback.tip` | `#85C79E` | 8.59 |
| `color.feedback.warning` | `#DCAE53` | 8.23 |
| `color.feedback.danger` | `#E2837B` | 6.25 |
| `color.feedback.tr` | `#6BC4BA` | 8.24 |

Callout zeminleri bu renklerin %12 opaklıkta `bg.surface` üzerine bindirilmesiyle türetilir; metin rengi her zaman `text.primary`/`text.secondary` kalır — feedback rengi kenarlık, ikon ve başlıkta kullanılır (renk + biçim birlikte, yalnız renk asla — 12 §"Etkileşim" kuralıyla aynı ilke).

### Kenarlıklar

| Token | Değer | Not |
|---|---|---|
| `color.border.subtle` | `#2E333A` | Dekoratif ayrım; kontrast şartı yok |
| `color.border.strong` | `#5D6774` | İnteraktif bileşen sınırı; base'e karşı 3.21 — non-text 3:1 eşiğini geçer (ölçüldü; `#59626F` 2.99 ile kaldığı için yükseltildi) |

## 3. Tipografi

| Token | Değer |
|---|---|
| `font.family.sans` | `Roboto` (fallback: system-ui, sans-serif) |
| `font.family.mono` | `Roboto Mono` (fallback: ui-monospace, monospace) |
| `font.weight` | 300 / 400 / 500 / 700 — **300 yalnızca ≥1.25rem boyutta** (dark zeminde ince kesim küçük boyutta okunabilirliği düşürür) |

Type scale (taban 1rem = 16px, satır yüksekliği gövdede 1.65):

| Token | Boyut | Kullanım |
|---|---|---|
| `type.body` | 1rem | Gövde, tooltip, badge, hint — efektif taban |
| `type.lead` | 1.125rem | Page summary, giriş paragrafı |
| `type.h4` | 1.125rem / 500 | Block içi alt başlık |
| `type.h3` | 1.25rem / 500 | |
| `type.h2` | 1.5rem / 500 | Section başlığı |
| `type.h1` | 1.75rem (mobile) → 2rem (desktop) / 400 | Page title — tek h1 |
| `type.code` | 1rem mono | codeBlock ve inline code; 1rem kuralına tabidir |

Font'lar self-host edilir (`woff2`, `font-display: swap`); CDN font isteği yapılmaz — statik ürün kendi varlığıyla gelir ve performans bütçesine dahildir.

## 4. Spacing, Radius, Gölge, Katman

4px taban ızgarası; üç anlamsal seviye `09 §Token` adlarıyla:

| Token | Mobile | Desktop |
|---|---|---|
| `space.compact` | 0.5rem | 0.5rem |
| `space.default` | 1rem | 1.25rem |
| `space.section` | 2rem | 3rem |

| Token | Değer |
|---|---|
| `radius.sm` / `radius.md` / `radius.lg` | 4px / 8px / 12px |
| `shadow.overlay` | `0 8px 24px rgba(0,0,0,0.45)` — yalnız overlay katmanlarında |
| `zIndex.drawer` | 40 |
| `zIndex.modal` | 50 (SearchOverlay, ExplanationPanel) |
| `zIndex.tooltip` | 60 — tooltip her katmanın üstünde görünebilmeli |

## 5. Hareket

| Token | Değer |
|---|---|
| `motion.fast` | 120ms — hover, tooltip |
| `motion.default` | 200ms — drawer, panel, accordion |
| `motion.highlight` | 1600ms — block anchor vurgusu (13 §3); tek sefer, döngüsüz |

`prefers-reduced-motion` durumunda tüm süreler 0'a düşer; anchor highlight animasyonsuz statik kenarlık vurgusuna döner (09 ve 13'teki kurallarla aynı).

## 6. Shiki Teması ve Kod Zemini

Shiki teması `github-dark-default` olarak kilitlenir; token renkleri temadan, kod zemini ise temadan değil `color.bg.elevated`'dan gelir (render bizim token pipeline'ımızda olduğu için zemin bağımsız uygulanabilir — 11 §"CodeBlock"). `highlightedLines` vurgusu `accent.primary`'nin %10 opaklıkta bindirmesidir. Tema değişikliği semver-minor karardır ve kontrast ölçümü tekrarlanır.

## 7. Uygulama Notu

Değerler `src/styles/tokens.css`'te CSS custom property olarak tanımlanır ve `globals.css`'teki semantik class'lar tarafından tüketilir (Tailwind yok — ADR-0004). Token kontrast testi, bu dokümandaki ölçüm formülünün (WCAG relative luminance) Vitest'e taşınmış halidir ve `tokens.css` her değiştiğinde CI'da koşar — değer burada değişir, test orada yakalar.
