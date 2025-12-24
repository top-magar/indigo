"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, NumberInput, SelectInput, ColorInput } from "./shared";
import type { DividerProps } from "@/lib/craft-editor/types";

export function DividerSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as DividerProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Style">
                <SettingRow label="Line Style">
                    <SelectInput
                        value={props.style || "solid"}
                        onChange={(value) => setProp((p: DividerProps) => { p.style = value as DividerProps["style"]; })}
                        options={[
                            { value: "solid", label: "Solid" },
                            { value: "dashed", label: "Dashed" },
                            { value: "dotted", label: "Dotted" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Color">
                    <ColorInput
                        value={props.color || "#e5e7eb"}
                        onChange={(value) => setProp((p: DividerProps) => { p.color = value; })}
                    />
                </SettingRow>
                <SettingRow label="Thickness (px)">
                    <NumberInput
                        value={props.thickness || 1}
                        onChange={(value) => setProp((p: DividerProps) => { p.thickness = value; })}
                        min={1}
                        max={10}
                    />
                </SettingRow>
                <SettingRow label="Width">
                    <SelectInput
                        value={props.width || "full"}
                        onChange={(value) => setProp((p: DividerProps) => { p.width = value as DividerProps["width"]; })}
                        options={[
                            { value: "full", label: "Full" },
                            { value: "medium", label: "Medium (2/3)" },
                            { value: "short", label: "Short (1/3)" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Spacing">
                <SettingRow label="Vertical Margin (px)">
                    <NumberInput
                        value={props.margin || 24}
                        onChange={(value) => setProp((p: DividerProps) => { p.margin = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
