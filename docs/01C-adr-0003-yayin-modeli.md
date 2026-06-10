# 01C — ADR-0003 (viewer serisi): Yayın Modeli — Public Repo + GitHub Pages

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü. Bu ADR, ADR-0001'in deploy ve görünürlük maddelerini kısmen revize eder; repo bağımsızlığı kararı (ADR-0001 §1-3) geçerli kalır.

## Durum

Kabul edildi — 10 Haziran 2026. Karar sahibi: kullanıcı (açık talimat: "GitHub'da repo aç, Pages'te yayınla" + görünürlük sorusuna "Public" yanıtı).

## Bağlam

ADR-0001 private repo + Hetzner Debian'a atomik rsync (releases/<sha> + current symlink) öngörüyordu. Kullanıcı yayını GitHub Pages'te istedi; ücretsiz planda Pages yalnız public repo'da çalışır. İki madde birlikte revize edildi. Pages'in teknik kısıtları statik SPA ile uyumludur: SPA fallback `404.html` kopyasıyla sağlanır (derin link HTTP 404 status döner ama uygulama yüklenir — bilinen Pages davranışı), alt yol (`/docs-viewer/`) `VITE_BASE` + router `basepath` ile çözülür.

## Karar

1. Repo **public**: `github.com/karacaismail/docs-viewer`. İçerik (metawork mimari spesifikasyonu) herkese açıktır — kullanıcı bunu görünürlük sorusunda açıkça kabul etti.
2. Yayın **GitHub Pages** (`https://karacaismail.github.io/docs-viewer/`), kaynak "GitHub Actions": CI zincirinin (05 §4) son halkası `actions/deploy-pages`'tir; ayrı deploy altyapısı yoktur.
3. Hetzner atomik rsync hattı ve n8n release orkestrasyonu **iptal değil, raftadır** — 05 §4'te şablon olarak korunur.

## Sonuçlar

Olumlu: sıfır sunucu operasyonu; deploy CI'ın doğal uzantısı; rollback `git revert` + otomatik yeniden yayın. Kabul edilen maliyet: erişim kontrolü yok (hassas içerik eklenecekse bu ADR yeniden açılır); Pages'in cache/header kontrolü sınırlı; derin linklerde 404-status-lu SPA fallback.

## Revizyon Tetikleyicisi

Şunlardan biri oluşursa Hetzner şablonuna dönülür: içerik gizlilik gerektirir hale gelir; özel header/cache veya basic-auth ihtiyacı doğar; metawork monorepo taşınması (ADR-0001 tetikleyicisi) gerçekleşir ve yayın oraya bağlanır.
