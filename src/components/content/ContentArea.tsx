// Page render: metadata index'ten sync, gövde page-başına lazy chunk'tan (14 #15)

import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { loadPageBlocks, resolvePage, resolvePageById, scrollToBlockAnchor, termsOfPage } from "../../engine";
import type { Page } from "../../schemas";
import { GlossaryTermChip } from "../glossary/GlossaryTerm";
import { ContentRenderer } from "./ContentRenderer";

export function ContentArea() {
  const { section, page: pageSlug } = useParams({ from: "/docs/$section/$page" });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const resolved = resolvePage(section, pageSlug);
  const [page, setPage] = useState<Page | null>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  const entry = resolved.kind === "found" ? resolved.entry : null;

  useEffect(() => {
    let alive = true;
    setPage(null);
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
          edebilirsiniz.
        </p>
      </div>
    );
  }

  const terms = termsOfPage(entry.id);
  const related = (entry.related ?? []).map(resolvePageById).filter((p) => p !== undefined);

  return (
    <article>
      {(entry.meta?.badge || entry.meta?.state || entry.meta?.granularity) && (
        <div className="meta-row">
          {entry.meta?.badge && <span className="badge">{entry.meta.badge}</span>}
          {entry.meta?.granularity && <span className="badge">{entry.meta.granularity}</span>}
          {entry.meta?.state && <span className="badge">{entry.meta.state}</span>}
        </div>
      )}
      <h1 tabIndex={-1} ref={h1Ref}>
        {entry.title}
      </h1>
      {entry.summary && <p className="lead">{entry.summary}</p>}

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
