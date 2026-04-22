"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Search, Grid3X3, List, Trash2, X, File, Video, ImageIcon, Loader2, Download, Copy, MoreHorizontal, ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          {preview && (
            <PreviewContent
              asset={preview}
              onDelete={() => { handleDelete(preview.id); setPreview(null); }}
              onPrev={filtered.indexOf(preview) > 0 ? () => setPreview(filtered[filtered.indexOf(preview) - 1]) : undefined}
              onNext={filtered.indexOf(preview) < filtered.length - 1 ? () => setPreview(filtered[filtered.indexOf(preview) + 1]) : undefined}
              onAltTextSave={async (alt) => {
                try {
                  const { updateAsset } = await import("./actions");
                  await updateAsset(preview.id, { altText: alt });
                  setAssets(prev => prev.map(a => a.id === preview.id ? { ...a, altText: alt } : a));
                  toast.success("Alt text saved");
                } catch { toast.error("Failed to save"); }
              }}
            />
          )}
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

function PreviewContent({ asset, onDelete, onPrev, onNext, onAltTextSave }: {
  asset: MediaAsset; onDelete: () => void; onPrev?: () => void; onNext?: () => void; onAltTextSave: (alt: string) => void;
}) {
  const type = getFileTypeCategory(asset.mimeType);
  const [altText, setAltText] = useState(asset.altText || "");
  const [editingAlt, setEditingAlt] = useState(false);

  // Reset alt text when asset changes
  useEffect(() => { setAltText(asset.altText || ""); setEditingAlt(false); }, [asset.id, asset.altText]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  return (
    <div className="flex flex-col md:flex-row" style={{ maxHeight: "85vh" }}>
      {/* Preview area */}
      <div className="flex-1 bg-muted/20 flex items-center justify-center min-h-[300px] md:min-h-[400px] p-6 relative group">
        {/* Nav arrows */}
        {onPrev && (
          <button onClick={onPrev} className="absolute left-3 z-10 size-8 rounded-full bg-background/80 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
            <ArrowLeft className="size-4" />
          </button>
        )}
        {onNext && (
          <button onClick={onNext} className="absolute right-3 z-10 size-8 rounded-full bg-background/80 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
            <ArrowRight className="size-4" />
          </button>
        )}

        {type === "image" ? (
          <img src={asset.cdnUrl} alt={asset.altText || asset.filename} className="max-w-full max-h-[75vh] object-contain" />
        ) : type === "video" ? (
          <video src={asset.cdnUrl} controls className="max-w-full max-h-[75vh] rounded-md"><track kind="captions" /></video>
        ) : (
          <div className="text-center">
            <File className="size-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">{asset.filename}</p>
            <p className="text-xs text-muted-foreground mt-1">{asset.mimeType}</p>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l flex flex-col">
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* File info */}
          <div className="space-y-1">
            <p className="text-sm font-medium break-all leading-tight">{asset.filename}</p>
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <p>{formatFileSize(asset.sizeBytes)} · {asset.mimeType.split("/")[1]?.toUpperCase()}</p>
              {asset.width && asset.height && <p>{asset.width} × {asset.height} px</p>}
              <p>{new Date(asset.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>

          {/* Alt text */}
          {type === "image" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-muted-foreground">Alt Text</label>
                {!editingAlt && (
                  <button onClick={() => setEditingAlt(true)} className="text-[10px] text-muted-foreground hover:text-foreground">
                    <Pencil className="size-3 inline" /> Edit
                  </button>
                )}
              </div>
              {editingAlt ? (
                <div className="space-y-1.5">
                  <Input value={altText} onChange={e => setAltText(e.target.value)} placeholder="Describe this image…" className="h-7 text-xs" autoFocus />
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => { onAltTextSave(altText); setEditingAlt(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => { setAltText(asset.altText || ""); setEditingAlt(false); }}>Cancel</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Improves SEO and accessibility</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{asset.altText || "No alt text set"}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" onClick={() => { navigator.clipboard.writeText(asset.cdnUrl); toast.success("Copied"); }}>
            <Copy className="size-3.5" /> Copy URL
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" onClick={() => { const a = document.createElement("a"); a.href = asset.cdnUrl; a.download = asset.originalFilename; a.click(); }}>
            <Download className="size-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
