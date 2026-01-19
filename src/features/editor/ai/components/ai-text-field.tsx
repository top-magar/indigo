/**
 * AI-Enhanced Text Field
 * 
 * A text input field with integrated AI generation capabilities.
 * Can be used for headlines, descriptions, CTAs, and other text content.
 */

'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  ChevronDown,
  Wand2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/shared/utils';
import * as aiClient from '../api-client';
import type { ContentTone } from '../types';

export type AITextFieldType = 'headline' | 'subheadline' | 'description' | 'cta' | 'general';

export interface AITextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  rows?: number;
  aiType?: AITextFieldType;
  aiContext?: {
    storeName?: string;
    productName?: string;
    industry?: string;
    tone?: ContentTone;
    existingContent?: string;
  };
  className?: string;
}

export function AITextField({
  label,
  value,
  onChange,
  placeholder,
  description,
  multiline = false,
  rows = 3,
  aiType = 'general',
  aiContext = {},
  className,
}: AITextFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tone = aiContext.tone || 'professional';

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      let result;

      switch (aiType) {
        case 'headline':
          result = await aiClient.generateHeadline({
            storeName: aiContext.storeName,
            industry: aiContext.industry,
            productName: aiContext.productName,
            tone,
            existingHeadline: value || undefined,
          });
          break;

        case 'subheadline':
          if (!aiContext.existingContent) {
            setError('A headline is required to generate a subheadline');
            setIsGenerating(false);
            return;
          }
          result = await aiClient.generateSubheadline(
            aiContext.existingContent,
            tone
          );
          break;

        case 'description':
          result = await aiClient.generateDescription({
            productName: aiContext.productName,
            tone,
            maxLength: 300,
          });
          break;

        case 'cta':
          result = await aiClient.generateCTA({
            action: 'shop',
            urgency: false,
            tone,
          });
          break;

        default:
          // General text improvement
          if (value) {
            const improved = await aiClient.improveContent(value, 'engagement');
            result = { success: improved.success, content: improved.improvedContent, error: improved.error };
          } else {
            result = await aiClient.generateHeadline({
              storeName: aiContext.storeName,
              tone,
            });
          }
      }

      if (result.success && result.content) {
        const allSuggestions = [result.content, ...(result.alternatives || [])];
        setSuggestions(allSuggestions);
        setShowSuggestions(true);
      } else {
        setError(result.error || 'Failed to generate content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [aiType, aiContext, tone, value]);

  const handleAcceptSuggestion = useCallback((suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [onChange]);

  const handleDismiss = useCallback(() => {
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
  }, []);

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-[var(--ds-gray-700)]">
          {label}
        </Label>
        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-6 px-2 text-[10px] gap-1 hover:bg-[var(--ds-purple-100)] hover:text-[var(--ds-purple-700)]"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 text-[var(--ds-purple-600)]" />
              )}
              {isGenerating ? 'Generating…' : 'AI'}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-72 p-0 border-[var(--ds-purple-200)]"
            sideOffset={4}
          >
            {error ? (
              <div className="p-3 space-y-2">
                <p className="text-xs text-[var(--ds-red-700)]">{error}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    className="h-6 px-2 text-xs"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="divide-y divide-[var(--ds-gray-200)]">
                <div className="p-2 bg-[var(--ds-purple-50)]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[var(--ds-purple-600)]" />
                    <span className="text-xs font-medium text-[var(--ds-gray-900)]">
                      AI Suggestions
                    </span>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="w-full p-2 text-left text-xs text-[var(--ds-gray-800)] hover:bg-[var(--ds-purple-50)] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex-1 leading-relaxed">{suggestion}</span>
                        <Check className="h-3 w-3 text-[var(--ds-purple-600)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="h-6 px-2 text-[10px]"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 px-2 text-[10px]"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ds-purple-600)]" />
                <span className="text-xs text-[var(--ds-gray-600)]">Generating suggestions…</span>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {description && (
        <p className="text-[10px] text-[var(--ds-gray-500)]">{description}</p>
      )}

      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'text-sm',
          multiline ? '' : 'h-8'
        )}
        rows={multiline ? rows : undefined}
      />
    </div>
  );
}
