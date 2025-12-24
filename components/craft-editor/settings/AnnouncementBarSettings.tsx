"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function AnnouncementBarSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    return (
        <div className="space-y-4">
            <SettingsSection title="Content">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Text</Label>
                        <Input
                            value={props.text || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.text = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Link Text</Label>
                        <Input
                            value={props.linkText || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.linkText = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Link URL</Label>
                        <Input
                            value={props.linkUrl || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.linkUrl = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Icon</Label>
                        <Select
                            value={props.icon || "sparkle"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.icon = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rocket">Rocket</SelectItem>
                                <SelectItem value="sparkle">Sparkle</SelectItem>
                                <SelectItem value="tag">Tag</SelectItem>
                                <SelectItem value="megaphone">Megaphone</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#18181b"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
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
