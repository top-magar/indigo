import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { db } from '@/infrastructure/db';
import { products } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { ForecastService } from '@/infrastructure/services';
import type { InventoryInsight } from '@/infrastructure/services/forecast';

const LOW_STOCK_THRESHOLD = 10;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userData?.tenant_id) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenantId = userData.tenant_id;

    // Get products with low stock
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        quantity: products.quantity,
        sku: products.sku,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        eq(products.trackQuantity, true),
        lte(products.quantity, LOW_STOCK_THRESHOLD * 3) // Get products that might need attention
      ))
      .limit(50);

    let insights: InventoryInsight[] = [];

    // Try ForecastService (handles AWS Forecast/Canvas with automatic fallback)
    try {
      const forecastService = new ForecastService();
      const forecastResult = await forecastService.generateInsights(
        tenantId,
        lowStockProducts.map(p => ({
          productId: p.id,
          productName: p.name,
          currentStock: p.quantity || 0,
          categoryId: p.categoryId || undefined,
        }))
      );

      if (forecastResult.success && forecastResult.insights) {
        insights = forecastResult.insights;
      }
    } catch (error) {
      console.error('ForecastService error, using fallback:', error);
    }

    // Fallback: Generate basic insights from stock levels
    if (insights.length === 0) {
      insights = lowStockProducts
        .filter(p => (p.quantity || 0) <= LOW_STOCK_THRESHOLD)
        .map(p => {
          const stock = p.quantity || 0;
          let priority: InventoryInsight['priority'] = 'low';
          let type: InventoryInsight['type'] = 'reorder_suggestion';

          if (stock === 0) {
            priority = 'critical';
            type = 'stock_out_warning';
          } else if (stock <= 3) {
            priority = 'high';
            type = 'stock_out_warning';
          } else if (stock <= LOW_STOCK_THRESHOLD) {
            priority = 'medium';
            type = 'reorder_suggestion';
          }

          return {
            id: `stock-${p.id}`,
            type,
            priority,
            title: stock === 0 
              ? `${p.name} is out of stock`
              : `${p.name} is running low`,
            description: stock === 0
              ? 'This product is currently unavailable for customers.'
              : `Only ${stock} units remaining. Consider reordering soon.`,
            productId: p.id,
            productName: p.name,
            actionLabel: 'Adjust Stock',
            actionUrl: `/dashboard/inventory?product=${p.id}`,
            metadata: {
              currentStock: stock,
              sku: p.sku,
            },
          };
        })
        .sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        });
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Forecast insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
