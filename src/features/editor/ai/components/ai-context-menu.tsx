/**
 * AI Context Menu
 * 
 * A context menu (right-click menu) for AI features in the visual editor.
 * Shows AI options when user right-clicks on a block or selected text.
 * 
 * Design System: Vercel/Geist
 * - Purple accent for AI features (--ds-purple-*)
 * - Consistent spacing and typography
 * - Accessible interactions with keyboard support
 * - Smooth transitions (150ms)
 */

'use client';

import { useState, useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuLabel,
} from '@/components/ui/context-menu';
import {
  Sparkles,
  Wand2,
  Languages,
  Minimize2,
  Maximize2,
  Image as ImageIcon,
  FileText,
  Loader2,
  Lightbulb,
  Target,
  Search,
  Scissors,
  Check,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import type { StoreBlock } from '@/types/blocks';
import {
  improveContent,
  translateText,
  analyzeImage,
  generateAltText,
  type ImprovementGoal,
} from '../api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface AIContextMenuProps {
  /** The block being right-clicked on */
  block?: StoreBlock;
  /** Selected text content (if any) */
  selectedText?: string;
  /** Callback when content is generated/improved */
  onContentChange?: (newContent: string) => void;
  /** Callback when alt text is generated for images */
  onAltTextGenerated?: (altText: string) => void;
  /** Callback when image analysis is complete */
  onImageAnalyzed?: (analysis: ImageAnalysisResult) => void;
  /** Callback to open the full AI generation panel */
  onOpenGeneratePanel?: () => void;
  /** Children to wrap with context menu trigger */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Whether AI features are enabled */
  disabled?: boolean;
}

export interface ImageAnalysisResult {
  labels?: string[];
  suggestedAltText?: string;
  dominantColors?: string[];
  containsText?: boolean;
  extractedText?: string;
  isSafe?: boolean;
}

// Supported languages for translation
const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
] as const;

