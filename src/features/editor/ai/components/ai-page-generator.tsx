'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Check, RefreshCw, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/shared/utils';
import { generateHeadline, generateDescription, generateFAQs, generateTestimonial } from '../api-client';
import type { StoreBlock, BlockType } from '@/types/blocks';

// ============================================================================
// TYPES
// ============================================================================

export type BusinessType =
  | 'fashion'
  | 'electronics'
  | 'food-beverage'
  | 'health-beauty'
  | 'home-garden'
  | 'sports'
  | 'jewelry'
  | 'books'
  | 'toys'
  | 'pets'
  | 'custom';

export type PageType =
  | 'homepage'
  | 'product'
  | 'about'
  | 'landing'
  | 'contact'
  | 'faq';

export type StylePreference =
  | 'minimal'
  | 'bold'
  | 'elegant'
  | 'playful'
  | 'professional'
  | 'luxurious';

export interface AIPageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageGenerated: (blocks: StoreBlock[]) => void;
  storeName?: string;
}

interface PageTemplate {
  blocks: Array<{ type: BlockType; variant?: string }>;
  description: string;
}

// ============================================================================
// PAGE TEMPLATES
// ============================================================================

const PAGE_TEMPLATES: Record<PageType, PageTemplate> = {
  homepage: {
    description: 'Full homepage with hero, products, and social proof',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'hero', variant: 'centered' },
      { type: 'trust-signals', variant: 'default' },
      { type: 'product-grid', variant: 'featured' },
      { type: 'testimonials', variant: 'carousel' },
      { type: 'newsletter', variant: 'default' },
      { type: 'footer', variant: 'default' },
    ],
  },
  product: {
    description: 'Product showcase with related items',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'featured-product', variant: 'default' },
      { type: 'product-grid', variant: 'related' },
      { type: 'testimonials', variant: 'simple' },
      { type: 'footer', variant: 'default' },
    ],
  },
  about: {
    description: 'About page with story and team',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'hero', variant: 'minimal-text' },
      { type: 'rich-text', variant: 'default' },
      { type: 'testimonials', variant: 'grid' },
      { type: 'footer', variant: 'default' },
    ],
  },
  landing: {
    description: 'Marketing landing page',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'hero', variant: 'split' },
      { type: 'trust-signals', variant: 'logos' },
      { type: 'promotional-banner', variant: 'default' },
      { type: 'newsletter', variant: 'centered' },
      { type: 'footer', variant: 'default' },
    ],
  },
  contact: {
    description: 'Contact page with form',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'hero', variant: 'minimal-text' },
      { type: 'rich-text', variant: 'contact' },
      { type: 'newsletter', variant: 'default' },
      { type: 'footer', variant: 'default' },
    ],
  },
  faq: {
    description: 'FAQ page with common questions',
    blocks: [
      { type: 'header', variant: 'default' },
      { type: 'hero', variant: 'minimal-text' },
      { type: 'faq', variant: 'accordion' },
      { type: 'newsletter', variant: 'default' },
      { type: 'footer', variant: 'default' },
    ],
  },
};

const BUSINESS_TYPES: Array<{ value: BusinessType; label: string }> = [
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'electronics', label: 'Electronics & Tech' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'books', label: 'Books & Media' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'pets', label: 'Pet Supplies' },
  { value: 'custom', label: 'Custom / Other' },
];

const PAGE_TYPES: Array<{ value: PageType; label: string; description: string }> = [
  { value: 'homepage', label: 'Homepage', description: 'Main store landing page' },
  { value: 'product', label: 'Product Page', description: 'Featured product showcase' },
  { value: 'about', label: 'About Page', description: 'Brand story and team' },
  { value: 'landing', label: 'Landing Page', description: 'Marketing campaign page' },
  { value: 'contact', label: 'Contact Page', description: 'Contact information' },
  { value: 'faq', label: 'FAQ Page', description: 'Frequently asked questions' },
];

