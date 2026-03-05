'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Palette } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/utils'

interface AIGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (prompt: string) => void
  isGenerating?: boolean
}

const AESTHETICS = [
  { id: 'minimal', label: 'Minimal', color: 'bg-zinc-100 text-zinc-900 border-zinc-300', desc: 'Clean, spacious, typography-driven' },
  { id: 'bold', label: 'Bold', color: 'bg-violet-950 text-violet-200 border-violet-700', desc: 'Dark, high-contrast, urgent' },
  { id: 'elegant', label: 'Elegant', color: 'bg-stone-100 text-amber-900 border-stone-300', desc: 'Serif fonts, warm, editorial' },
  { id: 'playful', label: 'Playful', color: 'bg-yellow-50 text-pink-600 border-yellow-300', desc: 'Bright, rounded, energetic' },
  { id: 'corporate', label: 'Pro', color: 'bg-slate-50 text-slate-900 border-slate-300', desc: 'Trustworthy, structured, proven' },
] as const

const EXAMPLES = [
  { text: 'Minimal coffee roastery with zen aesthetic', aesthetic: 'minimal' },
  { text: 'Bold streetwear brand with dark theme', aesthetic: 'bold' },
  { text: 'Elegant jewelry boutique, editorial feel', aesthetic: 'elegant' },
  { text: 'Playful kids toy store, bright and fun', aesthetic: 'playful' },
  { text: 'Professional outdoor gear shop', aesthetic: 'corporate' },
  { text: 'Luxury skincare brand, clean and refined', aesthetic: 'elegant' },
]

export function AIGenerationDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating = false
}: AIGenerationDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    // Prepend aesthetic keyword if selected but not already in prompt
    const aesthetic = selectedAesthetic
    const finalPrompt = aesthetic && !prompt.toLowerCase().includes(aesthetic)
      ? `${aesthetic} ${prompt}`
      : prompt
    onGenerate(finalPrompt.trim())
  }

  const handleExample = (example: typeof EXAMPLES[number]) => {
    setPrompt(example.text)
    setSelectedAesthetic(example.aesthetic)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Storefront
          </DialogTitle>
          <DialogDescription>
            Describe your store and pick an aesthetic. We'll generate a complete page layout with matching theme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aesthetic picker */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Aesthetic</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {AESTHETICS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAesthetic(selectedAesthetic === a.id ? null : a.id)}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all',
                    a.color,
                    selectedAesthetic === a.id
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-[1.02]'
                      : 'opacity-70 hover:opacity-100'
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A sustainable candle brand with warm, earthy tones..."
            className="min-h-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
            }}
          />

          {/* Examples */}
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                onClick={() => handleExample(ex)}
                className="rounded-md border bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {ex.text}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
                <span className="ml-2 text-xs opacity-60">⌘↵</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
