"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, ColorInput, SpacingInput, NumberInput, SelectInput } from "./shared";
import type { SectionProps } from "@/lib/craft-editor/types";

export function SectionSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as SectionProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Background">
                <SettingRow label="Background Color">
                    <ColorInput
                        value={props.backgroundColor || "transparent"}
                        onChange={(value) => setProp((p: SectionProps) => { p.backgroundColor = value; })}
                    />
                </SettingRow>
                <SettingRow label="Background Image URL">
                    <input
                        type="text"
                        value={props.backgroundImage || ""}
                        onChange={(e) => setProp((p: SectionProps) => { p.backgroundImage = e.target.value; })}
                        placeholder="https://..."
                        className="w-full h-8 px-2 text-sm border rounded"
                    />
                </SettingRow>
                <SettingRow label="Overlay Opacity">
                    <NumberInput
                        value={props.backgroundOverlay || 0}
                        onChange={(value) => setProp((p: SectionProps) => { p.backgroundOverlay = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Max Width">
                    <SelectInput
                        value={props.maxWidth || "container"}
                        onChange={(value) => setProp((p: SectionProps) => { p.maxWidth = value as SectionProps["maxWidth"]; })}
                        options={[
                            { value: "full", label: "Full Width" },
                            { value: "container", label: "Container (1280px)" },
                            { value: "narrow", label: "Narrow (768px)" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Min Height (px)">
                    <NumberInput
                        value={props.minHeight || 200}
                        onChange={(value) => setProp((p: SectionProps) => { p.minHeight = value; })}
                        min={0}
                        max={1000}
                    />
                </SettingRow>
                <SettingRow label="Vertical Align">
                    <SelectInput
                        value={props.verticalAlign || "top"}
                        onChange={(value) => setProp((p: SectionProps) => { p.verticalAlign = value as SectionProps["verticalAlign"]; })}
                        options={[
                            { value: "top", label: "Top" },
                            { value: "center", label: "Center" },
                            { value: "bottom", label: "Bottom" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Padding">
                <SpacingInput
                    value={props.padding || { top: 48, right: 24, bottom: 48, left: 24 }}
                    onChange={(value) => setProp((p: SectionProps) => { p.padding = value; })}
                />
            </SettingGroup>

            <SettingGroup title="Margin">
                <SpacingInput
                    value={props.margin || { top: 0, right: 0, bottom: 0, left: 0 }}
                    onChange={(value) => setProp((p: SectionProps) => { p.margin = value; })}
                />
            </SettingGroup>
        </div>
    );
}
