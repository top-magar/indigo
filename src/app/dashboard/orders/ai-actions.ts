"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { analyzeSentiment } from "@/infrastructure/aws/comprehend";
import { generateSupportResponse } from "@/infrastructure/aws/bedrock";
import { formatCurrency } from "@/shared/utils";

// ============================================================================
// Types
// ============================================================================

export interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "info" | "success";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

interface OrdersPageStats {
  pending: number;
  processing: number;
  revenue: number;
  avgOrderValue: number;
}

// ============================================================================
// Orders Page Insights
// ============================================================================

/**
 * Generate AI insights for the orders dashboard
 */
export async function getOrdersPageInsights(stats: OrdersPageStats): Promise<{ insights: AIInsight[] }> {
  const insights: AIInsight[] = [];
  
  // Warning: Pending orders need attention
  if (stats.pending > 0) {
    insights.push({
      id: "pending-orders",
      type: "warning",
      title: `${stats.pending} order${stats.pending === 1 ? "" : "s"} pending`,
      description: "Consider processing these orders to maintain customer satisfaction.",
      action: { label: "View pending", href: "/dashboard/orders?status=pending" },
    });
  }
  
  // Opportunity: High average order value
  if (stats.avgOrderValue > 100) {
    insights.push({
      id: "high-aov",
      type: "opportunity",
      title: "Above average order value",
      description: `Your AOV of ${formatCurrency(stats.avgOrderValue, "USD")} is performing well. Consider upselling strategies.`,
    });
  }
  
  // Info: Processing orders backlog
  if (stats.processing > 5) {
    insights.push({
      id: "processing-backlog",
      type: "info",
      title: `${stats.processing} orders in processing`,
      description: "Ensure fulfillment team is aware of the current workload.",
      action: { label: "View processing", href: "/dashboard/orders?status=processing" },
    });
  }
  
  // Success: Revenue milestone
  if (stats.revenue > 10000) {
    insights.push({
      id: "revenue-milestone",
      type: "success",
      title: "Strong revenue performance",
      description: `You've generated ${formatCurrency(stats.revenue, "USD")} in orders.`,
    });
  }

  // Info: Low pending orders (good performance)
  if (stats.pending === 0 && stats.processing > 0) {
    insights.push({
      id: "no-pending",
      type: "success",
      title: "All orders being processed",
      description: "Great job! No orders are waiting to be processed.",
    });
  }
  
  return { insights };
}

/**
 * Analyze customer sentiment from order notes using AWS Comprehend
 */
export async function analyzeOrderSentiment(orderId: string) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("customer_note, internal_notes")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const textToAnalyze = [order.customer_note, order.internal_notes]
    .filter(Boolean)
    .join(" ");

  if (!textToAnalyze) {
    return { sentiment: null, message: "No text to analyze" };
  }

  try {
    const result = await analyzeSentiment(textToAnalyze);
    return {
      sentiment: {
        score: result.scores.positive - result.scores.negative,
        label: result.sentiment.toLowerCase() as "positive" | "neutral" | "negative",
        confidence: Math.max(
          result.scores.positive,
          result.scores.negative,
          result.scores.neutral
        ),
      },
    };
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    return { error: "Failed to analyze sentiment" };
  }
}

/**
 * Generate AI-powered order insights using AWS Bedrock
 */
export async function generateOrderInsights(orderId: string) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      customers (*)
    `)
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const context = {
    orderNumber: order.order_number,
    status: order.status,
    total: `${order.currency} ${order.total}`,
    itemCount: order.order_items?.length || 0,
    customerNote: order.customer_note || "None",
    customerName: order.customer_name || "Guest",
    previousOrders: order.customers?.orders_count || 0,
  };

  const prompt = `Analyze this order and provide 3 brief, actionable recommendations:
