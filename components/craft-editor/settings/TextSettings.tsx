"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, NumberInput, SelectInput, ColorInput } from "./shared";
import type { TextProps } from "@/lib/craft-editor/types";

export function TextSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as TextProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Text">
                    <textarea
                        value={props.text || ""}
                        onChange={(e) => setProp((p: TextProps) => { p.text = e.target.value; })}
                        className="w-full h-20 px-2 py-1 text-sm border rounded resize-none"
                        placeholder="Enter text..."
                    />
                </SettingRow>
                <SettingRow label="Tag">
                    <SelectInput
                        value={props.tagName || "p"}
                        onChange={(value) => setProp((p: TextProps) => { p.tagName = value as TextProps["tagName"]; })}
                        options={[
                            { value: "p", label: "Paragraph" },
                            { value: "h1", label: "Heading 1" },
                            { value: "h2", label: "Heading 2" },
                            { value: "h3", label: "Heading 3" },
                            { value: "h4", label: "Heading 4" },
                            { value: "h5", label: "Heading 5" },
                            { value: "h6", label: "Heading 6" },
                            { value: "span", label: "Span" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Typography">
                <SettingRow label="Font Size (px)">
                    <NumberInput
                        value={props.fontSize || 16}
                        onChange={(value) => setProp((p: TextProps) => { p.fontSize = value; })}
                        min={8}
                        max={120}
                    />
                </SettingRow>
                <SettingRow label="Font Weight">
                    <SelectInput
                        value={props.fontWeight || "normal"}
                        onChange={(value) => setProp((p: TextProps) => { p.fontWeight = value as TextProps["fontWeight"]; })}
                        options={[
                            { value: "normal", label: "Normal" },
                            { value: "medium", label: "Medium" },
                            { value: "semibold", label: "Semibold" },
                            { value: "bold", label: "Bold" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Text Align">
                    <SelectInput
                        value={props.textAlign || "left"}
                        onChange={(value) => setProp((p: TextProps) => { p.textAlign = value as TextProps["textAlign"]; })}
                        options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Line Height">
                    <NumberInput
                        value={props.lineHeight || 1.6}
                        onChange={(value) => setProp((p: TextProps) => { p.lineHeight = value; })}
                        min={0.5}
                        max={3}
                        step={0.1}
                    />
                </SettingRow>
                <SettingRow label="Color">
                    <ColorInput
                        value={props.color || "inherit"}
                        onChange={(value) => setProp((p: TextProps) => { p.color = value; })}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
