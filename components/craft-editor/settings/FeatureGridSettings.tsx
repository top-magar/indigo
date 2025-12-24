"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function FeatureGridSettings() {
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
                        <Label className="text-xs">Subheading</Label>
                        <Textarea
                            value={props.subheading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.subheading = e.target.value))}
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Features">
                <div className="space-y-3">
                    {(props.features || []).map((feature: { icon: string; title: string; description: string }, index: number) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Feature {index + 1}</Label>
                            </div>
                            <div>
                                <Label className="text-xs">Icon</Label>
                                <Select
                                    value={feature.icon}
                                    onValueChange={(value) => {
                                        const newFeatures = [...props.features];
                                        newFeatures[index] = { ...feature, icon: value };
                                        setProp((props: Record<string, unknown>) => (props.features = newFeatures));
                                    }}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="truck">Truck</SelectItem>
                                        <SelectItem value="shield">Shield</SelectItem>
                                        <SelectItem value="refresh">Refresh</SelectItem>
                                        <SelectItem value="clock">Clock</SelectItem>
                                        <SelectItem value="heart">Heart</SelectItem>
                                        <SelectItem value="star">Star</SelectItem>
                                        <SelectItem value="gift">Gift</SelectItem>
                                        <SelectItem value="credit-card">Credit Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Title</Label>
                                <Input
                                    value={feature.title}
                                    onChange={(e) => {
                                        const newFeatures = [...props.features];
                                        newFeatures[index] = { ...feature, title: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.features = newFeatures));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                    value={feature.description}
                                    onChange={(e) => {
                                        const newFeatures = [...props.features];
                                        newFeatures[index] = { ...feature, description: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.features = newFeatures));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsSection>

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Columns</Label>
                        <Select
                            value={String(props.columns || 4)}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.columns = Number(value)))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2 Columns</SelectItem>
                                <SelectItem value="3">3 Columns</SelectItem>
                                <SelectItem value="4">4 Columns</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Icon Style</Label>
                        <Select
                            value={props.iconStyle || "filled"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.iconStyle = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="filled">Filled</SelectItem>
                                <SelectItem value="outlined">Outlined</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
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
