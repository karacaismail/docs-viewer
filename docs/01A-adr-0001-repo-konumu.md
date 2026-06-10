# 01A — ADR-0001 (viewer serisi): Repo Konumu

Bu doküman iki görev görür: viewer'ın repo konumu kararını verir ve bu setin ADR şablonunu tanımlar. Numara uzayı nottur: `HEDEF_MIMARI-8.md` kendi ADR-0001'ini metawork serisi için rezerve eder; viewer kendi bağımsız ADR serisini tutar. Bundan sonra bu setten her sapma, aynı şablonla yeni bir ADR ister.

## Durum

Kabul edildi — 10 Haziran 2026.

## Bağlam

`HEDEF_MIMARI-8.md` §7, `metawork` monorepo'sunu tanımlar (framework/kernel, modules, apps, packages, catalog, docs/adr) ve `mimari/` raporlarının oraya taşınmasını öngörür. Viewer'ın iki aday evi vardır: metawork içinde `apps/docs` olarak yaşamak ya da bağımsız repo olmak. Gerilim gerçektir, çünkü viewer'ın **içeriği** metawork mimarisinin spesifikasyonudur (197 cluster JSON) — içerik framework'e aittir; ama viewer'ın **kodu** framework'ten tamamen bağımsız statik bir SPA'dır.

Karara etki eden olgular: metawork Stage 0 (monorepo + boundaries + CI) henüz kurulmamıştır ve `HEDEF_MIMARI-8` §9'a göre 1-2 haftalık ayrı bir iştir; viewer'ın bu seti üretim için hazırdır ve beklemesi için teknik neden yoktur. Viewer'ın CI kapıları (05 §4) hafif ve frontend'e özgüdür; metawork'ün kapıları (ruff/mypy/pytest/import-linter) ağır ve polyglot'tur. İçerik güncelleme temposu (sık, küçük JSON diff'leri) framework geliştirme temposundan farklıdır. Viewer'ın metawork koduna sıfır import bağımlılığı vardır.

## Karar

Viewer **bağımsız private GitHub repo'su** olarak kurulur: `docs-viewer`. Monorepo'ya katılım reddedilmez, ertelenir — aşağıdaki revizyon tetikleyicisiyle.

1. **Kaynak içerik repo'ya taşınır:** 197 cluster JSON `docs-viewer/content-source/` altına git geçmişiyle birlikte alınır ve oradaki kopya tek doğruluk kaynağı olur. `mimari/` klasörü çalışma arşivi statüsüne düşer; çift kaynak yaşatılmaz (02 §4 izlenebilirlik ilkesinin repo karşılığı). Migration hattı (07) `content-source/ → src/data/` yönünde repo içinde çalışır.
2. **Bu doc seti** `docs-viewer/docs/` altına taşınır; viewer ADR'leri `docs-viewer/docs/adr/` altında bu şablonla birikir.
3. **Mimari analiz raporları** (`MIMARI-ANALIZ-*`, `HEDEF_MIMARI-8` vb.) viewer repo'suna girmez — onlar framework kararlarıdır ve `HEDEF_MIMARI-8` §12.3 gereği metawork `docs/adr/`'sine gider.
4. **Deploy** bağımsızdır: GitHub Actions → Hetzner Debian, `releases/<sha>` + `current` symlink (05 §4'teki hat). Viewer'ın yayını metawork release döngüsüne bağlanmaz.
5. **Tasarım token'ları** (09A) viewer içinde yaşar. Metawork `packages/tokens` kurulduğunda tek yönlü senkron değerlendirilir (token değerleri JSON olarak dışa verilebilir); viewer o pakete **bağımlanmaz**.

## Gerekçe Özeti

Bağımsız yaşam döngüsü + sıfır kod bağımlılığı + Stage 0'ı bekletmeme, monorepo'nun tek faydasına (içerik-framework yakınlığı) ağır basar. İçerik yakınlığı sorunu otomasyonla çözülür (aşağıda); repo birleştirmeyle çözmek, hafif bir statik siteyi ağır bir polyglot CI'ın arkasına koymak demektir.

## Sonuçlar

Olumlu: viewer bugün kurulabilir; CI dakikalar içinde döner; içerik PR'ları (12A §5.4) küçük ve izole kalır; Hetzner'da ayrı vhost/subdomain ile bağımsız servis edilir. Olumsuz / kabul edilen maliyet: metawork mimarisi değiştikçe `content-source/` elle ya da otomasyonla güncellenmek zorundadır — içerik ile framework'ün ayrışma riski repo ayrılığının bedelidir ve aşağıdaki senaryoyla yönetilir.

**Otomasyon senaryosu (openclaw + n8n, `HEDEF_MIMARI-8` §10.1 deseninin viewer karşılığı):** metawork `catalog/` veya ADR değişikliği n8n webhook'unu tetikler → openclaw etkilenen cluster JSON'larını tespit edip `docs-viewer`'da içerik PR'ı açar → CI içerik doğrulama kapısından geçer → editör onayıyla yayınlanır. İçerik ayrışması böylece commit anında değil, en geç PR kuyruğunda görünür olur.

## Revizyon Tetikleyicisi

Şu üç koşul birlikte oluştuğunda bu karar yeniden açılır ve taşıma `git subtree` ile geçmiş korunarak `metawork/apps/docs`'a yapılır: metawork Stage 0 tamamlanmış, `packages/tokens` üretimde, ve içerik-senkron otomasyonu ayda birden fazla manuel müdahale istiyor. Veri sözleşmeleri (03 §3-4 ID/slug kararlılığı) repo taşımasından etkilenmez — taşınabilirlik bu setin zaten garanti ettiği bir özelliktir.

## ADR Şablonu (bu setin sapma sözleşmesi)

Sonraki ADR'ler bu dosyanın yapısını izler: **Durum** (önerildi/kabul/reddedildi/yerini aldı + tarih) · **Bağlam** (gerilim ve olgular, gerekçeli dil — 01 §"Dil Tonu") · **Karar** (numaralı, uygulanabilir maddeler) · **Sonuçlar** (olumlu + kabul edilen maliyet) · **Revizyon Tetikleyicisi** (hangi koşulda yeniden açılır). Dosya adı: `adr-NNNN-konu.md`.
