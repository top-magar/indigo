"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function CTABannerSettings() {
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
                            rows={2}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Buttons">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Primary Button Text</Label>
                        <Input
                            value={props.buttonText || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.buttonText = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Primary Button URL</Label>
                        <Input
                            value={props.buttonUrl || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.buttonUrl = e.target.value))}
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

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Layout</Label>
                        <Select
                            value={props.layout || "centered"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.layout = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="centered">Centered</SelectItem>
                                <SelectItem value="split">Split</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Background">
                <div className="space-y-3">
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#0f172a"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
                    <div>
                        <Label className="text-xs">Background Image URL</Label>
                        <Input
                            value={props.backgroundImage || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.backgroundImage = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    {props.backgroundImage && (
                        <div>
                            <Label className="text-xs">Overlay Opacity: {props.overlayOpacity}%</Label>
                            <Slider
                                value={[props.overlayOpacity || 0]}
                                onValueChange={([value]: number[]) => setProp((props: Record<string, unknown>) => (props.overlayOpacity = value))}
                                min={0}
                                max={100}
                                step={5}
                                className="mt-2"
                            />
                        </div>
                    )}
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
