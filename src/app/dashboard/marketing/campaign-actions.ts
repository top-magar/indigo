"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:marketing-campaigns");

import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/db";
import { campaigns, campaignRecipients, customerSegments } from "@/db/schema/campaigns";
import { customers } from "@/db/schema/customers";
import { tenants } from "@/db/schema/tenants";
import { eq, and, desc, asc, inArray, isNotNull, gte } from "drizzle-orm";
import type {
    Campaign,
    CustomerSegment,
    CreateCampaignInput,
    CampaignStatus,
} from "./types";

async function getTenantId(): Promise<string | null> {
    const { user } = await getAuthenticatedClient();
    return user.tenantId;
}


export async function getCampaigns(): Promise<{ campaigns: Campaign[]; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaigns: [], error: "Unauthorized" };
    }

    try {
        const data = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.tenantId, tenantId))
            .orderBy(desc(campaigns.createdAt));

        return { campaigns: (data || []) as unknown as Campaign[] };
    } catch (error) {
        log.error("Error fetching campaigns:", error);
        return { campaigns: [], error: "Failed to fetch campaigns" };
    }
}

export async function getCampaign(id: string): Promise<{ campaign: Campaign | null; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaign: null, error: "Unauthorized" };
    }

    try {
        const [data] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

        return { campaign: (data as unknown as Campaign) || null };
    } catch (error) {
        log.error("Error fetching campaign:", error);
        return { campaign: null, error: "Failed to fetch campaign" };
    }
}

export async function createCampaign(input: CreateCampaignInput): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    if (!input.name?.trim()) {
        return { success: false, error: "Campaign name is required" };
    }

    try {
        // Get tenant info for default from email
        const [tenant] = await db
            .select({ name: tenants.name })
            .from(tenants)
            .where(eq(tenants.id, tenantId))
            .limit(1);

        const [data] = await db
            .insert(campaigns)
            .values({
                tenantId,
                name: input.name.trim(),
                type: input.type || "email",
                status: "draft",
                subject: input.subject,
                previewText: input.preview_text,
                fromName: input.from_name || tenant?.name || "Store",
                fromEmail: input.from_email,
                replyTo: input.reply_to,
                content: input.content,
                contentJson: input.content_json,
                segmentId: input.segment_id || "all",
                segmentName: input.segment_name || "All Customers",
                scheduledAt: input.scheduled_at ? new Date(input.scheduled_at) : null,
            })
            .returning();

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true, campaign: data as unknown as Campaign };
    } catch (error) {
        log.error("Error creating campaign:", error);
        return { success: false, error: "Failed to create campaign" };
    }
}

export async function updateCampaign(id: string, input: Partial<CreateCampaignInput> & { status?: CampaignStatus }): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if campaign exists and is editable
        const [existing] = await db
            .select({ status: campaigns.status })
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

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
        if (input.preview_text !== undefined) updateData.previewText = input.preview_text;
        if (input.from_name !== undefined) updateData.fromName = input.from_name;
        if (input.from_email !== undefined) updateData.fromEmail = input.from_email;
        if (input.reply_to !== undefined) updateData.replyTo = input.reply_to;
        if (input.content !== undefined) updateData.content = input.content;
        if (input.content_json !== undefined) updateData.contentJson = input.content_json;
        if (input.segment_id !== undefined) updateData.segmentId = input.segment_id;
        if (input.segment_name !== undefined) updateData.segmentName = input.segment_name;
        if (input.scheduled_at !== undefined) updateData.scheduledAt = input.scheduled_at ? new Date(input.scheduled_at) : null;

        const [data] = await db
            .update(campaigns)
            .set(updateData)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .returning();

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true, campaign: data as unknown as Campaign };
    } catch (error) {
        log.error("Error updating campaign:", error);
        return { success: false, error: "Failed to update campaign" };
    }
}

export async function deleteCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if campaign can be deleted
        const [existing] = await db
            .select({ status: campaigns.status })
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

        if (!existing) {
            return { success: false, error: "Campaign not found" };
        }

        if (existing.status === "sending") {
            return { success: false, error: "Cannot delete a campaign that is currently sending" };
        }

        // Delete recipients first
        await db
            .delete(campaignRecipients)
            .where(and(eq(campaignRecipients.campaignId, id), eq(campaignRecipients.tenantId, tenantId)));

        // Delete campaign
        await db
            .delete(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true };
    } catch (error) {
        log.error("Error deleting campaign:", error);
        return { success: false, error: "Failed to delete campaign" };
    }
}

export async function pauseCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const [existing] = await db
            .select({ status: campaigns.status })
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

        if (!existing) {
            return { success: false, error: "Campaign not found" };
        }

        if (existing.status !== "scheduled" && existing.status !== "sending") {
            return { success: false, error: "Can only pause scheduled or sending campaigns" };
        }

        await db
            .update(campaigns)
            .set({ status: "paused" })
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true };
    } catch (error) {
        log.error("Error pausing campaign:", error);
        return { success: false, error: "Failed to pause campaign" };
    }
}

export async function scheduleCampaign(id: string, scheduledAt: string): Promise<{ success: boolean; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Validate campaign is ready to schedule
        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

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
        const recipientCount = await getSegmentRecipientCount(campaign.segmentId || "all");

        await db
            .update(campaigns)
            .set({
                status: "scheduled",
                scheduledAt: new Date(scheduledAt),
                recipientsCount: recipientCount,
            })
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true };
    } catch (error) {
        log.error("Error scheduling campaign:", error);
        return { success: false, error: "Failed to schedule campaign" };
    }
}

