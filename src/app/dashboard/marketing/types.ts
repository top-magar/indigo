export type DiscountType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
export type DiscountScope = "all" | "products" | "collections" | "customers";

export interface Discount {
    id: string;
    tenant_id: string;
    code: string;
    name: string;
    description: string | null;
    type: DiscountType;
    value: number;
    scope: DiscountScope;
    min_order_amount: number | null;
    min_quantity: number | null;
    max_uses: number | null;
    max_uses_per_customer: number | null;
    used_count: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    combines_with_other_discounts: boolean;
    first_time_purchase_only: boolean;
    applicable_product_ids: string[] | null;
    applicable_collection_ids: string[] | null;
    applicable_customer_ids: string[] | null;
    excluded_product_ids: string[] | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface DiscountUsage {
    id: string;
    tenant_id: string;
    discount_id: string;
    customer_id: string | null;
    order_id: string | null;
    discount_amount: number;
    used_at: string;
}

export type CampaignType = "email" | "sms" | "push";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";
export type AutomationType = "welcome" | "abandoned_cart" | "post_purchase" | "win_back" | "birthday";

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    subject: string | null;
    preview_text: string | null;
    from_name: string | null;
    from_email: string | null;
    reply_to: string | null;
    content: string | null;
    content_json: Record<string, unknown> | null;
    template_id: string | null;
    segment_id: string | null;
    segment_name: string | null;
    scheduled_at: string | null;
    sent_at: string | null;
    recipients_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    revenue_generated: number;
    created_at: string;
    updated_at: string;
}

export interface Automation {
    id: string;
    name: string;
    type: AutomationType;
    description: string;
    is_active: boolean;
    trigger_delay_hours: number;
    emails_sent: number;
    conversion_rate: number;
    revenue_generated: number;
    created_at: string;
    updated_at: string;
}

export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    customer_count: number;
    conditions: Record<string, unknown>;
    created_at: string;
}

export interface MarketingActivity {
    id: string;
    type: "discount_used" | "campaign_sent" | "subscriber_added" | "automation_triggered";
    title: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface MarketingStats {
    totalDiscounts: number;
    activeDiscounts: number;
    totalRedemptions: number;
    discountRevenue: number;
    avgDiscountValue: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalEmailsSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    campaignRevenue: number;
    totalAutomations: number;
    activeAutomations: number;
    automationRevenue: number;
    totalSubscribers: number;
    subscriberGrowth: number;
}

export interface MarketingData {
    discounts: Discount[];
    campaigns: Campaign[];
    automations: Automation[];
    segments: CustomerSegment[];
    stats: MarketingStats;
    recentActivity: MarketingActivity[];
}

export interface ProductOption {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    image_url: string | null;
}

export interface CollectionOption {
    id: string;
    name: string;
    slug: string;
    product_count: number;
}

export interface CategoryOption {
    id: string;
    name: string;
    parent_name: string | null;
    product_count: number;
}

export interface CreateDiscountInput {
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    scope: DiscountScope;
    min_order_amount?: number;
    min_quantity?: number;
    max_uses?: number;
    max_uses_per_customer?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
    combines_with_other_discounts?: boolean;
    first_time_purchase_only?: boolean;
    applicable_product_ids?: string[];
    applicable_collection_ids?: string[];
    applicable_customer_ids?: string[];
    excluded_product_ids?: string[];
}

export interface CreateCampaignInput {
    name: string;
    type?: CampaignType;
    subject?: string;
    preview_text?: string;
    from_name?: string;
    from_email?: string;
    reply_to?: string;
    content?: string;
    content_json?: Record<string, unknown>;
    template_id?: string;
    segment_id?: string;
    segment_name?: string;
    scheduled_at?: string;
}
