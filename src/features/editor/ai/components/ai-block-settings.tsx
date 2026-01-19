/**
 * AI Block Settings Enhancement
 * 
 * Provides AI-enhanced settings panels for specific block types.
 * Adds AI generation buttons and suggestions to text fields.
 * 
 * Design System: Vercel/Geist with OKLCH colors
 * - Purple accent for AI features (--ds-purple-*)
 * - Consistent spacing (4px base)
 * - Accessible hit targets (min 32px)
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Loader2, 
  ChevronDown,
  Wand2,
  Languages,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import * as aiClient from '../api-client';
import { AIGenerateButton } from './ai-generate-button';
import { AISuggestionsPanel, type AISuggestion } from './ai-suggestions-panel';
import { AIImageAnalyzer } from './ai-image-analyzer';
import { AITranslationPanel } from './ai-translation-panel';
import type { ContentTone } from '../types';
import type { BlockType } from '@/types/blocks';

// ============================================================================
// AI SETTINGS SECTION
// ============================================================================

interface AISettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AISettingsSection({
  title = 'AI Assistant',
  children,
  defaultOpen = true,
  className,
}: AISettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "rounded-lg border border-[var(--ds-purple-300)] overflow-hidden",
      "shadow-[var(--ds-shadow-small)]",
      className
    )}>
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5",
          "bg-[var(--ds-purple-100)] hover:bg-[var(--ds-purple-200)]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-purple-600)] focus-visible:ring-offset-1"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--ds-purple-200)]">
            <Sparkles className="h-3 w-3 text-[var(--ds-purple-700)]" />
          </div>
          <span className="text-sm font-medium text-[var(--ds-gray-1000)]">{title}</span>
          <Badge 
            variant="secondary" 
            className="h-[18px] px-1.5 text-[10px] font-medium bg-[var(--ds-purple-200)] text-[var(--ds-purple-900)] border-0"
          >
            AI
          </Badge>
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-[var(--ds-gray-700)] transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      {/* Content - conditionally rendered */}
      {isOpen && (
        <div className="px-3 py-3 space-y-3 bg-[var(--ds-background-100)]">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HERO BLOCK AI SETTINGS
// ============================================================================

interface HeroAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  storeName?: string;
}

export function HeroAISettings({
  settings,
  onSettingChange,
  storeName,
}: HeroAISettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  const tone: ContentTone = 'professional';

  const handleGenerateHeadline = useCallback(async () => {
    setLoading('headline');
    setActiveField('headline');
    setSuggestions([]);

    try {
      const result = await aiClient.generateHeadline({
        storeName,
        tone,
        existingHeadline: settings.headline as string,
      });

      if (result.success && result.content) {
        const allSuggestions: AISuggestion[] = [
          { id: '1', content: result.content, type: 'headline' },
          ...(result.alternatives || []).map((alt, i) => ({
            id: `alt-${i}`,
            content: alt,
            type: 'headline' as const,
          })),
        ];
        setSuggestions(allSuggestions);
      }
    } finally {
      setLoading(null);
    }
  }, [settings.headline, storeName, tone]);

  const handleGenerateSubheadline = useCallback(async () => {
    const headline = settings.headline as string;
    if (!headline) return;

    setLoading('subheadline');
    setActiveField('subheadline');
    setSuggestions([]);

    try {
      const result = await aiClient.generateSubheadline(headline, tone);

      if (result.success && result.content) {
        setSuggestions([
          { id: '1', content: result.content, type: 'description' },
        ]);
      }
    } finally {
      setLoading(null);
    }
  }, [settings.headline, tone]);

  const handleGenerateCTA = useCallback(async () => {
    setLoading('cta');
    setActiveField('cta');
    setSuggestions([]);

    try {
      const result = await aiClient.generateCTA({
        action: 'shop',
        urgency: false,
        tone,
      });

      if (result.success && result.content) {
        const allSuggestions: AISuggestion[] = [
          { id: '1', content: result.content, type: 'cta' },
          ...(result.alternatives || []).map((alt, i) => ({
            id: `alt-${i}`,
            content: alt,
            type: 'cta' as const,
          })),
        ];
        setSuggestions(allSuggestions);
      }
    } finally {
      setLoading(null);
    }
  }, [tone]);

  const handleAcceptSuggestion = useCallback((suggestion: AISuggestion) => {
    if (activeField === 'headline') {
      onSettingChange('headline', suggestion.content);
    } else if (activeField === 'subheadline') {
      onSettingChange('subheadline', suggestion.content);
    } else if (activeField === 'cta') {
      onSettingChange('primaryCtaText', suggestion.content);
    }
    setSuggestions([]);
    setActiveField(null);
  }, [activeField, onSettingChange]);

  const handleDismiss = useCallback(() => {
    setSuggestions([]);
    setActiveField(null);
  }, []);

  return (
    <AISettingsSection>
      <div className="space-y-3">
        <p className="text-xs text-[var(--ds-gray-700)] leading-relaxed">
          Generate compelling content for your hero section
        </p>

        <div className="flex flex-wrap gap-2">
          <AIGenerateButton
            onClick={handleGenerateHeadline}
            loading={loading === 'headline'}
            label="Headline"
            tooltip="Generate a compelling headline"
            size="sm"
          />
          <AIGenerateButton
            onClick={handleGenerateSubheadline}
            loading={loading === 'subheadline'}
            disabled={!settings.headline}
            label="Subheadline"
            tooltip={settings.headline ? 'Generate a supporting subheadline' : 'Add a headline first'}
            size="sm"
          />
          <AIGenerateButton
            onClick={handleGenerateCTA}
            loading={loading === 'cta'}
            label="CTA"
            tooltip="Generate call-to-action text"
            size="sm"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <AISuggestionsPanel
          title={`${activeField?.charAt(0).toUpperCase()}${activeField?.slice(1)} Suggestions`}
          suggestions={suggestions}
          onAccept={handleAcceptSuggestion}
          onDismiss={handleDismiss}
          onRegenerate={
            activeField === 'headline' ? handleGenerateHeadline :
            activeField === 'subheadline' ? handleGenerateSubheadline :
            activeField === 'cta' ? handleGenerateCTA : undefined
          }
        />
      )}
    </AISettingsSection>
  );
}