// Improvement options
const IMPROVEMENT_OPTIONS: { id: ImprovementGoal; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'clarity',
    label: 'Clarity',
    description: 'Make it clearer and easier to understand',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
  {
    id: 'engagement',
    label: 'Engagement',
    description: 'Make it more compelling and engaging',
    icon: <Target className="h-3.5 w-3.5" />,
  },
  {
    id: 'seo',
    label: 'SEO',
    description: 'Optimize for search engines',
    icon: <Search className="h-3.5 w-3.5" />,
  },
  {
    id: 'brevity',
    label: 'Brevity',
    description: 'Make it more concise',
    icon: <Scissors className="h-3.5 w-3.5" />,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a block is an image block
 */
function isImageBlock(block?: StoreBlock): boolean {
  if (!block) return false;
  return block.type === 'image' || block.type === 'gallery';
}

/**
 * Get the image URL from a block
 */
function getImageUrl(block?: StoreBlock): string | undefined {
  if (!block) return undefined;
  
  if (block.type === 'image') {
    return (block.settings as { src?: string })?.src;
  }
  
  if (block.type === 'gallery') {
    const images = (block.settings as { images?: { src: string }[] })?.images;
    return images?.[0]?.src;
  }
  
  // Check for background images in other blocks
  const settings = block.settings as { backgroundImage?: string };
  return settings?.backgroundImage;
}

/**
 * Get text content from a block
 */
function getBlockTextContent(block?: StoreBlock): string | undefined {
  if (!block) return undefined;
  
  const settings = block.settings as Record<string, unknown>;
  
  // Try common text fields
  if (typeof settings.content === 'string') return settings.content;
  if (typeof settings.headline === 'string') return settings.headline;
  if (typeof settings.subheadline === 'string') return settings.subheadline;
  if (typeof settings.text === 'string') return settings.text;
  
  return undefined;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AIContextMenu({
  block,
  selectedText,
  onContentChange,
  onAltTextGenerated,
  onImageAnalyzed,
  onOpenGeneratePanel,
  children,
  className,
  disabled = false,
}: AIContextMenuProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get content to work with
  const content = selectedText || getBlockTextContent(block);
  const hasContent = Boolean(content && content.length > 0);
  const hasImageBlock = isImageBlock(block);
  const imageUrl = getImageUrl(block);
  const hasImage = Boolean(imageUrl);

  // Reset success state after delay
  const showSuccess = useCallback((key: string) => {
    setSuccess(key);
    setTimeout(() => setSuccess(null), 2000);
  }, []);

  // Handle content improvement
  const handleImprove = useCallback(async (goal: ImprovementGoal) => {
    if (!content || !onContentChange) return;
    
    const loadingKey = `improve-${goal}`;
    setLoading(loadingKey);
    
    try {
      const result = await improveContent(content, goal);
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess(loadingKey);
      }
    } catch (error) {
      console.error('Failed to improve content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  // Handle translation
  const handleTranslate = useCallback(async (targetLanguage: string) => {
    if (!content || !onContentChange) return;
    
    const loadingKey = `translate-${targetLanguage}`;
    setLoading(loadingKey);
    
    try {
      const result = await translateText(content, targetLanguage);
      if (result.success && result.translatedContent) {
        onContentChange(result.translatedContent);
        showSuccess(loadingKey);
      }
    } catch (error) {
      console.error('Failed to translate content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  // Handle make shorter
  const handleMakeShorter = useCallback(async () => {
    if (!content || !onContentChange) return;
    
    setLoading('shorter');
    
    try {
      const result = await improveContent(content, 'brevity');
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess('shorter');
      }
    } catch (error) {
      console.error('Failed to shorten content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  // Handle make longer
  const handleMakeLonger = useCallback(async () => {
    if (!content || !onContentChange) return;
    
    setLoading('longer');
    
    try {
      // Use engagement to expand content
      const result = await improveContent(content, 'engagement');
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess('longer');
      }
    } catch (error) {
      console.error('Failed to expand content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  // Handle image analysis
  const handleAnalyzeImage = useCallback(async () => {
    if (!imageUrl || !onImageAnalyzed) return;
    
    setLoading('analyze-image');
    
    try {
      const result = await analyzeImage(imageUrl);
      if (result.success) {
        onImageAnalyzed({
          labels: result.labels,
          suggestedAltText: result.suggestedAltText,
          dominantColors: result.dominantColors,
          containsText: result.containsText,
          extractedText: result.extractedText,
          isSafe: result.isSafe,
        });
        showSuccess('analyze-image');
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setLoading(null);
    }
  }, [imageUrl, onImageAnalyzed, showSuccess]);

  // Handle generate alt text
  const handleGenerateAltText = useCallback(async () => {
    if (!imageUrl || !onAltTextGenerated) return;
    
    setLoading('alt-text');
    
    try {
      const result = await generateAltText(imageUrl);
      if (result.success && result.content) {
        onAltTextGenerated(result.content);
        showSuccess('alt-text');
      }
    } catch (error) {
      console.error('Failed to generate alt text:', error);
    } finally {
      setLoading(null);
    }
  }, [imageUrl, onAltTextGenerated, showSuccess]);

  // Render loading or success icon
  const renderItemIcon = (key: string, defaultIcon: React.ReactNode) => {
    if (loading === key) {
      return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    }
    if (success === key) {
      return <Check className="h-3.5 w-3.5 text-[var(--ds-green-700)]" />;
    }
    return defaultIcon;
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className} asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* AI Label */}
        <ContextMenuLabel className="flex items-center gap-2 text-[var(--ds-purple-700)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Actions</span>
        </ContextMenuLabel>
        
        <ContextMenuSeparator />

        {/* Generate with AI */}
        {onOpenGeneratePanel && (
          <ContextMenuItem
            onClick={onOpenGeneratePanel}
            className={cn(
              "gap-2",
              "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
              "transition-colors duration-150"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--ds-purple-700)]" />
            <span>Generate with AI…</span>
          </ContextMenuItem>
        )}

        {/* Improve content submenu */}
        {hasContent && onContentChange && (
          <ContextMenuSub>
            <ContextMenuSubTrigger
              className={cn(
                "gap-2",
                "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                "data-open:bg-[var(--ds-purple-100)] data-open:text-[var(--ds-purple-900)]",
                "transition-colors duration-150"
              )}
            >
              <Wand2 className="h-3.5 w-3.5 text-[var(--ds-purple-700)]" />
              <span>Improve content</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {IMPROVEMENT_OPTIONS.map((option) => (
                <ContextMenuItem
                  key={option.id}
                  onClick={() => handleImprove(option.id)}
                  disabled={loading !== null}
                  className={cn(
                    "gap-2",
                    "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                    "transition-colors duration-150"
                  )}
                >
                  <span className="text-[var(--ds-purple-700)]">
                    {renderItemIcon(`improve-${option.id}`, option.icon)}
                  </span>
                  <span>{option.label}</span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Translate submenu */}
        {hasContent && onContentChange && (
          <ContextMenuSub>
            <ContextMenuSubTrigger
              className={cn(
                "gap-2",
                "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                "data-open:bg-[var(--ds-purple-100)] data-open:text-[var(--ds-purple-900)]",
                "transition-colors duration-150"
              )}
            >
              <Languages className="h-3.5 w-3.5 text-[var(--ds-purple-700)]" />
              <span>Translate to…</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <ContextMenuItem
                  key={lang.code}
                  onClick={() => handleTranslate(lang.code)}
                  disabled={loading !== null}
                  className={cn(
                    "gap-2",
                    "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                    "transition-colors duration-150"
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {(loading === `translate-${lang.code}` || success === `translate-${lang.code}`) && (
                    <span className="ml-auto">
                      {renderItemIcon(`translate-${lang.code}`, null)}
                    </span>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Make shorter / longer */}
        {hasContent && onContentChange && (
          <>
            <ContextMenuItem
              onClick={handleMakeShorter}
              disabled={loading !== null}
              className={cn(
                "gap-2",
                "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                "transition-colors duration-150"
              )}
            >
              <span className="text-[var(--ds-purple-700)]">
                {renderItemIcon('shorter', <Minimize2 className="h-3.5 w-3.5" />)}
              </span>
              <span>Make shorter</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={handleMakeLonger}
              disabled={loading !== null}
              className={cn(
                "gap-2",
                "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                "transition-colors duration-150"
              )}
            >
              <span className="text-[var(--ds-purple-700)]">
                {renderItemIcon('longer', <Maximize2 className="h-3.5 w-3.5" />)}
              </span>
              <span>Make longer</span>
            </ContextMenuItem>
          </>
        )}

        {/* Image-specific options */}
        {(hasImageBlock || hasImage) && (
          <>
            <ContextMenuSeparator />
            
            {onImageAnalyzed && (
              <ContextMenuItem
                onClick={handleAnalyzeImage}
                disabled={loading !== null || !imageUrl}
                className={cn(
                  "gap-2",
                  "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                  "transition-colors duration-150"
                )}
              >
                <span className="text-[var(--ds-purple-700)]">
                  {renderItemIcon('analyze-image', <ImageIcon className="h-3.5 w-3.5" />)}
                </span>
                <span>Analyze image</span>
              </ContextMenuItem>
            )}
            
            {onAltTextGenerated && (
              <ContextMenuItem
                onClick={handleGenerateAltText}
                disabled={loading !== null || !imageUrl}
                className={cn(
                  "gap-2",
                  "focus:bg-[var(--ds-purple-100)] focus:text-[var(--ds-purple-900)]",
                  "transition-colors duration-150"
                )}
              >
                <span className="text-[var(--ds-purple-700)]">
                  {renderItemIcon('alt-text', <FileText className="h-3.5 w-3.5" />)}
                </span>
                <span>Generate alt text</span>
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ============================================================================
// STANDALONE HOOK FOR CUSTOM IMPLEMENTATIONS
// ============================================================================

export interface UseAIContextMenuOptions {
  content?: string;
  imageUrl?: string;
  onContentChange?: (newContent: string) => void;
  onAltTextGenerated?: (altText: string) => void;
  onImageAnalyzed?: (analysis: ImageAnalysisResult) => void;
}

export interface UseAIContextMenuReturn {
  loading: string | null;
  success: string | null;
  handleImprove: (goal: ImprovementGoal) => Promise<void>;
  handleTranslate: (targetLanguage: string) => Promise<void>;
  handleMakeShorter: () => Promise<void>;
  handleMakeLonger: () => Promise<void>;
  handleAnalyzeImage: () => Promise<void>;
  handleGenerateAltText: () => Promise<void>;
}

/**
 * Hook for using AI context menu actions in custom implementations
 */
export function useAIContextMenu({
  content,
  imageUrl,
  onContentChange,
  onAltTextGenerated,
  onImageAnalyzed,
}: UseAIContextMenuOptions): UseAIContextMenuReturn {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = useCallback((key: string) => {
    setSuccess(key);
    setTimeout(() => setSuccess(null), 2000);
  }, []);

  const handleImprove = useCallback(async (goal: ImprovementGoal) => {
    if (!content || !onContentChange) return;
    
    const loadingKey = `improve-${goal}`;
    setLoading(loadingKey);
    
    try {
      const result = await improveContent(content, goal);
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess(loadingKey);
      }
    } catch (error) {
      console.error('Failed to improve content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  const handleTranslate = useCallback(async (targetLanguage: string) => {
    if (!content || !onContentChange) return;
    
    const loadingKey = `translate-${targetLanguage}`;
    setLoading(loadingKey);
    
    try {
      const result = await translateText(content, targetLanguage);
      if (result.success && result.translatedContent) {
        onContentChange(result.translatedContent);
        showSuccess(loadingKey);
      }
    } catch (error) {
      console.error('Failed to translate content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  const handleMakeShorter = useCallback(async () => {
    if (!content || !onContentChange) return;
    
    setLoading('shorter');
    
    try {
      const result = await improveContent(content, 'brevity');
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess('shorter');
      }
    } catch (error) {
      console.error('Failed to shorten content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  const handleMakeLonger = useCallback(async () => {
    if (!content || !onContentChange) return;
    
    setLoading('longer');
    
    try {
      const result = await improveContent(content, 'engagement');
      if (result.success && result.improvedContent) {
        onContentChange(result.improvedContent);
        showSuccess('longer');
      }
    } catch (error) {
      console.error('Failed to expand content:', error);
    } finally {
      setLoading(null);
    }
  }, [content, onContentChange, showSuccess]);

  const handleAnalyzeImage = useCallback(async () => {
    if (!imageUrl || !onImageAnalyzed) return;
    
    setLoading('analyze-image');
    
    try {
      const result = await analyzeImage(imageUrl);
      if (result.success) {
        onImageAnalyzed({
          labels: result.labels,
          suggestedAltText: result.suggestedAltText,
          dominantColors: result.dominantColors,
          containsText: result.containsText,
          extractedText: result.extractedText,
          isSafe: result.isSafe,
        });
        showSuccess('analyze-image');
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setLoading(null);
    }
  }, [imageUrl, onImageAnalyzed, showSuccess]);

  const handleGenerateAltText = useCallback(async () => {
    if (!imageUrl || !onAltTextGenerated) return;
    
    setLoading('alt-text');
    
    try {
      const result = await generateAltText(imageUrl);
      if (result.success && result.content) {
        onAltTextGenerated(result.content);
        showSuccess('alt-text');
      }
    } catch (error) {
      console.error('Failed to generate alt text:', error);
    } finally {
      setLoading(null);
    }
  }, [imageUrl, onAltTextGenerated, showSuccess]);

  return {
    loading,
    success,
    handleImprove,
    handleTranslate,
    handleMakeShorter,
    handleMakeLonger,
    handleAnalyzeImage,
    handleGenerateAltText,
  };
}
