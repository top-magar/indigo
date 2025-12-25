"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Cancel01Icon,
    PaintBrushIcon,
    TextIcon,
    LayoutTopIcon,
    CodeIcon,
    Loading03Icon,
    CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { StoreTheme, ThemeColors, ThemeTypography, ThemeLayout } from "@/types/page-builder";
import { updateStoreTheme } from "../actions";

interface ThemeEditorPanelProps {
    theme: StoreTheme | null;
    onClose: () => void;
}

const DEFAULT_COLORS: ThemeColors = {
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#3b82f6",
    background: "#ffffff",
    foreground: "#000000",
    muted: "#f4f4f5",
    mutedForeground: "#71717a",
};

const DEFAULT_TYPOGRAPHY: ThemeTypography = {
    headingFont: "Inter",
    bodyFont: "Inter",
    baseFontSize: 16,
};

const DEFAULT_LAYOUT: ThemeLayout = {
    maxWidth: "1280px",
    headerStyle: "default",
    footerStyle: "default",
};

const FONT_OPTIONS = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
    { value: "Nunito", label: "Nunito" },
];

const MAX_WIDTH_OPTIONS = [
    { value: "1024px", label: "Narrow (1024px)" },
    { value: "1280px", label: "Default (1280px)" },
    { value: "1440px", label: "Wide (1440px)" },
    { value: "1600px", label: "Extra Wide (1600px)" },
    { value: "100%", label: "Full Width" },
];


interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer shadow-sm"
                    style={{ backgroundColor: value }}
                >
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-24 h-8 text-xs font-mono uppercase"
                />
            </div>
        </div>
    );
}