export async function sendCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Validate campaign is ready to send
        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

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
        const recipients = await getSegmentRecipients(tenantId, campaign.segmentId || "all");

        if (recipients.length === 0) {
            return { success: false, error: "No recipients found for this segment" };
        }

        // Atomically lock campaign — prevents double-send race condition
        const [locked] = await db
            .update(campaigns)
            .set({ status: "sending", recipientsCount: recipients.length })
            .where(and(
                eq(campaigns.id, id),
                eq(campaigns.tenantId, tenantId),
                inArray(campaigns.status, ["draft", "scheduled"]),
            ))
            .returning({ id: campaigns.id });

        if (!locked) {
            return { success: false, error: "Campaign is already being sent" };
        }

        // Insert campaign_recipients rows
        const recipientRows = recipients.map((r) => ({
            tenantId,
            campaignId: id,
            customerId: r.id,
            email: r.email,
            status: "pending" as const,
        }));

        await db.insert(campaignRecipients).values(recipientRows);

        // Send emails via EmailService
        const { EmailService } = await import("@/infrastructure/services/email");
        const emailService = new EmailService();

        let deliveredCount = 0;
        let bouncedCount = 0;
        const now = new Date();

        for (const recipient of recipients) {
            const result = await emailService.send({
                to: recipient.email,
                subject: campaign.subject,
                html: campaign.content,
                from: campaign.fromEmail
                    ? `${campaign.fromName || ""} <${campaign.fromEmail}>`.trim()
                    : undefined,
                replyTo: campaign.replyTo || undefined,
            });

            if (result.success) {
                deliveredCount++;
                await db
                    .update(campaignRecipients)
                    .set({ status: "sent", sentAt: now })
                    .where(and(
                        eq(campaignRecipients.campaignId, id),
                        eq(campaignRecipients.email, recipient.email),
                        eq(campaignRecipients.tenantId, tenantId),
                    ));
            } else {
                bouncedCount++;
                log.warn(`Failed to send campaign email to ${recipient.email}: ${result.error}`);
                await db
                    .update(campaignRecipients)
                    .set({ status: "bounced", bouncedAt: now })
                    .where(and(
                        eq(campaignRecipients.campaignId, id),
                        eq(campaignRecipients.email, recipient.email),
                        eq(campaignRecipients.tenantId, tenantId),
                    ));
            }
        }

        // Finalize campaign status
        const finalStatus = deliveredCount > 0 ? "sent" : "failed";
        await db
            .update(campaigns)
            .set({
                status: finalStatus,
                sentAt: now,
                deliveredCount,
                bouncedCount,
            })
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true };
    } catch (error) {
        log.error("Error sending campaign:", error);
        return { success: false, error: "Failed to send campaign" };
    }
}

export async function duplicateCampaign(id: string): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const [original] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
            .limit(1);

        if (!original) {
            return { success: false, error: "Campaign not found" };
        }

        const [data] = await db
            .insert(campaigns)
            .values({
                tenantId,
                name: `${original.name} (Copy)`,
                type: original.type,
                status: "draft",
                subject: original.subject,
                previewText: original.previewText,
                fromName: original.fromName,
                fromEmail: original.fromEmail,
                replyTo: original.replyTo,
                content: original.content,
                contentJson: original.contentJson,
                segmentId: original.segmentId,
                segmentName: original.segmentName,
            })
            .returning();

        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/marketing/campaigns");
        
        return { success: true, campaign: data as unknown as Campaign };
    } catch (error) {
        log.error("Error duplicating campaign:", error);
        return { success: false, error: "Failed to duplicate campaign" };
    }
}

// ============================================================================
// SEGMENT OPERATIONS
// ============================================================================

export async function getSegments(): Promise<{ segments: CustomerSegment[]; error?: string }> {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { segments: [], error: "Unauthorized" };
    }

    try {
        const data = await db
            .select()
            .from(customerSegments)
            .where(and(eq(customerSegments.tenantId, tenantId), eq(customerSegments.isActive, true)))
            .orderBy(asc(customerSegments.name));

        // Add default segments
        const defaultSegments: CustomerSegment[] = [
            { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
            { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
            { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
            { id: "vip", name: "VIP Customers", description: "Top 10% by spending", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        ];

        return { segments: [...defaultSegments, ...(data as unknown as CustomerSegment[] || [])] };
    } catch (error) {
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
}

async function getSegmentRecipientCount(segmentId: string): Promise<number> {
    const recipients = await getSegmentRecipients(await getTenantId() || "", segmentId);
    return recipients.length;
}

async function getSegmentRecipients(tenantId: string, segmentId: string): Promise<{ id: string; email: string }[]> {
    if (!tenantId) return [];

    let conditions = [
        eq(customers.tenantId, tenantId),
        eq(customers.acceptsMarketing, true),
        isNotNull(customers.email),
    ];

    if (segmentId === "new") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        conditions.push(gte(customers.createdAt, thirtyDaysAgo));
    }

    const data = await db
        .select({ id: customers.id, email: customers.email })
        .from(customers)
        .where(and(...conditions));

    return (data || []).filter((c): c is { id: string; email: string } => !!c.email);
}

// ============================================================================
// AUTOMATION ACTIONS (Placeholder for future implementation)
// ============================================================================

export async function toggleAutomation(_id: string, _isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return { success: true };
}
