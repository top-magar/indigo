"use server"

import type { StoreBlock } from "@/types/blocks"
import type { GlobalStyles } from "@/features/editor/global-styles/types"
import {
  TEMPLATE_PRESETS,
  type TemplateId,
  type TemplatePreset,
} from "@/components/store/blocks/templates"
import { themePresets } from "@/features/editor/global-styles/presets"
import type { ThemePreset } from "@/features/editor/global-styles/types"

// Design thinking framework from Anthropic's frontend-design skill:
// Purpose → Tone → Constraints → Differentiation

export interface GenerationResult {
  blocks: StoreBlock[]
  templateId: TemplateId
  themePreset: ThemePreset
  globalStyles: GlobalStyles
  reasoning: string
}

interface AestheticProfile {
  templateId: TemplateId
  themePreset: ThemePreset
  keywords: string[]
  description: string
}

// Map aesthetic directions to template + theme combos
const AESTHETIC_PROFILES: AestheticProfile[] = [
  {
    templateId: "modern-minimal",
    themePreset: "minimal",
    keywords: ["minimal", "clean", "simple", "modern", "zen", "scandinavian", "muji", "aesop", "whitespace", "quiet", "understated"],
    description: "Clean lines, generous whitespace, typography-driven",
  },
  {
    templateId: "bold-vibrant",
    themePreset: "bold",
    keywords: ["bold", "vibrant", "loud", "energetic", "streetwear", "urban", "neon", "dark", "edgy", "punk", "maximalist", "statement"],
    description: "High contrast, dark backgrounds, prominent CTAs, urgency",
  },
  {
    templateId: "classic-commerce",
    themePreset: "corporate",
    keywords: ["classic", "traditional", "professional", "trust", "reliable", "corporate", "business", "established", "premium", "quality"],
    description: "Proven e-commerce patterns, trust signals, structured layout",
  },
  {
    templateId: "product-focused",
    themePreset: "minimal",
    keywords: ["product", "catalog", "grid", "showcase", "gallery", "collection", "shop", "browse", "inventory"],
    description: "Products front and center, minimal distractions",
  },
  {
    templateId: "lifestyle-brand",
    themePreset: "elegant",
    keywords: ["lifestyle", "luxury", "elegant", "refined", "artisan", "craft", "story", "brand", "editorial", "magazine", "boutique", "curated", "organic", "natural", "sustainable"],
    description: "Story-driven, serif typography, warm tones, editorial feel",
  },
  {
    templateId: "bold-vibrant",
    themePreset: "playful",
    keywords: ["playful", "fun", "colorful", "kids", "toys", "candy", "bright", "cheerful", "whimsical", "creative", "quirky"],
    description: "Rounded shapes, bright colors, energetic and approachable",
  },
]

// Industry-specific content overrides
const INDUSTRY_CONTENT: Record<string, Partial<Record<string, string>>> = {
  coffee: { headline: "Roasted to Perfection", subheadline: "Single-origin beans, crafted with care", primaryCtaText: "Shop Beans" },
  fashion: { headline: "New Season, New You", subheadline: "Curated styles for every occasion", primaryCtaText: "Shop Collection" },
  jewelry: { headline: "Timeless Elegance", subheadline: "Handcrafted pieces that tell your story", primaryCtaText: "Explore" },
  tech: { headline: "Built for Tomorrow", subheadline: "Tools that move as fast as you do", primaryCtaText: "Shop Now" },
  food: { headline: "Farm to Table", subheadline: "Fresh, local, and delivered to your door", primaryCtaText: "Order Now" },
  fitness: { headline: "Push Your Limits", subheadline: "Performance gear for every workout", primaryCtaText: "Shop Gear" },
  beauty: { headline: "Your Skin, Your Rules", subheadline: "Clean beauty that actually works", primaryCtaText: "Shop Skincare" },
  home: { headline: "Make It Yours", subheadline: "Thoughtful pieces for thoughtful spaces", primaryCtaText: "Shop Home" },
  pet: { headline: "Happy Pets, Happy Life", subheadline: "Premium products your pets deserve", primaryCtaText: "Shop Now" },
  art: { headline: "Collect the Extraordinary", subheadline: "Original works from emerging artists", primaryCtaText: "Browse Gallery" },
  wine: { headline: "Uncork Something Special", subheadline: "Hand-selected wines from world-class vineyards", primaryCtaText: "Explore Wines" },
  outdoor: { headline: "Adventure Awaits", subheadline: "Gear built for the wild", primaryCtaText: "Shop Gear" },
}

function scoreProfile(prompt: string, profile: AestheticProfile): number {
  const lower = prompt.toLowerCase()
  return profile.keywords.reduce((score, kw) => score + (lower.includes(kw) ? 1 : 0), 0)
}

function matchAesthetic(prompt: string): AestheticProfile {
  let best = AESTHETIC_PROFILES[0]
  let bestScore = 0

  for (const profile of AESTHETIC_PROFILES) {
    const score = scoreProfile(prompt, profile)
    if (score > bestScore) {
      bestScore = score
      best = profile
    }
  }

  return best
}

function matchIndustry(prompt: string): Partial<Record<string, string>> {
  const lower = prompt.toLowerCase()
  for (const [industry, content] of Object.entries(INDUSTRY_CONTENT)) {
    if (lower.includes(industry)) return content
  }
  return {}
}

function applyContentOverrides(blocks: StoreBlock[], overrides: Partial<Record<string, string>>): StoreBlock[] {
  if (Object.keys(overrides).length === 0) return blocks

  return blocks.map((block) => {
    if (block.type === "hero") {
      return {
        ...block,
        settings: { ...block.settings, ...overrides },
      }
    }
    return block
  })
}

export async function generatePage(prompt: string, storeSlug?: string): Promise<GenerationResult> {
  const aesthetic = matchAesthetic(prompt)
  const industry = matchIndustry(prompt)
  const template = TEMPLATE_PRESETS[aesthetic.templateId]
  const theme = themePresets[aesthetic.themePreset]

  // Build blocks from template
  let blocks = template.blocks.map((block, index) => ({
    ...block,
    id: crypto.randomUUID(),
    settings: {
      ...block.settings,
      // Replace store slug placeholders
      ...JSON.parse(
        JSON.stringify(block.settings).replace(
          /\{storeSlug\}/g,
          storeSlug || "my-store"
        )
      ),
    },
  })) as StoreBlock[]

  // Apply industry-specific content
  blocks = applyContentOverrides(blocks, industry)

  return {
    blocks,
    templateId: aesthetic.templateId,
    themePreset: aesthetic.themePreset,
    globalStyles: theme,
    reasoning: `Matched "${aesthetic.description}" aesthetic (${aesthetic.templateId} template + ${aesthetic.themePreset} theme)`,
  }
}
