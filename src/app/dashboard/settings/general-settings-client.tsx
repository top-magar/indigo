"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, CheckCircle, X, Upload, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { currencyOptions } from "@/shared/currency";
import { updateStoreSettings, updateCurrencySettings, updateStoreSeoSettings } from "./actions";
import type { Tenant } from "@/infrastructure/supabase/types";

interface Props {
  tenant: Tenant;
  userRole: "owner" | "admin" | "staff";
}

export function GeneralSettingsClient({ tenant, userRole }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const canEdit = userRole === "owner" || userRole === "admin";

  const [name, setName] = useState(tenant.name);
  const [description, setDescription] = useState(tenant.description || "");
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "");
  const [currency, setCurrency] = useState(tenant.currency || "USD");

  const seo = (tenant.settings as Record<string, Record<string, string>> | null)?.seo || {};
  const [seoTitle, setSeoTitle] = useState(seo.metaTitle || "");
  const [seoDescription, setSeoDescription] = useState(seo.metaDescription || "");

  const storeUrl = `https://${tenant.slug}.indigo.com`;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      setLogoUrl((await res.json()).url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => startTransition(async () => {
    const storeFd = new FormData();
    storeFd.set("name", name);
    storeFd.set("description", description);
    storeFd.set("logoUrl", logoUrl);

    const seoFd = new FormData();
    seoFd.set("metaTitle", seoTitle);
    seoFd.set("metaDescription", seoDescription);

    const [storeRes, currencyRes, seoRes] = await Promise.all([
      updateStoreSettings(storeFd),
      updateCurrencySettings({ currency, displayCurrency: currency, priceIncludesTax: false }),
      updateStoreSeoSettings(seoFd),
    ]);

    const err = storeRes.error || currencyRes.error || seoRes.error;
    if (err) { toast.error(err); return; }
    toast.success("Settings saved");
    router.refresh();
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Store</h1>
          <p className="text-xs text-muted-foreground">Manage your store details and how it appears online</p>
        </div>
        {canEdit && (
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
            {isPending ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      <div className="rounded-lg border divide-y">

        {/* ── Logo + Name ── */}
        <div className="p-5">
          <div className="flex gap-5">
            {/* Logo */}
            <div className="shrink-0">
              {logoUrl ? (
                <div className="relative size-20 overflow-hidden rounded-xl border group">
                  <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                  {canEdit && (
                    <button onClick={() => setLogoUrl("")} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="size-4 text-white" />
                    </button>
                  )}
                </div>
              ) : (
                <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed hover:border-foreground/20 hover:bg-muted/80 transition-colors">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploading || !canEdit} />
                  {isUploading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : (
                    <>
                      <Upload className="size-4 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">Logo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            {/* Name + Description */}
            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Store Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} disabled={!canEdit} placeholder="A short description of your store" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Store URL ── */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Store URL</p>
            <p className="text-sm text-muted-foreground">{tenant.slug}.indigo.com</p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="size-8" onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success("Copied"); }}>
              <Copy className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" asChild>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" /></a>
            </Button>
          </div>
        </div>

        {/* ── Currency ── */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Currency</p>
            <p className="text-[11px] text-muted-foreground">All prices displayed in this currency</p>
          </div>
          <Select value={currency} onValueChange={setCurrency} disabled={!canEdit}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.symbol} {c.value} — {c.label.replace(` (${c.symbol})`, "")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── SEO ── */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-medium">Search Engine Optimization</h2>
          <p className="text-xs text-muted-foreground">How your store appears in Google search results</p>
        </div>

        <div className="rounded-lg border divide-y">
          <div className="p-5 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Page Title</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{seoTitle.length}/60</span>
              </div>
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={tenant.name} maxLength={60} disabled={!canEdit} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Meta Description</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{seoDescription.length}/160</span>
              </div>
              <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} maxLength={160} disabled={!canEdit} placeholder="A brief description for search engines" />
            </div>
          </div>

          {/* Google Preview */}
          <div className="p-5 bg-muted/30">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
            <div className="space-y-0.5">
              <p className="text-base text-blue-600 font-medium leading-tight truncate">{seoTitle || tenant.name}</p>
              <p className="text-xs text-green-700">{tenant.slug}.indigo.com</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{seoDescription || "No description set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