Order #${context.orderNumber}, Status: ${context.status}, Total: ${context.total}
Customer: ${context.customerName} (${context.previousOrders} previous orders)
Note: ${context.customerNote}`;

  try {
    const response = await generateSupportResponse(prompt, {
      orderStatus: context.status,
    });

    if (!response.success || !response.content) {
      return { error: "Failed to generate insights" };
    }

    // Parse recommendations from response
    const recommendations = response.content
      .split("\n")
      .filter((line: string) => line.trim().match(/^[\d\-\*]/))
      .map((line: string) => line.replace(/^[\d\-\*\.\)]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return { recommendations };
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return { error: "Failed to generate insights" };
  }
}

/**
 * Generate AI-powered email draft for customer communication
 */
export async function generateCustomerEmail(
  orderId: string,
  emailType: "confirmation" | "shipping" | "followup" | "issue"
) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items (*)")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const emailPrompts: Record<string, string> = {
    confirmation: `Write a brief, friendly order confirmation email for order #${order.order_number}. 
      Customer: ${order.customer_name || "Valued Customer"}
      Total: ${order.currency} ${order.total}
      Items: ${(order.order_items as Array<{ product_name: string }>)?.map((i) => i.product_name).join(", ")}`,
    shipping: `Write a brief shipping notification email for order #${order.order_number}.
      Customer: ${order.customer_name || "Valued Customer"}
      Include a note about tracking information.`,
    followup: `Write a brief follow-up email asking for feedback on order #${order.order_number}.
      Customer: ${order.customer_name || "Valued Customer"}
      Keep it friendly and not pushy.`,
    issue: `Write a brief, empathetic email addressing a potential issue with order #${order.order_number}.
      Customer: ${order.customer_name || "Valued Customer"}
      Offer assistance and reassurance.`,
  };

  try {
    const response = await generateSupportResponse(emailPrompts[emailType], {
      orderStatus: order.status,
    });

    if (!response.success || !response.content) {
      return { error: "Failed to generate email" };
    }

    return { 
      email: {
        subject: getEmailSubject(emailType, order.order_number),
        body: response.content.trim(),
      }
    };
  } catch (error) {
    console.error("Email generation failed:", error);
    return { error: "Failed to generate email" };
  }
}

function getEmailSubject(type: string, orderNumber: string): string {
  const subjects: Record<string, string> = {
    confirmation: `Order Confirmed - #${orderNumber}`,
    shipping: `Your Order #${orderNumber} Has Shipped!`,
    followup: `How was your order #${orderNumber}?`,
    issue: `Update on Your Order #${orderNumber}`,
  };
  return subjects[type] || `Regarding Order #${orderNumber}`;
}

/**
 * Calculate order risk score based on various factors
 */
export async function calculateOrderRisk(orderId: string) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        orders_count,
        total_spent,
        created_at
      )
    `)
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  let riskScore = 0;
  const riskFactors: string[] = [];

  // Guest checkout (higher risk)
  if (!order.customer_id) {
    riskScore += 0.2;
    riskFactors.push("Guest checkout");
  }

  // New customer
  if (order.customers?.orders_count === 1) {
    riskScore += 0.1;
    riskFactors.push("First-time customer");
  }

  // High value order
  const orderTotal = parseFloat(order.total);
  if (orderTotal > 500) {
    riskScore += 0.15;
    riskFactors.push("High-value order");
  }

  // Mismatched addresses
  if (order.shipping_address && order.billing_address) {
    const shipping = order.shipping_address as any;
    const billing = order.billing_address as any;
    if (shipping.postalCode !== billing.postalCode) {
      riskScore += 0.1;
      riskFactors.push("Different shipping/billing addresses");
    }
  }

  // Normalize score to 0-1
  riskScore = Math.min(riskScore, 1);

  return {
    riskScore,
    riskLevel: riskScore > 0.6 ? "high" : riskScore > 0.3 ? "medium" : "low",
    factors: riskFactors,
  };
}

/**
 * Get AI-powered product recommendations for upsell/cross-sell
 */
export async function getOrderRecommendations(orderId: string) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      tenant_id,
      order_items (product_id)
    `)
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const productIds = order.order_items?.map((i: any) => i.product_id).filter(Boolean) || [];

  if (productIds.length === 0) {
    return { recommendations: [] };
  }

  // Get related products from same categories
  const { data: orderedProducts } = await supabase
    .from("products")
    .select("category_id")
    .in("id", productIds);

  const categoryIds = [...new Set(orderedProducts?.map((p) => p.category_id).filter(Boolean))];

  if (categoryIds.length === 0) {
    return { recommendations: [] };
  }

  // Get other products from same categories
  const { data: recommendations } = await supabase
    .from("products")
    .select("id, name, price, images")
    .eq("tenant_id", order.tenant_id)
    .in("category_id", categoryIds)
    .not("id", "in", `(${productIds.join(",")})`)
    .eq("status", "active")
    .limit(4);

  return {
    recommendations: (recommendations || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      image: p.images?.[0],
    })),
  };
}