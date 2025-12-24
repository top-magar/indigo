"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, SelectInput, SwitchInput } from "./shared";
import type { ButtonProps } from "@/lib/craft-editor/types";

export function ButtonSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as ButtonProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Button Text">
                    <TextInput
                        value={props.text || ""}
                        onChange={(value) => setProp((p: ButtonProps) => { p.text = value; })}
                        placeholder="Click me"
                    />
                </SettingRow>
                <SettingRow label="Link URL">
                    <TextInput
                        value={props.href || ""}
                        onChange={(value) => setProp((p: ButtonProps) => { p.href = value; })}
                        placeholder="https://..."
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Style">
                <SettingRow label="Variant">
                    <SelectInput
                        value={props.variant || "primary"}
                        onChange={(value) => setProp((p: ButtonProps) => { p.variant = value as ButtonProps["variant"]; })}
                        options={[
                            { value: "primary", label: "Primary" },
                            { value: "secondary", label: "Secondary" },
                            { value: "outline", label: "Outline" },
                            { value: "ghost", label: "Ghost" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Size">
                    <SelectInput
                        value={props.size || "md"}
                        onChange={(value) => setProp((p: ButtonProps) => { p.size = value as ButtonProps["size"]; })}
                        options={[
                            { value: "sm", label: "Small" },
                            { value: "md", label: "Medium" },
                            { value: "lg", label: "Large" },
                        ]}
                    />
                </SettingRow>
                <SwitchInput
                    label="Full Width"
                    checked={props.fullWidth ?? false}
                    onChange={(checked) => setProp((p: ButtonProps) => { p.fullWidth = checked; })}
                />
            </SettingGroup>
        </div>
    );
}
