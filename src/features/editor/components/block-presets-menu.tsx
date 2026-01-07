"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutIcon,
  Megaphone01Icon,
  ShoppingCart01Icon,
  File01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons"
import {
  getPresetsByCategory,
  applyPreset,
  PRESET_CATEGORIES,
  type BlockPreset,
  type PresetCategory,
  type PresetBlockConfig,
} from "@/features/editor/presets-dir/block-presets"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS } from "@/features/editor/block-constants"
import type { StoreBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"

// =============================================================================
// TYPES
// =============================================================================

export interface BlockPresetsMenuProps {
  onApplyPreset: (blocks: StoreBlock[]) => void
}

// =============================================================================
// CATEGORY ICONS
// =============================================================================

const CATEGORY_ICONS: Record<PresetCategory, typeof LayoutIcon> = {
  marketing: Megaphone01Icon,
  commerce: ShoppingCart01Icon,
  content: File01Icon,
  engagement: FavouriteIcon,
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique block ID
 */
function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Convert preset block configs to full StoreBlocks
 */
function presetConfigsToBlocks(configs: PresetBlockConfig[]): StoreBlock[] {
  return configs.map((config, index) => ({
    id: generateBlockId(),
    type: config.type,
    variant: config.variant,
    settings: { ...config.settings },
    order: index,
    visible: true,
  })) as StoreBlock[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BlockPresetsMenu({ onApplyPreset }: BlockPresetsMenuProps) {
  // Handle preset selection
  const handlePresetClick = (preset: BlockPreset) => {
    const blockConfigs = applyPreset(preset.id)
    if (blockConfigs) {
      const blocks = presetConfigsToBlocks(blockConfigs)
      onApplyPreset(blocks)
    }
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <HugeiconsIcon icon={LayoutIcon} className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Block Presets
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Block Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {PRESET_CATEGORIES.map(({ id: category, label }) => {
          const presetsForCategory = getPresetsByCategory(category)
          if (presetsForCategory.length === 0) return null

          const CategoryIcon = CATEGORY_ICONS[category]

          return (
            <DropdownMenuSub key={category}>
              <DropdownMenuSubTrigger className="gap-2">
                <HugeiconsIcon
                  icon={CategoryIcon}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
                <span className="text-xs">{label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {presetsForCategory.length}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                {presetsForCategory.map((preset) => {
                  // Get the primary block type for icon/color
                  const primaryBlockType = preset.blocks[0]?.type
                  const BlockIcon = primaryBlockType ? BLOCK_ICONS[primaryBlockType] : LayoutIcon
                  const textColor = primaryBlockType ? BLOCK_TEXT_COLORS[primaryBlockType] : "text-muted-foreground"

                  return (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <HugeiconsIcon
                          icon={BlockIcon}
                          className={cn("h-3.5 w-3.5 shrink-0", textColor)}
                        />
                        <span className="text-xs font-medium truncate">
                          {preset.name}
                        </span>
                        <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                          {preset.blocks.length} {preset.blocks.length === 1 ? "block" : "blocks"}
                        </span>
                      </div>
                      {preset.description && (
                        <span className="text-[10px] text-muted-foreground pl-5.5 line-clamp-1">
                          {preset.description}
                        </span>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
