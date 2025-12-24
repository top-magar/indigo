"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function HeroSplitSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    return (
        <div className="space-y-4">
            <SettingsSection title="Content">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Badge</Label>
                        <Switch
                            checked={props.showBadge}
                            onCheckedChange={(checked) => setProp((props: Record<string, unknown>) => (props.showBadge = checked))}
                        />
                    </div>
                    {props.showBadge && (
                        <div>
                            <Label className="text-xs">Badge Text</Label>
                            <Input
                                value={props.badgeText || ""}
                                onChange={(e) => setProp((props: Record<string, unknown>) => (props.badgeText = e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    )}
                    <div>
                        <Label className="text-xs">Subheading</Label>
                        <Input
                            value={props.subheading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.subheading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Heading</Label>
                        <Input
                            value={props.heading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.heading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                            value={props.description || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.description = e.target.value))}
                            className="mt-1"
                            rows={3}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Buttons">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Primary Button Text</Label>
                        <Input
                            value={props.primaryButtonText || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.primaryButtonText = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Primary Button URL</Label>
                        <Input
                            value={props.primaryButtonUrl || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.primaryButtonUrl = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Secondary Button Text</Label>
                        <Input
                            value={props.secondaryButtonText || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.secondaryButtonText = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Secondary Button URL</Label>
                        <Input
                            value={props.secondaryButtonUrl || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.secondaryButtonUrl = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Image">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Image URL</Label>
                        <Input
                            value={props.imageSrc || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.imageSrc = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Image Alt Text</Label>
                        <Input
                            value={props.imageAlt || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.imageAlt = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Image Position</Label>
                        <Select
                            value={props.imagePosition || "right"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.imagePosition = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                        </Select>
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
                    <ColorPicker
                        label="Text Color"
                        value={props.textColor || "#0f172a"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.textColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
