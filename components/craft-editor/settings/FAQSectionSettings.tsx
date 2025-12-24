"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

export function FAQSectionSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    const addItem = () => {
        const newItems = [...(props.items || []), { question: "New Question?", answer: "Answer goes here..." }];
        setProp((props: Record<string, unknown>) => (props.items = newItems));
    };

    const removeItem = (index: number) => {
        const newItems = props.items.filter((_: unknown, i: number) => i !== index);
        setProp((props: Record<string, unknown>) => (props.items = newItems));
    };

    return (
        <div className="space-y-4">
            <SettingsSection title="Content">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Heading</Label>
                        <Input
                            value={props.heading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.heading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Subheading</Label>
                        <Textarea
                            value={props.subheading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.subheading = e.target.value))}
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="FAQ Items">
                <div className="space-y-3">
                    {(props.items || []).map((item: { question: string; answer: string }, index: number) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Item {index + 1}</Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive"
                                    onClick={() => removeItem(index)}
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
                                </Button>
                            </div>
                            <div>
                                <Label className="text-xs">Question</Label>
                                <Input
                                    value={item.question}
                                    onChange={(e) => {
                                        const newItems = [...props.items];
                                        newItems[index] = { ...item, question: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.items = newItems));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Answer</Label>
                                <Textarea
                                    value={item.answer}
                                    onChange={(e) => {
                                        const newItems = [...props.items];
                                        newItems[index] = { ...item, answer: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.items = newItems));
                                    }}
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addItem}
                    >
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
                        Add FAQ Item
                    </Button>
                </div>
            </SettingsSection>

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Layout</Label>
                        <Select
                            value={props.layout || "accordion"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.layout = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accordion">Accordion</SelectItem>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="two-column">Two Column</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Style">
                <div className="space-y-3">
                    <ColorPicker
                        label="Background Color"
                        value={props.backgroundColor || "#ffffff"}
                        onChange={(value) => setProp((props: Record<string, unknown>) => (props.backgroundColor = value))}
                    />
                </div>
            </SettingsSection>
        </div>
    );
}
