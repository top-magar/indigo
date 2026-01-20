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

// Page utilities
export { createPage, createPageFromTemplate } from './types/page';

// Store
export { useEditorStoreV2 } from './store/editor-store';
export type { EditorState, EditorActions, EditorStore, CanvasTransform } from './store/editor-store';

// AI (Client-safe API client only - server implementation in page-generator.server.ts)
export { AIPageGenerator, aiPageGenerator } from './ai/page-generator';
export type { 
  AIPageGenerationRequest, 
  AIPageGenerationResponse,
  AISectionGenerationRequest,
  AISectionGenerationResponse,
  StoreContext,
  ProductContext,
} from './ai/page-generator';

// Canvas Components
export { Canvas } from './canvas/Canvas';
export type { CanvasProps } from './canvas/Canvas';
export { SelectionOverlay } from './canvas/SelectionOverlay';
export { ResizeHandles } from './canvas/ResizeHandles';
export type { ResizeHandlePosition } from './canvas/ResizeHandles';
export { ElementRenderer } from './canvas/ElementRenderer';
export type { ElementRendererProps } from './canvas/ElementRenderer';

// Hooks
export { useResizeElement } from './hooks/useResizeElement';
export { useSelectionOverlay } from './hooks/useSelectionOverlay';

// Panels
export { LayersPanel } from './panels/LayersPanel';
export { PropertiesPanel } from './panels/PropertiesPanel';
// export { ComponentsPanel } from './panels/ComponentsPanel';
export { AIChatPanel } from './panels/AIChatPanel';
export type { AIChatPanelProps, ChatMessage, QuickAction, StoreContext as AIChatStoreContext } from './panels/AIChatPanel';
