# AWS Integration - Code Examples & Patterns

## Current Usage Patterns

### 1. Product AI Actions

**File**: `src/app/dashboard/products/ai-actions.ts`

```typescript
// Generate product description
export async function generateAIDescription(
  productName: string,
  attributes: string[],
  tone: 'professional' | 'casual' | 'luxury' | 'playful' = 'professional'
): Promise<{ success: boolean; description?: string; error?: string }> {
  try {
    const result = await generateProductDescription(productName, attributes, {
      tone,
      length: 'medium',
      includeKeywords: attributes.slice(0, 5),
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, description: result.content };
  } catch (error) {
    console.error('[AI] Description generation failed:', error);
    return { success: false, error: 'Failed to generate description' };
  }
}

// Analyze product image
export async function analyzeProductImageAction(
  s3Key: string
): Promise<{ success: boolean; analysis?: ImageAnalysisResult; error?: string }> {
  try {
    const analysis = await analyzeProductImage(s3Key);

    return {
      success: true,
      analysis: {
        isSafe: analysis.moderation.isSafe,
        suggestedTags: analysis.suggestedTags,
        detectedText: analysis.text.textDetections
          .filter(t => t.type === 'LINE')
          .map(t => t.text),
        moderationWarnings: analysis.moderation.labels.map(l => l.name),
      },
    };
  } catch (error) {
    console.error('[AI] Image analysis failed:', error);
    return { success: false, error: 'Failed to analyze image' };
  }
}

// Generate complete AI suggestions
export async function generateAIProductSuggestions(
  productName: string,
  description?: string,
  imageS3Key?: string
): Promise<{ success: boolean; suggestions?: AIProductSuggestions; error?: string }> {
  try {
    const suggestions: AIProductSuggestions = {};

    // Get image-based suggestions if image provided
    let imageLabels: string[] = [];
    if (imageS3Key) {
      const imageAnalysis = await analyzeProductImage(imageS3Key);
      imageLabels = imageAnalysis.suggestedTags;
    }

    // Generate description if not provided
    if (!description) {
      const descResult = await generateProductDescription(
        productName,
        imageLabels.length > 0 ? imageLabels : [productName],
        { tone: 'professional', length: 'medium' }
      );
      if (descResult.success) {
        suggestions.description = descResult.content;
        description = descResult.content;
      }
    }

    // Generate tags from description
    if (description) {
      const tagResult = await suggestProductTags(productName, description);
      if (tagResult.success && tagResult.content) {
        suggestions.tags = tagResult.content
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);
      }

      // Extract key phrases for SEO
      const keyPhrases = await extractKeyPhrases(description);
      if (keyPhrases.phrases.length > 0) {
        const topPhrases = keyPhrases.phrases.slice(0, 3).map(p => p.text);
        suggestions.seoTitle = `${productName} - ${topPhrases.join(', ')}`;
        suggestions.seoDescription = description.slice(0, 160);
      }
    }

    // Merge image labels with generated tags
    if (imageLabels.length > 0) {
      suggestions.tags = [...new Set([...(suggestions.tags || []), ...imageLabels])].slice(0, 15);
    }

    return { success: true, suggestions };
  } catch (error) {
    console.error('[AI] Product suggestions failed:', error);
    return { success: false, error: 'Failed to generate suggestions' };
  }
}
```

### 2. Order Processing with AI

**File**: `src/app/dashboard/orders/ai-actions.ts`

```typescript
// Analyze order sentiment
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

// Generate AI-powered order insights
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

// Calculate order risk score
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
```

### 3. Media Upload with Moderation

