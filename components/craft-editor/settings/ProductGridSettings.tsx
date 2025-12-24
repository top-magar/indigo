"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, NumberInput, SelectInput, SwitchInput } from "./shared";
import type { ProductGridProps } from "@/lib/craft-editor/types";

export function ProductGridSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as ProductGridProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Heading">
                    <TextInput
                        value={props.heading || ""}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.heading = value; })}
                        placeholder="Featured Products"
                    />
                </SettingRow>
                <SettingRow label="Subheading">
                    <TextInput
                        value={props.subheading || ""}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.subheading = value; })}
                        placeholder="Check out our latest collection"
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Product Source">
                <SettingRow label="Source">
                    <SelectInput
                        value={props.source || "featured"}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.source = value as ProductGridProps["source"]; })}
                        options={[
                            { value: "all", label: "All Products" },
                            { value: "featured", label: "Featured" },
                            { value: "category", label: "By Category" },
                            { value: "collection", label: "By Collection" },
                            { value: "manual", label: "Manual Selection" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Limit">
                    <NumberInput
                        value={props.limit || 8}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.limit = value; })}
                        min={1}
                        max={24}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Columns">
                    <SelectInput
                        value={String(props.columns || 4)}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.columns = Number(value) as ProductGridProps["columns"]; })}
                        options={[
                            { value: "2", label: "2 Columns" },
                            { value: "3", label: "3 Columns" },
                            { value: "4", label: "4 Columns" },
                            { value: "5", label: "5 Columns" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Card Style">
                    <SelectInput
                        value={props.cardStyle || "default"}
                        onChange={(value) => setProp((p: ProductGridProps) => { p.cardStyle = value as ProductGridProps["cardStyle"]; })}
                        options={[
                            { value: "default", label: "Default" },
                            { value: "minimal", label: "Minimal" },
                            { value: "overlay", label: "Overlay" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Display Options">
                <SwitchInput
                    label="Show Price"
                    checked={props.showPrice ?? true}
                    onChange={(checked) => setProp((p: ProductGridProps) => { p.showPrice = checked; })}
                />
                <SwitchInput
                    label="Show Add to Cart"
                    checked={props.showAddToCart ?? true}
                    onChange={(checked) => setProp((p: ProductGridProps) => { p.showAddToCart = checked; })}
                />
                <SwitchInput
                    label="Show Quick View"
                    checked={props.showQuickView ?? false}
                    onChange={(checked) => setProp((p: ProductGridProps) => { p.showQuickView = checked; })}
                />
            </SettingGroup>
        </div>
    );
}