export function ThemeEditorPanel({ theme, onClose }: ThemeEditorPanelProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [colors, setColors] = useState<ThemeColors>(theme?.colors || DEFAULT_COLORS);
    const [typography, setTypography] = useState<ThemeTypography>(theme?.typography || DEFAULT_TYPOGRAPHY);
    const [layout, setLayout] = useState<ThemeLayout>(theme?.layout || DEFAULT_LAYOUT);
    const [customCss, setCustomCss] = useState(theme?.custom_css || "");
    const [hasChanges, setHasChanges] = useState(false);

    const updateColor = (key: keyof ThemeColors, value: string) => {
        setColors((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const updateTypography = (key: keyof ThemeTypography, value: string | number) => {
        setTypography((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const updateLayout = (key: keyof ThemeLayout, value: string) => {
        setLayout((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateStoreTheme({
                colors,
                typography,
                layout,
                custom_css: customCss || undefined,
            });

            if (result.success) {
                setHasChanges(false);
                toast.success("Theme saved successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save theme");
            }
        });
    };

    const handleReset = () => {
        setColors(DEFAULT_COLORS);
        setTypography(DEFAULT_TYPOGRAPHY);
        setLayout(DEFAULT_LAYOUT);
        setCustomCss("");
        setHasChanges(true);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
                        <HugeiconsIcon icon={PaintBrushIcon} className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold">Theme Editor</h2>
                        <p className="text-xs text-muted-foreground">Customize your store appearance</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <Tabs defaultValue="colors" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-11 shrink-0">
                    <TabsTrigger
                        value="colors"
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-chart-1 rounded-none"
                    >
                        <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4" />
                        Colors
                    </TabsTrigger>
                    <TabsTrigger
                        value="typography"
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-chart-1 rounded-none"
                    >
                        <HugeiconsIcon icon={TextIcon} className="h-4 w-4" />
                        Typography
                    </TabsTrigger>
                    <TabsTrigger
                        value="layout"
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-chart-1 rounded-none"
                    >
                        <HugeiconsIcon icon={LayoutTopIcon} className="h-4 w-4" />
                        Layout
                    </TabsTrigger>
                    <TabsTrigger
                        value="css"
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-chart-1 rounded-none"
                    >
                        <HugeiconsIcon icon={CodeIcon} className="h-4 w-4" />
                        CSS
                    </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                    <TabsContent value="colors" className="p-4 space-y-6 mt-0">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Brand Colors</h3>
                                <p className="text-xs text-muted-foreground">Primary colors used throughout your store</p>
                            </div>
                            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                                <ColorPicker label="Primary" value={colors.primary} onChange={(v) => updateColor("primary", v)} />
                                <ColorPicker label="Secondary" value={colors.secondary} onChange={(v) => updateColor("secondary", v)} />
                                <ColorPicker label="Accent" value={colors.accent} onChange={(v) => updateColor("accent", v)} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Background & Text</h3>
                                <p className="text-xs text-muted-foreground">Base colors for backgrounds and text</p>
                            </div>
                            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                                <ColorPicker label="Background" value={colors.background} onChange={(v) => updateColor("background", v)} />
                                <ColorPicker label="Foreground" value={colors.foreground} onChange={(v) => updateColor("foreground", v)} />
                                <ColorPicker label="Muted" value={colors.muted} onChange={(v) => updateColor("muted", v)} />
                                <ColorPicker label="Muted Text" value={colors.mutedForeground} onChange={(v) => updateColor("mutedForeground", v)} />
                            </div>
                        </div>

                        {/* Color Preview */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Preview</h3>
                            <div
                                className="p-6 rounded-xl border border-border"
                                style={{ backgroundColor: colors.background }}
                            >
                                <h4 className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
                                    Sample Heading
                                </h4>
                                <p className="text-sm mb-4" style={{ color: colors.mutedForeground }}>
                                    This is how your text will look with the selected colors.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{ backgroundColor: colors.primary, color: colors.secondary }}
                                    >
                                        Primary Button
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-medium border"
                                        style={{ borderColor: colors.accent, color: colors.accent }}
                                    >
                                        Accent Button
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="typography" className="p-4 space-y-6 mt-0">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Font Family</h3>
                                <p className="text-xs text-muted-foreground">Choose fonts for headings and body text</p>
                            </div>
                            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border">
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Heading Font</Label>
                                    <Select
                                        value={typography.headingFont}
                                        onValueChange={(v) => updateTypography("headingFont", v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FONT_OPTIONS.map((font) => (
                                                <SelectItem key={font.value} value={font.value}>
                                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Body Font</Label>
                                    <Select
                                        value={typography.bodyFont}
                                        onValueChange={(v) => updateTypography("bodyFont", v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FONT_OPTIONS.map((font) => (
                                                <SelectItem key={font.value} value={font.value}>
                                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Base Font Size</h3>
                                <p className="text-xs text-muted-foreground">Default text size in pixels</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Size</span>
                                    <span className="text-sm font-medium">{typography.baseFontSize}px</span>
                                </div>
                                <Slider
                                    value={[typography.baseFontSize]}
                                    onValueChange={([v]) => updateTypography("baseFontSize", v)}
                                    min={12}
                                    max={24}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Typography Preview */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Preview</h3>
                            <div className="p-6 rounded-xl border border-border bg-background">
                                <h4
                                    className="text-2xl font-bold mb-2"
                                    style={{ fontFamily: typography.headingFont }}
                                >
                                    Heading Example
                                </h4>
                                <p
                                    className="text-muted-foreground"
                                    style={{
                                        fontFamily: typography.bodyFont,
                                        fontSize: `${typography.baseFontSize}px`,
                                    }}
                                >
                                    This is how your body text will appear with the selected font and size settings.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="layout" className="p-4 space-y-6 mt-0">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Content Width</h3>
                                <p className="text-xs text-muted-foreground">Maximum width of your store content</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                <Select
                                    value={layout.maxWidth}
                                    onValueChange={(v) => updateLayout("maxWidth", v)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MAX_WIDTH_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Header Style</h3>
                                <p className="text-xs text-muted-foreground">Choose your store header layout</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(["default", "centered", "minimal"] as const).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => updateLayout("headerStyle", style)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all text-center",
                                            layout.headerStyle === style
                                                ? "border-chart-1 bg-chart-1/5"
                                                : "border-border hover:border-muted-foreground/30"
                                        )}
                                    >
                                        <div className="w-full h-8 rounded bg-muted mb-2" />
                                        <span className="text-xs font-medium capitalize">{style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Footer Style</h3>
                                <p className="text-xs text-muted-foreground">Choose your store footer layout</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(["default", "minimal", "expanded"] as const).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => updateLayout("footerStyle", style)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all text-center",
                                            layout.footerStyle === style
                                                ? "border-chart-1 bg-chart-1/5"
                                                : "border-border hover:border-muted-foreground/30"
                                        )}
                                    >
                                        <div className="w-full h-6 rounded bg-muted mb-2" />
                                        <span className="text-xs font-medium capitalize">{style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="css" className="p-4 space-y-4 mt-0">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Custom CSS</h3>
                            <p className="text-xs text-muted-foreground">
                                Add custom styles to override default theme settings
                            </p>
                        </div>
                        <Textarea
                            value={customCss}
                            onChange={(e) => {
                                setCustomCss(e.target.value);
                                setHasChanges(true);
                            }}
                            placeholder={`/* Custom CSS */\n.store-header {\n  /* your styles */\n}`}
                            className="min-h-[300px] font-mono text-sm"
                        />
                        <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                            <p className="text-xs text-chart-4">
                                <strong>Note:</strong> Custom CSS is applied after all theme styles. Use with caution as it may affect store appearance.
                            </p>
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0 bg-muted/30">
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
                    Reset to Default
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isPending || !hasChanges}
                        className="gap-2"
                    >
                        {isPending ? (
                            <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                        ) : (
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" />
                        )}
                        Save Theme
                    </Button>
                </div>
            </div>
        </div>
    );
}
