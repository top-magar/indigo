"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, CheckCircle, X, Upload, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="max-w-3xl space-y-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Store</h1>
        <p className="text-xs text-muted-foreground">Name, branding, currency, and SEO</p>
      </div>

      <div className="space-y-3">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Store Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Store URL</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center h-8 rounded-md border bg-muted/50 px-3 text-xs">
                    <span className="text-muted-foreground">{tenant.slug}.indigo.com</span>
                  </div>
                  <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={() => { navigator.clipboard.writeText(`https://${tenant.slug}.indigo.com`); toast.success("Copied"); }}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} disabled={!canEdit} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Logo</Label>
              <div className="flex items-start gap-4">
                {logoUrl ? (
                  <div className="relative size-16 overflow-hidden rounded-lg border group">
                    <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    {canEdit && (
                      <button onClick={() => setLogoUrl("")} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploading || !canEdit} />
                    {isUploading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Upload className="size-4 text-muted-foreground" />}
                  </label>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">400×400px, PNG or JPG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Currency</CardTitle>
            <CardDescription className="text-xs">All prices displayed in this currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={currency} onValueChange={setCurrency} disabled={!canEdit}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[["NPR", "Nepalese Rupee"], ["USD", "US Dollar"], ["INR", "Indian Rupee"], ["EUR", "Euro"], ["GBP", "British Pound"]].map(([code, label]) => (
                  <SelectItem key={code} value={code}>{code} — {label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SEO</CardTitle>
            <CardDescription className="text-xs">How your store appears in search results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Page Title <span className="text-muted-foreground">({seoTitle.length}/60)</span></Label>
              <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Your Store — Shop Online" maxLength={60} disabled={!canEdit} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Meta Description <span className="text-muted-foreground">({seoDescription.length}/160)</span></Label>
              <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} maxLength={160} disabled={!canEdit} />
            </div>
            <div className="rounded-lg border p-3 bg-muted/30 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Google Preview</p>
              <p className="text-sm text-blue-600 font-medium truncate">{seoTitle || tenant.name}</p>
              <p className="text-xs text-green-700 truncate">{tenant.slug}.indigo.com</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{seoDescription || "No description set"}</p>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending} size="sm">
              {isPending ? <><Loader2 className="size-3.5 animate-spin mr-1.5" /> Saving...</> : <><CheckCircle className="size-3.5 mr-1.5" /> Save</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
