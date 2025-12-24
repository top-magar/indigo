"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, SelectInput, ColorInput } from "./shared";
import type { NewsletterProps } from "@/lib/craft-editor/types";

export function NewsletterSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as NewsletterProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Content">
                <SettingRow label="Heading">
                    <TextInput
                        value={props.heading || ""}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.heading = value; })}
                        placeholder="Subscribe to Our Newsletter"
                    />
                </SettingRow>
                <SettingRow label="Description">
                    <textarea
                        value={props.description || ""}
                        onChange={(e) => setProp((p: NewsletterProps) => { p.description = e.target.value; })}
                        className="w-full h-16 px-2 py-1 text-sm border rounded resize-none"
                        placeholder="Get the latest updates..."
                    />
                </SettingRow>
                <SettingRow label="Placeholder">
                    <TextInput
                        value={props.placeholder || ""}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.placeholder = value; })}
                        placeholder="Enter your email"
                    />
                </SettingRow>
                <SettingRow label="Button Text">
                    <TextInput
                        value={props.buttonText || ""}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.buttonText = value; })}
                        placeholder="Subscribe"
                    />
                </SettingRow>
                <SettingRow label="Success Message">
                    <TextInput
                        value={props.successMessage || ""}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.successMessage = value; })}
                        placeholder="Thanks for subscribing!"
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Layout">
                    <SelectInput
                        value={props.layout || "inline"}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.layout = value as NewsletterProps["layout"]; })}
                        options={[
                            { value: "inline", label: "Inline" },
                            { value: "stacked", label: "Stacked" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Style">
                <SettingRow label="Background Color">
                    <ColorInput
                        value={props.backgroundColor || ""}
                        onChange={(value) => setProp((p: NewsletterProps) => { p.backgroundColor = value; })}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
