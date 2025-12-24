"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, ColorInput, SpacingInput, NumberInput, SelectInput } from "./shared";
import type { ContainerProps } from "@/lib/craft-editor/types";

export function ContainerSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as ContainerProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Size">
                <SettingRow label="Width">
                    <SelectInput
                        value={props.width || "full"}
                        onChange={(value) => setProp((p: ContainerProps) => { p.width = value as ContainerProps["width"]; })}
                        options={[
                            { value: "full", label: "Full Width" },
                            { value: "auto", label: "Auto" },
                            { value: "fixed", label: "Fixed" },
                        ]}
                    />
                </SettingRow>
                {props.width === "fixed" && (
                    <SettingRow label="Fixed Width (px)">
                        <NumberInput
                            value={props.fixedWidth || 400}
                            onChange={(value) => setProp((p: ContainerProps) => { p.fixedWidth = value; })}
                            min={100}
                            max={2000}
                        />
                    </SettingRow>
                )}
            </SettingGroup>

            <SettingGroup title="Style">
                <SettingRow label="Background Color">
                    <ColorInput
                        value={props.backgroundColor || "transparent"}
                        onChange={(value) => setProp((p: ContainerProps) => { p.backgroundColor = value; })}
                    />
                </SettingRow>
                <SettingRow label="Border Radius">
                    <NumberInput
                        value={props.borderRadius || 0}
                        onChange={(value) => setProp((p: ContainerProps) => { p.borderRadius = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
                <SettingRow label="Shadow">
                    <SelectInput
                        value={props.shadow || "none"}
                        onChange={(value) => setProp((p: ContainerProps) => { p.shadow = value as ContainerProps["shadow"]; })}
                        options={[
                            { value: "none", label: "None" },
                            { value: "sm", label: "Small" },
                            { value: "md", label: "Medium" },
                            { value: "lg", label: "Large" },
                            { value: "xl", label: "Extra Large" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Padding">
                <SpacingInput
                    value={props.padding || { top: 16, right: 16, bottom: 16, left: 16 }}
                    onChange={(value) => setProp((p: ContainerProps) => { p.padding = value; })}
                />
            </SettingGroup>
        </div>
    );
}
