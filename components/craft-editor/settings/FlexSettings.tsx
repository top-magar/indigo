"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, NumberInput, SelectInput, SwitchInput } from "./shared";
import type { FlexProps } from "@/lib/craft-editor/types";

export function FlexSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as FlexProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Flex Layout">
                <SettingRow label="Direction">
                    <SelectInput
                        value={props.direction || "row"}
                        onChange={(value) => setProp((p: FlexProps) => { p.direction = value as FlexProps["direction"]; })}
                        options={[
                            { value: "row", label: "Row" },
                            { value: "column", label: "Column" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Justify Content">
                    <SelectInput
                        value={props.justify || "start"}
                        onChange={(value) => setProp((p: FlexProps) => { p.justify = value as FlexProps["justify"]; })}
                        options={[
                            { value: "start", label: "Start" },
                            { value: "center", label: "Center" },
                            { value: "end", label: "End" },
                            { value: "between", label: "Space Between" },
                            { value: "around", label: "Space Around" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Align Items">
                    <SelectInput
                        value={props.align || "center"}
                        onChange={(value) => setProp((p: FlexProps) => { p.align = value as FlexProps["align"]; })}
                        options={[
                            { value: "start", label: "Start" },
                            { value: "center", label: "Center" },
                            { value: "end", label: "End" },
                            { value: "stretch", label: "Stretch" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Gap (px)">
                    <NumberInput
                        value={props.gap || 16}
                        onChange={(value) => setProp((p: FlexProps) => { p.gap = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
                <SwitchInput
                    label="Wrap"
                    checked={props.wrap ?? true}
                    onChange={(checked) => setProp((p: FlexProps) => { p.wrap = checked; })}
                />
            </SettingGroup>
        </div>
    );
}
