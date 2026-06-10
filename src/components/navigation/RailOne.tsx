// Rail 1: kategori seçimi route değiştirmez, Rail 2'yi değiştirir (10 §Rail 1).
// Pragmatik istisna: kategori seçimi o kategorinin ilk page'ine gider — URL tek doğruluk kaynağı.
import { Link } from "@tanstack/react-router";
import { navigation, useFirstSlugOf } from "./navData";
import { useUiState } from "../ui/UiState";

export function RailOne({ activeSection, onNavigate, plain }: {
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
          <button className="iconbtn" aria-label="Ara (Cmd+K)" onClick={() => ui.open("search")} style={{ float: "right" }}>
            <i className="ph ph-magnifying-glass" aria-hidden />
          </button>
        </div>
      )}
      {navigation.categories.map((c) => {
        const [section, page] = firstSlugOf(c.id).split("/");
        return (
          <Link
            key={c.id}
            to="/docs/$section/$page"
            params={{ section, page }}
            className="rail1__item"
            aria-current={c.id === activeSection ? "true" : undefined}
            onClick={onNavigate}
          >
            <i className={`ph ${c.icon}`} aria-hidden />
            <span>{c.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
