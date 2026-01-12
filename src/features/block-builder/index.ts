// Block Builder - Public exports
export { BlockBuilder } from "./components/block-builder"
export { BlockBuilderErrorBoundary } from "./components/error-boundary"
export { 
  builderBlockToStoreBlock, 
  storeBlockToBuilderBlock, 
  builderBlocksToStoreBlocks 
} from "./utils/block-converter"
export { getBlockDefaults } from "./utils/block-defaults"
export type { 
  BuilderState, 
  BuilderActions, 
  BlockBuilderDocument, 
  BuilderBlock 
} from "./types"

// Client-only exports (use these only in client components)
export { useBuilderStore } from "./hooks/use-builder-store"
export { useAutosave } from "./hooks/use-autosave"
export { usePreviewSync } from "./hooks/use-preview-sync"