// ============================================================================
// IMAGE BLOCK AI SETTINGS
// ============================================================================

interface ImageAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
}

export function ImageAISettings({
  settings,
  onSettingChange,
}: ImageAISettingsProps) {
  const imageUrl = settings.src as string;

  if (!imageUrl) {
    return (
      <AISettingsSection>
        <p className="text-xs text-[var(--ds-gray-600)] leading-relaxed">
          Upload an image to use AI analysis features
        </p>
      </AISettingsSection>
    );
  }

  return (
    <AISettingsSection>
      <AIImageAnalyzer
        imageUrl={imageUrl}
        currentAltText={settings.alt as string}
        onAltTextChange={(altText) => onSettingChange('alt', altText)}
        showModeration
        showLabels
        showTextExtraction
      />
    </AISettingsSection>
  );
}

// ============================================================================
// FAQ BLOCK AI SETTINGS
// ============================================================================

interface FAQAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  productName?: string;
}

export function FAQAISettings({
  settings,
  onSettingChange,
  productName,
}: FAQAISettingsProps) {
  const [loading, setLoading] = useState(false);
  const [generatedFAQs, setGeneratedFAQs] = useState<Array<{ question: string; answer: string }>>([]);

  const existingItems = (settings.items as Array<{ question: string; answer: string }>) || [];

  const handleGenerateFAQs = useCallback(async () => {
    setLoading(true);
    setGeneratedFAQs([]);

    try {
      const result = await aiClient.generateFAQs({
        productName,
        existingFAQs: existingItems,
        count: 3,
      });

      if (result.success && result.faqs) {
        setGeneratedFAQs(result.faqs);
      }
    } finally {
      setLoading(false);
    }
  }, [productName, existingItems]);

  const handleAddFAQ = useCallback((faq: { question: string; answer: string }) => {
    const newItems = [...existingItems, faq];
    onSettingChange('items', newItems);
    setGeneratedFAQs(prev => prev.filter(f => f.question !== faq.question));
  }, [existingItems, onSettingChange]);

  const handleAddAll = useCallback(() => {
    const newItems = [...existingItems, ...generatedFAQs];
    onSettingChange('items', newItems);
    setGeneratedFAQs([]);
  }, [existingItems, generatedFAQs, onSettingChange]);

  return (
    <AISettingsSection>
      <div className="space-y-3">
        <p className="text-xs text-[var(--ds-gray-700)] leading-relaxed">
          Generate FAQ questions and answers automatically
        </p>

        <AIGenerateButton
          onClick={handleGenerateFAQs}
          loading={loading}
          label="Generate FAQs"
          tooltip="Generate 3 new FAQ items"
          size="sm"
        />
      </div>

      {generatedFAQs.length > 0 && (
        <div className="space-y-2 rounded-lg border border-[var(--ds-purple-300)] bg-[var(--ds-purple-100)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--ds-gray-1000)]">
              Generated FAQs
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddAll}
              className="h-8 px-3 text-xs font-medium hover:bg-[var(--ds-purple-200)] transition-colors duration-150"
            >
              Add All
            </Button>
          </div>
          <div className="space-y-2">
            {generatedFAQs.map((faq, index) => (
              <div
                key={index}
                className="rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] p-3 group hover:border-[var(--ds-purple-400)] transition-colors duration-150"
              >
                <p className="text-sm font-medium text-[var(--ds-gray-1000)] mb-1.5">
                  {faq.question}
                </p>
                <p className="text-xs text-[var(--ds-gray-700)] line-clamp-2 leading-relaxed">
                  {faq.answer}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddFAQ(faq)}
                  className="h-7 px-2 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-[var(--ds-purple-100)]"
                >
                  Add this FAQ
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AISettingsSection>
  );
}


// ============================================================================
// RICH TEXT AI SETTINGS
// ============================================================================

interface RichTextAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
}

export function RichTextAISettings({
  settings,
  onSettingChange,
}: RichTextAISettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const content = settings.content as string || '';

  const handleImprove = useCallback(async (goal: 'clarity' | 'engagement' | 'seo' | 'brevity') => {
    if (!content) return;

    setLoading(goal);

    try {
      const result = await aiClient.improveContent(content, goal);
      if (result.success && result.improvedContent) {
        onSettingChange('content', result.improvedContent);
      }
    } finally {
      setLoading(null);
    }
  }, [content, onSettingChange]);

  const handleTranslate = useCallback((translatedContent: string) => {
    onSettingChange('content', translatedContent);
    setShowTranslation(false);
  }, [onSettingChange]);

  if (!content) {
    return (
      <AISettingsSection>
        <p className="text-xs text-[var(--ds-gray-600)] leading-relaxed">
          Add content to use AI improvement features
        </p>
      </AISettingsSection>
    );
  }

  return (
    <AISettingsSection>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--ds-gray-800)]">
            Improve your content with AI
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImprove('clarity')}
              disabled={loading !== null}
              className="h-8 px-3 text-xs font-medium border-[var(--ds-gray-300)] hover:border-[var(--ds-purple-400)] hover:bg-[var(--ds-purple-100)] transition-colors duration-150"
            >
              {loading === 'clarity' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-purple-700)]" />
              )}
              Clarity
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImprove('engagement')}
              disabled={loading !== null}
              className="h-8 px-3 text-xs font-medium border-[var(--ds-gray-300)] hover:border-[var(--ds-purple-400)] hover:bg-[var(--ds-purple-100)] transition-colors duration-150"
            >
              {loading === 'engagement' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-purple-700)]" />
              )}
              Engagement
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImprove('seo')}
              disabled={loading !== null}
              className="h-8 px-3 text-xs font-medium border-[var(--ds-gray-300)] hover:border-[var(--ds-purple-400)] hover:bg-[var(--ds-purple-100)] transition-colors duration-150"
            >
              {loading === 'seo' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-purple-700)]" />
              )}
              SEO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImprove('brevity')}
              disabled={loading !== null}
              className="h-8 px-3 text-xs font-medium border-[var(--ds-gray-300)] hover:border-[var(--ds-purple-400)] hover:bg-[var(--ds-purple-100)] transition-colors duration-150"
            >
              {loading === 'brevity' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-purple-700)]" />
              )}
              Brevity
            </Button>
          </div>
        </div>

        <div className="pt-1 border-t border-[var(--ds-gray-200)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className="h-8 px-3 text-xs font-medium border-[var(--ds-gray-300)] hover:border-[var(--ds-blue-400)] hover:bg-[var(--ds-blue-100)] transition-colors duration-150"
          >
            <Languages className="h-3.5 w-3.5 mr-1.5 text-[var(--ds-blue-700)]" />
            Translate
          </Button>
        </div>

        {showTranslation && (
          <AITranslationPanel
            content={content}
            onTranslate={handleTranslate}
            onCancel={() => setShowTranslation(false)}
          />
        )}
      </div>
    </AISettingsSection>
  );
}


