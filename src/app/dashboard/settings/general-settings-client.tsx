"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Store, Upload, X, Loader2, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/shared/utils";
import { updateStoreSettings, updateStoreSeoSettings } from "./actions";
import { updateCurrencySettings } from "./currency/actions";
import type { Tenant } from "@/infrastructure/supabase/types";

interface GeneralSettingsClientProps {
  tenant: Tenant;
  userRole: "owner" | "admin" | "staff";
}

export function GeneralSettingsClient({ tenant, userRole }: GeneralSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [name, setName] = useState(tenant.name);
  const [description, setDescription] = useState(tenant.description || "");
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "");
  const [currency, setCurrency] = useState(tenant.currency || "NPR");

  const settings = (tenant.settings as Record<string, Record<string, string>>) || {};
  const seoSettings = settings.seo || {};
  const analyticsSettings = settings.analytics || {};

  const [metaTitle, setMetaTitle] = useState(seoSettings.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(seoSettings.metaDescription || "");
  const [ogImage, setOgImage] = useState(seoSettings.ogImage || "");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(analyticsSettings.googleAnalyticsId || "");
  const [facebookPixelId, setFacebookPixelId] = useState(analyticsSettings.facebookPixelId || "");

  const canEdit = userRole === "owner" || userRole === "admin";

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

  const handleSaveGeneral = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    fd.set("logoUrl", logoUrl);
    startTransition(async () => {
      const [storeResult, currencyResult] = await Promise.all([
        updateStoreSettings(fd),
        updateCurrencySettings({ currency, displayCurrency: currency, priceIncludesTax: false }),
      ]);
      const err = storeResult.error || currencyResult.error;
      err ? toast.error(err) : (toast.success("Settings saved"), router.refresh());
    });
  };

  const handleSaveSeo = () => {
    const fd = new FormData();
    fd.set("metaTitle", metaTitle);
    fd.set("metaDescription", metaDescription);
    fd.set("ogImage", ogImage);
    fd.set("googleAnalyticsId", googleAnalyticsId);
    fd.set("facebookPixelId", facebookPixelId);
    startTransition(async () => {
      const r = await updateStoreSeoSettings(fd);
      r.error ? toast.error(r.error) : (toast.success("SEO settings saved"), router.refresh());
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">General</h1>
        <p className="text-xs text-muted-foreground">Store information and SEO</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2 text-xs">
            <Store className="size-3.5" /> Store
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 text-xs">
            <Search className="size-3.5" /> SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Store Information</CardTitle>
              <CardDescription className="text-xs">Name, description, and logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Store Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Store URL</Label>
                  <div className="flex items-center gap-1 rounded-md border bg-muted/50 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">yoursite.com/store/</span>
                    <span className="font-medium">{tenant.slug}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Logo</Label>
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <div className="relative size-20 overflow-hidden rounded-lg border group">
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                      {canEdit && (
                        <button onClick={() => setLogoUrl("")} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className={cn("flex size-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted", !canEdit && "cursor-not-allowed opacity-50")}>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploading || !canEdit} />
                      {isUploading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : <Upload className="size-5 text-muted-foreground" />}
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">400×400px, PNG or JPG, max 5MB</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Currency</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={!canEdit}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPR">NPR — Nepalese Rupee</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">All prices displayed in this currency</p>
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={handleSaveGeneral} disabled={isPending} size="sm">
                {isPending ? <><Loader2 className="size-3.5 animate-spin mr-1.5" /> Saving...</> : <><CheckCircle className="size-3.5 mr-1.5" /> Save</>}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search Engine Optimization</CardTitle>
              <CardDescription className="text-xs">How your store appears in Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={tenant.name} disabled={!canEdit} maxLength={60} />
                <p className="text-[10px] text-muted-foreground text-right">{metaTitle.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} disabled={!canEdit} maxLength={160} />
                <p className="text-[10px] text-muted-foreground text-right">{metaDescription.length}/160</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] font-medium mb-2">Search Preview</p>
                <p className="text-sm text-blue-600">{metaTitle || tenant.name}</p>
                <p className="text-xs text-green-700">yoursite.com/store/{tenant.slug}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{metaDescription || description || "No description"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Google Analytics ID</Label>
                  <Input value={googleAnalyticsId} onChange={(e) => setGoogleAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX" disabled={!canEdit} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Facebook Pixel ID</Label>
                  <Input value={facebookPixelId} onChange={(e) => setFacebookPixelId(e.target.value)} placeholder="XXXXXXXXXXXXXXXX" disabled={!canEdit} className="font-mono text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={handleSaveSeo} disabled={isPending} size="sm">
                {isPending ? "Saving..." : "Save SEO Settings"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
