"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

export function StatsSectionSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    const addStat = () => {
        const newStats = [...(props.stats || []), { value: "100+", label: "New Stat", description: "" }];
        setProp((props: Record<string, unknown>) => (props.stats = newStats));
    };

    const removeStat = (index: number) => {
        const newStats = props.stats.filter((_: unknown, i: number) => i !== index);
        setProp((props: Record<string, unknown>) => (props.stats = newStats));
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
                    <div>
                        <Label className="text-xs">Subheading</Label>
                        <Input
                            value={props.subheading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.subheading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Stats">
                <div className="space-y-3">
                    {(props.stats || []).map((stat: { value: string; label: string; description?: string }, index: number) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Stat {index + 1}</Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive"
                                    onClick={() => removeStat(index)}
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                                </Button>
                            </div>
                            <div>
                                <Label className="text-xs">Value</Label>
                                <Input
                                    value={stat.value}
                                    onChange={(e) => {
                                        const newStats = [...props.stats];
                                        newStats[index] = { ...stat, value: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.stats = newStats));
                                    }}
                                    className="mt-1"
                                    placeholder="e.g., 10K+"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                    value={stat.label}
                                    onChange={(e) => {
                                        const newStats = [...props.stats];
                                        newStats[index] = { ...stat, label: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.stats = newStats));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Description (optional)</Label>
                                <Input
                                    value={stat.description || ""}
                                    onChange={(e) => {
                                        const newStats = [...props.stats];
                                        newStats[index] = { ...stat, description: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.stats = newStats));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addStat}
                    >
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
                        Add Stat
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
                                <SelectItem value="cards">Cards</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#0f172a"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
                    <ColorPicker
                        label="Accent Color"
                        value={props.accentColor || "#3b82f6"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.accentColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