**File**: `src/app/api/media/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/infrastructure/auth/session';
import { uploadToS3, getPresignedUploadUrl } from '@/infrastructure/aws/s3';
import { moderateImage, detectLabels } from '@/infrastructure/aws/rekognition';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !tenantId) {
      return NextResponse.json(
        { error: 'Missing file or tenantId' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Moderate image
    const moderation = await moderateImage({ bytes: new Uint8Array(buffer) });
    if (!moderation.isSafe) {
      return NextResponse.json(
        { 
          error: 'Image contains inappropriate content',
          violations: moderation.labels.map(l => l.name)
        },
        { status: 400 }
      );
    }

    // Upload to S3
    const uploadResult = await uploadToS3(buffer, {
      tenantId,
      filename: file.name,
      contentType: file.type,
      folder: 'products',
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      );
    }

    // Detect labels for auto-tagging
    const labels = await detectLabels({ s3Key: uploadResult.key });

    return NextResponse.json({
      success: true,
      url: uploadResult.cdnUrl,
      key: uploadResult.key,
      suggestedTags: labels.labels
        .filter(l => l.confidence > 80)
        .map(l => l.name.toLowerCase())
        .slice(0, 10),
    });
  } catch (error) {
    console.error('[Media Upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Get presigned URL for direct upload
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');
    const tenantId = searchParams.get('tenantId');

    if (!filename || !contentType || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await getPresignedUploadUrl({
      tenantId,
      filename,
      contentType,
      folder: 'products',
    });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error('[Presigned URL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
```

### 4. Search with OpenSearch

**File**: `src/features/search/opensearch-search.ts`

```typescript
import { searchProducts, getAutocompleteSuggestions } from '@/infrastructure/aws/opensearch';

export async function searchProductsAction(
  tenantId: string,
  query: string,
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  },
  page: number = 1,
  pageSize: number = 20
) {
  try {
    const result = await searchProducts({
      query,
      tenantId,
      filters,
      facets: ['category', 'vendor', 'priceRange', 'stockStatus'],
      sort: query ? { field: '_score', order: 'desc' } : { field: 'createdAt', order: 'desc' },
      page,
      pageSize,
      highlight: true,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      products: result.hits?.map(hit => ({
        ...hit.document,
        highlights: hit.highlights,
      })) || [],
      total: result.total || 0,
      facets: result.facets || {},
    };
  } catch (error) {
    console.error('[Search] Error:', error);
    return { success: false, error: 'Search failed' };
  }
}

export async function getSearchSuggestions(
  tenantId: string,
  query: string,
  limit: number = 10
) {
  try {
    const result = await getAutocompleteSuggestions(tenantId, query, limit);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      suggestions: result.hits?.map(hit => ({
        name: hit.document.name,
        slug: hit.document.slug,
        image: hit.document.image,
      })) || [],
    };
  } catch (error) {
    console.error('[Autocomplete] Error:', error);
    return { success: false, error: 'Autocomplete failed' };
  }
}
```

### 5. Recommendations

**File**: `src/features/recommendations/actions.ts`

```typescript
export async function getRecommendations(options: RecommendationOptions) {
  const { tenantId, customerId, limit = 8 } = options;

  try {
    // If no customer, return trending products
    if (!customerId) {
      return getTrendingProducts({ tenantId, limit });
    }

    // Try AWS Personalize first
    if (isPersonalizeEnabled()) {
      const personalizeResult = await getPersonalizedRecommendations(customerId, {
        numResults: limit,
      });

      if (personalizeResult.success && personalizeResult.recommendations?.length) {
        const productIds = personalizeResult.recommendations.map(r => r.itemId);
        
        // Fetch full product details
        const recommendedProducts = await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            images: products.images,
          })
          .from(products)
          .where(and(
            eq(products.tenantId, tenantId),
            eq(products.status, 'active'),
            inArray(products.id, productIds)
          ))
          .limit(limit);

        // Sort by Personalize ranking
        const sortedProducts = productIds
          .map(id => recommendedProducts.find(p => p.id === id))
          .filter(Boolean);

        return { 
          success: true, 
          products: sortedProducts,
          source: 'personalize' as const,
        };
      }
    }

    // Fallback to SQL-based collaborative filtering
    const purchasedProducts = await db
      .select({ productId: orderItems.productId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orders.tenantId, tenantId),
        eq(orders.customerId, customerId)
      ));

    const purchasedIds = purchasedProducts.map(p => p.productId).filter(Boolean) as string[];

    if (purchasedIds.length === 0) {
      return getTrendingProducts({ tenantId, limit });
    }

    // Find products frequently bought together
    const recommendations = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
      })
      .from(products)
      .innerJoin(orderItems, eq(products.id, orderItems.productId))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        sql`${products.id} NOT IN (${purchasedIds.map(id => `'${id}'`).join(',')})`
      ))
      .groupBy(products.id)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return { success: true, products: recommendations, source: 'collaborative' as const };
  } catch (error) {
    console.error('[Recommendations] Failed:', error);
    return { success: false, products: [], error: 'Failed to get recommendations' };
  }
}

// Track user interactions for personalization
export async function trackProductInteraction(
  userId: string,
  sessionId: string,
  eventType: InteractionEventType,
  productId: string,
  options?: {
    eventValue?: number;
    properties?: Record<string, string>;
  }
) {
  if (!isPersonalizeEnabled()) {
    return { success: true, tracked: false };
  }

  try {
    const result = await trackInteraction(userId, sessionId, eventType, productId, options);
    return { success: result.success, tracked: true };
  } catch (error) {
    console.error('[Track Interaction] Failed:', error);
    return { success: false, tracked: false };
  }
}
```

