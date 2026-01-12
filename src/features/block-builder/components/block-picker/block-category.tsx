"use client"

import { Button } from "@/components/ui/button"
import { getBlockIcon } from "../../utils/block-icons"
import { blockSchemas } from "../../utils/block-schemas"
import type { BlockType } from "@/types/blocks"

interface BlockCategoryProps {
  category: "layout" | "content" | "commerce" | "engagement"
  title: string
  onBlockSelect: (type: BlockType) => void
}

export function BlockCategory({ category, title, onBlockSelect }: BlockCategoryProps) {
  const blocks = blockSchemas.filter(schema => schema.category === category)

  if (blocks.length === 0) return null

  return (
    <div>
      <h3 className="font-medium text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {blocks.map((schema) => {
          const Icon = getBlockIcon(schema.type)
          return (
            <Button
              key={schema.type}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted"
              onClick={() => onBlockSelect(schema.type)}
            >
              <Icon className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium text-xs">{schema.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {schema.description}
                </p>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}