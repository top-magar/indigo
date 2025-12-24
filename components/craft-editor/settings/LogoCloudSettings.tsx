"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

export function LogoCloudSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    const addLogo = () => {
        const newLogos = [...(props.logos || []), { name: "New Brand", url: "" }];
        setProp((props: Record<string, unknown>) => (props.logos = newLogos));
    };

    const removeLogo = (index: number) => {
        const newLogos = props.logos.filter((_: unknown, i: number) => i !== index);
        setProp((props: Record<string, unknown>) => (props.logos = newLogos));
    };

    return (
        <div className="space-y-4">
            <SettingsSection title="Content">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Heading</Label>
                        <Input
                            value={props.heading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.heading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Logos">
                <div className="space-y-3">
                    {(props.logos || []).map((logo: { name: string; url?: string }, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={logo.name}
                                onChange={(e) => {
                                    const newLogos = [...props.logos];
                                    newLogos[index] = { ...logo, name: e.target.value };
                                    setProp((props: Record<string, unknown>) => (props.logos = newLogos));
                                }}
                                placeholder="Brand name"
                                className="flex-1"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive"
                                onClick={() => removeLogo(index)}
                            >
                                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addLogo}
                    >
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
                        Add Logo
                    </Button>
                </div>
            </SettingsSection>

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Layout</Label>
                        <Select
                            value={props.layout || "grid"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.layout = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="inline">Inline</SelectItem>
                                <SelectItem value="marquee">Marquee (Scrolling)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Grayscale Effect</Label>
                        <Switch
                            checked={props.grayscale}
                            onCheckedChange={(checked) => setProp((props: Record<string, unknown>) => (props.grayscale = checked))}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#ffffff"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
