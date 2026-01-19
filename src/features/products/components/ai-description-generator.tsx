'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateAIDescription, generateAITags } from '@/app/dashboard/products/ai-actions';
import { toast } from 'sonner';

interface AIDescriptionGeneratorProps {
  productName: string;
  attributes?: string[];
  currentDescription?: string;
  onDescriptionGenerated: (description: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
  disabled?: boolean;
}

type Tone = 'professional' | 'casual' | 'luxury' | 'playful';

export function AIDescriptionGenerator({
  productName,
  attributes = [],
  currentDescription,
  onDescriptionGenerated,
  onTagsGenerated,
  disabled = false,
}: AIDescriptionGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [tone, setTone] = useState<Tone>('professional');
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name first');
      return;
    }

    startTransition(async () => {
      const result = await generateAIDescription(
        productName,
        attributes.length > 0 ? attributes : [productName],
        tone
      );

      if (result.success && result.description) {
        setGeneratedDescription(result.description);
        toast.success('Description generated!');
      } else {
        toast.error(result.error || 'Failed to generate description');
      }
    });
  };

  const handleAccept = () => {
    if (generatedDescription) {
      onDescriptionGenerated(generatedDescription);
      setGeneratedDescription(null);
      toast.success('Description applied');
    }
  };

  const handleGenerateTags = () => {
    if (!productName.trim() || !currentDescription) {
      toast.error('Please add a product name and description first');
      return;
    }

    startTransition(async () => {
      const result = await generateAITags(productName, currentDescription);

      if (result.success && result.tags) {
        onTagsGenerated?.(result.tags);
        toast.success(`Generated ${result.tags.length} tags`);
      } else {
        toast.error(result.error || 'Failed to generate tags');
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={disabled || isPending || !productName.trim()}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Description
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use AI to generate a product description</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="playful">Playful</SelectItem>
          </SelectContent>
        </Select>

        {onTagsGenerated && currentDescription && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateTags}
                  disabled={disabled || isPending}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Tags
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate tags from description</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {generatedDescription && (
        <div className="rounded-lg border border-[var(--ds-blue-300)] bg-[var(--ds-blue-100)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isPending}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleAccept}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Use This
              </Button>
            </div>
          </div>
          <p className="text-sm text-[var(--ds-gray-800)]">{generatedDescription}</p>
        </div>
      )}
    </div>
  );
}
