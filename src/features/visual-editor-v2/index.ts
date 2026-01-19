/**
 * Visual Editor V2 - Public Exports
 * 
 * Framer/Webflow/Figma-level visual editor with AI page generation.
 */

// Types
export * from './types/element';
export * from './types/page';
export * from './types/tokens';
export * from './types/component';

// Store
export { useEditorStoreV2 } from './store/editor-store';
export type { EditorState, EditorActions, EditorStore, CanvasTransform } from './store/editor-store';

// AI
export { AIPageGenerator, aiPageGenerator } from './ai/page-generator';
export type { 
  AIPageGenerationRequest, 
  AIPageGenerationResponse,
  AISectionGenerationRequest,
  AISectionGenerationResponse,
  StoreContext,
  ProductContext,
} from './ai/page-generator';

// Canvas (to be implemented)
// export { VisualCanvas } from './canvas/Canvas';

// Panels (to be implemented)
// export { LayersPanel } from './panels/LayersPanel';
// export { PropertiesPanel } from './panels/PropertiesPanel';
// export { ComponentsPanel } from './panels/ComponentsPanel';
// export { AIChatPanel } from './panels/AIChatPanel';
