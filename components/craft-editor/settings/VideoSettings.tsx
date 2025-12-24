"use client";

import { useNode } from "@craftjs/core";
import { SettingRow, SettingGroup, TextInput, SelectInput, SwitchInput } from "./shared";
import type { VideoProps } from "@/lib/craft-editor/types";

export function VideoSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props as VideoProps,
    }));

    return (
        <div className="space-y-6">
            <SettingGroup title="Video Source">
                <SettingRow label="Provider">
                    <SelectInput
                        value={props.provider || "youtube"}
                        onChange={(value) => setProp((p: VideoProps) => { p.provider = value as VideoProps["provider"]; })}
                        options={[
                            { value: "youtube", label: "YouTube" },
                            { value: "vimeo", label: "Vimeo" },
                            { value: "custom", label: "Custom URL" },
                        ]}
                    />
                </SettingRow>
                <SettingRow label="Video URL">
                    <TextInput
                        value={props.src || ""}
                        onChange={(value) => setProp((p: VideoProps) => { p.src = value; })}
                        placeholder={props.provider === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                    />
                </SettingRow>
                {props.provider === "custom" && (
                    <SettingRow label="Poster Image URL">
                        <TextInput
                            value={props.poster || ""}
                            onChange={(value) => setProp((p: VideoProps) => { p.poster = value; })}
                            placeholder="https://..."
                        />
                    </SettingRow>
                )}
            </SettingGroup>

            <SettingGroup title="Layout">
                <SettingRow label="Aspect Ratio">
                    <SelectInput
                        value={props.aspectRatio || "16:9"}
                        onChange={(value) => setProp((p: VideoProps) => { p.aspectRatio = value as VideoProps["aspectRatio"]; })}
                        options={[
                            { value: "16:9", label: "16:9 (Widescreen)" },
                            { value: "4:3", label: "4:3 (Standard)" },
                            { value: "1:1", label: "1:1 (Square)" },
                            { value: "9:16", label: "9:16 (Vertical)" },
                        ]}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="Playback">
                <SwitchInput
                    label="Autoplay"
                    checked={props.autoplay ?? false}
                    onChange={(checked) => setProp((p: VideoProps) => { p.autoplay = checked; })}
                />
                <SwitchInput
                    label="Loop"
                    checked={props.loop ?? false}
                    onChange={(checked) => setProp((p: VideoProps) => { p.loop = checked; })}
                />
                <SwitchInput
                    label="Muted"
                    checked={props.muted ?? false}
                    onChange={(checked) => setProp((p: VideoProps) => { p.muted = checked; })}
                />
                <SwitchInput
                    label="Show Controls"
                    checked={props.controls ?? true}
                    onChange={(checked) => setProp((p: VideoProps) => { p.controls = checked; })}
                />
            </SettingGroup>
        </div>
    );
}
