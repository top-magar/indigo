"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function HeroCenteredSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

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
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                            value={props.description || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.description = e.target.value))}
                            className="mt-1"
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Trusted By</Label>
                        <Switch
                            checked={props.showTrustedBy}
                            onCheckedChange={(checked) => setProp((props: Record<string, unknown>) => (props.showTrustedBy = checked))}
                        />
                    </div>
                    {props.showTrustedBy && (
                        <div>
                            <Label className="text-xs">Trusted By Text</Label>
                            <Input
                                value={props.trustedByText || ""}
                                onChange={(e) => setProp((props: Record<string, unknown>) => (props.trustedByText = e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    )}
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

            <SettingsSection title="Background">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Background Image URL</Label>
                        <Input
                            value={props.backgroundImage || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.backgroundImage = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Overlay Opacity: {props.overlayOpacity}%</Label>
                        <Slider
                            value={[props.overlayOpacity || 50]}
                            onValueChange={([value]: number[]) => setProp((props: Record<string, unknown>) => (props.overlayOpacity = value))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Height</Label>
                        <Select
                            value={props.height || "large"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.height = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="full">Full Screen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <ColorPicker
                        label="Text Color"
                        value={props.textColor || "#ffffff"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.textColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
