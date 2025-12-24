"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, NumberInput, SelectInput } from "./shared";
import type { ImageProps } from "@/lib/craft-editor/types";

export function ImageSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as ImageProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Image">
                <SettingRow label="Image URL">
                    <TextInput
                        value={props.src || ""}
                        onChange={(value) => setProp((p: ImageProps) => { p.src = value; })}
                        placeholder="https://..."
                    />
                </SettingRow>
                <SettingRow label="Alt Text">
                    <TextInput
                        value={props.alt || ""}
                        onChange={(value) => setProp((p: ImageProps) => { p.alt = value; })}
                        placeholder="Image description"
                    />
                </SettingRow>
                <SettingRow label="Link URL">
                    <TextInput
                        value={props.link || ""}
                        onChange={(value) => setProp((p: ImageProps) => { p.link = value; })}
                        placeholder="https://..."
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Size">
                <SettingRow label="Width">
                    <SelectInput
                        value={props.width || "full"}
                        onChange={(value) => setProp((p: ImageProps) => { p.width = value as ImageProps["width"]; })}
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
                            onChange={(value) => setProp((p: ImageProps) => { p.fixedWidth = value; })}
                            min={50}
                            max={2000}
                        />
                    </SettingRow>
                )}
                <SettingRow label="Height">
                    <SelectInput
                        value={props.height || "auto"}
                        onChange={(value) => setProp((p: ImageProps) => { p.height = value as ImageProps["height"]; })}
                        options={[
                            { value: "auto", label: "Auto" },
                            { value: "fixed", label: "Fixed" },
                        ]}
                    />
                </SettingRow>
                {props.height === "fixed" && (
                    <SettingRow label="Fixed Height (px)">
                        <NumberInput
                            value={props.fixedHeight || 300}
                            onChange={(value) => setProp((p: ImageProps) => { p.fixedHeight = value; })}
                            min={50}
                            max={2000}
                        />
                    </SettingRow>
                )}
            </SettingGroup>

            <SettingGroup title="Style">
                <SettingRow label="Object Fit">
                    <SelectInput
                        value={props.objectFit || "cover"}
                        onChange={(value) => setProp((p: ImageProps) => { p.objectFit = value as ImageProps["objectFit"]; })}
                        options={[
                            { value: "cover", label: "Cover" },
                            { value: "contain", label: "Contain" },
                            { value: "fill", label: "Fill" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Border Radius">
                    <NumberInput
                        value={props.borderRadius || 0}
                        onChange={(value) => setProp((p: ImageProps) => { p.borderRadius = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
