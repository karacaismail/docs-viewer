// Term etkileşimi — tooltip hover+focus, tap/enter panel açar (12 §Etkileşim)
import * as Tooltip from "@radix-ui/react-tooltip";
import type { GlossaryTerm } from "../../schemas";
import { resolveTerm } from "../../engine";
import { useUiState } from "../ui/UiState";

function TermTrigger({ term, className, children }: {
  term: GlossaryTerm; className: string; children: React.ReactNode;
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

// Inline term segment'i (içerikte) — noktalı underline
export function GlossaryTermInline({ termId, text }: { termId: string; text: string }) {
  const term = resolveTerm(termId);
  if (!term) return <>{text}</>; // çözülemeyen termId düz metne düşer (04 §4)
  return <TermTrigger term={term} className="term">{text}</TermTrigger>;
}

// Sayfa üstü terim chip'i — segment bağlama editöryel iş olduğundan (12A §2-B)
// terimler chip olarak da erişilebilir kalır
export function GlossaryTermChip({ term }: { term: GlossaryTerm }) {
  return (
    <TermTrigger term={term} className="term-chip">
      <i className="ph ph-question" aria-hidden />
      {term.label}
    </TermTrigger>
  );
}
