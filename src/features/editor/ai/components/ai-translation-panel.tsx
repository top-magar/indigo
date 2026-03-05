/**
 * AI Translation Panel
 * 
 * Provides translation capabilities for block content with
 * language selection and preview.
 * 
 * Design System: Vercel/Geist
 * - Blue accent for translation features
 * - Consistent spacing and typography
 * - Accessible interactions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Languages, 
  Loader2, 
  Check, 
  X,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAITranslate } from '../use-ai-editor';

// Supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
];

export interface AITranslationPanelProps {
  content: string;
  sourceLanguage?: string;
  onTranslate: (translatedContent: string, targetLanguage: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function AITranslationPanel({
  content,
  sourceLanguage = 'en',
  onTranslate,
  onCancel,
  className,
}: AITranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  
  const { 
    translate, 
    translatedContent, 
    loading, 
    error,
    reset,
  } = useAITranslate();

  const handleTranslate = async () => {
    if (!targetLanguage || !content) return;
    
    const result = await translate(content, targetLanguage, sourceLanguage);
    if (result) {
      setShowPreview(true);
    }
  };

  const handleAccept = () => {
    if (translatedContent) {
      onTranslate(translatedContent, targetLanguage);
      reset();
      setShowPreview(false);
      setTargetLanguage('');
    }
  };

  const handleCancel = () => {
    reset();
    setShowPreview(false);
    setTargetLanguage('');
    onCancel?.();
  };

  const sourceLang = LANGUAGES.find(l => l.code === sourceLanguage);
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

  return (
    <Card className={cn(
      'border-primary/30 bg-primary/10',
      'shadow-sm',
      className
    )}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
            <Languages className="h-3.5 w-3.5 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
            Translate Content
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Language Selection */}
        {!showPreview && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  From
                </label>
                <div className={cn(
                  "h-9 px-3 rounded-md",
                  "border border-border bg-muted",
                  "flex items-center text-sm text-muted-foreground"
                )}>
                  {sourceLang?.name || 'Auto-detect'}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 mt-6 flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  To
                </label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="h-9 text-sm border-border">
                    <SelectValue placeholder="Select language…" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter(l => l.code !== sourceLanguage).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Original Content Preview */}
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Original</p>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {content}
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 px-3 text-xs font-medium hover:bg-muted transition-colors duration-150"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleTranslate}
                disabled={!targetLanguage || loading}
                className={cn(
                  "h-8 px-4 text-xs font-medium",
                  "bg-primary hover:bg-primary/80 text-white",
                  "transition-colors duration-150"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Translating…
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5 mr-1.5" />
                    Translate
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Translation Preview */}
        {showPreview && translatedContent && (
          <>
            <div className="space-y-2.5">
              {/* Original */}
              <div className="rounded-lg border border-border bg-muted p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Original ({sourceLang?.name})
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content}
                </p>
              </div>

              {/* Translated */}
              <div className="rounded-lg border border-primary/30 bg-background p-3">
                <p className="text-xs font-medium text-primary mb-1.5">
                  Translated ({targetLang?.name})
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {translatedContent}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 px-3 text-xs font-medium hover:bg-muted transition-colors duration-150"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAccept}
                className={cn(
                  "h-8 px-4 text-xs font-medium",
                  "bg-primary hover:bg-primary/80 text-white",
                  "transition-colors duration-150"
                )}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Use Translation
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


// ============================================================================
// QUICK TRANSLATE BUTTON
// ============================================================================

export interface QuickTranslateButtonProps {
  content: string;
  targetLanguage: string;
  onTranslate: (translatedContent: string) => void;
  className?: string;
}

export function QuickTranslateButton({
  content,
  targetLanguage,
  onTranslate,
  className,
}: QuickTranslateButtonProps) {
  const { translate, loading } = useAITranslate();
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

  const handleClick = async () => {
    const result = await translate(content, targetLanguage);
    if (result) {
      onTranslate(result);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={loading || !content}
      className={cn(
        "h-8 px-3 text-xs font-medium",
        "hover:bg-primary/10",
        "transition-colors duration-150",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Languages className="h-3.5 w-3.5 mr-1.5 text-primary" />
      )}
      {targetLang?.name || targetLanguage}
    </Button>
  );
}
