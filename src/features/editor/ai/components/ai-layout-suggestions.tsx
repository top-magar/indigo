/**
 * AI Layout Suggestions Component
 * 
 * Provides intelligent block suggestions based on current page structure
 * and page type. Helps users build effective page layouts.
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Plus, 
  Loader2,
  Layout,
  ShoppingBag,
  Info,
  Phone,
  Rocket,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAILayoutSuggestions } from '../use-ai-editor';
import type { StoreBlock } from '@/types/blocks';
import type { AILayoutSuggestion } from '../types';

// Block type icons
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  hero: <Rocket className="h-3.5 w-3.5" />,
  'featured-product': <ShoppingBag className="h-3.5 w-3.5" />,
  'product-grid': <Layout className="h-3.5 w-3.5" />,
  testimonials: <Info className="h-3.5 w-3.5" />,
  'trust-signals': <Info className="h-3.5 w-3.5" />,
  newsletter: <Info className="h-3.5 w-3.5" />,
  faq: <Info className="h-3.5 w-3.5" />,
  footer: <Layout className="h-3.5 w-3.5" />,
};

// Page type icons
const PAGE_TYPE_ICONS: Record<string, React.ReactNode> = {
  home: <Layout className="h-4 w-4" />,
  product: <ShoppingBag className="h-4 w-4" />,
  about: <Info className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  landing: <Rocket className="h-4 w-4" />,
};

export type PageType = 'home' | 'product' | 'about' | 'contact' | 'landing';

export interface AILayoutSuggestionsProps {
  currentBlocks: StoreBlock[];
  pageType: PageType;
  onAddBlock: (blockType: string, variant: string) => void;
  autoLoad?: boolean;
  className?: string;
}

export function AILayoutSuggestions({
  currentBlocks,
  pageType,
  onAddBlock,
  autoLoad = true,
  className,
}: AILayoutSuggestionsProps) {
  const { 
    getSuggestions, 
    suggestions, 
    loading, 
    error,
    reset,
  } = useAILayoutSuggestions();

  // Auto-load suggestions on mount or when blocks change
  useEffect(() => {
    if (autoLoad) {
      getSuggestions(currentBlocks, pageType);
    }
  }, [autoLoad, currentBlocks.length, pageType]);

  const handleRefresh = () => {
    getSuggestions(currentBlocks, pageType);
  };

  const handleAddBlock = (suggestion: AILayoutSuggestion) => {
    onAddBlock(suggestion.blockType, suggestion.variant);
  };

  if (loading) {
    return (
      <Card className={cn('border-[var(--ds-amber-200)] bg-[var(--ds-amber-50)]/50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--ds-amber-100)] flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-[var(--ds-amber-600)] animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                Analyzing page structure…
              </p>
              <p className="text-xs text-[var(--ds-gray-600)]">
                AI is generating layout suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('border-[var(--ds-red-200)] bg-[var(--ds-red-50)]', className)}>
        <CardContent className="p-3">
          <p className="text-xs text-[var(--ds-red-700)]">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-6 px-2 text-xs mt-2 hover:bg-[var(--ds-red-100)]"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className={cn('border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)]', className)}>
        <CardContent className="p-4 text-center">
          <Lightbulb className="h-8 w-8 text-[var(--ds-gray-400)] mx-auto mb-2" />
          <p className="text-sm text-[var(--ds-gray-600)]">
            Your page looks complete!
          </p>
          <p className="text-xs text-[var(--ds-gray-500)] mt-1">
            No additional blocks suggested
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-[var(--ds-amber-200)] bg-[var(--ds-amber-50)]/50', className)}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[var(--ds-amber-100)] flex items-center justify-center">
              <Lightbulb className="h-3.5 w-3.5 text-[var(--ds-amber-600)]" />
            </div>
            <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
              Suggested Blocks
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge 
              variant="secondary" 
              className="h-5 px-1.5 text-[10px] bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]"
            >
              {PAGE_TYPE_ICONS[pageType]}
              <span className="ml-1 capitalize">{pageType}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.blockType}-${index}`}
            className="rounded-md border border-[var(--ds-gray-200)] bg-white p-2.5 hover:border-[var(--ds-amber-300)] transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className="h-7 w-7 rounded-md bg-[var(--ds-gray-100)] flex items-center justify-center shrink-0 mt-0.5">
                  {BLOCK_ICONS[suggestion.blockType] || <Layout className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--ds-gray-900)] capitalize">
                      {suggestion.blockType.replace('-', ' ')}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="h-4 px-1 text-[9px] bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]"
                    >
                      {suggestion.variant}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--ds-gray-600)] mt-0.5 line-clamp-2">
                    {suggestion.reason}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddBlock(suggestion)}
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--ds-amber-100)]"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {/* Confidence indicator */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-[var(--ds-gray-100)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--ds-amber-500)] rounded-full transition-all"
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--ds-gray-500)] tabular-nums">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}

        {/* Refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="w-full h-7 text-xs text-[var(--ds-gray-600)] hover:bg-[var(--ds-amber-100)]"
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          Get new suggestions
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPACT SUGGESTION CHIP
// ============================================================================

export interface SuggestionChipProps {
  suggestion: AILayoutSuggestion;
  onAdd: () => void;
  className?: string;
}

export function SuggestionChip({
  suggestion,
  onAdd,
  className,
}: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full',
        'border border-[var(--ds-amber-200)] bg-[var(--ds-amber-50)]',
        'text-xs text-[var(--ds-amber-800)]',
        'hover:bg-[var(--ds-amber-100)] hover:border-[var(--ds-amber-300)]',
        'transition-colors',
        className
      )}
    >
      <Lightbulb className="h-3 w-3" />
      <span className="capitalize">{suggestion.blockType.replace('-', ' ')}</span>
      <Plus className="h-3 w-3" />
    </button>
  );
}
