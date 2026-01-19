/**
 * AI Editor Components
 * 
 * Export all AI-related UI components for the visual editor.
 */

export { AIGenerateButton, type AIGenerateButtonProps } from './ai-generate-button';

export { 
  AISuggestionsPanel, 
  AIImprovementPanel,
  type AISuggestionsPanelProps,
  type AIImprovementPanelProps,
  type AISuggestion,
  type AIImprovementOption,
} from './ai-suggestions-panel';

export { 
  AIImageAnalyzer, 
  type AIImageAnalyzerProps,
} from './ai-image-analyzer';

export { 
  AITranslationPanel, 
  QuickTranslateButton,
  type AITranslationPanelProps,
  type QuickTranslateButtonProps,
} from './ai-translation-panel';

export { 
  AILayoutSuggestions, 
  SuggestionChip,
  type AILayoutSuggestionsProps,
  type SuggestionChipProps,
  type PageType,
} from './ai-layout-suggestions';

export {
  AITextField,
  type AITextFieldProps,
  type AITextFieldType,
} from './ai-text-field';

export {
  AISettingsSection,
  HeroAISettings,
  ImageAISettings,
  FAQAISettings,
  RichTextAISettings,
  PromoBannerAISettings,
  TestimonialsAISettings,
  BlockAISettings,
  type BlockAISettingsProps,
} from './ai-block-settings';

export {
  AISlashCommand,
  type AISlashCommandProps,
  type MenuItem as AISlashMenuItem,
  type SubMenuItem as AISlashSubMenuItem,
  type MenuState as AISlashMenuState,
} from './ai-slash-command';

export {
  AIContextMenu,
  useAIContextMenu,
  type AIContextMenuProps,
  type ImageAnalysisResult,
  type UseAIContextMenuOptions,
  type UseAIContextMenuReturn,
} from './ai-context-menu';

export {
  AIQuickActions,
  type AIQuickActionsProps,
} from './ai-quick-actions';

export {
  AIPageGenerator,
  type AIPageGeneratorProps,
  type BusinessType,
  type PageType as AIPageType,
  type StylePreference,
} from './ai-page-generator';

export {
  AIChatPanel,
  type AIChatPanelProps,
  type ChatMessage,
  type ChatAction,
} from './ai-chat-panel';
