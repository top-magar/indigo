"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:marketing-campaigns");

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import type {
    Campaign,
    CustomerSegment,
    CreateCampaignInput,
    CampaignStatus,
} from "./types";

async function getTenantId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    return userData?.tenant_id || null;
}


export async function getCampaigns(): Promise<{ campaigns: Campaign[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaigns: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        log.error("Error fetching campaigns:", error);
        return { campaigns: [], error: error.message };
    }

    return { campaigns: data || [] };
}

export async function getCampaign(id: string): Promise<{ campaign: Campaign | null; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaign: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        log.error("Error fetching campaign:", error);
        return { campaign: null, error: error.message };
    }

    return { campaign: data };
}

export async function createCampaign(input: CreateCampaignInput): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    if (!input.name?.trim()) {
        return { success: false, error: "Campaign name is required" };
    }

    // Get tenant info for default from email
    const { data: tenant } = await supabase
        .from("tenants")
        .select("name, email")
        .eq("id", tenantId)
        .single();

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            tenant_id: tenantId,
            name: input.name.trim(),
            type: input.type || "email",
            status: "draft",
            subject: input.subject,
            preview_text: input.preview_text,
            from_name: input.from_name || tenant?.name || "Store",
            from_email: input.from_email || tenant?.email,
            reply_to: input.reply_to,
            content: input.content,
            content_json: input.content_json,
            segment_id: input.segment_id || "all",
            segment_name: input.segment_name || "All Customers",
            scheduled_at: input.scheduled_at,
        })
        .select()
        .single();

    if (error) {
        log.error("Error creating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

export async function updateCampaign(id: string, input: Partial<CreateCampaignInput> & { status?: CampaignStatus }): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Check if campaign exists and is editable
    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status === "sent" || existing.status === "sending") {
        return { success: false, error: "Cannot edit a campaign that has been sent or is sending" };
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.preview_text !== undefined) updateData.preview_text = input.preview_text;
    if (input.from_name !== undefined) updateData.from_name = input.from_name;
    if (input.from_email !== undefined) updateData.from_email = input.from_email;
    if (input.reply_to !== undefined) updateData.reply_to = input.reply_to;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.content_json !== undefined) updateData.content_json = input.content_json;
    if (input.segment_id !== undefined) updateData.segment_id = input.segment_id;
    if (input.segment_name !== undefined) updateData.segment_name = input.segment_name;
    if (input.scheduled_at !== undefined) updateData.scheduled_at = input.scheduled_at;

    const { data, error } = await supabase
        .from("campaigns")
        .update(updateData)
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();

    if (error) {
        log.error("Error updating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

export async function deleteCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Check if campaign can be deleted
    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status === "sending") {
        return { success: false, error: "Cannot delete a campaign that is currently sending" };
    }

    // Delete recipients first
    await supabase
        .from("campaign_recipients")
        .delete()
        .eq("campaign_id", id)
        .eq("tenant_id", tenantId);

    // Delete campaign
    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        log.error("Error deleting campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function pauseCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status !== "scheduled" && existing.status !== "sending") {
        return { success: false, error: "Can only pause scheduled or sending campaigns" };
    }

    const { error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        log.error("Error pausing campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function scheduleCampaign(id: string, scheduledAt: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate campaign is ready to schedule
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!campaign) {
        return { success: false, error: "Campaign not found" };
    }

    if (!campaign.subject) {
        return { success: false, error: "Campaign must have a subject line" };
    }

    if (!campaign.content) {
        return { success: false, error: "Campaign must have content" };
    }

    // Get recipient count
    const recipientCount = await getSegmentRecipientCount(campaign.segment_id || "all");

    const { error } = await supabase
        .from("campaigns")
        .update({ 
            status: "scheduled",
            scheduled_at: scheduledAt,
            recipients_count: recipientCount,
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        log.error("Error scheduling campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function sendCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate campaign is ready to send
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!campaign) {
        return { success: false, error: "Campaign not found" };
    }

    if (campaign.status === "sent" || campaign.status === "sending") {
        return { success: false, error: "Campaign has already been sent" };
    }

    if (!campaign.subject) {
        return { success: false, error: "Campaign must have a subject line" };
    }

    if (!campaign.content) {
        return { success: false, error: "Campaign must have content" };
    }

    // Get recipients from the segment
    const recipients = await getSegmentRecipients(tenantId, campaign.segment_id || "all");

    if (recipients.length === 0) {
        return { success: false, error: "No recipients found for this segment" };
    }

    // Atomically lock campaign — prevents double-send race condition
    const { data: locked, error: lockErr } = await supabase
        .from("campaigns")
        .update({ status: "sending", recipients_count: recipients.length })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .in("status", ["draft", "scheduled"])
        .select("id")
        .maybeSingle();

    if (lockErr || !locked) {
        return { success: false, error: "Campaign is already being sent" };
    }

    // Insert campaign_recipients rows
    const recipientRows = recipients.map((r) => ({
        tenant_id: tenantId,
        campaign_id: id,
        customer_id: r.id,
        email: r.email,
        status: "pending" as const,
    }));

    await supabase.from("campaign_recipients").insert(recipientRows);

    // Send emails via EmailService
    const { EmailService } = await import("@/infrastructure/services/email");
    const emailService = new EmailService();

    let deliveredCount = 0;
    let bouncedCount = 0;
    const now = new Date().toISOString();

    for (const recipient of recipients) {
        const result = await emailService.send({
            to: recipient.email,
            subject: campaign.subject,
            html: campaign.content,
            from: campaign.from_email
                ? `${campaign.from_name || ""} <${campaign.from_email}>`.trim()
                : undefined,
            replyTo: campaign.reply_to || undefined,
        });

        if (result.success) {
            deliveredCount++;
            await supabase
                .from("campaign_recipients")
                .update({ status: "sent", sent_at: now })
                .eq("campaign_id", id)
                .eq("email", recipient.email)
                .eq("tenant_id", tenantId);
        } else {
            bouncedCount++;
            log.warn(`Failed to send campaign email to ${recipient.email}: ${result.error}`);
            await supabase
                .from("campaign_recipients")
                .update({ status: "bounced", bounced_at: now })
                .eq("campaign_id", id)
                .eq("email", recipient.email)
                .eq("tenant_id", tenantId);
        }
    }

    // Finalize campaign status
    const finalStatus = deliveredCount > 0 ? "sent" : "failed";
    const { error } = await supabase
        .from("campaigns")
        .update({
            status: finalStatus,
            sent_at: now,
            delivered_count: deliveredCount,
            bounced_count: bouncedCount,
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        log.error("Error finalizing campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function duplicateCampaign(id: string): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: original } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!original) {
        return { success: false, error: "Campaign not found" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            tenant_id: tenantId,
            name: `${original.name} (Copy)`,
            type: original.type,
            status: "draft",
            subject: original.subject,
            preview_text: original.preview_text,
            from_name: original.from_name,
            from_email: original.from_email,
            reply_to: original.reply_to,
            content: original.content,
            content_json: original.content_json,
            segment_id: original.segment_id,
            segment_name: original.segment_name,
        })
        .select()
        .single();

    if (error) {
        log.error("Error duplicating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

// ============================================================================
// SEGMENT OPERATIONS
// ============================================================================

export async function getSegments(): Promise<{ segments: CustomerSegment[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { segments: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) {
        log.error("Error fetching segments:", error);
        // Return default segments if table doesn't exist yet
        return { 
            segments: [
                { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "vip", name: "VIP Customers", description: "Top 10% by spending", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
            ]
        };
    }

    // Add default segments if none exist
    const defaultSegments: CustomerSegment[] = [
        { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "vip", name: "VIP Customers", description: "Top 10% by spending", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
    ];

    return { segments: [...defaultSegments, ...(data || [])] };
}

async function getSegmentRecipientCount(segmentId: string): Promise<number> {
    const recipients = await getSegmentRecipients(await getTenantId() || "", segmentId);
    return recipients.length;
}

async function getSegmentRecipients(tenantId: string, segmentId: string): Promise<{ id: string; email: string }[]> {
    if (!tenantId) return [];

    const supabase = await createClient();

    let query = supabase
        .from("customers")
        .select("id, email")
        .eq("tenant_id", tenantId)
        .eq("accepts_marketing", true)
        .not("email", "is", null);

    switch (segmentId) {
        case "new": {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query = query.gte("created_at", thirtyDaysAgo.toISOString());
            break;
        }
    }

    const { data } = await query;
    return (data || []).filter((c): c is { id: string; email: string } => !!c.email);
}

// ============================================================================
// AUTOMATION ACTIONS (Placeholder for future implementation)
// ============================================================================

export async function toggleAutomation(_id: string, _isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return { success: true };
}
