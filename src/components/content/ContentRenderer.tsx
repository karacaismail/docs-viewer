// blocks.map -> registry çözümü (11 §Renderer 1) — switch zinciri yok.
import type { Block } from "../../schemas";
import { resolveBlock } from "../../engine";

export function ContentRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = resolveBlock(block.type);
        if (!Component) return null;
        return <Component key={block.id} block={block} />;
      })}
    </>
  );
}
