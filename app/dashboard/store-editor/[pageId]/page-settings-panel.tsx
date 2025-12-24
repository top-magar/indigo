"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import type { StorePage } from "@/types/page-builder";
import { updateStorePage } from "../actions";

interface PageSettingsPanelProps {
    page: StorePage;
    onClose: () => void;
    darkMode?: boolean;
}

export function PageSettingsPanel({ page, onClose }: PageSettingsPanelProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(page.title);
    const [slug, setSlug] = useState(page.slug);
    const [metaTitle, setMetaTitle] = useState(page.meta_title || "");
    const [metaDescription, setMetaDescription] = useState(page.meta_description || "");
    const [status, setStatus] = useState(page.status);
    const [isHomepage, setIsHomepage] = useState(page.is_homepage);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateStorePage(page.id, {
                title,
                slug,
                meta_title: metaTitle || undefined,
                meta_description: metaDescription || undefined,
                status,
                is_homepage: isHomepage,
            });

            if (result.success) {
                toast.success("Settings saved");
                router.refresh();
                onClose();
            } else {
                toast.error(result.error || "Failed to save settings");
            }
        });
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold">Page Settings</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {/* General */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            General
                        </h3>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Page Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">URL Slug</Label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">/</span>
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label className="text-xs">Set as Homepage</Label>
                                <p className="text-[10px] text-muted-foreground">
                                    This page will be shown when visitors access your store
                                </p>
                            </div>
                            <Switch checked={isHomepage} onCheckedChange={setIsHomepage} />
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            SEO
                        </h3>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Meta Title</Label>
                            <Input
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder={title}
                                className="h-8 text-sm"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                {metaTitle.length}/60 characters
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Meta Description</Label>
                            <Textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="Describe this page for search engines..."
                                rows={3}
                                className="text-sm resize-none"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                {metaDescription.length}/160 characters
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Search Preview
                        </h3>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-chart-1 text-sm font-medium truncate">
                                {metaTitle || title}
                            </p>
                            <p className="text-xs truncate text-chart-2">
                                yourstore.com/{slug}
                            </p>
                            <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">
                                {metaDescription || "No description provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-chart-1 hover:bg-chart-1/90 text-white"
                >
                    {isPending && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
