// Page render: metadata index'ten sync, gövde page-başına lazy chunk'tan (14 #15)

import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  lastUpdated,
  loadPageBlocks,
  pageAt,
  pageNeighbors,
  pageToMarkdown,
  resolvePage,
  resolvePageById,
  scrollToBlockAnchor,
  termsOfPage,
} from "../../engine";
import type { Page } from "../../schemas";
import { GlossaryTermChip } from "../glossary/GlossaryTerm";
import { useUiState } from "../ui/UiState";
import { ContentRenderer } from "./ContentRenderer";
import { CurriculumProgress } from "./CurriculumProgress";
import { ReadingProgress } from "./ReadingProgress";

// Rozet insancıllaştırma (ADR-0008 Rev.2: yeni adlar öne, metafor/tooltip yanında) — ham slug kullanıcıya gösterilmez
const GRAN_TR: Record<string, { label: string; title: string }> = {
  kaya: { label: "Kaya", title: "Tanım katmanı: Domain (Module) — SP 21" },
  "buyuk-tas": { label: "Büyük Taş", title: "Tanım katmanı: Surface/ArcheType işi — SP 13" },
  "orta-tas": { label: "Orta Taş", title: "Tanım katmanı: View/Projection — SP 8" },
  "kucuk-tas": { label: "Küçük Taş", title: "Tanım katmanı: Fragment/Section — SP 5" },
};
const STATE_TR: Record<string, string> = { wip: "taslak", ok: "tamam", aday: "aday", done: "tamam" };

