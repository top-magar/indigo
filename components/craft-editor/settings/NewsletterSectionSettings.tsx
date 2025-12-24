"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function NewsletterSectionSettings() {
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
                    <div>
                        <Label className="text-xs">Placeholder</Label>
                        <Input
                            value={props.placeholder || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.placeholder = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Button Text</Label>
                        <Input
                            value={props.buttonText || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.buttonText = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Privacy">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Privacy Note</Label>
                        <Switch
                            checked={props.showPrivacyNote}
                            onCheckedChange={(checked) => setProp((props: Record<string, unknown>) => (props.showPrivacyNote = checked))}
                        />
                    </div>
                    {props.showPrivacyNote && (
                        <div>
                            <Label className="text-xs">Privacy Note</Label>
                            <Input
                                value={props.privacyNote || ""}
                                onChange={(e) => setProp((props: Record<string, unknown>) => (props.privacyNote = e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>
            </SettingsSection>

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Layout</Label>
                        <Select
                            value={props.layout || "stacked"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.layout = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stacked">Stacked (Centered)</SelectItem>
                                <SelectItem value="inline">Inline (Side by Side)</SelectItem>
                                <SelectItem value="split">Split (Card Style)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#f8fafc"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
