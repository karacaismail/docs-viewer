// Tüm inline içeriğin tek render yolu (11 §Renderer 2) — HTML string yok.
import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import type { Segment } from "../../schemas";
import { resolveRef } from "../../engine";
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
      const target = resolveRef(s.refId);
      if (!target) return s.text; // çözülemezse düz metin (08 §4)
      const [section, page] = target.slug.split("/");
      return (
        <Link to="/docs/$section/$page" params={{ section, page }}>{target.title}</Link>
      );
    }
    case "term":
      return <GlossaryTermInline termId={s.termId} text={s.text} />;
  }
}