export function ContentArea() {
  const ui = useUiState();
  const { section, page: pageSlug } = useParams({ from: "/docs/$section/$page" });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const resolved = resolvePage(section, pageSlug);
  const [page, setPage] = useState<Page | null>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const [mdHintSeen, setMdHintSeen] = useState(() => {
    try {
      return window.localStorage.getItem("md-aciklama") === "1";
    } catch {
      return true;
    }
  });

  const entry = resolved.kind === "found" ? resolved.entry : null;

  useEffect(() => {
    let alive = true;
    setPage(null);
    setCopied(false);
    if (entry) {
      void loadPageBlocks(entry.id.slice(5)).then((p) => {
        if (alive && p) setPage(p);
      });
    }
    return () => {
      alive = false;
    };
  }, [entry]);

  useEffect(() => {
    document.title = `${entry?.title ?? "Sayfa bulunamadı"} — Mimari Dokümantasyon`;
    if (entry) {
      try {
        window.localStorage.setItem("son-ziyaret", JSON.stringify({ slug: entry.slug, title: entry.title }));
      } catch {
        /* kalıcılık yoksa sessiz geç */
      }
    }
    if (!entry) {
      h1Ref.current?.focus();
      return;
    }
    if (!page) return; // anchor/focus, gövde DOM'a girince
    if (hash) {
      requestAnimationFrame(() => scrollToBlockAnchor(hash)); // (10 §Routing 2)
    } else {
      window.scrollTo({ top: 0 });
      h1Ref.current?.focus(); // sayfa değişimi duyurulur (10 §Routing 4)
    }
  }, [entry, page, hash]);

  if (!entry) {
    return (
      <div className="notfound">
        <h1 tabIndex={-1} ref={h1Ref}>
          Sayfa bulunamadı
        </h1>
        <p>
          “{resolved.kind === "not-found" ? resolved.slug : ""}” adresinde bir doküman yok. Sol menüden devam
          edebilirsiniz — ya da aradığınızı bulmak için:
        </p>
        <div className="notfound__actions">
          <button type="button" className="iconbtn" onClick={() => ui.open("search")}>
            <i className="ph ph-magnifying-glass" aria-hidden /> Aramayı aç
          </button>
          <Link to="/sozluk" className="iconbtn">
            <i className="ph ph-book-open" aria-hidden /> Sözlüğe bak (A-Z)
          </Link>
        </div>
      </div>
    );
  }

  const terms = termsOfPage(entry.id);
  const related = (entry.related ?? []).map(resolvePageById).filter((p) => p !== undefined);

  // MD dışa aktarma: 'İlgili sayfalar' öncesi içerik (başlık+özet+blocks) -> <stem>.md indir
  const exportMd = () => {
    if (!page) return;
    dismissMdHint();
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const md = pageToMarkdown(entry, page.blocks, base);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    a.download = `${entry.slug.split("/")[1] ?? "sayfa"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // MD kopyala (UX-B9): indirme yerine panoya — 60+ için "dosya nereye indi?" sorusunu atlar
  const dismissMdHint = () => {
    if (mdHintSeen) return;
    setMdHintSeen(true);
    try {
      window.localStorage.setItem("md-aciklama", "1");
    } catch {
      /* kalıcılık yoksa oturum içi */
    }
  };

  const copyMd = () => {
    if (!page) return;
    dismissMdHint();
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const md = pageToMarkdown(entry, page.blocks, base);
    void navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    });
  };

  const flat = pageAt(entry.slug);
  const updatedAt = lastUpdated[entry.id.slice(5)];
  const headings = (page?.blocks ?? []).filter(
    (b): b is Extract<typeof b, { type: "heading" }> => b.type === "heading" && b.level === 2,
  );

  return (
    <article>
      <ReadingProgress />
      {flat?.section && (
        <nav className="crumbs" aria-label="Konum">
          <span className="crumbs__section">{flat.section}</span>
          <span aria-hidden> › </span>
          <span>{flat.categoryLabel}</span>
        </nav>
      )}
      <div className="page-actions">
        <button
          type="button"
          className="iconbtn"
          onClick={exportMd}
          disabled={!page}
          aria-label="Sayfayı Markdown olarak dışa aktar"
          title="Markdown olarak dışa aktar (.md)"
        >
          <i className="ph ph-download-simple" aria-hidden /> MD
        </button>
        <button
          type="button"
          className="iconbtn"
          onClick={copyMd}
          disabled={!page}
          aria-label="Sayfayı Markdown olarak panoya kopyala"
          title="Markdown'ı panoya kopyala"
        >
          <i className={`ph ${copied ? "ph-check" : "ph-copy"}`} aria-hidden />{" "}
          {copied ? "Kopyalandı" : "MD kopyala"}
        </button>
        <span aria-live="polite" className="sr-only-live">
          {copied ? "Sayfa içeriği Markdown olarak panoya kopyalandı" : ""}
        </span>
        {!mdHintSeen && (
          <span className="md-hint">
            MD = sayfanın metni, yapay zekâya yapıştırılabilir biçimde. Kopyala panoya alır; MD indir dosya
            olarak kaydeder.
          </span>
        )}
      </div>
      {(entry.meta?.badge || entry.meta?.state || entry.meta?.granularity || updatedAt) && (
        <div className="meta-row">
          {entry.meta?.badge && <span className="badge">{entry.meta.badge}</span>}
          {entry.meta?.granularity && (
            <span className="badge" title={GRAN_TR[entry.meta.granularity]?.title}>
              {GRAN_TR[entry.meta.granularity]?.label ?? entry.meta.granularity}
            </span>
          )}
          {entry.meta?.state && (
            <span className="badge">{STATE_TR[entry.meta.state] ?? entry.meta.state}</span>
          )}
          {updatedAt && <span className="updated-at">Son güncelleme: {updatedAt}</span>}
        </div>
      )}
      <h1 tabIndex={-1} ref={h1Ref}>
        {entry.title}
      </h1>
      {entry.summary && <p className="lead">{entry.summary}</p>}
      {page && (
        <details className="governance-panel">
          <summary>Sayfa yönetişimi ve kabul durumu</summary>
          <dl>
            <div>
              <dt>Sahip</dt>
              <dd>{page.owner}</dd>
            </div>
            <div>
              <dt>Reviewer</dt>
              <dd>{page.reviewer}</dd>
            </div>
            <div>
              <dt>Olgunluk</dt>
              <dd>{page.maturity}</dd>
            </div>
            <div>
              <dt>Son doğrulama</dt>
              <dd>{page.lastVerified ?? "Henüz doğrulanmadı"}</dd>
            </div>
            <div>
              <dt>Dış inceleme</dt>
              <dd>{page.externalReviewRequired ? "Zorunlu" : "İç review yeterli"}</dd>
            </div>
            <div>
              <dt>Operasyon etkisi</dt>
              <dd>{page.operationalImpact}</dd>
            </div>
          </dl>
          <strong>Kabul kriterleri</strong>
          <ul>
            {page.acceptanceCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      )}

      {(entry.slug === "egitim/edu-overview" || entry.slug === "egitim/edu-faz-haritasi") && (
        <CurriculumProgress />
      )}

      {headings.length >= 4 && (
        <details className="toc">
          <summary>Bu sayfada ({headings.length} bölüm)</summary>
          <ol className="toc__list">
            {headings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ol>
        </details>
      )}

      {terms.length > 0 && (
        <ul
          className="meta-row"
          aria-label="Bu sayfadaki terimler"
          style={{ listStyle: "none", padding: 0, margin: "0 0 var(--space-default)" }}
        >
          {terms.map((t) => (
            <li key={t.id}>
              <GlossaryTermChip term={t} />
            </li>
          ))}
        </ul>
      )}

      {page ? (
        <ContentRenderer blocks={page.blocks} />
      ) : (
        <p role="status" aria-busy="true" style={{ color: "var(--color-text-muted)" }}>
          İçerik yükleniyor…
        </p>
      )}

      {(() => {
        const nb = pageNeighbors(entry.slug);
        if (!nb.prev && !nb.next) return null;
        const linkOf = (it: { slug: string }) => {
          const [s2, p2] = it.slug.split("/");
          return { to: "/docs/$section/$page" as const, params: { section: s2, page: p2 } };
        };
        return (
          <nav className="pager" aria-label="Sıralı okuma">
            {nb.prev ? (
              <Link {...linkOf(nb.prev)} className="pager__link">
                <span className="pager__dir">← Önceki</span>
                <span className="pager__title">{nb.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nb.next && (
              <Link {...linkOf(nb.next)} className="pager__link pager__link--next">
                <span className="pager__dir">
                  Sonraki →{nb.crossesCategory ? ` · Sıradaki bölüm: ${nb.next.categoryLabel}` : ""}
                </span>
                <span className="pager__title">{nb.next.title}</span>
              </Link>
            )}
          </nav>
        );
      })()}

      {related.length > 0 && (
        <nav className="related" aria-label="İlgili sayfalar">
          <h2>İlgili sayfalar</h2>
          <div className="cardgrid">
            {related.map((p) => {
              const [s, pg] = p.slug.split("/");
              return (
                <Link
                  key={p.id}
                  to="/docs/$section/$page"
                  params={{ section: s, page: pg }}
                  className="card"
                  style={{ textDecoration: "none" }}
                >
                  <div className="card__title">{p.title}</div>
                  <span style={{ color: "var(--color-text-secondary)" }}>{p.summary}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </article>
  );
}
