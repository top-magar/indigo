"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, Eye, EyeOff, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { type StorePage, updateStorePage } from "./actions";

interface Props {
    initialPages: StorePage[];
}

export function PagesClient({ initialPages }: Props) {
    const [pages, setPages] = useState(initialPages);
    const [editing, setEditing] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editPublished, setEditPublished] = useState(false);

    function openEditor(page: StorePage) {
        setEditing(page.slug);
        setEditTitle(page.title);
        setEditContent(page.content);
        setEditPublished(page.isPublished);
    }

    function handleSave() {
        if (!editing) return;
        const slug = editing;
        startTransition(async () => {
            const result = await updateStorePage(slug, {
                title: editTitle,
                content: editContent,
                isPublished: editPublished,
            });
            if (result.success) {
                toast.success("Page saved");
                setPages((prev) => prev.map((p) =>
                    p.slug === slug ? { ...p, title: editTitle, content: editContent, isPublished: editPublished, updatedAt: new Date().toISOString() } : p
                ));
                setEditing(null);
            } else {
                toast.error(result.error ?? "Failed to save");
            }
        });
    }

    if (editing) {
        const page = pages.find((p) => p.slug === editing);
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => setEditing(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold tracking-[-0.4px]">Edit Page</h1>
                        <p className="text-sm text-muted-foreground">/{page?.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="published" className="text-sm">Published</Label>
                            <Switch id="published" checked={editPublished} onCheckedChange={setEditPublished} />
                        </div>
                        <Button onClick={handleSave} disabled={isPending} className="gap-2">
                            <Save className="h-4 w-4" />
                            {isPending ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="pageTitle">Page Title</Label>
                            <Input id="pageTitle" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="pageContent">Content</Label>
                            <Textarea
                                id="pageContent"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={20}
                                placeholder="Write your page content here… (Markdown supported)"
                                className="font-mono text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold tracking-[-0.4px]">Pages</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your store&apos;s static pages like About, Contact, and policies.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Store Pages</CardTitle>
                    <CardDescription>Click a page to edit its content.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pages.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No pages yet"
                            description="Create your first page to add content like About, Contact, or policies."
                            size="sm"
                            className="py-8"
                        />
                    ) : (
                    <div className="divide-y">
                        {pages.map((page) => (
                            <button
                                key={page.slug}
                                className="flex w-full items-center gap-4 py-3 px-2 text-left hover:bg-accent rounded-md transition-colors"
                                onClick={() => openEditor(page)}
                            >
                                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{page.title}</p>
                                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {page.content ? (
                                        <span className="text-xs text-muted-foreground">
                                            {page.content.length > 0 ? `${page.content.length} chars` : "Empty"}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Empty</span>
                                    )}
                                    {page.isPublished ? (
                                        <Badge variant="outline" className="text-success gap-1">
                                            <Eye className="h-3 w-3" /> Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground gap-1">
                                            <EyeOff className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
