# 01G — ADR-0007 (viewer serisi): Terminoloji — Kernel/Core Ayrımı ve "Module" Dili

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü.

## Durum

Kabul edildi — 11 Haziran 2026.

## Bağlam

İçerik setinde genişletme birimi için "plugin" (WordPress dili) kullanılıyordu; ayrıca "kernel" ve "core" yer yer eşanlamlı geçiyordu. Proje hedefi netleşti: AI-first/AI-native bir **kernel** (sistemin kalbi ve beyni — Linux kernel analojisi) ve üstünde SaaS app'leri (Shopify/SAP/Salesforce clone'ları…); her app'in kendi **core** module'ü (Drupal core analojisi — app'in değişmez kalbi) vardır; app'lerin ortak yapısı kernel'dedir. App geliştirme **SDK** ile yapılır ve SDK vibecoding-uyumludur.

## Karar

1. Genişletme birimi **module**'dür (Drupal dili); "plugin" ifadesi kullanılmaz — yalnız WordPress'in kendi terimini tarif eden karşılaştırma cümlelerinde geçebilir.
2. **Kernel** yalnız sistem geneli için, **core** yalnız app çekirdeği için kullanılır; ikisi birbirinin yerine geçmez.
3. Mevcut 254 "plugin" geçişi içerik ve doc setinde "module/modül"e çevrildi; sayfa slug'ları değişmedi (03 §3 slug kararlılığı — `kernel-plugin`, `edu-u09-plugin` slug olarak kalır, başlıkları Module dilindedir).
4. Sözleşme `kernel/k-terminoloji` içerik sayfasında yaşar ve glossary'ye Kernel/Core/App/Module/SDK kayıtları eklendi.

## Sonuçlar

Artılar: Drupal module ekosistemi kültürüyle hizalanma; kernel/core karışıklığının yapısal önlenmesi; AI-codegen için tutarlı sözlük. Eksiler: eski slug'larda "plugin" kelimesi yaşamaya devam eder — bilinçli kabul (link kararlılığı > ad kozmetiği).
