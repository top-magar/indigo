// Block Converter - Converts between BuilderBlock and StoreBlock formats
import type { StoreBlock } from "@/types/blocks"
import type { BuilderBlock } from "../types"

/**
 * Convert BuilderBlock to StoreBlock format for rendering
 */
export function builderBlockToStoreBlock(builderBlock: BuilderBlock): StoreBlock {
  return {
    id: builderBlock.id,
    type: builderBlock.type,
    variant: builderBlock.variant,
    order: builderBlock.order,
    visible: builderBlock.visible,
    settings: builderBlock.data,
  } as StoreBlock
}

/**
 * Convert StoreBlock to BuilderBlock format
 */
export function storeBlockToBuilderBlock(storeBlock: StoreBlock): BuilderBlock {
  return {
    id: storeBlock.id,
    type: storeBlock.type,
    variant: storeBlock.variant,
    data: storeBlock.settings || {},
    order: storeBlock.order,
    visible: storeBlock.visible,
  }
}

/**
 * Convert array of BuilderBlocks to StoreBlocks
 */
export function builderBlocksToStoreBlocks(builderBlocks: BuilderBlock[]): StoreBlock[] {
  return builderBlocks
    .sort((a, b) => a.order - b.order)
    .map(builderBlockToStoreBlock)
}