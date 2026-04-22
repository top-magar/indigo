'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Languages, Loader2, Check, AlertCircle } from 'lucide-react';

interface TranslationPanelProps {
  productId: string;
  productName: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  onTranslationsGenerated?: (translations: Record<string, TranslatedContent>) => void;
}

interface TranslatedContent {
  name: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
}

const AVAILABLE_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
] as const;

export function TranslationPanel({
  productName,
  description,
  metaTitle,
  metaDescription,
  onTranslationsGenerated,
}: TranslationPanelProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, TranslatedContent>>({});
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleTranslate = async () => {
    if (selectedLanguages.length === 0) return;

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { name: productName, description, metaTitle, metaDescription },
          targetLanguages: selectedLanguages,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslations(data.translations);
      onTranslationsGenerated?.(data.translations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Languages className="size-4" />
          AI Translation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Translate product content to multiple languages using AWS Translate.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_LANGUAGES.map(lang => (
            <label
              key={lang.code}
              className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedLanguages.includes(lang.code)}
                onCheckedChange={() => toggleLanguage(lang.code)}
              />
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm text-muted-foreground">{lang.name}</span>
              {translations[lang.code] && (
                <Check className="size-3.5 text-emerald-500 ml-auto" />
              )}
            </label>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handleTranslate}
          disabled={selectedLanguages.length === 0 || isTranslating}
          className="w-full"
        >
          {isTranslating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Translating…
            </>
          ) : (
            <>
              <Languages className="size-4" />
              Translate to {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {Object.keys(translations).length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            <p className="text-sm font-medium text-foreground">
              Generated Translations
            </p>
            {Object.entries(translations).map(([code, content]) => {
              const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
              return (
                <div
                  key={code}
                  className="p-3 rounded-md bg-muted space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span>{lang?.flag}</span>
                    <Badge variant="secondary" className="text-xs">
                      {lang?.name}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {content.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {content.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
