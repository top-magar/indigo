"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Palette, Type, Image, Globe, MessageSquare, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateStorefrontSettings, type StorefrontSettings } from "./actions";

const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube", "twitter"] as const;
const THEMES = [
  { value: "minimal", label: "Minimal", desc: "Clean, whitespace-focused" },
  { value: "bold", label: "Bold", desc: "Strong colors, large typography" },
  { value: "classic", label: "Classic", desc: "Traditional e-commerce layout" },
  { value: "modern", label: "Modern", desc: "Sleek with animations" },
  { value: "nepal", label: "Nepal", desc: "Optimized for Nepali market" },
] as const;
const HEADING_FONTS = ["Inter", "Poppins", "Playfair Display", "Montserrat", "Roboto"] as const;
const BODY_FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Nunito"] as const;

export function StorefrontSettingsClient({ initialSettings }: { initialSettings: StorefrontSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [s, setS] = useState(initialSettings);
  const set = <K extends keyof StorefrontSettings>(k: K, v: StorefrontSettings[K]) => setS({ ...s, [k]: v });

  const handleSave = () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(s)) {
      fd.set(k, typeof v === "object" ? JSON.stringify(v) : String(v ?? ""));
    }
    startTransition(async () => {
      const result = await updateStorefrontSettings(fd);
      if (result.error) toast.error(result.error);
      else { toast.success("Storefront settings saved"); router.refresh(); }
    });
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.4px]">Store Appearance</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize how your store looks to customers.</p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
        </Button>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="size-4" />Theme</CardTitle>
          <CardDescription>Choose a layout style for your store</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button key={t.value} onClick={() => set("theme", t.value)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${s.theme === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Palette className="size-4" />Colors</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {([["primaryColor", "Primary"], ["secondaryColor", "Secondary"], ["backgroundColor", "Background"]] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={s[key]} onChange={(e) => set(key, e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={s[key]} onChange={(e) => set(key, e.target.value)}
                    className="font-mono text-xs h-8" maxLength={7} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fonts */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Type className="size-4" />Typography</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Heading Font</Label>
              <Select value={s.headingFont} onValueChange={(v) => set("headingFont", v as typeof s.headingFont)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HEADING_FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Body Font</Label>
              <Select value={s.bodyFont} onValueChange={(v) => set("bodyFont", v as typeof s.bodyFont)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BODY_FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Image className="size-4" />Branding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Logo URL</Label>
            <Input value={s.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Favicon URL</Label>
            <Input value={s.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Hero */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="size-4" />Homepage Hero</CardTitle>
          <CardDescription>The first thing customers see</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input value={s.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} placeholder="Welcome to our store" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Button Text</Label>
              <Input value={s.heroCta} onChange={(e) => set("heroCta", e.target.value)} placeholder="Shop Now" maxLength={30} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Subtitle</Label>
            <Input value={s.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} placeholder="Discover amazing products" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Hero Image URL</Label>
            <Input value={s.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Announcement Bar */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="size-4" />Announcement Bar</CardTitle></CardHeader>
        <CardContent>
          <Input value={s.announcementBar} onChange={(e) => set("announcementBar", e.target.value)}
            placeholder="Free shipping on orders over Rs 1,000!" maxLength={200} />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="size-4" />Contact & Footer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={s.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="support@store.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Phone</Label>
              <Input value={s.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+977 98XXXXXXXX" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Footer Text</Label>
            <Textarea value={s.footerText} onChange={(e) => set("footerText", e.target.value)} placeholder="© 2025 Your Store" rows={2} maxLength={500} />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-sm flex items-center gap-2"><Share2 className="size-4" />Social Links</CardTitle></div>
          <Button variant="outline" size="sm" onClick={() => set("socialLinks", [...s.socialLinks, { platform: "facebook", url: "" }])}>
            <Plus className="size-4 mr-1" />Add
          </Button>
        </CardHeader>
        {s.socialLinks.length > 0 && (
          <CardContent className="space-y-2">
            {s.socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={link.platform} onValueChange={(v) => {
                  const updated = [...s.socialLinks]; updated[i] = { ...link, platform: v as typeof link.platform }; set("socialLinks", updated);
                }}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
                <Input className="flex-1" value={link.url} onChange={(e) => {
                  const updated = [...s.socialLinks]; updated[i] = { ...link, url: e.target.value }; set("socialLinks", updated);
                }} placeholder="https://" />
                <Button variant="ghost" size="icon" onClick={() => set("socialLinks", s.socialLinks.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Search className="size-4" />SEO</CardTitle>
          <CardDescription>How your store appears in Google search results</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Page Title <span className="text-muted-foreground">({s.seoTitle.length}/60)</span></Label>
            <Input value={s.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Your Store — Shop Online in Nepal" maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Meta Description <span className="text-muted-foreground">({s.seoDescription.length}/160)</span></Label>
            <Textarea value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)}
              placeholder="Discover amazing products at great prices. Free shipping across Nepal." rows={2} maxLength={160} />
          </div>
          {/* Preview */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Google Preview</p>
            <p className="text-sm text-blue-600 font-medium truncate">{s.seoTitle || "Your Store"}</p>
            <p className="text-xs text-green-700 truncate">yourstore.indigo.com.np</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{s.seoDescription || "No description set"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
