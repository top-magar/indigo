/**
 * AI Image Analyzer Component
 * 
 * Analyzes uploaded images and provides:
 * - Auto-generated alt text
 * - Content moderation warnings
 * - Label/tag suggestions
 * - Text extraction from images
 * 
 * Design System: Vercel/Geist
 * - Consistent spacing and typography
 * - Semantic colors for status indicators
 * - Accessible interactions
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  FileText,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAIImageAnalysis, useAIAltText } from '../use-ai-editor';

export interface AIImageAnalyzerProps {
  imageUrl: string;
  currentAltText?: string;
  onAltTextChange?: (altText: string) => void;
  onLabelsExtracted?: (labels: string[]) => void;
  showModeration?: boolean;
  showLabels?: boolean;
  showTextExtraction?: boolean;
  autoAnalyze?: boolean;
  className?: string;
}

export function AIImageAnalyzer({
  imageUrl,
  currentAltText = '',
  onAltTextChange,
  onLabelsExtracted,
  showModeration = true,
  showLabels = true,
  showTextExtraction = true,
  autoAnalyze = false,
  className,
}: AIImageAnalyzerProps) {
  const [altText, setAltText] = useState(currentAltText);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const { 
    analyze, 
    result: analysisResult, 
    loading: analyzing, 
    error: analysisError,
    reset: resetAnalysis,
  } = useAIImageAnalysis();

  const {
    generate: generateAltText,
    altText: generatedAltText,
    loading: generatingAlt,
  } = useAIAltText();

  // Auto-analyze on mount if enabled
  useEffect(() => {
    if (autoAnalyze && imageUrl && !hasAnalyzed) {
      handleAnalyze();
    }
  }, [autoAnalyze, imageUrl]);

  // Update alt text when generated
  useEffect(() => {
    if (generatedAltText) {
      setAltText(generatedAltText);
      onAltTextChange?.(generatedAltText);
    }
  }, [generatedAltText, onAltTextChange]);

  // Notify parent of extracted labels
  useEffect(() => {
    if (analysisResult?.labels && onLabelsExtracted) {
      onLabelsExtracted(analysisResult.labels);
    }
  }, [analysisResult?.labels, onLabelsExtracted]);

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    await analyze(imageUrl);
    setHasAnalyzed(true);
  };

  const handleGenerateAltText = async () => {
    if (!imageUrl) return;
    await generateAltText(imageUrl);
  };

  const handleAltTextChange = (value: string) => {
    setAltText(value);
    onAltTextChange?.(value);
  };

  const isLoading = analyzing || generatingAlt;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Alt Text Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--ds-gray-800)]">
            Alt Text
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateAltText}
            disabled={isLoading || !imageUrl}
            className={cn(
              "h-8 px-3 text-xs font-medium",
              "hover:bg-[var(--ds-purple-100)]",
              "transition-colors duration-150"
            )}
          >
            {generatingAlt ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-purple-700)]" />
            )}
            Generate
          </Button>
        </div>
        <Input
          value={altText}
          onChange={(e) => handleAltTextChange(e.target.value)}
          placeholder="Describe this image for accessibility…"
          className="h-9 text-sm border-[var(--ds-gray-300)] focus:border-[var(--ds-gray-500)] focus:ring-0"
        />
        {!altText && (
          <p className="text-xs text-[var(--ds-amber-800)] flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            Alt text improves accessibility and SEO
          </p>
        )}
      </div>

      {/* Analysis Button */}
      {!hasAnalyzed && (showModeration || showLabels || showTextExtraction) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isLoading || !imageUrl}
          className={cn(
            "w-full h-9 text-xs font-medium",
            "border-[var(--ds-gray-300)]",
            "hover:border-[var(--ds-purple-400)] hover:bg-[var(--ds-purple-100)]",
            "transition-colors duration-150"
          )}
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4 mr-2 text-[var(--ds-purple-700)]" />
          )}
          Analyze Image with AI
        </Button>
      )}

      {/* Analysis Error */}
      {analysisError && (
        <div className="rounded-lg bg-[var(--ds-red-100)] border border-[var(--ds-red-300)] p-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[var(--ds-red-700)] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--ds-red-900)] font-medium">{analysisError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { resetAnalysis(); setHasAnalyzed(false); }}
                className="h-7 px-2 text-xs text-[var(--ds-red-800)] hover:bg-[var(--ds-red-200)] mt-2 transition-colors duration-150"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult?.success && (
        <div className="space-y-3">
          {/* Content Moderation */}
          {showModeration && (
            <div className="rounded-lg border border-[var(--ds-gray-300)] p-3">
              <div className="flex items-center gap-2.5">
                <Shield className={cn(
                  'h-4 w-4 flex-shrink-0',
                  analysisResult.isSafe 
                    ? 'text-[var(--ds-green-700)]' 
                    : 'text-[var(--ds-red-700)]'
                )} />
                <span className="text-xs font-medium text-[var(--ds-gray-900)]">
                  Content Safety
                </span>
                {analysisResult.isSafe ? (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-2 text-[10px] font-medium bg-[var(--ds-green-100)] text-[var(--ds-green-900)] border-0"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Safe
                  </Badge>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-2 text-[10px] font-medium bg-[var(--ds-red-100)] text-[var(--ds-red-900)] border-0"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Review needed
                  </Badge>
                )}
              </div>
              {analysisResult.moderationLabels && analysisResult.moderationLabels.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {analysisResult.moderationLabels.map((label, i) => (
                    <Badge 
                      key={i}
                      variant="secondary" 
                      className="h-5 px-2 text-[10px] font-medium bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)] border-0"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Labels/Tags */}
          {showLabels && analysisResult.labels && analysisResult.labels.length > 0 && (
            <div className="rounded-lg border border-[var(--ds-gray-300)] p-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Tag className="h-4 w-4 text-[var(--ds-gray-700)] flex-shrink-0" />
                <span className="text-xs font-medium text-[var(--ds-gray-900)]">
                  Detected Labels
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.labels.map((label, i) => (
                  <Badge 
                    key={i}
                    variant="secondary" 
                    className="h-6 px-2.5 text-xs font-medium bg-[var(--ds-gray-100)] text-[var(--ds-gray-800)] border-0"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {showTextExtraction && analysisResult.containsText && analysisResult.extractedText && (
            <div className="rounded-lg border border-[var(--ds-gray-300)] p-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <FileText className="h-4 w-4 text-[var(--ds-gray-700)] flex-shrink-0" />
                <span className="text-xs font-medium text-[var(--ds-gray-900)]">
                  Extracted Text
                </span>
              </div>
              <p className="text-xs text-[var(--ds-gray-800)] bg-[var(--ds-gray-100)] rounded-md p-2.5 leading-relaxed">
                {analysisResult.extractedText}
              </p>
            </div>
          )}

          {/* Re-analyze button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { resetAnalysis(); setHasAnalyzed(false); }}
            className="h-8 px-3 text-xs font-medium text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)] transition-colors duration-150"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Re-analyze
          </Button>
        </div>
      )}
    </div>
  );
}
