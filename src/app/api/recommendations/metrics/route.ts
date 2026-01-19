import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { 
  isPersonalizeEnabled,
  getPersonalizedRecommendations,
} from '@/infrastructure/aws/personalize';

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

    // Check if Personalize is enabled
    if (!isPersonalizeEnabled()) {
      // Return mock data for demo purposes
      return NextResponse.json({
        status: 'setup_required',
        metrics: {
          clickThroughRate: '0%',
          conversionRate: '0%',
          revenueImpact: '$0',
          recommendationsServed: '0',
        },
        activeUsers: 0,
        recommendationClicks: 0,
        trends: {
          clickThroughRate: '0%',
          conversionRate: '0%',
          revenueImpact: '0%',
          recommendationsServed: '0%',
          activeUsers: '0%',
          recommendationClicks: '0%',
        },
      });
    }

    // In a real implementation, you would:
    // 1. Query your analytics database for recommendation metrics
    // 2. Get actual performance data from Personalize
    // 3. Calculate CTR, conversion rates, revenue impact

    // For now, return mock data that shows what the metrics would look like
    return NextResponse.json({
      status: 'active',
      metrics: {
        clickThroughRate: '12.4%',
        conversionRate: '8.7%',
        revenueImpact: '$2,847',
        recommendationsServed: '1,234',
      },
      activeUsers: 847,
      recommendationClicks: 153,
      trends: {
        clickThroughRate: '+2.1%',
        conversionRate: '+1.3%',
        revenueImpact: '+15.2%',
        recommendationsServed: '+8.9%',
        activeUsers: '+12%',
        recommendationClicks: '+8%',
      },
    });
  } catch (error) {
    console.error('Recommendations metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendation metrics' },
      { status: 500 }
    );
  }
}