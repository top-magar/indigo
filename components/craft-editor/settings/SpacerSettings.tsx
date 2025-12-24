"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, NumberInput, SliderInput } from "./shared";
import type { SpacerProps } from "@/lib/craft-editor/types";

export function SpacerSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as SpacerProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Spacing">
                <SettingRow label="Height (px)">
                    <SliderInput
                        value={props.height || 48}
                        onChange={(value) => setProp((p: SpacerProps) => { p.height = value; })}
                        min={8}
                        max={200}
                    />
                </SettingRow>
                <SettingRow label="Mobile Height (px)">
                    <NumberInput
                        value={props.mobileHeight || props.height || 24}
                        onChange={(value) => setProp((p: SpacerProps) => { p.mobileHeight = value; })}
                        min={0}
                        max={200}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