### 6. Inventory Forecasting

**File**: `src/app/api/inventory/forecast-insights/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { calculateStockOutRisk, generateInventoryInsights } from '@/infrastructure/aws/forecast';
import { db } from '@/infrastructure/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { tenantId, productIds } = await request.json();

    if (!tenantId || !productIds?.length) {
      return NextResponse.json(
        { error: 'Missing tenantId or productIds' },
        { status: 400 }
      );
    }

    // Get product data
    const productData = await db
      .select({
        productId: products.id,
        productName: products.name,
        currentStock: products.stock,
        leadTimeDays: products.leadTimeDays,
      })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    // Calculate stock-out risks
    const riskResult = await calculateStockOutRisk(productData);

    if (!riskResult.success) {
      return NextResponse.json(
        { error: riskResult.error },
        { status: 500 }
      );
    }

    // Generate insights
    const insightsResult = await generateInventoryInsights(tenantId, productData);

    return NextResponse.json({
      success: true,
      risks: riskResult.risks,
      insights: insightsResult.insights,
    });
  } catch (error) {
    console.error('[Forecast] Error:', error);
    return NextResponse.json(
      { error: 'Forecast failed' },
      { status: 500 }
    );
  }
}
```

## Best Practices

### 1. Always Validate Input
```typescript
// ✅ Good
const validation = ServiceValidator.validateEmail(email);
if (!validation.valid) {
  throw new Error(validation.error);
}

// ❌ Bad
await sendEmail(email); // No validation
```

### 2. Use Consistent Error Handling
```typescript
// ✅ Good
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  console.error('[Service] Operation failed:', error);
  return { success: false, error: error.message };
}

// ❌ Bad
const result = await operation(); // No error handling
return result;
```

### 3. Track Operations
```typescript
// ✅ Good
return ServiceObservability.trackOperation(
  'upload',
  'S3',
  () => uploadToS3(file, options),
  { tenantId }
);

// ❌ Bad
return uploadToS3(file, options); // No observability
```

### 4. Implement Retry Logic
```typescript
// ✅ Good
return ServiceErrorHandler.withRetry(
  () => operation(),
  { maxRetries: 3, backoffMs: 100 }
);

// ❌ Bad
return operation(); // No retry on transient failures
```

### 5. Use Feature Flags
```typescript
// ✅ Good
if (isOpenSearchEnabled()) {
  return searchWithOpenSearch(query);
}
return searchWithSQL(query);

// ❌ Bad
return searchWithOpenSearch(query); // Fails if not configured
```

## Troubleshooting

### Common Issues

**Issue**: "AWS credentials not found"
**Solution**: Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set

**Issue**: "Service not enabled"
**Solution**: Check environment variable (e.g., `AWS_OPENSEARCH_ENABLED=true`)

**Issue**: "Timeout errors"
**Solution**: Increase timeout or implement retry logic with exponential backoff

**Issue**: "High costs"
**Solution**: Review usage patterns, implement caching, use local alternatives where possible
