// Sağdan açılan uzun açıklama paneli — Radix Dialog: focus trap + Escape +
// kapanışta focus dönüşü + arka plan scroll kilidi (12 §Etkileşim 4).
// Panel içeriği (longExplanation/analogy/useCases) lazy chunk'tan gelir (14 #15).

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { loadTermDetail, resolveTerm } from "../../engine";
import type { GlossaryDetail, SevenQuestions } from "../../schemas";

import { useUiState } from "../ui/UiState";

// Yedi soru kalıbı etiketleri (12A §6) — sıra sabit: kavrama giriş sırası
const SEVEN_Q_LABELS: [keyof SevenQuestions, string][] = [
  ["ne", "Ne?"],
  ["nicin", "Niçin?"],
  ["nasil", "Nasıl?"],
  ["nerede", "Nerede?"],
  ["ne_zaman", "Ne zaman?"],
  ["kim", "Kim?"],
  ["analoji", "Analoji"],
];

export function ExplanationPanel() {
  const ui = useUiState();
  const term = ui.panelTermId ? resolveTerm(ui.panelTermId) : undefined;
  const open = ui.layer === "panel" && !!term;
  const [detail, setDetail] = useState<GlossaryDetail | null>(null);

  useEffect(() => {
    let alive = true;
    setDetail(null);
    if (open && term) {
      void loadTermDetail(term.id).then((d) => {
        if (alive && d) setDetail(d);
      });
    }
    return () => {
      alive = false;
    };
  }, [open, term]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) ui.close();
      }}
    >
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

              {!detail && (
                <p role="status" aria-busy="true" style={{ color: "var(--color-text-muted)" }}>
                  Açıklama yükleniyor…
                </p>
              )}

              {detail && (
                <>
                  <section className="panel-section">
                    <h3>Açıklama</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{detail.longExplanation}</p>
                  </section>

                  {detail.sevenQuestions && (
                    <section className="panel-section">
                      <h3>Yedi soruda</h3>
                      <dl className="seven-q">
                        {SEVEN_Q_LABELS.map(([key, label]) => (
                          <div key={key} className="seven-q__row">
                            <dt>{label}</dt>
                            <dd>{detail.sevenQuestions?.[key]}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}

                  {detail.realWorldAnalogy && !detail.sevenQuestions && (
                    <section className="panel-section">
                      <h3>Gerçek dünya analojisi</h3>
                      <p>{detail.realWorldAnalogy}</p>
                    </section>
                  )}

                  {detail.useCases && detail.useCases.length > 0 && (
                    <section className="panel-section">
                      <h3>Kullanım alanları</h3>
                      <ul>
                        {detail.useCases.map((u, i) => (
                          <li key={i}>{u}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {detail.caseStudies && detail.caseStudies.length > 0 && (
                    <section className="panel-section">
                      <h3>Vaka çalışmaları</h3>
                      {detail.caseStudies.map((c, i) => (
                        <div key={i} className="usecase">
                          <div className="usecase__title">{c.title}</div>
                          {c.story}
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
