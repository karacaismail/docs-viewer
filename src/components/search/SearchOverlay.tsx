// MiniSearch overlay — lazy index, klavye sözleşmesi, block anchor hedefi (13)

import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import type MiniSearch from "minisearch";
import { useEffect, useRef, useState } from "react";
import { foldTurkish, loadSearchIndex } from "../../engine";
import type { SearchDoc } from "../../schemas";
import { useUiState } from "../ui/UiState";

type Result = SearchDoc & { score: number };
// Son seçimler (UX-C14): sorgu boşken "kaldığın yerden devam" listesi — bu cihazda saklanır
type RecentHit = { title: string; pageTitle: string; slug: string; blockId?: string };
const RECENT_KEY = "son-aramalar";
const readRecents = (): RecentHit[] => {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? (v as RecentHit[]).slice(0, 5) : [];
  } catch {
    return [];
  }
};
const pushRecent = (h: RecentHit): void => {
  try {
    const list = [h, ...readRecents().filter((r) => !(r.slug === h.slug && r.blockId === h.blockId))].slice(
      0,
      5,
    );
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* kalıcılık yoksa sessiz geç */
  }
};
let cachedIndex: MiniSearch<SearchDoc> | null = null;

async function getIndex(): Promise<MiniSearch<SearchDoc>> {
  if (cachedIndex) return cachedIndex;
  const [{ default: MiniSearchCtor }, documents] = await Promise.all([
    import("minisearch"),
    loadSearchIndex(),
  ]);
  // processTerm hem index hem sorgu tarafına aynı fold'u uygular (13A §3)
  const ms = new MiniSearchCtor<SearchDoc>({
    fields: ["title", "pageTitle", "text"],
    storeFields: ["kind", "pageId", "pageTitle", "slug", "blockId", "blockType", "title", "text"],
    processTerm: (t) => foldTurkish(t),
    searchOptions: {
      boost: { title: 3, pageTitle: 2 },
      prefix: (term) => term.length > 2, // çok kısa sorgular prefix yapmaz (13 §Edge)
      fuzzy: 0.15,
    },
  });
  ms.addAll(documents);
  cachedIndex = ms;
  return ms;
}

export function SearchOverlay() {
  const ui = useUiState();
  const navigate = useNavigate();
  const open = ui.layer === "search";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [sel, setSel] = useState(0);
  const [ready, setReady] = useState(false);
  const [kindFilter, setKindFilter] = useState<"all" | "block" | "term">("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recents, setRecents] = useState<RecentHit[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSel(0);
    setKindFilter("all");
    setSuggestions([]);
    setRecents(readRecents());
    void getIndex().then(() => setReady(true));
  }, [open]);

  useEffect(() => {
    if (!open || !ready) return;
    const t = window.setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      void getIndex().then((ms) => {
        const found = ms.search(query).slice(0, 30) as unknown as Result[];
        setResults(found);
        setSel(0);
        // "Şunu mu demek istediniz?" (UX-C12): sıfır sonuçta gevşek fuzzy önerisi
        setSuggestions(
          found.length === 0
            ? ms
                .autoSuggest(query, { fuzzy: 0.4, prefix: true })
                .slice(0, 3)
                .map((s) => s.suggestion)
            : [],
        );
      });
    }, 120);
    return () => window.clearTimeout(t);
  }, [query, open, ready]);

  useEffect(() => {
    document.getElementById(`sr-${sel}`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const go = (r: Result) => {
    const [section, page] = r.slug.split("/");
    pushRecent({ title: r.title, pageTitle: r.pageTitle, slug: r.slug, blockId: r.blockId || undefined });
    ui.close();
    void navigate({ to: "/docs/$section/$page", params: { section, page }, hash: r.blockId || undefined });
  };

  const shown = kindFilter === "all" ? results : results.filter((r) => r.kind === kindFilter);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && shown[sel]) {
      e.preventDefault();
      go(shown[sel]);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? ui.open("search") : ui.close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-backdrop" />
        <Dialog.Content className="search-overlay" role="search" aria-describedby={undefined}>
          <Dialog.Title className="sr-only" style={{ position: "absolute", left: -9999 }}>
            Dokümanlarda ara
          </Dialog.Title>
          <input
            className="search-input"
            type="search"
            placeholder={ready ? "Ara… (örn. outbox, multi-tenancy, sürdürülebilirlik)" : "Index yükleniyor…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={shown.length > 0}
            aria-controls="search-results"
            aria-activedescendant={shown[sel] ? `sr-${sel}` : undefined}
            // biome-ignore lint/a11y/noAutofocus: search overlay açılışında odak input'a taşınır — 13 §Overlay 1 sözleşmesi
            autoFocus
          />
          <fieldset className="search-chips" aria-label="Sonuç türü filtresi">
            {(
              [
                ["all", "Tümü"],
                ["block", "İçerik"],
                ["term", "Terimler"],
              ] as const
            ).map(([k, label]) => (
              <button
                type="button"
                key={k}
                className={`chip${kindFilter === k ? " chip--active" : ""}`}
                aria-pressed={kindFilter === k}
                onClick={() => {
                  setKindFilter(k);
                  setSel(0);
                }}
              >
                {label}
              </button>
            ))}
          </fieldset>
          <div className="search-results" id="search-results" role="listbox" ref={listRef}>
            {query.trim() && shown.length === 0 && ready && (
              <div className="search-empty" role="status">
                Sonuç bulunamadı: “{query}”
                {kindFilter !== "all" && results.length > 0 && (
                  <p>Bu türde sonuç yok — "Tümü" filtresini dene.</p>
                )}
                {suggestions.length > 0 && (
                  <p className="search-suggest">
                    Şunu mu demek istediniz:{" "}
                    {suggestions.map((sg) => (
                      <button type="button" key={sg} className="chip" onClick={() => setQuery(sg)}>
                        {sg}
                      </button>
                    ))}
                  </p>
                )}
              </div>
            )}
            {!query.trim() && recents.length > 0 && (
              <div className="search-recents">
                <p className="search-recents__title">Son açtıkların</p>
                {recents.map((r) => (
                  <button
                    type="button"
                    key={`${r.slug}#${r.blockId ?? ""}`}
                    className="search-result"
                    onClick={() => go({ ...r, blockId: r.blockId ?? "" } as unknown as Result)}
                  >
                    <span className="r-title">
                      <i className="ph ph-clock-counter-clockwise" aria-hidden /> {r.title}
                    </span>{" "}
                    <span className="r-page">— {r.pageTitle}</span>
                  </button>
                ))}
              </div>
            )}
            <span aria-live="polite" style={{ position: "absolute", left: -9999 }}>
              {query.trim() ? `${shown.length} sonuç` : ""}
            </span>
            {shown.map((r, i) => (
              <button
                type="button"
                key={r.id}
                id={`sr-${i}`}
                role="option"
                data-kind={r.kind}
                aria-selected={i === sel}
                className="search-result"
                onMouseEnter={() => setSel(i)}
                onClick={() => go(r)}
              >
                <span className="r-title">
                  {r.kind === "term" && <i className="ph ph-book-open" aria-hidden />} {r.title}
                </span>{" "}
                <span className="r-page">— {r.pageTitle}</span>
                <span className="r-text">{r.text.slice(0, 140)}</span>
              </button>
            ))}
          </div>
          <div className="kbd-hint" aria-hidden>
            <span>↑↓ gezin</span>
            <span>Enter aç</span>
            <span>Esc kapat</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
