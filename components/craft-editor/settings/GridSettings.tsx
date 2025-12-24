"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, NumberInput, SelectInput } from "./shared";
import type { GridProps } from "@/lib/craft-editor/types";

export function GridSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as GridProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Grid Layout">
                <SettingRow label="Columns">
                    <SelectInput
                        value={String(props.columns || 3)}
                        onChange={(value) => setProp((p: GridProps) => { p.columns = Number(value) as GridProps["columns"]; })}
                        options={[
                            { value: "1", label: "1 Column" },
                            { value: "2", label: "2 Columns" },
                            { value: "3", label: "3 Columns" },
                            { value: "4", label: "4 Columns" },
                            { value: "5", label: "5 Columns" },
                            { value: "6", label: "6 Columns" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Gap (px)">
                    <NumberInput
                        value={props.gap || 24}
                        onChange={(value) => setProp((p: GridProps) => { p.gap = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
                <SettingRow label="Align Items">
                    <SelectInput
                        value={props.alignItems || "stretch"}
                        onChange={(value) => setProp((p: GridProps) => { p.alignItems = value as GridProps["alignItems"]; })}
                        options={[
                            { value: "start", label: "Start" },
                            { value: "center", label: "Center" },
                            { value: "end", label: "End" },
                            { value: "stretch", label: "Stretch" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