// ============================================================================
// PROMOTIONAL BANNER AI SETTINGS
// ============================================================================

interface PromoBannerAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
}

export function PromoBannerAISettings({
  settings,
  onSettingChange,
}: PromoBannerAISettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleGenerateHeadline = useCallback(async () => {
    setLoading('headline');
    setActiveField('headline');
    setSuggestions([]);

    try {
      const result = await aiClient.generateHeadline({
        tone: 'urgent',
        existingHeadline: settings.headline as string,
      });

      if (result.success && result.content) {
        const allSuggestions: AISuggestion[] = [
          { id: '1', content: result.content, type: 'headline' },
          ...(result.alternatives || []).map((alt, i) => ({
            id: `alt-${i}`,
            content: alt,
            type: 'headline' as const,
          })),
        ];
        setSuggestions(allSuggestions);
      }
    } finally {
      setLoading(null);
    }
  }, [settings.headline]);

  const handleGenerateCTA = useCallback(async () => {
    setLoading('cta');
    setActiveField('cta');
    setSuggestions([]);

    try {
      const result = await aiClient.generateCTA({
        action: 'shop',
        urgency: true,
        tone: 'urgent',
      });

      if (result.success && result.content) {
        const allSuggestions: AISuggestion[] = [
          { id: '1', content: result.content, type: 'cta' },
          ...(result.alternatives || []).map((alt, i) => ({
            id: `alt-${i}`,
            content: alt,
            type: 'cta' as const,
          })),
        ];
        setSuggestions(allSuggestions);
      }
    } finally {
      setLoading(null);
    }
  }, []);

  const handleAcceptSuggestion = useCallback((suggestion: AISuggestion) => {
    if (activeField === 'headline') {
      onSettingChange('headline', suggestion.content);
    } else if (activeField === 'cta') {
      onSettingChange('ctaText', suggestion.content);
    }
    setSuggestions([]);
    setActiveField(null);
  }, [activeField, onSettingChange]);

  const handleDismiss = useCallback(() => {
    setSuggestions([]);
    setActiveField(null);
  }, []);

  return (
    <AISettingsSection>
      <div className="space-y-3">
        <p className="text-xs text-[var(--ds-gray-700)] leading-relaxed">
          Generate attention-grabbing promotional content
        </p>

        <div className="flex flex-wrap gap-2">
          <AIGenerateButton
            onClick={handleGenerateHeadline}
            loading={loading === 'headline'}
            label="Headline"
            tooltip="Generate a promotional headline"
            size="sm"
          />
          <AIGenerateButton
            onClick={handleGenerateCTA}
            loading={loading === 'cta'}
            label="CTA"
            tooltip="Generate urgent call-to-action"
            size="sm"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <AISuggestionsPanel
          title={`${activeField?.charAt(0).toUpperCase()}${activeField?.slice(1)} Suggestions`}
          suggestions={suggestions}
          onAccept={handleAcceptSuggestion}
          onDismiss={handleDismiss}
          onRegenerate={
            activeField === 'headline' ? handleGenerateHeadline :
            activeField === 'cta' ? handleGenerateCTA : undefined
          }
        />
      )}
    </AISettingsSection>
  );
}


