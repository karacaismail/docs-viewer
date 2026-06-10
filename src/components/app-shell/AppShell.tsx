import { useEffect } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { UiStateProvider, useUiState } from "../ui/UiState";
import { RailOne } from "../navigation/RailOne";
import { RailTwo } from "../navigation/RailTwo";
import { SearchOverlay } from "../search/SearchOverlay";
import { ExplanationPanel } from "../glossary/ExplanationPanel";
import { navigation } from "../../engine";

export function AppShell() {
  return (
    <UiStateProvider>
      <Shell />
    </UiStateProvider>
  );
}

function useActiveSection(): string {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const m = pathname.match(/^\/docs\/([^/]+)/);
  return m?.[1] ?? navigation.categories[0]?.id ?? "";
}

function Shell() {
  const ui = useUiState();
  const section = useActiveSection();
  const category = navigation.categories.find((c) => c.id === section);

  // Cmd/Ctrl-K → search (13 §Overlay)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.open("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui]);

  return (
    <div className="shell">
      <a className="skip-link" href="#icerik">İçeriğe atla</a>

      {/* Desktop: sabit iki rail */}
      <div className="shell__rails">
        <RailOne activeSection={section} />
        {category && <RailTwo category={category} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile üst bar */}
        <header className="topbar" role="banner">
          <button className="iconbtn" aria-label="Kategoriler" onClick={() => ui.open("mobileNav")}>
            <i className="ph ph-list" aria-hidden />
          </button>
          <span className="topbar__title">{category?.label ?? "Dokümantasyon"}</span>
          <button className="iconbtn" aria-label="Sayfa listesi" onClick={() => ui.open("mobileToc")}>
            <i className="ph ph-tree-view" aria-hidden />
          </button>
          <button className="iconbtn" aria-label="Ara" onClick={() => ui.open("search")}>
            <i className="ph ph-magnifying-glass" aria-hidden />
          </button>
        </header>

        <main id="icerik" className="shell__content content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Rail 1 — sheet */}
      <Dialog.Root open={ui.layer === "mobileNav"} onOpenChange={(o) => (o ? ui.open("mobileNav") : ui.close())}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-backdrop" />
          <Dialog.Content className="drawer" aria-describedby={undefined}>
            <Dialog.Title>Kategoriler</Dialog.Title>
            <Dialog.Close className="iconbtn panel__close" aria-label="Kapat"><i className="ph ph-x" aria-hidden /></Dialog.Close>
            <RailOne activeSection={section} onNavigate={ui.close} plain />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile Rail 2 — drawer */}
      <Dialog.Root open={ui.layer === "mobileToc"} onOpenChange={(o) => (o ? ui.open("mobileToc") : ui.close())}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-backdrop" />
          <Dialog.Content className="drawer" aria-describedby={undefined}>
            <Dialog.Title>{category?.label}</Dialog.Title>
            <Dialog.Close className="iconbtn panel__close" aria-label="Kapat"><i className="ph ph-x" aria-hidden /></Dialog.Close>
            {category && <RailTwo category={category} onNavigate={ui.close} plain />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <SearchOverlay />
      <ExplanationPanel />
    </div>
  );
}
