"use client";

import { useState } from "react";
import { updateThemeSettings } from "./actions";
import { type ThemeConfig, defaultThemeConfig } from "@/features/editor/lib/theme-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ThemeSettingsProps {
  projectId: string;
  initialTheme?: Partial<ThemeConfig>;
}

export function ThemeSettings({ projectId, initialTheme }: ThemeSettingsProps) {
  const [theme, setTheme] = useState<ThemeConfig>({ ...defaultThemeConfig, ...(initialTheme || {}) } as ThemeConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: keyof ThemeConfig, value: string) => {
    setTheme((prev: ThemeConfig) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateThemeSettings(projectId, theme);
      toast.success("Theme settings saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Theme</CardTitle>
        <CardDescription>
          These settings will apply globally to your storefront and editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.primaryColor || '#10b981'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.primaryColor || '#10b981'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.textColor || '#111827'}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.textColor || '#111827'}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Input
              type="text"
              value={theme.borderRadius || '8px'}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              placeholder="e.g. 8px, 0.5rem"
            />
          </div>

          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Select value={theme.headingFont || 'Inter'} onValueChange={(v) => handleChange('headingFont', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Outfit">Outfit</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Merriweather">Merriweather</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Body Font</Label>
            <Select value={theme.bodyFont || 'Inter'} onValueChange={(v) => handleChange('bodyFont', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Outfit">Outfit</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lora">Lora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Color Mode</Label>
            <Select value={theme.mode || 'light'} onValueChange={(v: 'light' | 'dark') => handleChange('mode', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto mt-4">
          {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