// ============================================================================
// TESTIMONIALS AI SETTINGS
// ============================================================================

interface TestimonialsAISettingsProps {
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  productName?: string;
}

export function TestimonialsAISettings({
  settings,
  onSettingChange,
  productName,
}: TestimonialsAISettingsProps) {
  const [loading, setLoading] = useState(false);
  const [generatedTestimonials, setGeneratedTestimonials] = useState<Array<{ quote: string; author: string }>>([]);

  const existingReviews = (settings.manualReviews as Array<{ quote: string; author: string }>) || [];

  const handleGenerateTestimonials = useCallback(async () => {
    setLoading(true);
    setGeneratedTestimonials([]);

    try {
      // Generate 3 testimonials
      const results = await Promise.all([
        aiClient.generateTestimonial({ productName, tone: 'friendly' }),
        aiClient.generateTestimonial({ productName, tone: 'professional' }),
        aiClient.generateTestimonial({ productName, tone: 'casual' }),
      ]);

      const testimonials = results
        .filter(r => r.success && r.content)
        .map((r, i) => ({
          quote: r.content!,
          author: `Customer ${existingReviews.length + i + 1}`,
        }));

      setGeneratedTestimonials(testimonials);
    } finally {
      setLoading(false);
    }
  }, [productName, existingReviews.length]);

  const handleAddTestimonial = useCallback((testimonial: { quote: string; author: string }) => {
    const newReviews = [...existingReviews, testimonial];
    onSettingChange('manualReviews', newReviews);
    setGeneratedTestimonials(prev => prev.filter(t => t.quote !== testimonial.quote));
  }, [existingReviews, onSettingChange]);

  const handleAddAll = useCallback(() => {
    const newReviews = [...existingReviews, ...generatedTestimonials];
    onSettingChange('manualReviews', newReviews);
    setGeneratedTestimonials([]);
  }, [existingReviews, generatedTestimonials, onSettingChange]);

  return (
    <AISettingsSection>
      <div className="space-y-3">
        <p className="text-xs text-[var(--ds-gray-700)] leading-relaxed">
          Generate sample testimonials for your store
        </p>

        <AIGenerateButton
          onClick={handleGenerateTestimonials}
          loading={loading}
          label="Generate Testimonials"
          tooltip="Generate 3 sample testimonials"
          size="sm"
        />
      </div>

      {generatedTestimonials.length > 0 && (
        <div className="space-y-2 rounded-lg border border-[var(--ds-purple-300)] bg-[var(--ds-purple-100)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--ds-gray-1000)]">
              Generated Testimonials
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddAll}
              className="h-8 px-3 text-xs font-medium hover:bg-[var(--ds-purple-200)] transition-colors duration-150"
            >
              Add All
            </Button>
          </div>
          <div className="space-y-2">
            {generatedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] p-3 group hover:border-[var(--ds-purple-400)] transition-colors duration-150"
              >
                <p className="text-sm text-[var(--ds-gray-900)] italic mb-1.5 line-clamp-2 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <p className="text-xs text-[var(--ds-gray-700)]">
                  — {testimonial.author}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddTestimonial(testimonial)}
                  className="h-7 px-2 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-[var(--ds-purple-100)]"
                >
                  Add this testimonial
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AISettingsSection>
  );
}


