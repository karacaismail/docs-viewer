import type { Block } from "../../../schemas";
import { SegmentRenderer } from "../SegmentRenderer";

type B<T extends Block["type"]> = { block: Extract<Block, { type: T }> };

// table + comparisonTable aynı semantik çekirdeği paylaşır; dar ekranda scroll bölgesi etiketlenir (11 §5)
function DataTable({ id, caption, columns, rows }: {
  id: string; caption?: string; columns: string[]; rows: Block extends never ? never : import("../../../schemas").Segment[][][];
}) {
  return (
    <div id={id} className="tablewrap" role="region" aria-label={caption ?? "Tablo"} tabIndex={0}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci}><SegmentRenderer segments={cell} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableBlock({ block }: B<"table">) {
  return <DataTable id={block.id} caption={block.caption} columns={block.columns} rows={block.rows} />;
}

export function ComparisonTableBlock({ block }: B<"comparisonTable">) {
  return <DataTable id={block.id} caption={block.caption} columns={block.columns} rows={block.rows} />;
}
