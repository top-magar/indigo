/**
 * AI Suggestions Panel
 * 
 * A panel that displays AI-generated content suggestions with options
 * to accept, regenerate, or dismiss.
 * 
 * Design System: Vercel/Geist
 * - Purple accent for AI features
 * - Consistent spacing and typography
 * - Accessible interactions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Check, 
  X, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Copy,
  Wand2,
} from 'lucide-react';
import { cn } from '@/shared/utils';

export interface AISuggestion {
  id: string;
  content: string;
  type: 'headline' | 'description' | 'cta' | 'faq' | 'improvement';
  confidence?: number;
}

export interface AISuggestionsPanelProps {
  title?: string;
  suggestions: AISuggestion[];
  loading?: boolean;
  error?: string | null;
  onAccept: (suggestion: AISuggestion) => void;
  onRegenerate?: () => void;
  onDismiss?: () => void;
  showAlternatives?: boolean;
  className?: string;
}

export function AISuggestionsPanel({
  title = 'AI Suggestions',
  suggestions,
  loading = false,
  error = null,
  onAccept,
  onRegenerate,
  onDismiss,
  showAlternatives = true,
  className,
}: AISuggestionsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (suggestion: AISuggestion) => {
    await navigator.clipboard.writeText(suggestion.content);
    setCopiedId(suggestion.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <Card className={cn(
        'border-purple-100 bg-purple-50',
        'shadow-sm',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Generating suggestions…
              </p>
              <p className="text-xs text-muted-foreground">
                AI is creating content for you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn(
        'border-red-100 bg-destructive/10',
        'shadow-sm',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-700">
                Generation failed
              </p>
              <p className="text-xs text-destructive">
                {error}
              </p>
            </div>
            <div className="flex gap-1">
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-8 px-3 text-xs font-medium hover:bg-red-100 transition-colors duration-150"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="h-8 w-8 hover:bg-red-100 transition-colors duration-150"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (suggestions.length === 0) {
    return null;
  }

  const primarySuggestion = suggestions[0];
  const alternatives = suggestions.slice(1);

  return (
    <Card className={cn(
      'border-purple-100 bg-purple-50',
      'shadow-sm',
      className
    )}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRegenerate}
                className="h-8 w-8 hover:bg-purple-100 transition-colors duration-150"
                aria-label="Regenerate suggestions"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-8 w-8 hover:bg-purple-100 transition-colors duration-150"
                aria-label="Dismiss suggestions"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Primary suggestion */}
        <div className="rounded-lg border border-purple-100 bg-background p-3 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {primarySuggestion.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {primarySuggestion.confidence && (
                <Badge 
                  variant="secondary" 
                  className="h-5 px-2 text-[10px] font-medium bg-purple-100 text-purple-700 border-0"
                >
                  {Math.round(primarySuggestion.confidence * 100)}% match
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(primarySuggestion)}
                className="h-8 px-3 text-xs font-medium hover:bg-muted transition-colors duration-150"
              >
                {copiedId === primarySuggestion.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept(primarySuggestion)}
                className="h-8 px-3 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-150"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Use this
              </Button>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        {showAlternatives && alternatives.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:text-purple-600"
              )}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''}
            </button>
            
            {expanded && (
              <div className="space-y-2">
                {alternatives.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "rounded-md border border-border bg-background p-3",
                      "group hover:border-purple-200",
                      "transition-colors duration-150"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                        {suggestion.content}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAccept(suggestion)}
                        className={cn(
                          "h-8 w-8 opacity-0 group-hover:opacity-100",
                          "transition-opacity duration-150",
                          "hover:bg-purple-50"
                        )}
                        aria-label="Use this suggestion"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// ============================================================================
// AI IMPROVEMENT PANEL
// ============================================================================

export interface AIImprovementOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface AIImprovementPanelProps {
  content: string;
  onImprove: (goal: string) => void;
  loading?: boolean;
  className?: string;
}

const IMPROVEMENT_OPTIONS: AIImprovementOption[] = [
  {
    id: 'clarity',
    label: 'Clarity',
    description: 'Make it clearer and easier to understand',
    icon: <Wand2 className="h-3.5 w-3.5" />,
  },
  {
    id: 'engagement',
    label: 'Engagement',
    description: 'Make it more compelling and engaging',
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    id: 'seo',
    label: 'SEO',
    description: 'Optimize for search engines',
    icon: <Wand2 className="h-3.5 w-3.5" />,
  },
  {
    id: 'brevity',
    label: 'Brevity',
    description: 'Make it more concise',
    icon: <Wand2 className="h-3.5 w-3.5" />,
  },
];

export function AIImprovementPanel({
  content,
  onImprove,
  loading = false,
  className,
}: AIImprovementPanelProps) {
  if (!content || content.length < 10) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Improve with AI
      </p>
      <div className="flex flex-wrap gap-2">
        {IMPROVEMENT_OPTIONS.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            onClick={() => onImprove(option.id)}
            disabled={loading}
            className={cn(
              "h-8 px-3 text-xs font-medium",
              "border-border",
              "hover:border-purple-200 hover:bg-purple-50",
              "transition-colors duration-150"
            )}
            title={option.description}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <span className="mr-1.5 text-purple-600">{option.icon}</span>
            )}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
