"use client";

import { useNode } from "@craftjs/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSection, ColorPicker } from "./shared";

export function TestimonialCarouselSettings() {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

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
                        <Input
                            value={props.subheading || ""}
                            onChange={(e) => setProp((props: Record<string, unknown>) => (props.subheading = e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Testimonials">
                <div className="space-y-3">
                    {(props.testimonials || []).map((testimonial: { quote: string; author: string; role?: string; avatar?: string; rating?: number }, index: number) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                            <Label className="text-xs font-medium">Testimonial {index + 1}</Label>
                            <div>
                                <Label className="text-xs">Quote</Label>
                                <Textarea
                                    value={testimonial.quote}
                                    onChange={(e) => {
                                        const newTestimonials = [...props.testimonials];
                                        newTestimonials[index] = { ...testimonial, quote: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.testimonials = newTestimonials));
                                    }}
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Author</Label>
                                <Input
                                    value={testimonial.author}
                                    onChange={(e) => {
                                        const newTestimonials = [...props.testimonials];
                                        newTestimonials[index] = { ...testimonial, author: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.testimonials = newTestimonials));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Role</Label>
                                <Input
                                    value={testimonial.role || ""}
                                    onChange={(e) => {
                                        const newTestimonials = [...props.testimonials];
                                        newTestimonials[index] = { ...testimonial, role: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.testimonials = newTestimonials));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Avatar URL</Label>
                                <Input
                                    value={testimonial.avatar || ""}
                                    onChange={(e) => {
                                        const newTestimonials = [...props.testimonials];
                                        newTestimonials[index] = { ...testimonial, avatar: e.target.value };
                                        setProp((props: Record<string, unknown>) => (props.testimonials = newTestimonials));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsSection>

            <SettingsSection title="Layout">
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Layout</Label>
                        <Select
                            value={props.layout || "cards"}
                            onValueChange={(value) => setProp((props: Record<string, unknown>) => (props.layout = value))}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cards">Cards Grid</SelectItem>
                                <SelectItem value="simple">Simple List</SelectItem>
                                <SelectItem value="featured">Featured Single</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Rating</Label>
                        <Switch
                            checked={props.showRating}
                            onCheckedChange={(checked) => setProp((props: Record<string, unknown>) => (props.showRating = checked))}
                        />
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
