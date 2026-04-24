"use client";

import { useState, useRef } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils";
import { uploadEditorAsset } from "../../../lib/upload";
import { MediaPicker } from "@/features/media/components/media-picker";
import { toast } from "sonner";

export function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadEditorAsset(fd);
    setUploading(false);
    if ('url' in res) onChange(res.url);
    else toast.error('error' in res ? res.error : 'Upload failed');
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-lg border border-sidebar-border overflow-hidden">
          <img src={value} alt="" className="w-full h-28 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => ref.current?.click()} className="size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <MIcon name="cloud_upload" size={14} />
            </button>
            <button onClick={() => setPickerOpen(true)} className="size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <MIcon name="image" size={14} />
            </button>
            <button onClick={() => onChange('')} className="size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-red-500/50 transition-colors">
              <MIcon name="delete" size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            onClick={() => ref.current?.click()}
            className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 cursor-pointer transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-sidebar-border/50 hover:border-primary/30 hover:bg-muted/30",
              uploading && "opacity-50 pointer-events-none"
            )}>
            <MIcon name={uploading ? "hourglass_empty" : "cloud_upload"} size={20} className={cn("text-muted-foreground/40", uploading && "animate-spin")} />
            <p className="text-[10px] text-muted-foreground/40">{uploading ? "Uploading..." : "Drop image or click to upload"}</p>
          </div>
          <button onClick={() => setPickerOpen(true)} className="flex w-full items-center justify-center gap-1 h-7 rounded-md border border-sidebar-border text-[10px] text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <MIcon name="image" size={12} /> Browse Media Library
          </button>
        </div>
      )}
      <Input ref={ref as unknown as React.Ref<HTMLInputElement>} type="file" accept="image/*,video/mp4" className="hidden"
        onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleUpload(f); }} />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[10px] font-mono text-muted-foreground" placeholder="or paste URL..." />
      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(assets) => { if (assets[0]?.cdnUrl) onChange(assets[0].cdnUrl); setPickerOpen(false); }} />
    </div>
  );
}
