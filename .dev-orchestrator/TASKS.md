# Indigo Editor Feature Sprint — Remaining Gaps

## Context
Indigo is a Next.js 16 e-commerce platform with a visual storefront editor.
Stack: Next.js 16 + Tailwind CSS v4 + Zustand + Supabase + Stripe Connect.

Key files:
- Store: src/features/editor/store.ts (Zustand, 1226 lines, uses mutateBlocks/mutateBlocksDeep helpers)
- Store types: src/features/editor/types.ts (EditorActions interface)
- Block types: src/types/blocks.ts (BaseBlock with responsiveOverrides, getResolvedSettings)
- Visual editor: src/app/(editor)/storefront/visual-editor.tsx
- Settings panel: src/features/editor/components/settings-panel.tsx
- Command palette: src/features/editor/components/command-palette.tsx

Design system rules:
- rounded-lg (never xl/2xl), p-4 max spacing, text-muted-foreground (never opacity variants)
- Compact, data-dense UI inspired by Linear/Stripe/Vercel Geist
- Use shadcn/ui components from src/components/ui/

CRITICAL: Run `npx tsc --noEmit` after every change — must be 0 errors.
Write MINIMAL code only.

## Tasks

### [AI-SVC] Create AI page generation service
- writes: src/features/ai/generate-page.ts
- reads: src/types/blocks.ts
- depends:
- prompt: Create a template-based page generator that maps a text prompt to StoreBlock[].
  Export: `export async function generatePage(prompt: string): Promise<StoreBlock[]>`
  Import StoreBlock from @/types/blocks.
  Strategy: parse the prompt for keywords (e.g. "landing page", "about", "product"),
  then return a pre-built array of blocks appropriate for that page type.
  Include at least 3 templates: landing (header + hero + trust + products + newsletter + footer),
  about (header + rich-text + footer), product (header + product-grid + footer).
  Each block needs: id (use crypto.randomUUID()), type, variant, settings with sensible defaults.
  Keep it under 120 lines. No API calls — pure template logic for now.

### [AI-DLG] Create AI generation dialog component
- writes: src/features/editor/components/ai-generation-dialog.tsx
- reads: src/components/ui/dialog.tsx, src/components/ui/button.tsx, src/components/ui/textarea.tsx
- depends:
- prompt: Create a dialog for AI page generation.
  Props: `{ open: boolean; onOpenChange: (open: boolean) => void; onGenerate: (prompt: string) => void; isGenerating?: boolean }`
  Use shadcn Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Textarea.
  Include a textarea with placeholder "Describe the page you want to create...",
  a Generate button with loading state, and example prompts as clickable chips below the textarea.
  Example prompts: "Landing page for a coffee shop", "About us page", "Product showcase".
  Keep it under 80 lines. Use Sparkles icon from lucide-react.

### [CMD-EXP] Expand command palette actions
- writes: src/features/editor/components/command-palette.tsx
- reads: src/features/editor/store.ts, src/features/editor/types.ts
- depends:
- prompt: The command palette currently has only 5 actions. Add these additional actions:
  - Duplicate Block (duplicate currently selected block)
  - Delete Block (remove currently selected block)
  - Toggle Snapping (toggle snap-to-grid)
  - Switch to Desktop/Tablet/Mobile viewport
  - Undo / Redo
  - Select All Blocks
  Import the needed store actions. Each action needs: id, label, icon, shortcut (if any), action callback.
  Group actions by category using CommandGroup: "Blocks", "Viewport", "Edit".
  Keep changes minimal — just add to the existing actions array.

### [AI-WIRE] Wire AI generation into visual editor
- writes: src/app/(editor)/storefront/visual-editor.tsx
- reads: src/features/ai/generate-page.ts, src/features/editor/components/ai-generation-dialog.tsx
- depends: AI-SVC, AI-DLG
- prompt: Wire the AI generation feature into the visual editor.
  1. Import AIGenerationDialog and generatePage
  2. Add state: const [aiDialogOpen, setAiDialogOpen] = useState(false)
  3. Add state: const [isGenerating, setIsGenerating] = useState(false)
  4. Add handler: handleAiGenerate that calls generatePage(prompt), then setBlocks(result)
  5. Add the dialog component at the bottom of the JSX (before closing TooltipProvider)
  6. Pass setAiDialogOpen to EditorHeader or add a keyboard shortcut (Cmd+Shift+G)
  Keep changes minimal — only add what's needed to wire it up.

### [VARIANT-FIX] Fix variant selector text wrapping
- writes: src/features/editor/components/settings-panel.tsx
- reads:
- depends:
- prompt: In the settings panel, the variant selector grid has cells that don't handle
  long variant names well (e.g. "Announcement Bar" wraps to 2 lines, making the cell taller).
  Find the variant selector grid in the settings panel and add:
  - `text-xs` and `truncate` to the variant label text
  - `min-h-[36px]` to each grid cell for consistent height
  - `items-center` to center the text vertically
  This should be a very small CSS-only fix. Do NOT restructure the component.
