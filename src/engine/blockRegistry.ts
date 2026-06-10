// Registry deseni (08 §2) — switch zinciri yok; block'lar kendini kaydeder.
// Engine UI'ı import etmez; kayıt components katmanından yapılır.
import type { ComponentType } from "react";
import type { Block, BlockType } from "../schemas";

export type BlockComponent<T extends Block = Block> = ComponentType<{ block: T }>;

const registry = new Map<BlockType, BlockComponent>();

export function registerBlock<T extends BlockType>(
  type: T,
  component: ComponentType<{ block: Extract<Block, { type: T }> }>,
): void {
  registry.set(type, component as BlockComponent);
}

export function resolveBlock(type: BlockType): BlockComponent | undefined {
  const c = registry.get(type);
  if (!c && import.meta.env.DEV) throw new Error(`Registry'de kayıtsız block type: ${type}`);
  if (!c) console.warn(`Bilinmeyen block type atlandı: ${type}`);
  return c;
}