// ============================================================================
// BLOCK AI SETTINGS FACTORY
// ============================================================================

export interface BlockAISettingsProps {
  blockType: BlockType;
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  storeName?: string;
  productName?: string;
}

export function BlockAISettings({
  blockType,
  settings,
  onSettingChange,
  storeName,
  productName,
}: BlockAISettingsProps) {
  // Only show AI settings for supported block types
  switch (blockType) {
    case 'hero':
      return (
        <HeroAISettings
          settings={settings}
          onSettingChange={onSettingChange}
          storeName={storeName}
        />
      );
    case 'image':
      return (
        <ImageAISettings
          settings={settings}
          onSettingChange={onSettingChange}
        />
      );
    case 'faq':
      return (
        <FAQAISettings
          settings={settings}
          onSettingChange={onSettingChange}
          productName={productName}
        />
      );
    case 'rich-text':
      return (
        <RichTextAISettings
          settings={settings}
          onSettingChange={onSettingChange}
        />
      );
    case 'promotional-banner':
      return (
        <PromoBannerAISettings
          settings={settings}
          onSettingChange={onSettingChange}
        />
      );
    case 'testimonials':
      return (
        <TestimonialsAISettings
          settings={settings}
          onSettingChange={onSettingChange}
          productName={productName}
        />
      );
    default:
      // Show AI section with message for unsupported blocks
      return (
        <AISettingsSection>
          <p className="text-xs text-[var(--ds-gray-600)] leading-relaxed">
            AI features are available for Hero, Image, FAQ, Rich Text, Promotional Banner, and Testimonials blocks.
          </p>
        </AISettingsSection>
      );
  }
}
