// heading, paragraph, callout, divider, list, image — semantik HTML zorunlu (11 §3)

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { withBase } from "../../../engine";
import type { Block } from "../../../schemas";
import { SegmentRenderer } from "../SegmentRenderer";

type B<T extends Block["type"]> = { block: Extract<Block, { type: T }> };

// Başlık + bağlantı kopyala (UX-B7): hover/focus'ta görünen zincir düğmesi, URL'i #çıpa ile panoya yazar.
export function HeadingBlock({ block }: B<"heading">) {
  const Tag = `h${block.level}` as "h2" | "h3" | "h4";
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${block.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Tag id={block.id} className="hx">
      {block.text}{" "}
      <button
        type="button"
        className="anchor-copy"
        onClick={copy}
        aria-label={`"${block.text}" başlığının bağlantısını kopyala`}
        title="Bu başlığın bağlantısını kopyala"
      >
        <i className={`ph ${copied ? "ph-check" : "ph-link"}`} aria-hidden />
      </button>
      <span aria-live="polite" className="sr-only-live">
        {copied ? "Başlık bağlantısı panoya kopyalandı" : ""}
      </span>
    </Tag>
  );
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
  // Büyüt (UX-D2): görünür düğme + tam ekran diyalog — gizli "görsele tıkla" davranışı yerine
  // 60+ için keşfedilebilir kontrol.
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
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button type="button" className="iconbtn image-zoom" aria-label={`Görseli büyüt: ${block.alt}`}>
            <i className="ph ph-magnifying-glass-plus" aria-hidden /> Büyüt
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-backdrop" />
          <Dialog.Content className="image-lightbox" aria-describedby={undefined}>
            <Dialog.Title className="sr-only-live">{block.alt}</Dialog.Title>
            <img src={withBase(block.src)} alt={block.alt} />
            <Dialog.Close asChild>
              <button
                type="button"
                className="iconbtn image-lightbox__close"
                aria-label="Büyütülmüş görseli kapat"
              >
                <i className="ph ph-x" aria-hidden /> Kapat
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
