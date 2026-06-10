# docs-viewer — Mimari Dokümantasyon Görüntüleyici

Statik JSON tabanlı, backend'siz doküman görüntüleyici. Yönerge seti: `../definations/` (00-INDEX.md).

## Komutlar

```bash
npm install
npm run migrate     # content-source/ -> src/data/ (+ tools/migrate/report.md)
npm run dev         # Vite dev server
npm run test        # Vitest: fold, içerik doğrulama, engine, kontrat, smoke, yasak taraması
npm run build       # migrate + tsc + vite build -> build/
npm run preview     # build önizleme
```

## Mimari özet

- **İçerik**: `content-source/` (197 cluster JSON) → migration → `src/data/{navigation,pages,glossary,search-index}.json` (generated, elle düzenlenmez)
- **Engine** (`src/engine/`): load → validate(dev) → resolve; block registry; foldTurkish; anchor scroll
- **UI**: React 19 + TanStack Router + Radix; 16 block bileşeni registry üzerinden; tek dark tema (`src/styles/tokens.css` — 09A değerleri)
- **Search**: MiniSearch, lazy index, `processTerm=foldTurkish` (13A), sonuç → page + block anchor + highlight
- **Code**: Shiki `codeToTokens` → React renderer; `github-dark-default`; HTML string render yasak

## Bilinen sınırlar (v0.1)

- 83 görsel varlık kayıp (`tools/migrate/report.md`); ImageBlock metin fallback gösterir — `public/assets/` doldurulunca otomatik düzelir
- Eager JS ~212KB gzip (size-limit kapısı 250KB); page gövdeleri ve glossary detayı lazy chunk'larda
- Paragraph içi term segment bağlama editöryel iş (12A); terimler şimdilik sayfa üstü chip + panel ile erişilebilir
- Playwright e2e + axe CI katmanı kurulmadı (05 §2.5) — jsdom smoke testleri mevcut
