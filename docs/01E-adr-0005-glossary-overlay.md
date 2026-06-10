# 01E — ADR-0005 (viewer serisi): Glossary Zenginleştirme Overlay'i

Şablon: `01A-adr-0001-repo-konumu.md` son bölümü. 12A §3a'da "ADR adayı" olarak duran sapmanın resmî kaydıdır.

## Durum

Kabul edildi — 10 Haziran 2026.

## Bağlam

15 §3 (ilk hali) ve 12A §2-A, zenginleştirmenin kaynaktaki `enrich.terms`'e yazılmasını öngörüyordu. Parti 1 uygulamasında bu, 28 kaynak cluster dosyasına dağılmış, diff'i incelenemez bir değişiklik üretecekti; ayrıca kaynak dosyalar (content-source) migration'ın "dokunulmaz girdi" statüsündeydi — editöryel katmanın kaynağa karışması, içerik kökeni izlenebilirliğini (02 §4) bulanıklaştırır.

## Karar

Editöryel zenginleştirme tek overlay dosyasında yaşar: `tools/migrate/glossary-enrichment.json` — anahtar `foldTurkish(label)`, alanlar `a` (realWorldAnalogy), `u` (useCases), `l` (longExplanation ek paragrafı). Migration overlay'i yalnız kapsam kategorisine (şu an `egitim`) uygular; kapsam genişlemesi (Parti 2+) migration'daki kapsam kuralını günceller, overlay formatını değiştirmez. Yeni terim kaydı (label/meaning/why) ise eskisi gibi kaynaktaki `enrich.terms`'e yazılır — iki yazım yerinin ayrımı 15 §3'te tanımlıdır.

## Sonuçlar

Olumlu: editöryel katman tek dosyada diff'lenebilir ve geri alınabilir; kaynak clusters pristine; label-temelli anahtar, aynı terimin tüm bağlamlarına tek girdiyle hizmet eder (Parti 2'nin çok-bağlamlı varyantları ayrışmak isterse `byTermId` önceliği eklenir — format buna açık). Kabul edilen maliyet: içerik iki dosyaya bakılarak okunur (kaynak + overlay); bağlam-başına farklılaşan zenginleştirme şu an label-genelidir.

## Revizyon Tetikleyicisi

Parti 2'de aynı label'ın bağlamlar arası FARKLI analoji/useCases istemesi `byTermId` katmanının eklenmesini tetikler; overlay 1.000 girdiyi aşarsa kategori-başına dosyalara bölme değerlendirilir.
