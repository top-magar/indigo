"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Folder01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  getEditorCollections,
  getEditorCollectionById,
  type EditorCollection,
} from "@/app/(editor)/storefront/data-actions"
import type { CollectionField as CollectionFieldConfig } from "../types"

interface CollectionFieldProps {
  config: CollectionFieldConfig
  value: string
  onChange: (value: string) => void
}

export function CollectionField({ config, value, onChange }: CollectionFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [collections, setCollections] = useState<EditorCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<EditorCollection | null>(
    null
  )
  const [isPending, startTransition] = useTransition()
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)

  // Fetch collections when dialog opens
  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const data = await getEditorCollections()
        setCollections(data)
      })
    }
  }, [open])

  // Fetch selected collection info on mount
  useEffect(() => {
    if (value && !selectedCollection) {
      setIsLoadingSelected(true)
      getEditorCollectionById(value)
        .then((collection) => {
          if (collection) setSelectedCollection(collection)
        })
        .finally(() => setIsLoadingSelected(false))
    }
  }, [value, selectedCollection])

  // Search collections
  const handleSearch = useCallback((query: string) => {
    setSearch(query)
    startTransition(async () => {
      const data = await getEditorCollections(query || undefined)
      setCollections(data)
    })
  }, [])

  const filteredCollections = search
    ? collections.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : collections

  const handleSelect = (collection: EditorCollection) => {
    onChange(collection.id)
    setSelectedCollection(collection)
    setOpen(false)
  }

  const handleClear = () => {
    onChange("")
    setSelectedCollection(null)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-2 px-3"
            disabled={isLoadingSelected}
          >
            {isLoadingSelected ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : selectedCollection ? (
              <div className="flex items-center gap-3 w-full">
                {selectedCollection.image ? (
                  <img
                    src={selectedCollection.image}
                    alt={selectedCollection.name}
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={Folder01Icon}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {selectedCollection.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCollection.productCount} products
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={Folder01Icon} className="h-4 w-4" />
                <span>Select a collection...</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search collections..."
                className="pl-9"
              />
              {isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
                />
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {isPending && collections.length === 0 ? (
                <div className="space-y-2 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <HugeiconsIcon
                    icon={Folder01Icon}
                    className="h-10 w-10 text-muted-foreground/50 mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {search ? "No collections found" : "No collections available"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search
                      ? "Try a different search term"
                      : "Create collections in the dashboard first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {filteredCollections.map((collection) => (
                    <button
                      key={collection.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                        value === collection.id
                          ? "bg-primary/10 ring-1 ring-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(collection)}
                    >
                      {collection.image ? (
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="h-10 w-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                          <HugeiconsIcon
                            icon={Folder01Icon}
                            className="h-5 w-5 text-muted-foreground"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {collection.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {collection.productCount} products
                        </p>
                      </div>
                      {collection.description && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {collection.description.slice(0, 20)}
                          {collection.description.length > 20 ? "..." : ""}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
