"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Mail,
    Users,
    Calendar,
    Check,
    Info,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/utils";
import { AICopyGenerator } from "@/features/marketing/components/ai-copy-generator";
import { 
    type Campaign, 
    type CustomerSegment,
    createCampaign, 
    updateCampaign,
    scheduleCampaign,
    sendCampaign,
} from "./actions";
import { toast } from "sonner";

interface CampaignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: Campaign | null;
    segments: CustomerSegment[];
}

export function CampaignDialog({ open, onOpenChange, campaign, segments }: CampaignDialogProps) {
    const router = useRouter();
    const isEditing = !!campaign;
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState("details");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        preview_text: "",
        from_name: "",
        from_email: "",
        reply_to: "",
        segment_id: "all",
        segment_name: "All Customers",
        content: "",
        scheduled_at: "",
        schedule_enabled: false,
    });

    // Reset form when dialog opens/closes or campaign changes
    useEffect(() => {
        if (open && campaign) {
            setFormData({
                name: campaign.name,
                subject: campaign.subject || "",
                preview_text: campaign.preview_text || "",
                from_name: campaign.from_name || "",
                from_email: campaign.from_email || "",
                reply_to: campaign.reply_to || "",
                segment_id: campaign.segment_id || "all",
                segment_name: campaign.segment_name || "All Customers",
                content: campaign.content || "",
                scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.split("T")[0] + "T" + campaign.scheduled_at.split("T")[1]?.substring(0, 5) : "",
                schedule_enabled: !!campaign.scheduled_at,
            });
            setActiveTab("details");
            setErrors({});
        } else if (open && !campaign) {
            setFormData({
                name: "",
                subject: "",
                preview_text: "",
                from_name: "",
                from_email: "",
                reply_to: "",
                segment_id: "all",
                segment_name: "All Customers",
                content: "",
                scheduled_at: "",
                schedule_enabled: false,
            });
            setActiveTab("details");
            setErrors({});
        }
    }, [open, campaign]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Campaign name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForSend = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Campaign name is required";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject line is required";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Email content is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setActiveTab("details");
            return;
        }

        startTransition(async () => {
            try {
                const selectedSegment = segments.find(s => s.id === formData.segment_id);
                const data = {
                    name: formData.name.trim(),
                    subject: formData.subject.trim() || undefined,
                    preview_text: formData.preview_text.trim() || undefined,
                    from_name: formData.from_name.trim() || undefined,
                    from_email: formData.from_email.trim() || undefined,
                    reply_to: formData.reply_to.trim() || undefined,
                    segment_id: formData.segment_id,
                    segment_name: selectedSegment?.name || "All Customers",
                    content: formData.content || undefined,
                };

                const result = isEditing 
                    ? await updateCampaign(campaign.id, data)
                    : await createCampaign(data);

                if (result.success) {
                    toast.success(isEditing ? "Campaign saved" : "Campaign created");
                    onOpenChange(false);
                    router.refresh();
                } else {
                    toast.error(result.error || "Something went wrong");
                }
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const handleSchedule = async () => {
        if (!validateForSend()) {
            if (errors.name) setActiveTab("details");
            else if (errors.subject) setActiveTab("content");
            else if (errors.content) setActiveTab("content");
            return;
        }

        if (!formData.scheduled_at) {
            toast.error("Please select a date and time to schedule");
            return;
        }

        startTransition(async () => {
            try {
                // First save the campaign
                const selectedSegment = segments.find(s => s.id === formData.segment_id);
                const data = {
                    name: formData.name.trim(),
                    subject: formData.subject.trim(),
                    preview_text: formData.preview_text.trim() || undefined,
                    from_name: formData.from_name.trim() || undefined,
                    from_email: formData.from_email.trim() || undefined,
                    reply_to: formData.reply_to.trim() || undefined,
                    segment_id: formData.segment_id,
                    segment_name: selectedSegment?.name || "All Customers",
                    content: formData.content,
                };

                let campaignId = campaign?.id;

                if (isEditing) {
                    const updateResult = await updateCampaign(campaign.id, data);
                    if (!updateResult.success) {
                        toast.error(updateResult.error || "Failed to save campaign");
                        return;
                    }
                } else {
                    const createResult = await createCampaign(data);
                    if (!createResult.success || !createResult.campaign) {
                        toast.error(createResult.error || "Failed to create campaign");
                        return;
                    }
                    campaignId = createResult.campaign.id;
                }

                // Then schedule it
                const scheduleResult = await scheduleCampaign(campaignId!, formData.scheduled_at);
                if (scheduleResult.success) {
                    toast.success("Campaign scheduled");
                    onOpenChange(false);
                    router.refresh();
                } else {
                    toast.error(scheduleResult.error || "Failed to schedule campaign");
                }
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const handleSendNow = async () => {
        if (!validateForSend()) {
            if (errors.name) setActiveTab("details");
            else if (errors.subject) setActiveTab("content");
            else if (errors.content) setActiveTab("content");
            return;
        }

        startTransition(async () => {
            try {
                // First save the campaign
                const selectedSegment = segments.find(s => s.id === formData.segment_id);
                const data = {
                    name: formData.name.trim(),
                    subject: formData.subject.trim(),
                    preview_text: formData.preview_text.trim() || undefined,
                    from_name: formData.from_name.trim() || undefined,
                    from_email: formData.from_email.trim() || undefined,
                    reply_to: formData.reply_to.trim() || undefined,
                    segment_id: formData.segment_id,
                    segment_name: selectedSegment?.name || "All Customers",
                    content: formData.content,
                };

                let campaignId = campaign?.id;

                if (isEditing) {
                    const updateResult = await updateCampaign(campaign.id, data);
                    if (!updateResult.success) {
                        toast.error(updateResult.error || "Failed to save campaign");
                        return;
                    }
                } else {
                    const createResult = await createCampaign(data);
                    if (!createResult.success || !createResult.campaign) {
                        toast.error(createResult.error || "Failed to create campaign");
                        return;
                    }
                    campaignId = createResult.campaign.id;
                }

                // Then send it
                const sendResult = await sendCampaign(campaignId!);
                if (sendResult.success) {
                    toast.success("Campaign sent!");
                    onOpenChange(false);
                    router.refresh();
                } else {
                    toast.error(sendResult.error || "Failed to send campaign");
                }
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const selectedSegment = segments.find(s => s.id === formData.segment_id);

    const handleAICopyGenerated = (copy: string, type: 'email' | 'social' | 'banner' | 'sms') => {
        switch (type) {
            case 'email':
                // Email copy typically contains subject line and preview text
                // Parse the generated content - usually first line is subject, rest is preview/content
                const lines = copy.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                    // First line or "Subject:" line becomes the subject
                    const subjectLine = lines[0].replace(/^Subject:\s*/i, '').trim();
                    setFormData(prev => ({
                        ...prev,
                        subject: subjectLine,
                        preview_text: lines.length > 1 ? lines[1].replace(/^Preview:\s*/i, '').trim() : prev.preview_text,
                    }));
                    if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }));
                }
                break;
            case 'social':
                // Social media content goes to the main content field
                setFormData(prev => ({
                    ...prev,
                    content: copy,
                }));
                if (errors.content) setErrors(prev => ({ ...prev, content: "" }));
                break;
            case 'banner':
                // Banner headline goes to subject line (used as headline)
                setFormData(prev => ({
                    ...prev,
                    subject: copy.split('\n')[0].trim(),
                }));
                if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }));
                break;
            case 'sms':
                // SMS content goes to the main content field
                setFormData(prev => ({
                    ...prev,
                    content: copy,
                }));
                if (errors.content) setErrors(prev => ({ ...prev, content: "" }));
                break;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Update your email campaign" 
                            : "Create a new email campaign to engage your customers"
                        }
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="send">Send</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto py-4 px-1">
                        {/* Details Tab */}
                        <TabsContent value="details" className="mt-0 space-y-5">
                            {/* Campaign Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Campaign Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Summer Sale Announcement"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: "" });
                                    }}
                                    className={errors.name ? "border-destructive" : ""}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Internal name to identify this campaign
                                </p>
                            </div>

                            {/* Audience Selection */}
                            <div className="space-y-3 pt-3 border-t">
                                <Label className="text-sm font-medium">Audience</Label>
                                <Select
                                    value={formData.segment_id}
                                    onValueChange={(value) => {
                                        const segment = segments.find(s => s.id === value);
                                        setFormData({ 
                                            ...formData, 
                                            segment_id: value,
                                            segment_name: segment?.name || "All Customers"
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map((segment) => (
                                            <SelectItem key={segment.id} value={segment.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{segment.name}</span>
                                                    {segment.customer_count > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {segment.customer_count.toLocaleString()}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedSegment && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{selectedSegment.name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedSegment.description}</p>
                                        </div>
                                        {selectedSegment.customer_count > 0 && (
                                            <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                                                {selectedSegment.customer_count.toLocaleString()} recipients
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sender Info */}
                            <div className="space-y-4 pt-3 border-t">
                                <Label className="text-sm font-medium">Sender Information</Label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="from_name" className="text-sm">From Name</Label>
                                        <Input
                                            id="from_name"
                                            placeholder="Your Store Name"
                                            value={formData.from_name}
                                            onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="from_email" className="text-sm">From Email</Label>
                                        <Input
                                            id="from_email"
                                            type="email"
                                            placeholder="hello@yourstore.com"
                                            value={formData.from_email}
                                            onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reply_to" className="text-sm">Reply-To Email</Label>
                                    <Input
                                        id="reply_to"
                                        type="email"
                                        placeholder="support@yourstore.com"
                                        value={formData.reply_to}
                                        onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Where replies to this email will be sent
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Content Tab */}
                        <TabsContent value="content" className="mt-0 space-y-5">
                            {/* AI Copy Generator - Collapsible */}
                            <div className="rounded-lg border border-[var(--ds-gray-200)]">
                                <button
                                    type="button"
                                    onClick={() => setAiGeneratorOpen(!aiGeneratorOpen)}
                                    className="flex w-full items-center justify-between p-3 text-left hover:bg-[var(--ds-gray-100)] transition-colors rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-[var(--ds-amber-600)]" />
                                        <span className="text-sm font-medium">AI Copy Generator</span>
                                        <Badge variant="secondary" className="text-xs bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]">
                                            Beta
                                        </Badge>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 text-[var(--ds-gray-500)] transition-transform",
                                        aiGeneratorOpen && "rotate-180"
                                    )} />
                                </button>
                                {aiGeneratorOpen && (
                                    <div className="border-t border-[var(--ds-gray-200)] p-4">
                                        <AICopyGenerator
                                            productName={formData.name}
                                            onCopyGenerated={handleAICopyGenerated}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Subject Line */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">
                                    Subject Line <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., 🎉 Summer Sale: Up to 50% Off!"
                                    value={formData.subject}
                                    onChange={(e) => {
                                        setFormData({ ...formData, subject: e.target.value });
                                        if (errors.subject) setErrors({ ...errors, subject: "" });
                                    }}
                                    className={errors.subject ? "border-destructive" : ""}
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive">{errors.subject}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {formData.subject.length}/60 characters recommended
                                </p>
                            </div>

                            {/* Preview Text */}
                            <div className="space-y-2">
                                <Label htmlFor="preview_text">Preview Text</Label>
                                <Input
                                    id="preview_text"
                                    placeholder="e.g., Don't miss out on our biggest sale of the year"
                                    value={formData.preview_text}
                                    onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Appears after the subject line in inbox previews
                                </p>
                            </div>

                            {/* Email Content */}
                            <div className="space-y-2 pt-3 border-t">
                                <Label htmlFor="content">
                                    Email Content <span className="text-destructive">*</span>
                                </Label>
                                <textarea
                                    id="content"
                                    placeholder="Write your email content here...

You can use HTML for formatting. For example:
<h1>Welcome!</h1>
<p>Thank you for being a valued customer.</p>
<a href='https://yourstore.com'>Shop Now</a>"
                                    value={formData.content}
                                    onChange={(e) => {
                                        setFormData({ ...formData, content: e.target.value });
                                        if (errors.content) setErrors({ ...errors, content: "" });
                                    }}
                                    className={cn(
                                        "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono",
                                        errors.content && "border-destructive"
                                    )}
                                />
                                {errors.content && (
                                    <p className="text-xs text-destructive">{errors.content}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>HTML is supported. Use personalization tags like {"{{first_name}}"} for dynamic content.</span>
                                </div>
                            </div>

                            {/* Preview */}
                            {formData.content && (
                                <div className="space-y-2 pt-3 border-t">
                                    <Label className="text-sm font-medium">Preview</Label>
                                    <div className="rounded-lg border bg-white p-4 max-h-[200px] overflow-y-auto">
                                        <div 
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: formData.content }}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Send Tab */}
                        <TabsContent value="send" className="mt-0 space-y-5">
                            {/* Campaign Summary */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Campaign Summary</Label>
                                <div className="rounded-lg border divide-y">
                                    <div className="flex items-center justify-between p-3">
                                        <span className="text-sm text-muted-foreground">Campaign Name</span>
                                        <span className="text-sm font-medium">{formData.name || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3">
                                        <span className="text-sm text-muted-foreground">Subject</span>
                                        <span className="text-sm font-medium truncate max-w-[200px]">{formData.subject || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3">
                                        <span className="text-sm text-muted-foreground">Audience</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{selectedSegment?.name || "All Customers"}</span>
                                            {selectedSegment?.customer_count ? (
                                                <Badge variant="secondary" className="text-xs">
                                                    {selectedSegment.customer_count.toLocaleString()}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3">
                                        <span className="text-sm text-muted-foreground">From</span>
                                        <span className="text-sm font-medium">
                                            {formData.from_name || "Store"} {formData.from_email ? `<${formData.from_email}>` : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Readiness Check */}
                            <div className="space-y-3 pt-3 border-t">
                                <Label className="text-sm font-medium">Readiness Check</Label>
                                <div className="space-y-2">
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border",
                                        formData.name ? "border-chart-2/50 bg-chart-2/5" : "border-destructive/50 bg-destructive/5"
                                    )}>
                                        {formData.name ? (
                                            <Check className="h-4 w-4 text-chart-2" />
                                        ) : (
                                            <Info className="h-4 w-4 text-destructive" />
                                        )}
                                        <span className="text-sm">Campaign name</span>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border",
                                        formData.subject ? "border-chart-2/50 bg-chart-2/5" : "border-destructive/50 bg-destructive/5"
                                    )}>
                                        {formData.subject ? (
                                            <Check className="h-4 w-4 text-chart-2" />
                                        ) : (
                                            <Info className="h-4 w-4 text-destructive" />
                                        )}
                                        <span className="text-sm">Subject line</span>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border",
                                        formData.content ? "border-chart-2/50 bg-chart-2/5" : "border-destructive/50 bg-destructive/5"
                                    )}>
                                        {formData.content ? (
                                            <Check className="h-4 w-4 text-chart-2" />
                                        ) : (
                                            <Info className="h-4 w-4 text-destructive" />
                                        )}
                                        <span className="text-sm">Email content</span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Option */}
                            <div className="space-y-3 pt-3 border-t">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, schedule_enabled: false })}
                                        className={cn(
                                            "flex-1 flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
                                            !formData.schedule_enabled
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                            !formData.schedule_enabled
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground"
                                        )}>
                                            {!formData.schedule_enabled && (
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Send Now</p>
                                            <p className="text-xs text-muted-foreground">Send immediately</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, schedule_enabled: true })}
                                        className={cn(
                                            "flex-1 flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
                                            formData.schedule_enabled
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                            formData.schedule_enabled
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground"
                                        )}>
                                            {formData.schedule_enabled && (
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Schedule</p>
                                            <p className="text-xs text-muted-foreground">Send at a specific time</p>
                                        </div>
                                    </button>
                                </div>

                                {formData.schedule_enabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                                        <Input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            value={formData.scheduled_at}
                                            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="pt-4 border-t gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Save Draft
                    </Button>
                    {activeTab === "send" && (
                        <Button
                            type="button"
                            onClick={formData.schedule_enabled ? handleSchedule : handleSendNow}
                            disabled={isPending || !formData.name || !formData.subject || !formData.content}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {formData.schedule_enabled ? "Scheduling..." : "Sending..."}
                                </>
                            ) : (
                                <>
                                    {formData.schedule_enabled ? <Calendar className="h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                                    {formData.schedule_enabled ? "Schedule Campaign" : "Send Now"}
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
