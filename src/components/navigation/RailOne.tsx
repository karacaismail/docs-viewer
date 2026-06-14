// Rail 1: kategori seçimi route değiştirmez, Rail 2'yi değiştirir (10 §Rail 1).
// Pragmatik istisna: kategori seçimi o kategorinin ilk page'ine gider — URL tek doğruluk kaynağı.
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUiState } from "../ui/UiState";
import { navigation, useFirstSlugOf } from "./navData";

export function RailOne({
  activeSection,
  onNavigate,
  plain,
}: {
  activeSection: string;
  onNavigate?: () => void;
  plain?: boolean;
}) {
  const ui = useUiState();
  const firstSlugOf = useFirstSlugOf();
  return (
    <nav className={plain ? undefined : "rail1"} aria-label="Ana kategoriler">
      {!plain && (
        <>
          <div className="rail1__brand">Mimari Doküman</div>
          <button
            type="button"
            className="iconbtn btn-solid rail1__search"
            aria-label="Ara (Ctrl+K)"
            onClick={() => ui.open("search")}
          >
            <span className="rail1__search-text">
              <i className="ph ph-magnifying-glass" aria-hidden /> Ara
            </span>
            <kbd className="kbdchip">Ctrl+K</kbd>
          </button>
        </>
      )}
      {navigation.categories.map((c, i) => {
        const [section, page] = firstSlugOf(c.id).split("/");
        // Bölüm başlığı: önceki kategoriden farklı section başlıyorsa (03 §1)
        const prev = navigation.categories[i - 1];
        const sectionHeading = c.section && c.section !== prev?.section ? c.section : undefined;
        return (
          <div key={c.id}>
            {sectionHeading && <div className="rail1__section">{sectionHeading}</div>}
            <Link
              to="/docs/$section/$page"
              params={{ section, page }}
              className="rail1__item"
              aria-current={c.id === activeSection ? "true" : undefined}
              onClick={onNavigate}
            >
              <i className={`ph ${c.icon}`} aria-hidden />
              <span>{c.label}</span>
            </Link>
          </div>
        );
      })}
      <RailFooter onNavigate={onNavigate} />
    </nav>
  );
}

// Alt blok (UX): Devam et · Sözlük · Issue · AI sözleşmesi — 60+ için açık metinli
function RailFooter({ onNavigate }: { onNavigate?: () => void }) {
  const [last, setLast] = useState<{ slug: string; title: string } | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("son-ziyaret");
      if (raw) setLast(JSON.parse(raw));
    } catch {
      /* yok say */
    }
  }, []);
  const [ls, lp] = (last?.slug ?? "/").split("/");
  return (
    <div className="rail1__footer">
      {last && (
        <Link
          to="/docs/$section/$page"
          params={{ section: ls, page: lp }}
          className="rail1__continue"
          onClick={onNavigate}
        >
          <i className="ph ph-bookmark-simple" aria-hidden /> Devam et: {last.title}
        </Link>
      )}
      <Link to="/sozluk" className="rail1__item" onClick={onNavigate}>
        <i className="ph ph-book-open-text" aria-hidden />
        <span>Sözlük (A-Z)</span>
      </Link>
      <a
        className="rail1__meta"
        href="https://github.com/karacaismail/docs-viewer/issues/new"
        target="_blank"
        rel="noreferrer"
      >
        <i className="ph ph-chat-circle-text" aria-hidden /> Issue ekle
      </a>
      <span className="rail1__meta rail1__meta--static">
        <i className="ph ph-clock" aria-hidden /> Update: {__BUILD_DATE__}
      </span>
      <a
        className="rail1__meta"
        href={`${import.meta.env.BASE_URL}llms.txt`}
        target="_blank"
        rel="noreferrer"
      >
        <i className="ph ph-robot" aria-hidden /> AI sözleşmesi (llms.txt)
      </a>
    </div>
  );
}
