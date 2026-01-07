"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Copy01Icon,
  ClipboardIcon,
  Delete02Icon,
  ViewIcon,
  ViewOffIcon,
  Upload04Icon,
  FloppyDiskIcon,
  PencilEdit01Icon,
  SmartPhone01Icon,
  LaptopIcon,
  ComputerIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Layers01Icon,
  MagnetIcon,
} from "@hugeicons/core-free-icons"
import { useEditorStore, selectCanUndo, selectCanRedo, selectSnappingEnabled } from "@/features/editor/store"
import { useBlockClipboard } from "@/features/editor/hooks/use-block-clipboard"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS } from "@/features/editor/block-constants"
import type { BlockType } from "@/types/blocks"

interface CommandPaletteProps {
  onAddBlock: (type: BlockType, variant: string) => void
  onSave: () => void
  onPublish: () => void
  existingBlockTypes: BlockType[]
  isDirty: boolean
  isPending: boolean
}

export function CommandPalette({
  onAddBlock,
  onSave,
  onPublish,
  existingBlockTypes,
  isDirty,
  isPending,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)

  // Editor store
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const blocks = useEditorStore((s) => s.blocks)
  const editorMode = useEditorStore((s) => s.editorMode)
  const viewport = useEditorStore((s) => s.viewport)
  const canUndo = useEditorStore(selectCanUndo)
  const canRedo = useEditorStore(selectCanRedo)
  const snappingEnabled = useEditorStore(selectSnappingEnabled)
  const {
    selectBlock,
    undo,
    redo,
    removeBlock,
    duplicateBlock,
    updateBlock,
    moveBlock,
    setEditorMode,
    setViewport,
    toggleSnapping,
  } = useEditorStore()

  // Clipboard
  const { copy, paste, canPaste } = useBlockClipboard()

  // Selected block info
  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId),
    [blocks, selectedBlockId]
  )
  const selectedBlockIndex = useMemo(
    () => blocks.findIndex((b) => b.id === selectedBlockId),
    [blocks, selectedBlockId]
  )

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Command handlers
  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  // Block type entries for "Add block" commands
  const blockTypes = Object.entries(BLOCK_REGISTRY)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions - always visible */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(onSave)}
            disabled={!isDirty || isPending}
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 text-muted-foreground" />
            <span>Save draft</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(onPublish)}
            disabled={isPending}
          >
            <HugeiconsIcon icon={Upload04Icon} className="h-4 w-4 text-muted-foreground" />
            <span>Publish changes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(undo)}
            disabled={!canUndo}
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="h-4 w-4 text-muted-foreground" />
            <span>Undo</span>
            <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(redo)}
            disabled={!canRedo}
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="h-4 w-4 text-muted-foreground" />
            <span>Redo</span>
            <CommandShortcut>⌘⇧Z</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Block Actions - only when a block is selected */}
        {selectedBlock && (
          <>
            <CommandGroup heading={`Selected: ${BLOCK_REGISTRY[selectedBlock.type]?.name || selectedBlock.type}`}>
              <CommandItem onSelect={() => runCommand(() => copy())}>
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 text-muted-foreground" />
                <span>Copy block</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              {selectedBlock.type !== "header" && selectedBlock.type !== "footer" && (
                <CommandItem onSelect={() => runCommand(() => duplicateBlock(selectedBlockId!))}>
                  <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span>Duplicate block</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
              )}
              <CommandItem
                onSelect={() => runCommand(() => updateBlock(selectedBlockId!, { visible: !selectedBlock.visible }))}
              >
                <HugeiconsIcon 
                  icon={selectedBlock.visible ? ViewOffIcon : ViewIcon} 
                  className="h-4 w-4 text-muted-foreground" 
                />
                <span>{selectedBlock.visible ? "Hide block" : "Show block"}</span>
                <CommandShortcut>⌘H</CommandShortcut>
              </CommandItem>
              {selectedBlockIndex > 0 && (
                <CommandItem
                  onSelect={() => runCommand(() => moveBlock(selectedBlockIndex, selectedBlockIndex - 1))}
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span>Move block up</span>
                </CommandItem>
              )}
              {selectedBlockIndex < blocks.length - 1 && (
                <CommandItem
                  onSelect={() => runCommand(() => moveBlock(selectedBlockIndex, selectedBlockIndex + 1))}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span>Move block down</span>
                </CommandItem>
              )}
              {selectedBlock.type !== "header" && selectedBlock.type !== "footer" && (
                <CommandItem
                  onSelect={() => runCommand(() => removeBlock(selectedBlockId!))}
                  className="text-destructive data-[selected=true]:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  <span>Delete block</span>
                  <CommandShortcut>⌫</CommandShortcut>
                </CommandItem>
              )}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Paste - when clipboard has content */}
        {canPaste && (
          <>
            <CommandGroup heading="Clipboard">
              <CommandItem onSelect={() => runCommand(() => paste())}>
                <HugeiconsIcon icon={ClipboardIcon} className="h-4 w-4 text-muted-foreground" />
                <span>Paste block</span>
                <CommandShortcut>⌘V</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Add Blocks */}
        <CommandGroup heading="Add Block">
          {blockTypes.map(([type, meta]) => {
            const blockType = type as BlockType
            const Icon = BLOCK_ICONS[blockType]
            const isUnique = blockType === "header" || blockType === "footer"
            const alreadyExists = existingBlockTypes.includes(blockType)
            const isDisabled = isUnique && alreadyExists

            if (isDisabled) return null

            return (
              <CommandItem
                key={type}
                onSelect={() => runCommand(() => onAddBlock(blockType, meta.variants[0].id))}
              >
                <HugeiconsIcon icon={Icon} className="h-4 w-4 text-muted-foreground" />
                <span>Add {meta.name}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* View Controls */}
        <CommandGroup heading="View">
          <CommandItem
            onSelect={() => runCommand(() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit'))}
          >
            <HugeiconsIcon 
              icon={editorMode === 'edit' ? ViewIcon : PencilEdit01Icon} 
              className="h-4 w-4 text-muted-foreground" 
            />
            <span>Switch to {editorMode === 'edit' ? 'Preview' : 'Edit'} mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(toggleSnapping)}
          >
            <HugeiconsIcon 
              icon={MagnetIcon} 
              className={`h-4 w-4 ${snappingEnabled ? 'text-primary' : 'text-muted-foreground'}`} 
            />
            <span>{snappingEnabled ? 'Disable' : 'Enable'} snapping</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setViewport('mobile'))}
            data-checked={viewport === 'mobile'}
          >
            <HugeiconsIcon icon={SmartPhone01Icon} className="h-4 w-4 text-muted-foreground" />
            <span>Mobile viewport</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setViewport('tablet'))}
            data-checked={viewport === 'tablet'}
          >
            <HugeiconsIcon icon={LaptopIcon} className="h-4 w-4 text-muted-foreground" />
            <span>Tablet viewport</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setViewport('desktop'))}
            data-checked={viewport === 'desktop'}
          >
            <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4 text-muted-foreground" />
            <span>Desktop viewport</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigate to blocks */}
        {blocks.length > 0 && (
          <CommandGroup heading="Go to Block">
            {blocks.map((block) => {
              const Icon = BLOCK_ICONS[block.type]
              const meta = BLOCK_REGISTRY[block.type]
              return (
                <CommandItem
                  key={block.id}
                  onSelect={() => runCommand(() => selectBlock(block.id))}
                  data-checked={selectedBlockId === block.id}
                >
                  <HugeiconsIcon icon={Icon} className="h-4 w-4 text-muted-foreground" />
                  <span>{meta?.name || block.type}</span>
                  {!block.visible && (
                    <span className="text-muted-foreground text-[10px]">(hidden)</span>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
