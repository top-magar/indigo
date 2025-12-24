"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, NumberInput, SelectInput, ColorInput, SliderInput } from "./shared";
import type { HeroProps } from "@/lib/craft-editor/types";

export function HeroSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as HeroProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Heading">
                    <TextInput
                        value={props.heading || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.heading = value; })}
                        placeholder="Welcome to Our Store"
                    />
                </SettingRow>
                <SettingRow label="Subheading">
                    <TextInput
                        value={props.subheading || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.subheading = value; })}
                        placeholder="Discover amazing products"
                    />
                </SettingRow>
                <SettingRow label="Description">
                    <textarea
                        value={props.description || ""}
                        onChange={(e) => setProp((p: HeroProps) => { p.description = e.target.value; })}
                        className="w-full h-16 px-2 py-1 text-sm border rounded resize-none"
                        placeholder="Enter description..."
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Primary Button">
                <SettingRow label="Text">
                    <TextInput
                        value={props.primaryButtonText || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.primaryButtonText = value; })}
                        placeholder="Shop Now"
                    />
                </SettingRow>
                <SettingRow label="Link">
                    <TextInput
                        value={props.primaryButtonLink || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.primaryButtonLink = value; })}
                        placeholder="/products"
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Secondary Button">
                <SettingRow label="Text">
                    <TextInput
                        value={props.secondaryButtonText || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.secondaryButtonText = value; })}
                        placeholder="Learn More"
                    />
                </SettingRow>
                <SettingRow label="Link">
                    <TextInput
                        value={props.secondaryButtonLink || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.secondaryButtonLink = value; })}
                        placeholder="/about"
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Layout">
                    <SelectInput
                        value={props.layout || "center"}
                        onChange={(value) => setProp((p: HeroProps) => { p.layout = value as HeroProps["layout"]; })}
                        options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                            { value: "split", label: "Split" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Height">
                    <SelectInput
                        value={props.height || "large"}
                        onChange={(value) => setProp((p: HeroProps) => { p.height = value as HeroProps["height"]; })}
                        options={[
                            { value: "small", label: "Small (300px)" },
                            { value: "medium", label: "Medium (450px)" },
                            { value: "large", label: "Large (600px)" },
                            { value: "full", label: "Full Screen" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Background">
                <SettingRow label="Background Color">
                    <ColorInput
                        value={props.backgroundColor || "#f8fafc"}
                        onChange={(value) => setProp((p: HeroProps) => { p.backgroundColor = value; })}
                    />
                </SettingRow>
                <SettingRow label="Background Image URL">
                    <TextInput
                        value={props.backgroundImage || ""}
                        onChange={(value) => setProp((p: HeroProps) => { p.backgroundImage = value; })}
                        placeholder="https://..."
                    />
                </SettingRow>
                <SettingRow label="Overlay Opacity">
                    <SliderInput
                        value={props.overlayOpacity || 0}
                        onChange={(value) => setProp((p: HeroProps) => { p.overlayOpacity = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
                <SettingRow label="Text Color">
                    <ColorInput
                        value={props.textColor || "#0f172a"}
                        onChange={(value) => setProp((p: HeroProps) => { p.textColor = value; })}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
