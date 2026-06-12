// Tüm inline içeriğin tek render yolu (11 §Renderer 2) — HTML string yok.

import * as Tooltip from "@radix-ui/react-tooltip";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { resolveRefEntry } from "../../engine";
import type { Segment } from "../../schemas";
import { GlossaryTermInline } from "../glossary/GlossaryTerm";

export function SegmentRenderer({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (
        <Fragment key={i}>{renderSegment(s)}</Fragment>
      ))}
    </>
  );
}

function renderSegment(s: Segment) {
  switch (s.type) {
    case "text":
      return s.text;
    case "strong":
      return <strong>{s.text}</strong>;
    case "code":
      return <code className="inline">{s.text}</code>;
    case "link":
      return (
        <a href={s.href} target="_blank" rel="noopener noreferrer">
          {s.text} <i className="ph ph-arrow-square-out" aria-hidden style={{ fontSize: "0.85em" }} />
        </a>
      );
    case "ref": {
      const target = resolveRefEntry(s.refId);
      if (!target) return s.text; // çözülemezse düz metin (08 §4)
      const [section, page] = target.slug.split("/");
      const link = (
        <Link to="/docs/$section/$page" params={{ section, page }}>
          {target.title}
        </Link>
      );
      // Hover önizleme (UX-D1): tıklamadan önce hedefin özeti — 60+ için "bu link beni nereye götürür?" cevabı
      if (!target.summary) return link;
      return (
        <Tooltip.Provider delayDuration={250}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="ref-preview" sideOffset={6}>
                <strong>{target.title}</strong>
                <span>{target.summary}</span>
                <Tooltip.Arrow className="tooltip-arrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }
    case "term":
      return <GlossaryTermInline termId={s.termId} text={s.text} />;
  }
}
