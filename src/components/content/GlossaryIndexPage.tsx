// /sozluk — Global Sözlük (UX-C10): 700+ terimin A-Z dökümü; süzme + bağlam linki + '?' paneli.
// 60+ ilkesi: büyük dokunma hedefleri, açık etiketler, tek sütun okunaklı liste.
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { allTerms, foldTurkish, navigation, resolvePageById } from "../../engine";
import { useUiState } from "../ui/UiState";

export function GlossaryIndexPage() {
  const ui = useUiState();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const terms = useMemo(() => {
    const fq = foldTurkish(q.trim());
    const list = allTerms().filter((t) => {
      if (fq && !foldTurkish(t.label).includes(fq)) return false;
      if (cat !== "all" && !resolvePageById(t.pageId)?.slug.startsWith(`${cat}/`)) return false;
      return true;
    });
    return [...list].sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [q, cat]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof terms>();
    for (const t of terms) {
      const k = (t.label[0] ?? "#").toLocaleUpperCase("tr");
      if (!m.has(k)) m.set(k, []);
      m.get(k)?.push(t);
    }
    return [...m.entries()];
  }, [terms]);

  return (
    <article>
      <h1>Sözlük — Tüm Terimler (A-Z)</h1>
      <p className="lead">
        {allTerms().length} bağlamsal terim. Aynı kelime farklı sayfalarda farklı bağlam taşıyabilir — her
        kayıt kendi sayfasına bağlıdır; uzun açıklama için "?" düğmesini kullan.
      </p>
      <p>
        <label>
          Terim süz:{" "}
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="örn. archetype, kaya, pii…"
            className="glossary-filter"
            aria-label="Sözlükte terim süz"
          />
        </label>{" "}
        <label>
          Kategori:{" "}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Terimleri kategoriye göre süz"
          >
            <option value="all">Tümü</option>
            {navigation.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </p>
      {groups.map(([letter, items]) => (
        <section key={letter} className="glossary-group">
          <h2>{letter}</h2>
          <ul className="glossary-list">
            {items.map((t) => {
              const pg = resolvePageById(t.pageId);
              const [sec, pslug] = (pg?.slug ?? "/").split("/");
              return (
                <li key={t.id}>
                  <div className="glossary-row">
                    <strong>{t.label}</strong>
                    <button
                      type="button"
                      className="iconbtn"
                      aria-label={`${t.label} — uzun açıklama panelini aç`}
                      onClick={() => ui.open("panel", t.id)}
                    >
                      ?
                    </button>
                    {pg && (
                      <Link
                        to="/docs/$section/$page"
                        params={{ section: sec, page: pslug }}
                        className="glossary-ctx"
                      >
                        bağlam: {pg.title}
                      </Link>
                    )}
                  </div>
                  <span className="glossary-short">{t.shortExplanation}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {terms.length === 0 && (
        <p role="status">Eşleşen terim yok — yazımı sadeleştirmeyi dene (TR katlama otomatik).</p>
      )}
    </article>
  );
}
