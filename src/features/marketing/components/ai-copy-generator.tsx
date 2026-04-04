'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIService } from '@/infrastructure/services';
import { toast } from 'sonner';

type CampaignType = 'email' | 'social' | 'banner' | 'sms';

interface AICopyGeneratorProps {
  productName?: string;
  onCopyGenerated?: (copy: string, type: CampaignType) => void;
}

interface GeneratedCopy {
  type: CampaignType;
  content: string;
}

export function AICopyGenerator({ productName = '', onCopyGenerated }: AICopyGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(productName);
  const [context, setContext] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('email');
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!name.trim()) {
      toast.error('Please enter a product or campaign name');
      return;
    }

    startTransition(async () => {
      const aiService = new AIService();
      const result = await aiService.generateText(
        `Generate ${campaignType} marketing copy for "${name}".${context ? ` Context: ${context}` : ''}`
      );

      if (result.success && result.content) {
        const newCopy: GeneratedCopy = {
          type: campaignType,
          content: result.content,
        };
        setGeneratedCopies(prev => [newCopy, ...prev].slice(0, 5));
        onCopyGenerated?.(result.content, campaignType);
        toast.success('Marketing copy generated!');
      } else {
        toast.error(result.error || 'Failed to generate copy');
      }
    });
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const typeLabels: Record<CampaignType, string> = {
    email: 'Email',
    social: 'Social Media',
    banner: 'Banner Ad',
    sms: 'SMS',
  };

  const typeColors: Record<CampaignType, string> = {
    email: 'bg-primary/10 text-primary',
    social: 'bg-purple-50 text-purple-700',
    banner: 'bg-amber-50 text-amber-500',
    sms: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Marketing Copy Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product/Campaign Name</Label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer Sale Collection"
              className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-type">Campaign Type</Label>
            <Select value={campaignType} onValueChange={(v) => setCampaignType(v as CampaignType)}>
              <SelectTrigger id="campaign-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Subject & Preview</SelectItem>
                <SelectItem value="social">Social Media Post</SelectItem>
                <SelectItem value="banner">Banner Headline</SelectItem>
                <SelectItem value="sms">SMS Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (optional)</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="20% off, limited time, free shipping over $50..."
            rows={2}
          />
        </div>

        <Button onClick={handleGenerate} disabled={isPending || !name.trim()} className="w-full gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate {typeLabels[campaignType]} Copy
        </Button>

        {generatedCopies.length > 0 && (
          <div className="space-y-3 pt-2">
            <Label>Generated Copies</Label>
            {generatedCopies.map((copy, index) => (
              <div
                key={index}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge className={typeColors[copy.type]}>{typeLabels[copy.type]}</Badge>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(copy.content, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{copy.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
