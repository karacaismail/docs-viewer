// Sağdan açılan uzun açıklama paneli — Radix Dialog: focus trap + Escape +
// kapanışta focus dönüşü + arka plan scroll kilidi (12 §Etkileşim 4)
import * as Dialog from "@radix-ui/react-dialog";
import { resolveTerm } from "../../engine";
import { useUiState } from "../ui/UiState";

export function ExplanationPanel() {
  const ui = useUiState();
  const term = ui.panelTermId ? resolveTerm(ui.panelTermId) : undefined;
  const open = ui.layer === "panel" && !!term;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) ui.close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-backdrop" />
        <Dialog.Content
          className="panel-right"
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            // Kontrollü Dialog: focus dönüşünü biz yönetiriz (12 §Etkileşim 4)
            e.preventDefault();
            ui.returnFocusEl?.focus();
          }}
        >
          {term && (
            <>
              <Dialog.Close className="iconbtn panel__close" aria-label="Paneli kapat">
                <i className="ph ph-x" aria-hidden />
              </Dialog.Close>
              <Dialog.Title asChild>
                <h2>{term.label}</h2>
              </Dialog.Title>
              <p style={{ color: "var(--color-text-secondary)" }}>{term.shortExplanation}</p>

              <section className="panel-section">
                <h3>Açıklama</h3>
                <p style={{ whiteSpace: "pre-line" }}>{term.longExplanation}</p>
              </section>

              {term.realWorldAnalogy && (
                <section className="panel-section">
                  <h3>Gerçek dünya analojisi</h3>
                  <p>{term.realWorldAnalogy}</p>
                </section>
              )}

              {term.useCases && term.useCases.length > 0 && (
                <section className="panel-section">
                  <h3>Kullanım alanları</h3>
                  <ul>{term.useCases.map((u, i) => <li key={i}>{u}</li>)}</ul>
                </section>
              )}

              {term.caseStudies && term.caseStudies.length > 0 && (
                <section className="panel-section">
                  <h3>Vaka çalışmaları</h3>
                  {term.caseStudies.map((c, i) => (
                    <div key={i} className="usecase">
                      <div className="usecase__title">{c.title}</div>
                      {c.story}
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
