// Term etkileşimi — hover/focus tooltip kısa açıklamayı taşır (alt çizgili terimin
// kendisine bağlı); ayrı `!` kontrolü kaldırıldı (tooltip ile tekrarlıydı). `?` uzun
// açıklama panelini açar. Görsel boyut küçük, dokunma hedefi padding/margin
// telafisiyle ≥44px (12 §Etkileşim 3).

import * as Tooltip from "@radix-ui/react-tooltip";
import { resolveTerm } from "../../engine";
import type { GlossaryTerm } from "../../schemas";
import { useUiState } from "../ui/UiState";

function TermTooltip({
  term,
  className,
  children,
}: {
  term: GlossaryTerm;
  className: string;
  children: React.ReactNode;
}) {
  const ui = useUiState();
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className={className}
            onClick={() => ui.open("panel", term.id)}
            aria-label={`${term.label} — terim açıklamasını aç`}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip" sideOffset={6}>
            {term.shortExplanation}
            <Tooltip.Arrow style={{ fill: "var(--color-border-strong)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Inline term segment'i — noktalı underline (kısa açıklama tooltip'i terime bağlı) + `?` panel kontrolü (12 §3)
export function GlossaryTermInline({ termId, text }: { termId: string; text: string }) {
  const ui = useUiState();
  const term = resolveTerm(termId);
  if (!term) return <>{text}</>; // çözülemeyen termId düz metne düşer (04 §4)
  return (
    <span className="term-wrap">
      <TermTooltip term={term} className="term">
        {text}
      </TermTooltip>
      <button
        type="button"
        className="term-ctl"
        aria-label={`${term.label} — uzun açıklama panelini aç`}
        onClick={() => ui.open("panel", term.id)}
      >
        ?
      </button>
    </span>
  );
}

// Sayfa üstü terim chip'i — sayfanın terim envanterine hızlı erişim (12A §3a)
export function GlossaryTermChip({ term }: { term: GlossaryTerm }) {
  return (
    <TermTooltip term={term} className="term-chip">
      <i className="ph ph-question" aria-hidden />
      {term.label}
    </TermTooltip>
  );
}
