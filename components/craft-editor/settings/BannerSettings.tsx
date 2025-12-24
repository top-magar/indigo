"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, SelectInput, ColorInput, SliderInput } from "./shared";
import type { BannerProps } from "@/lib/craft-editor/types";

export function BannerSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as BannerProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Heading">
                    <TextInput
                        value={props.heading || ""}
                        onChange={(value) => setProp((p: BannerProps) => { p.heading = value; })}
                        placeholder="Special Offer"
                    />
                </SettingRow>
                <SettingRow label="Description">
                    <textarea
                        value={props.description || ""}
                        onChange={(e) => setProp((p: BannerProps) => { p.description = e.target.value; })}
                        className="w-full h-16 px-2 py-1 text-sm border rounded resize-none"
                        placeholder="Get 20% off..."
                    />
                </SettingRow>
                <SettingRow label="Button Text">
                    <TextInput
                        value={props.buttonText || ""}
                        onChange={(value) => setProp((p: BannerProps) => { p.buttonText = value; })}
                        placeholder="Shop Now"
                    />
                </SettingRow>
                <SettingRow label="Button Link">
                    <TextInput
                        value={props.buttonLink || ""}
                        onChange={(value) => setProp((p: BannerProps) => { p.buttonLink = value; })}
                        placeholder="/products"
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Height">
                    <SelectInput
                        value={props.height || "medium"}
                        onChange={(value) => setProp((p: BannerProps) => { p.height = value as BannerProps["height"]; })}
                        options={[
                            { value: "small", label: "Small" },
                            { value: "medium", label: "Medium" },
                            { value: "large", label: "Large" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Text Position">
                    <SelectInput
                        value={props.textPosition || "center"}
                        onChange={(value) => setProp((p: BannerProps) => { p.textPosition = value as BannerProps["textPosition"]; })}
                        options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Background">
                <SettingRow label="Image URL">
                    <TextInput
                        value={props.image || ""}
                        onChange={(value) => setProp((p: BannerProps) => { p.image = value; })}
                        placeholder="https://..."
                    />
                </SettingRow>
                <SettingRow label="Overlay Color">
                    <ColorInput
                        value={props.overlayColor || "#000000"}
                        onChange={(value) => setProp((p: BannerProps) => { p.overlayColor = value; })}
                    />
                </SettingRow>
                <SettingRow label="Overlay Opacity">
                    <SliderInput
                        value={props.overlayOpacity || 40}
                        onChange={(value) => setProp((p: BannerProps) => { p.overlayOpacity = value; })}
                        min={0}
                        max={100}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
