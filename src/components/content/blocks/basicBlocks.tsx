// heading, paragraph, callout, divider, list, image — semantik HTML zorunlu (11 §3)

import { withBase } from "../../../engine";
import type { Block } from "../../../schemas";
import { SegmentRenderer } from "../SegmentRenderer";

type B<T extends Block["type"]> = { block: Extract<Block, { type: T }> };

export function HeadingBlock({ block }: B<"heading">) {
  const Tag = `h${block.level}` as "h2" | "h3" | "h4";
  return <Tag id={block.id}>{block.text}</Tag>;
}

export function ParagraphBlock({ block }: B<"paragraph">) {
  return (
    <p id={block.id} style={{ whiteSpace: "pre-line" }}>
      <SegmentRenderer segments={block.segments} />
    </p>
  );
}

const CALLOUT_ICON: Record<string, string> = {
  info: "ph-info",
  tip: "ph-lightbulb",
  warning: "ph-warning",
  danger: "ph-warning-octagon",
  tr: "ph-flag",
};

export function CalloutBlock({ block }: B<"callout">) {
  return (
    <aside id={block.id} className={`callout callout--${block.variant}`}>
      {block.title && (
        <div className="callout__title">
          <i className={`ph ${CALLOUT_ICON[block.variant]}`} aria-hidden />
          {block.title}
        </div>
      )}
      <SegmentRenderer segments={block.segments} />
    </aside>
  );
}

export function DividerBlock({ block }: B<"divider">) {
  return <hr id={block.id} className="divider" />;
}

export function ListBlock({ block }: B<"list">) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag id={block.id}>
      {block.items.map((segs, i) => (
        <li key={i}>
          <SegmentRenderer segments={segs} />
        </li>
      ))}
    </Tag>
  );
}

export function ImageBlock({ block }: B<"image">) {
  // Kayıp varlıkta erişilebilir metin fallback — kırık görsel ikonu gösterilmez (07B §1)
  return (
    <figure id={block.id}>
      <object
        data={withBase(block.src)}
        type="image/svg+xml"
        aria-label={block.alt}
        style={{ maxWidth: "100%" }}
      >
        <div className="image-fallback" role="img" aria-label={block.alt}>
          <i className="ph ph-image" aria-hidden /> {block.alt}
        </div>
      </object>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
