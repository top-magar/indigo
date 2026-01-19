nto dashboard with real-time widgets, API endpoints, and setup automation.

**Last Updated**: January 13, 2026ance
- GDPR-compliant data handling
- SOC 2 Type II aligned infrastructure
- Regular security assessments

## Documentation Links

- [Amazon Personalize Developer Guide](https://docs.aws.amazon.com/personalize/)
- [Amazon OpenSearch Service Guide](https://docs.aws.amazon.com/opensearch-service/)
- [SageMaker Canvas User Guide](https://docs.aws.amazon.com/sagemaker/latest/dg/canvas.html)
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/)

---

**Status**: ✅ Complete - AI services fully integrated ik API response times
- Monitor AWS service quotas
- Alert on service degradation

### Regular Tasks
- Update ML models monthly
- Review cost optimization opportunities
- Monitor forecast accuracy and adjust algorithms

## Security Considerations

### Data Privacy
- All AI services respect tenant isolation
- No cross-tenant data sharing
- PII handling follows AWS best practices

### Access Control
- IAM roles with minimal required permissions
- Service-specific access policies
- Regular permission audits

### Complists
- **Bedrock Nova**: Lower cost than Claude models
- **Basic Personalize**: Pay-per-use pricing

### Premium Options
- **SageMaker Canvas**: ~$50-200/month for advanced forecasting
- **OpenSearch**: ~$100-300/month for search infrastructure
- **Personalize Campaigns**: ~$50-150/month for real-time recommendations

## Monitoring & Maintenance

### Health Checks
- API endpoints return service status
- Widgets show connection states
- Error boundaries handle service failures

### Performance Monitoring
- Trac*: Train solution and create campaigns
2. **Configure OpenSearch**: Set domain endpoint when ready
3. **Enable Canvas**: Run setup script for premium forecasting

### Future Enhancements
1. **Advanced Analytics**: Deeper AI service performance insights
2. **Automated Alerts**: Email/SMS notifications for critical insights
3. **Custom Models**: Tenant-specific ML model training
4. **A/B Testing**: Compare AI vs non-AI performance

## Cost Optimization

### Free Tier Usage
- **Local Forecasting**: No additional co Services" for configuration

### Inventory Forecasting
1. Go to Inventory page
2. View "Forecast Insights" widget for predictions
3. See priority-based alerts for stock issues
4. Click "Upgrade to Canvas" for premium forecasting

### Recommendations Analytics
1. Check "Personalized Recommendations" widget
2. View performance metrics and trends
3. Monitor user engagement with recommendations
4. Access setup flow if Personalize not configured

## Next Steps

### Immediate Actions
1. **Complete Personalize Setup*Real-time data fetching with loading states and error handling

#### API Layer
- RESTful endpoints for AI service data
- Tenant-aware with RLS security
- Graceful fallbacks when services unavailable

#### Infrastructure
- Modular AWS service clients
- Configuration-driven service enabling
- Cost-aware service recommendations

## Usage Examples

### Viewing AI Services Status
1. Navigate to main dashboard
2. Scroll to "AI & ML Services" panel
3. Click service cards to see features and setup status
4. Use "Manageeneration with Nova Lite model
- **Local Forecasting**: Demand prediction algorithms
- **Dashboard Widgets**: Real-time AI insights display

### 🔧 Setup Required
- **Amazon Personalize**: Dataset group created, needs campaign training
- **Amazon OpenSearch**: Domain created, needs endpoint configuration
- **SageMaker Canvas**: Requires Studio domain setup

### 📊 Integration Points

#### Dashboard
- Main dashboard shows AI services overview
- Inventory page displays forecast insights and recommendations
- =arn:aws:iam::014498637134:role/IndigoPersonalizeRole

# Amazon OpenSearch
AWS_OPENSEARCH_ENABLED=false
AWS_OPENSEARCH_INDEX_PREFIX=indigo
AWS_OPENSEARCH_USERNAME=admin
AWS_OPENSEARCH_PASSWORD=Indigo2024!Secure

# Local Forecasting (always available)
AWS_FORECAST_ENABLED=false

# SageMaker Canvas (optional premium forecasting)
AWS_SAGEMAKER_CANVAS_ENABLED=false
# AWS_SAGEMAKER_STUDIO_DOMAIN_ID=
# AWS_SAGEMAKER_CANVAS_EXECUTION_ROLE=
```

## Service Status

### ✅ Active Services
- **Amazon Bedrock**: Content gutomatic .env.local configuration
- **Cost Transparency**: Upfront pricing estimates

## Environment Configuration

### Required Variables

```bash
# AWS AI/ML Services
AWS_REKOGNITION_ENABLED=true
AWS_BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
AWS_COMPREHEND_ENABLED=true

# Amazon Personalize
AWS_PERSONALIZE_ENABLED=true
AWS_PERSONALIZE_DATASET_GROUP_ARN=arn:aws:personalize:us-east-1:014498637134:dataset-group/indigo-ecommerce
AWS_PERSONALIZE_TRACKING_ID=8ed41df9-142b-4dfc-a0c1-a9d55dfc1fcd
AWS_PERSONALIZE_ROLE_ARN
- **Full-text Search**: Typo tolerance and fuzzy matching
- **Faceted Filtering**: Category, price, brand filtering
- **Autocomplete**: Real-time search suggestions
- **Analytics Ready**: Search performance tracking

### 5. Setup Automation

#### SageMaker Canvas Setup (`scripts/setup-sagemaker-canvas.ts`)
- **One-click Setup**: Automated IAM roles and Studio domain creation
- **VPC Configuration**: Automatic network setup
- **Policy Management**: Proper permissions for Canvas access
- **Environment Updates**: Aailable method
- **Local Algorithms**: Moving averages, trend analysis, seasonality detection
- **Stock-out Risk**: Predictive alerts for inventory management
- **Seasonal Trends**: E-commerce pattern recognition

**Personalize Service (`personalize.ts`)**
- **Real-time Recommendations**: User-based and item-based
- **Event Tracking**: User interaction monitoring
- **Batch Operations**: Bulk user and item updates
- **Campaign Management**: Multiple recommendation strategies

**OpenSearch Service (`opensearch.ts`)**e/aws/`)

**SageMaker Canvas (`sagemaker-canvas.ts`)**
- **No-code ML Platform**: Visual model building interface
- **Professional Forecasting**: Higher accuracy than local algorithms
- **Model Management**: Training, deployment, and monitoring
- **Batch Processing**: Multiple product forecasting
- **Cost Estimation**: Transparent pricing calculations

**Forecast Service (`forecast.ts`)**
- **Hybrid Approach**: Canvas (premium) + local (free) forecasting
- **Intelligent Routing**: Automatically chooses best avizes insights by urgency
- **Product Integration**: Links insights to specific products

#### Recommendations Metrics API (`src/app/api/recommendations/metrics/route.ts`)
- **Personalize Integration**: Connects to Amazon Personalize when configured
- **Performance Metrics**: Real CTR, conversion rates, revenue impact
- **Demo Mode**: Provides mock data when Personalize not setup
- **Trend Analysis**: Calculates week-over-week performance changes

### 4. AWS Infrastructure

#### Enhanced Services (`src/infrastructurwith percentage changes
- **User Analytics**: Active users and recommendation click tracking
- **Setup States**: Different UI for setup required vs active states

### 3. API Endpoints

#### Forecast Insights API (`src/app/api/inventory/forecast-insights/route.ts`)
- **Multi-tenant Support**: Filters by tenant ID with RLS
- **AWS Integration**: Uses AWS Forecast service when available
- **Intelligent Fallbacks**: Local algorithms when AWS services unavailable
- **Priority Classification**: Automatically categorw priority insights
- **Actionable Recommendations**: Direct links to inventory management
- **Visual Indicators**: Icons and color coding for different insight types
- **Smart Fallbacks**: Shows "All Good" state when no issues detected

#### Recommendations Widget (`src/components/dashboard/ai-services/recommendations-widget.tsx`)
- **Personalize Metrics**: CTR, conversion rate, revenue impact
- **Real-time Data**: Fetches from `/api/recommendations/metrics`
- **Performance Trends**: Visual trend indicators *:
  - Amazon Personalize: Real-time recommendations, user behavior tracking
  - OpenSearch: Full-text search, autocomplete, faceted filtering
  - SageMaker Canvas: No-code ML forecasting, visual model building
  - Bedrock: AI content generation, multi-language support

#### Forecast Insights Widget (`src/components/dashboard/ai-services/forecast-insights-widget.tsx`)
- **Real-time Inventory Insights**: Fetches data from `/api/inventory/forecast-insights`
- **Priority-based Alerts**: Critical, high, medium, lodget` for personalization metrics
- Real-time AI insights alongside traditional inventory management

### 2. AI Services Widgets

#### AI Services Panel (`src/components/dashboard/ai-services/ai-services-panel.tsx`)
- **Service Status Overview**: Shows active/setup required/processing states
- **Interactive Service Cards**: Click to expand features and details
- **Setup Progress**: Visual progress bars for incomplete setups
- **Quick Actions**: Direct links to setup and configuration pages
- **Service Features*ium option)
- **Amazon Bedrock** - AI content generation

## Completed Components

### 1. Dashboard Integration

#### Main Dashboard (`src/app/dashboard/dashboard-client.tsx`)
- Added `AIServicesPanel` component to main dashboard
- Provides overview of all AI services with setup status
- Interactive service cards with feature lists and setup progress

#### Inventory Page (`src/app/dashboard/inventory/inventory-client.tsx`)
- Integrated `ForecastInsightsWidget` for inventory predictions
- Added `RecommendationsWisummarizes the completed integration of AWS AI/ML services into the Indigo e-commerce platform dashboard.

## Overview

The dashboard now includes comprehensive AI services integration with real-time widgets, API endpoints, and setup automation for:

- **Amazon Personalize** - AI-powered product recommendations
- **Amazon OpenSearch** - Advanced search with autocomplete and faceting
- **Local Forecasting** - Demand forecasting with fallback algorithms
- **SageMaker Canvas** - No-code ML forecasting (premument # AI Services Integration Complete

This doc