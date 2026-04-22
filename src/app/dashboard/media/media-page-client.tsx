"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Search, Grid3X3, List, Trash2, X, File, Video, ImageIcon, Loader2, Download, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";
import { deleteAsset, bulkDeleteAssets } from "@/app/dashboard/media/actions";

// ─── Types ────────────────────────────────────────────────

interface MediaPageClientProps {
  initialAssets: MediaAsset[];
  totalAssets: number;
}

type ViewMode = "grid" | "list";

// ─── Main Component ───────────────────────────────────────

export function MediaPageClient({ initialAssets, totalAssets }: MediaPageClientProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? assets.filter(a => a.filename.toLowerCase().includes(search.toLowerCase()))
    : assets;

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        // Add to local state (simplified — real app would refetch)
        const newAsset: MediaAsset = {
          id: crypto.randomUUID(),
          tenantId: "",
          folderId: null,
          filename: file.name,
          originalFilename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          width: null,
          height: null,
          blobUrl: data.url,
          cdnUrl: data.url,
          thumbnailUrl: null,
          altText: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        setAssets(prev => [newAsset, ...prev]);
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteAssets(Array.from(selected));
      setAssets(prev => prev.filter(a => !selected.has(a.id)));
      setSelected(new Set());
      toast.success(`Deleted ${selected.size} files`);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Media</h1>
          <p className="text-xs text-muted-foreground">{assets.length} file{assets.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Upload
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" className="pl-8 h-8 text-xs" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3" />
            </button>
          )}
        </div>
        <div className="flex h-8 border rounded-md overflow-hidden">
          <button onClick={() => setView("grid")} className={cn("flex items-center justify-center w-8 h-full", view === "grid" ? "bg-accent" : "hover:bg-accent/50")}>
            <Grid3X3 className="size-3.5" />
          </button>
          <div className="w-px bg-border" />
          <button onClick={() => setView("list")} className={cn("flex items-center justify-center w-8 h-full", view === "list" ? "bg-accent" : "hover:bg-accent/50")}>
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{selected.size} selected</span>
          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={handleBulkDelete}>
            <Trash2 className="size-3" /> Delete
          </Button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <ImageIcon className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">{search ? "No results" : "No files yet"}</p>
          <p className="text-xs text-muted-foreground mb-4">{search ? `Nothing matches "${search}"` : "Upload product images to get started"}</p>
          {!search && (
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" /> Upload Files
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(asset => (
            <GridCard key={asset.id} asset={asset} selected={selected.has(asset.id)} onToggle={() => toggle(asset.id)} onClick={() => setPreview(asset)} onDelete={() => handleDelete(asset.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {filtered.map(asset => (
            <ListRow key={asset.id} asset={asset} selected={selected.has(asset.id)} onToggle={() => toggle(asset.id)} onClick={() => setPreview(asset)} onDelete={() => handleDelete(asset.id)} />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={open => !open && setPreview(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {preview && <PreviewContent asset={preview} onDelete={() => { handleDelete(preview.id); setPreview(null); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────

function GridCard({ asset, selected, onToggle, onClick, onDelete }: {
  asset: MediaAsset; selected: boolean; onToggle: () => void; onClick: () => void; onDelete: () => void;
}) {
  const type = getFileTypeCategory(asset.mimeType);
  return (
    <div className={cn("group rounded-lg border overflow-hidden cursor-pointer transition-colors", selected && "ring-2 ring-foreground")} onClick={onClick}>
      <div className="aspect-square bg-muted relative flex items-center justify-center">
        {type === "image" ? (
          <img src={asset.thumbnailUrl || asset.cdnUrl} alt={asset.altText || asset.filename} className="size-full object-cover" loading="lazy" />
        ) : type === "video" ? (
          <Video className="size-6 text-muted-foreground" />
        ) : (
          <File className="size-6 text-muted-foreground" />
        )}
        <div className={cn("absolute top-2 left-2 transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => { e.stopPropagation(); onToggle(); }}>
          <Checkbox checked={selected} className="size-4 bg-background" />
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{asset.filename}</p>
        <p className="text-[10px] text-muted-foreground">{formatFileSize(asset.sizeBytes)}</p>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────

function ListRow({ asset, selected, onToggle, onClick, onDelete }: {
  asset: MediaAsset; selected: boolean; onToggle: () => void; onClick: () => void; onDelete: () => void;
}) {
  const type = getFileTypeCategory(asset.mimeType);
  return (
    <div className={cn("group flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors", selected ? "bg-accent" : "hover:bg-accent/50")} onClick={onClick}>
      <div className={cn("transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => { e.stopPropagation(); onToggle(); }}>
        <Checkbox checked={selected} className="size-4" />
      </div>
      <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {type === "image" ? (
          <img src={asset.thumbnailUrl || asset.cdnUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : type === "video" ? <Video className="size-4 text-muted-foreground" /> : <File className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{asset.filename}</p>
        <p className="text-[11px] text-muted-foreground">{formatFileSize(asset.sizeBytes)}{asset.width && asset.height && ` · ${asset.width}×${asset.height}`}</p>
      </div>
      <span className="text-[10px] text-muted-foreground capitalize shrink-0">{type}</span>
      <div className={cn("transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(asset.cdnUrl); toast.success("Copied"); }} className="text-xs gap-2"><Copy className="size-3.5" /> Copy URL</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { const a = document.createElement("a"); a.href = asset.cdnUrl; a.download = asset.originalFilename; a.click(); }} className="text-xs gap-2"><Download className="size-3.5" /> Download</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-xs gap-2 text-destructive focus:text-destructive"><Trash2 className="size-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Preview ──────────────────────────────────────────────

function PreviewContent({ asset, onDelete }: { asset: MediaAsset; onDelete: () => void }) {
  const type = getFileTypeCategory(asset.mimeType);
  return (
    <div className="flex flex-col md:flex-row max-h-[80vh]">
      {/* Preview */}
      <div className="flex-1 bg-muted/30 flex items-center justify-center min-h-[300px] p-4">
        {type === "image" ? (
          <img src={asset.cdnUrl} alt={asset.altText || asset.filename} className="max-w-full max-h-[70vh] object-contain rounded-md" />
        ) : type === "video" ? (
          <video src={asset.cdnUrl} controls className="max-w-full max-h-[70vh] rounded-md"><track kind="captions" /></video>
        ) : (
          <div className="text-center">
            <File className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">{asset.filename}</p>
          </div>
        )}
      </div>
      {/* Info sidebar */}
      <div className="w-full md:w-72 border-t md:border-t-0 md:border-l p-4 space-y-4 overflow-y-auto">
        <div>
          <p className="text-sm font-medium break-all">{asset.filename}</p>
          <p className="text-xs text-muted-foreground mt-1">{asset.mimeType} · {formatFileSize(asset.sizeBytes)}</p>
          {asset.width && asset.height && <p className="text-xs text-muted-foreground">{asset.width} × {asset.height}px</p>}
          <p className="text-xs text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="space-y-1.5">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => { navigator.clipboard.writeText(asset.cdnUrl); toast.success("Copied"); }}>
            <Copy className="size-3.5" /> Copy URL
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => { const a = document.createElement("a"); a.href = asset.cdnUrl; a.download = asset.originalFilename; a.click(); }}>
            <Download className="size-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
