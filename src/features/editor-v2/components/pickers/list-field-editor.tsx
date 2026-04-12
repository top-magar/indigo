"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FieldDef } from "../../registry"

interface ListFieldEditorProps {
  value: string
  onChange: (v: string) => void
  listFields: NonNullable<FieldDef["listFields"]>
}

export function ListFieldEditor({ value, onChange, listFields }: ListFieldEditorProps) {
  const items: Record<string, string>[] = (() => { try { return JSON.parse(value) } catch { return [] } })()

  const update = (newItems: Record<string, string>[]) => onChange(JSON.stringify(newItems))

  const addItem = () => {
    const empty: Record<string, string> = {}
    for (const f of listFields) empty[f.key] = ""
    update([...items, empty])
  }

  const removeItem = (index: number) => update(items.filter((_, i) => i !== index))

  const updateItem = (index: number, key: string, val: string) => {
    const copy = items.map((item, i) => i === index ? { ...item, [key]: val } : item)
    update(copy)
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1 items-start p-2 rounded border bg-muted/30">
          <div className="flex-1 flex flex-col gap-1">
            {listFields.map((f) => (
              <Input
                key={f.key}
                value={item[f.key] ?? ""}
                onChange={(e) => updateItem(i, f.key, e.target.value)}
                placeholder={f.label}
                type={f.type === "number" ? "number" : "text"}
                className="h-6 text-xs"
              />
            ))}
          </div>
          <button onClick={() => removeItem(i)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-6 text-xs" onClick={addItem}>
        <Plus className="h-3 w-3 mr-1" />Add Item
      </Button>
    </div>
  )
}
