"use client"

import { useEditorStore } from "../store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { History, Undo2 } from "lucide-react"

export function HistoryPanel({ children }: { children: React.ReactNode }) {
  const history = useEditorStore((s) => s.history)
  const undo = () => useEditorStore.temporal.getState().undo()

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" className="w-56 p-0 max-h-64 overflow-auto">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b text-xs font-medium">
          <History className="h-3 w-3" />History
        </div>
        {history.length === 0 ? (
          <p className="text-[10px] text-muted-foreground p-3">No changes yet</p>
        ) : (
          <div className="flex flex-col">
            {[...history].reverse().map((entry, i) => (
              <div key={entry.timestamp + i} className={`flex items-center justify-between px-3 py-1.5 text-[10px] ${i === 0 ? "bg-blue-500/10 text-blue-400" : "text-muted-foreground"}`}>
                <div className="flex flex-col">
                  <span>{entry.label}</span>
                  <span className="text-[8px] opacity-60">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
                {i > 0 && (
                  <button onClick={() => { for (let j = 0; j < i; j++) undo() }} className="p-0.5 hover:bg-white/10 rounded">
                    <Undo2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
