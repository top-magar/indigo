"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useEditorStore, selectBlocks, selectSelectedBlockId } from "@/features/editor/store"
import { getBlockPath, findBlockById } from "@/types/blocks"
import { BLOCK_NAMES } from "@/features/editor/block-constants"
import { Fragment, useMemo } from "react"

export function BlockBreadcrumb() {
  const blocks = useEditorStore(selectBlocks)
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const selectBlock = useEditorStore((s) => s.selectBlock)

  const crumbs = useMemo(() => {
    if (!selectedBlockId) return []
    const ancestorIds = getBlockPath(blocks, selectedBlockId)
    const allIds = [...ancestorIds, selectedBlockId]
    return allIds.map((id) => {
      const block = findBlockById(blocks, id)
      return block ? { id, label: BLOCK_NAMES[block.type] || block.type } : null
    }).filter(Boolean) as { id: string; label: string }[]
  }, [blocks, selectedBlockId])

  if (crumbs.length <= 1) return null

  return (
    <div className="flex items-center border-b bg-background/80 px-3 h-7 shrink-0">
      <Breadcrumb>
        <BreadcrumbList className="text-xs gap-1">
          {crumbs.map((crumb, i) => (
            <Fragment key={crumb.id}>
              {i > 0 && <BreadcrumbSeparator className="[&>svg]:h-3 [&>svg]:w-3" />}
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage className="text-xs font-medium">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="text-xs cursor-pointer hover:text-foreground"
                    onClick={() => selectBlock(crumb.id)}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
