// Rail 1: kategori seçimi route değiştirmez, Rail 2'yi değiştirir (10 §Rail 1).
// Pragmatik istisna: kategori seçimi o kategorinin ilk page'ine gider — URL tek doğruluk kaynağı.
import { Link } from "@tanstack/react-router";
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
        <div className="rail1__brand">
          Mimari Doküman
          <button
            type="button"
            className="iconbtn"
            aria-label="Ara (Cmd+K)"
            onClick={() => ui.open("search")}
            style={{ float: "right" }}
          >
            <i className="ph ph-magnifying-glass" aria-hidden />
          </button>
        </div>
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
    </nav>
  );
}
