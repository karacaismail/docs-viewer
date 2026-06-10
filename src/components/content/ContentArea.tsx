// Page render: başlık + summary + meta + term chip'leri + blocks + related (11 §Renderer)
import { useEffect, useRef } from "react";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { resolvePage, resolvePageById, termsOfPage, scrollToBlockAnchor } from "../../engine";
import { ContentRenderer } from "./ContentRenderer";
import { GlossaryTermChip } from "../glossary/GlossaryTerm";

export function ContentArea() {
  const { section, page: pageSlug } = useParams({ from: "/docs/$section/$page" });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const resolved = resolvePage(section, pageSlug);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = resolved.kind === "found" ? resolved.page.title : "Sayfa bulunamadı";
    document.title = `${title} — Mimari Dokümantasyon`;
    if (hash) {
      // İçerik mount edildikten sonra anchor'a in (10 §Routing 2)
      requestAnimationFrame(() => scrollToBlockAnchor(hash));
    } else {
      window.scrollTo({ top: 0 });
      h1Ref.current?.focus(); // sayfa değişimi screen reader'a duyurulur (10 §Routing 4)
    }
  }, [resolved, hash]);

  if (resolved.kind === "not-found") {
    return (
      <div className="notfound">
        <h1 tabIndex={-1} ref={h1Ref}>Sayfa bulunamadı</h1>
        <p>“{resolved.slug}” adresinde bir doküman yok. Sol menüden devam edebilirsiniz.</p>
      </div>
    );
  }

  const { page } = resolved;
  const terms = termsOfPage(page.id);
  const related = (page.related ?? []).map(resolvePageById).filter((p) => p !== undefined);

  return (
    <article>
      {(page.meta?.badge || page.meta?.state || page.meta?.granularity) && (
        <div className="meta-row">
          {page.meta?.badge && <span className="badge">{page.meta.badge}</span>}
          {page.meta?.granularity && <span className="badge">{page.meta.granularity}</span>}
          {page.meta?.state && <span className="badge">{page.meta.state}</span>}
        </div>
      )}
      <h1 tabIndex={-1} ref={h1Ref}>{page.title}</h1>
      {page.summary && <p className="lead">{page.summary}</p>}

      {terms.length > 0 && (
        <div className="meta-row" role="list" aria-label="Bu sayfadaki terimler">
          {terms.map((t) => (
            <GlossaryTermChip key={t.id} term={t} />
          ))}
        </div>
      )}

      <ContentRenderer blocks={page.blocks} />

      {related.length > 0 && (
        <nav className="related" aria-label="İlgili sayfalar">
          <h2>İlgili sayfalar</h2>
          <div className="cardgrid">
            {related.map((p) => {
              const [s, pg] = p.slug.split("/");
              return (
                <Link key={p.id} to="/docs/$section/$page" params={{ section: s, page: pg }} className="card" style={{ textDecoration: "none" }}>
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