const STYLE_PREFERENCES: Array<{ value: StylePreference; label: string }> = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'playful', label: 'Playful' },
  { value: 'professional', label: 'Professional' },
  { value: 'luxurious', label: 'Luxurious' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function AIPageGenerator({
  open,
  onOpenChange,
  onPageGenerated,
  storeName = 'My Store',
}: AIPageGeneratorProps) {
  // Form state
  const [businessType, setBusinessType] = useState<BusinessType>('fashion');
  const [pageType, setPageType] = useState<PageType>('homepage');
  const [stylePreference, setStylePreference] = useState<StylePreference>('minimal');
  const [customRequirements, setCustomRequirements] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [generatedBlocks, setGeneratedBlocks] = useState<StoreBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const template = PAGE_TEMPLATES[pageType];
  const totalBlocks = template.blocks.length;
  const progress = isGenerating ? ((currentBlockIndex + 1) / totalBlocks) * 100 : 0;

  const resetState = useCallback(() => {
    setIsGenerating(false);
    setCurrentBlockIndex(0);
    setGeneratedBlocks([]);
    setError(null);
    setIsComplete(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    resetState();
    setIsGenerating(true);
    setError(null);

    const blocks: StoreBlock[] = [];
    const templateBlocks = template.blocks;

    try {
      for (let i = 0; i < templateBlocks.length; i++) {
        setCurrentBlockIndex(i);
        const blockDef = templateBlocks[i];

        // Generate content based on block type
        let settings: Record<string, unknown> = {};
        
        try {
          switch (blockDef.type) {
            case 'hero':
              const headlineResult = await generateHeadline({
                storeName,
                industry: businessType,
                tone: stylePreference === 'playful' ? 'casual' : 'professional',
              });
              if (headlineResult.success && headlineResult.content) {
                settings = {
                  headline: headlineResult.content,
                  subheadline: `Welcome to ${storeName}`,
                  ctaText: 'Shop Now',
                };
              }
              break;
              
            case 'faq':
              const faqResult = await generateFAQs({
                productName: storeName,
                category: businessType,
                count: 5,
              });
              if (faqResult.success && faqResult.faqs) {
                settings = { items: faqResult.faqs };
              }
              break;
              
            case 'testimonials':
              const testimonialResult = await generateTestimonial({
                productName: storeName,
                tone: stylePreference === 'playful' ? 'casual' : 'professional',
              });
              if (testimonialResult.success && testimonialResult.content) {
                settings = {
                  items: [{
                    quote: testimonialResult.content,
                    author: 'Happy Customer',
                    role: 'Verified Buyer',
                  }],
                };
              }
              break;
              
            case 'rich-text':
              const descResult = await generateDescription({
                productName: storeName,
                category: businessType,
                tone: stylePreference === 'playful' ? 'casual' : 'professional',
                maxLength: 300,
              });
              if (descResult.success && descResult.content) {
                settings = { content: descResult.content };
              }
              break;
              
            default:
              // For other blocks, use default settings
              settings = {};
          }
        } catch {
          // If generation fails for a block, continue with defaults
          settings = {};
        }

        // Create block with generated content
        const block = {
          id: `block-${Date.now()}-${i}`,
          type: blockDef.type,
          variant: blockDef.variant || 'default',
          settings,
          visible: true,
          locked: false,
        } as StoreBlock;

        blocks.push(block);
        setGeneratedBlocks([...blocks]);
      }

      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [template, storeName, businessType, stylePreference, resetState]);

  const handleAccept = useCallback(() => {
    onPageGenerated(generatedBlocks);
    onOpenChange(false);
    resetState();
  }, [generatedBlocks, onPageGenerated, onOpenChange, resetState]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetState();
  }, [onOpenChange, resetState]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-(--ds-purple-600)" />
            Generate Page with AI
          </DialogTitle>
          <DialogDescription>
            Create a complete page layout with AI-generated content
          </DialogDescription>
        </DialogHeader>

        {!isGenerating && !isComplete ? (
          <div className="space-y-4 py-4">
            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                <SelectTrigger id="business-type">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page Type */}
            <div className="space-y-2">
              <Label htmlFor="page-type">Page Type</Label>
              <Select value={pageType} onValueChange={(v) => setPageType(v as PageType)}>
                <SelectTrigger id="page-type">
                  <SelectValue placeholder="Select page type" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-(--ds-gray-500)">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-(--ds-gray-500)">
                {template.description} ({totalBlocks} blocks)
              </p>
            </div>

            {/* Style Preference */}
            <div className="space-y-2">
              <Label htmlFor="style">Style Preference</Label>
              <Select value={stylePreference} onValueChange={(v) => setStylePreference(v as StylePreference)}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PREFERENCES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Custom Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements or details about your store..."
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                className="h-20 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-(--ds-red-100) text-(--ds-red-800) text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              className="w-full bg-(--ds-purple-600) hover:bg-(--ds-purple-700)"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Page
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-(--ds-purple-600) mb-4" />
              <p className="text-sm font-medium text-(--ds-gray-900)">
                Generating your page...
              </p>
              <p className="text-xs text-(--ds-gray-500) mt-1">
                Creating {template.blocks[currentBlockIndex]?.type || 'block'} ({currentBlockIndex + 1}/{totalBlocks})
              </p>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="space-y-2">
              {template.blocks.map((block, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2 text-sm px-3 py-2 rounded-md',
                    index < currentBlockIndex && 'bg-(--ds-green-100) text-(--ds-green-800)',
                    index === currentBlockIndex && 'bg-(--ds-purple-100) text-(--ds-purple-800)',
                    index > currentBlockIndex && 'text-(--ds-gray-400)'
                  )}
                >
                  {index < currentBlockIndex ? (
                    <Check className="h-4 w-4" />
                  ) : index === currentBlockIndex ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="capitalize">{block.type.replace(/-/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : isComplete ? (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-(--ds-green-100) flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-(--ds-green-600)" />
              </div>
              <p className="text-sm font-medium text-(--ds-gray-900)">
                Page generated successfully!
              </p>
              <p className="text-xs text-(--ds-gray-500) mt-1">
                {generatedBlocks.length} blocks created
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-(--ds-purple-600) hover:bg-(--ds-purple-700)"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
