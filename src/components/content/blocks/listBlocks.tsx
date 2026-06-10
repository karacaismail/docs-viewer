// definitionList, stepList, checklist, useCase, caseStudy, cardGrid, lessonHeader
import type { Block } from "../../../schemas";
import { SegmentRenderer } from "../SegmentRenderer";

type B<T extends Block["type"]> = { block: Extract<Block, { type: T }> };

export function DefinitionListBlock({ block }: B<"definitionList">) {
  return (
    <dl id={block.id} className="deflist">
      {block.items.map((it, i) => (
        <div key={i}>
          <dt>{it.term}</dt>
          <dd style={{ whiteSpace: "pre-line" }}>
            <SegmentRenderer segments={it.definition} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function StepListBlock({ block }: B<"stepList">) {
  return (
    <ol id={block.id} className="steps">
      {block.steps.map((s, i) => (
        <li key={i}>
          {s.title && <span className="step__title">{s.title}: </span>}
          <SegmentRenderer segments={s.segments} />
        </li>
      ))}
    </ol>
  );
}

export function ChecklistBlock({ block }: B<"checklist">) {
  return (
    <section id={block.id}>
      {block.title && <h3>{block.title}</h3>}
      <ul className="checklist">
        {block.items.map((it, i) => (
          <li key={i}>
            <span>
              <SegmentRenderer segments={it.segments} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UseCaseBlock({ block }: B<"useCase">) {
  return (
    <article id={block.id} className="usecase">
      <div className="usecase__title">{block.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>
        <SegmentRenderer segments={block.scenario} />
      </div>
      {block.outcome && (
        <div className="usecase__outcome">
          <SegmentRenderer segments={block.outcome} />
        </div>
      )}
    </article>
  );
}

export function CaseStudyBlock({ block }: B<"caseStudy">) {
  return (
    <article id={block.id} className="usecase">
      <div className="usecase__title">{block.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>
        <SegmentRenderer segments={block.story} />
      </div>
    </article>
  );
}

export function CardGridBlock({ block }: B<"cardGrid">) {
  return (
    <div id={block.id} className="cardgrid">
      {block.cards.map((c, i) => (
        <div key={i} className="card">
          <div className="card__title">
            {c.icon && <i className={`ph ${c.icon}`} aria-hidden />}
            {c.title}
          </div>
          <SegmentRenderer segments={c.segments} />
        </div>
      ))}
    </div>
  );
}

export function LessonHeaderBlock({ block }: B<"lessonHeader">) {
  return (
    <header id={block.id} className="lesson-header">
      <div className="lesson-header__unit">{block.unit}</div>
      <h2 style={{ margin: "0.25rem 0", border: "none" }}>{block.title}</h2>
      <div className="lesson-header__meta">
        <span>
          <i className="ph ph-clock" aria-hidden /> {block.durationMin} dk
        </span>
        <span>
          <i className="ph ph-steps" aria-hidden /> Seviye: {block.level}
        </span>
        {block.prereq.length > 0 && <span>Ön-koşul: {block.prereq.join(", ")}</span>}
      </div>
      {block.goals.length > 0 && (
        <>
          <strong>Hedefler</strong>
          <ul>
            {block.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </>
      )}
    </header>
  );
}
