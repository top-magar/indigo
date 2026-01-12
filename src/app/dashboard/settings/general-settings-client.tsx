"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
    Store,
    Upload,
    X,
    Loader2,
    Paintbrush,
    Globe,
    Search,
    Share2,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";
import { updateStoreSettings, updateStoreSeoSettings, updateStoreSocialSettings } from "./actions";
import type { Tenant } from "@/infrastructure/supabase/types";

interface GeneralSettingsClientProps {
    tenant: Tenant;
    userRole: "owner" | "admin" | "staff";
}

const currencies = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
    { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
    { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
    { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "BRL", label: "Brazilian Real (R$)", symbol: "R$" },
    { value: "MXN", label: "Mexican Peso (MX$)", symbol: "MX$" },
];

const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export function GeneralSettingsClient({ tenant, userRole }: GeneralSettingsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // General settings state
    const [name, setName] = useState(tenant.name);
    const [description, setDescription] = useState(tenant.description || "");
    const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "");
    const [primaryColor, setPrimaryColor] = useState(tenant.primary_color);
    const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color);
    const [currency, setCurrency] = useState(tenant.currency);

    // SEO settings state
    const settings = tenant.settings as Record<string, any> || {};
    const seoSettings = settings.seo || {};
    const analyticsSettings = settings.analytics || {};
    const socialSettings = settings.social || {};

    const [metaTitle, setMetaTitle] = useState(seoSettings.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(seoSettings.metaDescription || "");
    const [ogImage, setOgImage] = useState(seoSettings.ogImage || "");
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState(analyticsSettings.googleAnalyticsId || "");
    const [facebookPixelId, setFacebookPixelId] = useState(analyticsSettings.facebookPixelId || "");

    // Social settings state
    const [facebook, setFacebook] = useState(socialSettings.facebook || "");
    const [instagram, setInstagram] = useState(socialSettings.instagram || "");
    const [twitter, setTwitter] = useState(socialSettings.twitter || "");
    const [tiktok, setTiktok] = useState(socialSettings.tiktok || "");
    const [youtube, setYoutube] = useState(socialSettings.youtube || "");
    const [linkedin, setLinkedin] = useState(socialSettings.linkedin || "");

    const canEdit = userRole === "owner" || userRole === "admin";

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setLogoUrl(data.url);
            toast.success("Logo uploaded");
        } catch {
            toast.error("Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveGeneral = async () => {
        const formData = new FormData();
        formData.set("name", name);
        formData.set("description", description);
        formData.set("logoUrl", logoUrl);
        formData.set("primaryColor", primaryColor);
        formData.set("secondaryColor", secondaryColor);
        formData.set("currency", currency);

        startTransition(async () => {
            const result = await updateStoreSettings(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Store settings saved");
                router.refresh();
            }
        });
    };

    const handleSaveSeo = async () => {
        const formData = new FormData();
        formData.set("metaTitle", metaTitle);
        formData.set("metaDescription", metaDescription);
        formData.set("ogImage", ogImage);
        formData.set("googleAnalyticsId", googleAnalyticsId);
        formData.set("facebookPixelId", facebookPixelId);

        startTransition(async () => {
            const result = await updateStoreSeoSettings(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("SEO settings saved");
                router.refresh();
            }
        });
    };

    const handleSaveSocial = async () => {
        const formData = new FormData();
        formData.set("facebook", facebook);
        formData.set("instagram", instagram);
        formData.set("twitter", twitter);
        formData.set("tiktok", tiktok);
        formData.set("youtube", youtube);
        formData.set("linkedin", linkedin);

        startTransition(async () => {
            const result = await updateStoreSocialSettings(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Social links saved");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
                <p className="text-muted-foreground">
                    Manage your store information, branding, and preferences
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="general" className="gap-2">
                        <Store className="w-4 h-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="gap-2">
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">SEO</span>
                    </TabsTrigger>
                    <TabsTrigger value="social" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Social</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                    {/* Store Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                Store Information
                            </CardTitle>
                            <CardDescription>Basic information about your store</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Store Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Store"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Store URL</Label>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 h-10">
                                        <span className="text-sm text-muted-foreground">yoursite.com/store/</span>
                                        <span className="text-sm font-medium">{tenant.slug}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell customers about your store..."
                                    rows={3}
                                    disabled={!canEdit}
                                />
                                <p className="text-xs text-muted-foreground">
                                    This appears on your storefront and in search results
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Paintbrush className="w-5 h-5" />
                                Branding
                            </CardTitle>
                            <CardDescription>Customize your store appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo */}
                            <div className="space-y-2">
                                <Label>Store Logo</Label>
                                <div className="flex items-start gap-4">
                                    {logoUrl ? (
                                        <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted group">
                                            <Image src={logoUrl} alt="Store logo" fill className="object-cover" />
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl("")}
                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <label className={cn(
                                            "flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted",
                                            !canEdit && "cursor-not-allowed opacity-50"
                                        )}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                                disabled={isUploading || !canEdit}
                                            />
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            ) : (
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </label>
                                    )}
                                    <div className="text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">Upload your logo</p>
                                        <p>Recommended: 400x400px, PNG or JPG</p>
                                        <p>Max file size: 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Colors */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="primary-color">Primary Color</Label>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="h-10 w-14 cursor-pointer p-1 border-2"
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <Input
                                            id="primary-color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1 font-mono"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Used for buttons and links</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secondary-color">Secondary Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="h-10 w-14 cursor-pointer p-1 border-2"
                                            disabled={!canEdit}
                                        />
                                        <Input
                                            id="secondary-color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            placeholder="#ffffff"
                                            className="flex-1 font-mono"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Used for accents and backgrounds</p>
                                </div>
                            </div>

                            {/* Color Preview */}
                            <div className="p-4 rounded-lg border bg-muted/30">
                                <p className="text-sm font-medium mb-3">Preview</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Primary Button
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                                        style={{ borderColor: primaryColor, color: primaryColor }}
                                    >
                                        Outline Button
                                    </button>
                                    <div
                                        className="px-4 py-2 rounded-lg text-sm"
                                        style={{ backgroundColor: secondaryColor, color: primaryColor }}
                                    >
                                        Secondary BG
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Regional Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Regional Settings
                            </CardTitle>
                            <CardDescription>Currency and localization preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency} disabled={!canEdit}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-mono w-6">{c.symbol}</span>
                                                        {c.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        All prices will be displayed in this currency
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    {canEdit && (
                        <div className="flex justify-end">
                            <Button onClick={handleSaveGeneral} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Search Engine Optimization
                            </CardTitle>
                            <CardDescription>Improve your store visibility in search results</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={tenant.name}
                                    disabled={!canEdit}
                                    maxLength={60}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Appears in browser tabs and search results</span>
                                    <span>{metaTitle.length}/60</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder="Describe your store in 160 characters or less..."
                                    rows={3}
                                    disabled={!canEdit}
                                    maxLength={160}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Appears in search engine results</span>
                                    <span>{metaDescription.length}/160</span>
                                </div>
                            </div>

                            {/* SEO Preview */}
                            <div className="p-4 rounded-lg border bg-muted/30">
                                <p className="text-sm font-medium mb-3">Search Preview</p>
                                <div className="space-y-1">
                                    <p className="text-[var(--ds-blue-700)] text-lg hover:underline cursor-pointer">
                                        {metaTitle || tenant.name}
                                    </p>
                                    <p className="text-[var(--ds-green-800)] text-sm">yoursite.com/store/{tenant.slug}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {metaDescription || description || "No description provided"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics & Tracking</CardTitle>
                            <CardDescription>Connect your analytics tools</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                                    <Input
                                        id="googleAnalyticsId"
                                        value={googleAnalyticsId}
                                        onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                        placeholder="G-XXXXXXXXXX"
                                        disabled={!canEdit}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                                    <Input
                                        id="facebookPixelId"
                                        value={facebookPixelId}
                                        onChange={(e) => setFacebookPixelId(e.target.value)}
                                        placeholder="XXXXXXXXXXXXXXXX"
                                        disabled={!canEdit}
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {canEdit && (
                        <div className="flex justify-end">
                            <Button onClick={handleSaveSeo} disabled={isPending}>
                                {isPending ? "Saving..." : "Save SEO Settings"}
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Social Tab */}
                <TabsContent value="social" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Social Media Links
                            </CardTitle>
                            <CardDescription>Connect your social media profiles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        value={facebook}
                                        onChange={(e) => setFacebook(e.target.value)}
                                        placeholder="https://facebook.com/yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="https://instagram.com/yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter / X</Label>
                                    <Input
                                        id="twitter"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        placeholder="https://twitter.com/yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tiktok">TikTok</Label>
                                    <Input
                                        id="tiktok"
                                        value={tiktok}
                                        onChange={(e) => setTiktok(e.target.value)}
                                        placeholder="https://tiktok.com/@yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="youtube">YouTube</Label>
                                    <Input
                                        id="youtube"
                                        value={youtube}
                                        onChange={(e) => setYoutube(e.target.value)}
                                        placeholder="https://youtube.com/@yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="https://linkedin.com/company/yourstore"
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                These links will appear in your store footer and can be used for social sharing
                            </p>
                        </CardContent>
                    </Card>

                    {canEdit && (
                        <div className="flex justify-end">
                            <Button onClick={handleSaveSocial} disabled={isPending}>
                                {isPending ? "Saving..." : "Save Social Links"}
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}