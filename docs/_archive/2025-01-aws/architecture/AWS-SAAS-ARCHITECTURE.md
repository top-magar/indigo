# AWS SaaS Architecture for Indigo

## Executive Summary

This document outlines a production-ready AWS architecture for the Indigo multi-tenant e-commerce SaaS platform. Based on the AWS Well-Architected SaaS Lens and industry best practices, this architecture provides scalability, security, cost-efficiency, and operational excellence.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    INTERNET                                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │   CloudFront     │  │   Route 53       │  │   WAF            │
         │   (CDN)          │  │   (DNS)          │  │   (Security)     │
         └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
                  │                     │                     │
                  └─────────────────────┼─────────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │         Application Load Balancer      │
                    │         (Multi-AZ, SSL Termination)    │
                    └───────────────────┬───────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│  ECS Fargate    │          │  ECS Fargate    │          │  Lambda         │
│  (Next.js App)  │          │  (API Services) │          │  (Background)   │
│  Auto-scaling   │          │  Auto-scaling   │          │  Event-driven   │
└────────┬────────┘          └────────┬────────┘          └────────┬────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │           VPC (Private Subnets)   │
                    └─────────────────┬─────────────────┘
                                      │
    ┌─────────────────────────────────┼─────────────────────────────────┐
    │                                 │                                 │
    ▼                                 ▼                                 ▼
┌─────────────┐              ┌─────────────────┐              ┌─────────────────┐
│ Aurora      │              │ ElastiCache     │              │ OpenSearch      │
│ PostgreSQL  │              │ (Redis)         │              │ Serverless      │
│ Serverless  │              │ Cluster         │              │                 │
│ + RLS       │              │                 │              │                 │
└─────────────┘              └─────────────────┘              └─────────────────┘
```

---

## 1. Compute Layer

### Option A: ECS Fargate (Recommended for Indigo)

**Why Fargate over Lambda for Next.js:**
- Next.js requires persistent server for SSR/ISR
- Better cold start performance for e-commerce
- Predictable pricing at scale
- Full control over runtime environment

```yaml
# ECS Task Definition
Resources:
  IndigoTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: indigo-app
      Cpu: '1024'        # 1 vCPU
      Memory: '2048'     # 2 GB
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ContainerDefinitions:
        - Name: nextjs-app
          Image: !Sub ${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/indigo:latest
          PortMappings:
            - ContainerPort: 3000
          Environment:
            - Name: NODE_ENV
              Value: production
            - Name: DATABASE_URL
              Value: !Ref DatabaseUrl
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: /ecs/indigo
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs
```

### Auto-Scaling Configuration

```yaml
# Application Auto Scaling
Resources:
  IndigoScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: 20
      MinCapacity: 2
      ResourceId: !Sub service/${ECSCluster}/${ECSService}
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  # Scale based on CPU
  CPUScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: cpu-scaling
      PolicyType: TargetTrackingScaling
      TargetTrackingScalingPolicyConfiguration:
        TargetValue: 70
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        ScaleInCooldown: 300
        ScaleOutCooldown: 60

  # Scale based on request count
  RequestScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: request-scaling
      PolicyType: TargetTrackingScaling
      TargetTrackingScalingPolicyConfiguration:
        TargetValue: 1000  # requests per target
        PredefinedMetricSpecification:
          PredefinedMetricType: ALBRequestCountPerTarget
```

### Option B: Lambda@Edge (For Static/Hybrid)

Use Lambda for specific workloads:
- Webhook handlers
- Background jobs (Inngest)
- Image processing
- AI inference

```typescript
// Lambda for Stripe webhooks
export const handler = async (event: APIGatewayProxyEvent) => {
  const signature = event.headers['stripe-signature'];
  const webhookEvent = stripe.webhooks.constructEvent(
    event.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  // Process webhook...
};
```

---

## 2. Database Layer

### Aurora PostgreSQL Serverless v2 (Recommended)

**Why Aurora Serverless v2:**
- Auto-scales from 0.5 to 128 ACUs
- Pay only for what you use
- Native PostgreSQL RLS support
- Multi-AZ by default
- 99.99% availability SLA

```yaml
Resources:
  IndigoDBCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineVersion: '15.4'
      EngineMode: provisioned
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5    # Minimum ACUs
        MaxCapacity: 16     # Maximum ACUs
      DatabaseName: indigo
      MasterUsername: !Ref DBUsername
      MasterUserPassword: !Ref DBPassword
      EnableHttpEndpoint: true  # Data API
      StorageEncrypted: true
      DeletionProtection: true
      BackupRetentionPeriod: 7
      VpcSecurityGroupIds:
        - !Ref DBSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
```

### Row-Level Security Implementation

```sql
-- Enable RLS on all tenant tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Application sets tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql;
```

### Connection Pooling with RDS Proxy

```yaml
Resources:
  IndigoRDSProxy:
    Type: AWS::RDS::DBProxy
    Properties:
      DBProxyName: indigo-proxy
      EngineFamily: POSTGRESQL
      Auth:
        - AuthScheme: SECRETS
          SecretArn: !Ref DBSecret
          IAMAuth: REQUIRED
      RoleArn: !GetAtt RDSProxyRole.Arn
      VpcSecurityGroupIds:
        - !Ref ProxySecurityGroup
      VpcSubnetIds: !Ref PrivateSubnets
      RequireTLS: true
      IdleClientTimeout: 1800
```

---

## 3. Caching Layer

### ElastiCache Redis Cluster

```yaml
Resources:
  IndigoRedisCluster:
    Type: AWS::ElastiCache::ReplicationGroup
    Properties:
      ReplicationGroupDescription: Indigo Redis Cluster
      Engine: redis
      EngineVersion: '7.0'
      CacheNodeType: cache.r6g.large
      NumCacheClusters: 2  # Multi-AZ
      AutomaticFailoverEnabled: true
      AtRestEncryptionEnabled: true
      TransitEncryptionEnabled: true
      AuthToken: !Ref RedisAuthToken
      CacheSubnetGroupName: !Ref CacheSubnetGroup
      SecurityGroupIds:
        - !Ref CacheSecurityGroup
```

### Caching Strategy

```typescript
// src/infrastructure/cache/redis-client.ts
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_AUTH_TOKEN,
  tls: {},
});

// Cache patterns for multi-tenant
export async function getTenantCache<T>(
  tenantId: string,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cacheKey = `tenant:${tenantId}:${key}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redis.setex(cacheKey, ttl, JSON.stringify(data));
  return data;
}

// Invalidate tenant cache
export async function invalidateTenantCache(
  tenantId: string,
  pattern: string
): Promise<void> {
  const keys = await redis.keys(`tenant:${tenantId}:${pattern}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## 4. Search Layer

### OpenSearch Serverless

```yaml
Resources:
  IndigoSearchCollection:
    Type: AWS::OpenSearchServerless::Collection
    Properties:
      Name: indigo-products
      Type: SEARCH
      Description: Product search for Indigo tenants

  SearchAccessPolicy:
    Type: AWS::OpenSearchServerless::AccessPolicy
    Properties:
      Name: indigo-search-access
      Type: data
      Policy: !Sub |
        [
          {
            "Rules": [
              {
                "ResourceType": "index",
                "Resource": ["index/indigo-products/*"],
                "Permission": ["aoss:*"]
              }
            ],
            "Principal": ["arn:aws:iam::${AWS::AccountId}:role/IndigoAppRole"]
          }
        ]
```

### Multi-Tenant Search Index

```typescript
// Index structure with tenant isolation
const productMapping = {
  mappings: {
    properties: {
      tenant_id: { type: 'keyword' },  // Required for filtering
      name: { type: 'text', analyzer: 'standard' },
      description: { type: 'text' },
      price: { type: 'float' },
      category: { type: 'keyword' },
      tags: { type: 'keyword' },
      status: { type: 'keyword' },
      created_at: { type: 'date' },
    }
  }
};

// Always filter by tenant_id
async function searchProducts(tenantId: string, query: string) {
  return opensearch.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: [
            { match: { name: query } }
          ],
          filter: [
            { term: { tenant_id: tenantId } },  // CRITICAL
            { term: { status: 'active' } }
          ]
        }
      }
    }
  });
}
```

---

## 5. AI/ML Services Layer

### Amazon Bedrock Integration

```typescript
// src/infrastructure/aws/bedrock-client.ts
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// Use Nova for cost efficiency
export async function generateProductDescription(
  product: { name: string; features: string[] }
): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'amazon.nova-micro-v1:0',  // 75% cheaper than Claude
    body: JSON.stringify({
      inputText: `Generate an SEO-optimized product description for:
        Name: ${product.name}
        Features: ${product.features.join(', ')}`,
      textGenerationConfig: {
        maxTokenCount: 500,
        temperature: 0.7,
      }
    }),
  });
  
  const response = await bedrock.send(command);
  return JSON.parse(new TextDecoder().decode(response.body)).outputText;
}
```

### Amazon Personalize for Recommendations

```typescript
// src/infrastructure/aws/personalize-client.ts
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from '@aws-sdk/client-personalize-runtime';

const personalize = new PersonalizeRuntimeClient({ region: process.env.AWS_REGION });

export async function getProductRecommendations(
  tenantId: string,
  userId: string,
  numResults: number = 10
): Promise<string[]> {
  // Each tenant has their own campaign
  const campaignArn = `arn:aws:personalize:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:campaign/tenant-${tenantId}`;
  
  const command = new GetRecommendationsCommand({
    campaignArn,
    userId,
    numResults,
  });
  
  const response = await personalize.send(command);
  return response.itemList?.map(item => item.itemId!) || [];
}
```

---

## 6. Security Layer

### WAF Configuration

```yaml
Resources:
  IndigoWAF:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: indigo-waf
      Scope: CLOUDFRONT
      DefaultAction:
        Allow: {}
      Rules:
        # Rate limiting per IP
        - Name: RateLimitRule
          Priority: 1
          Statement:
            RateBasedStatement:
              Limit: 2000  # requests per 5 minutes
              AggregateKeyType: IP
          Action:
            Block: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: RateLimitRule
        
        # AWS Managed Rules
        - Name: AWSManagedRulesCommonRuleSet
          Priority: 2
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesCommonRuleSet
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: CommonRuleSet
        
        # SQL Injection Protection
        - Name: AWSManagedRulesSQLiRuleSet
          Priority: 3
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesSQLiRuleSet
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: SQLiRuleSet
```

### Secrets Management

```yaml
Resources:
  DatabaseSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: indigo/database
      GenerateSecretString:
        SecretStringTemplate: '{"username": "indigo_admin"}'
        GenerateStringKey: password
        PasswordLength: 32
        ExcludeCharacters: '"@/\'

  StripeSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: indigo/stripe
      SecretString: !Sub |
        {
          "secret_key": "${StripeSecretKey}",
          "webhook_secret": "${StripeWebhookSecret}"
        }
```

---

## 7. Observability Layer

### CloudWatch Dashboard

```yaml
Resources:
  IndigoDashboard:
    Type: AWS::CloudWatch::Dashboard
    Properties:
      DashboardName: indigo-operations
      DashboardBody: !Sub |
        {
          "widgets": [
            {
              "type": "metric",
              "properties": {
                "title": "ECS CPU Utilization",
                "metrics": [
                  ["AWS/ECS", "CPUUtilization", "ServiceName", "indigo-app"]
                ],
                "period": 60
              }
            },
            {
              "type": "metric",
              "properties": {
                "title": "Database Connections",
                "metrics": [
                  ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", "indigo-db"]
                ]
              }
            },
            {
              "type": "metric",
              "properties": {
                "title": "API Latency (p99)",
                "metrics": [
                  ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "${ALB}"]
                ],
                "stat": "p99"
              }
            }
          ]
        }
```

### X-Ray Tracing

```typescript
// src/instrumentation.ts
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';

const provider = new NodeTracerProvider({
  idGenerator: new AWSXRayIdGenerator(),
});

provider.register({
  propagator: new AWSXRayPropagator(),
});
```

---

## 8. CI/CD Pipeline

### CodePipeline Configuration

```yaml
Resources:
  IndigoPipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: indigo-pipeline
      RoleArn: !GetAtt PipelineRole.Arn
      Stages:
        - Name: Source
          Actions:
            - Name: GitHub
              ActionTypeId:
                Category: Source
                Owner: ThirdParty
                Provider: GitHub
                Version: '1'
              Configuration:
                Owner: !Ref GitHubOwner
                Repo: indigo
                Branch: main
                OAuthToken: !Ref GitHubToken
              OutputArtifacts:
                - Name: SourceOutput
        
        - Name: Build
          Actions:
            - Name: BuildAndTest
              ActionTypeId:
                Category: Build
                Owner: AWS
                Provider: CodeBuild
                Version: '1'
              Configuration:
                ProjectName: !Ref BuildProject
              InputArtifacts:
                - Name: SourceOutput
              OutputArtifacts:
                - Name: BuildOutput
        
        - Name: Deploy-Staging
          Actions:
            - Name: DeployToStaging
              ActionTypeId:
                Category: Deploy
                Owner: AWS
                Provider: ECS
                Version: '1'
              Configuration:
                ClusterName: !Ref StagingCluster
                ServiceName: indigo-staging
        
        - Name: Approval
          Actions:
            - Name: ManualApproval
              ActionTypeId:
                Category: Approval
                Owner: AWS
                Provider: Manual
                Version: '1'
        
        - Name: Deploy-Production
          Actions:
            - Name: DeployToProduction
              ActionTypeId:
                Category: Deploy
                Owner: AWS
                Provider: ECS
                Version: '1'
              Configuration:
                ClusterName: !Ref ProductionCluster
                ServiceName: indigo-production
                DeploymentConfiguration:
                  MinimumHealthyPercent: 100
                  MaximumPercent: 200
```

---

## 9. Multi-Tenant Isolation Patterns

### Tenant Context Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT ISOLATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Request arrives at ALB                                                   │
│     │                                                                        │
│     ▼                                                                        │
│  2. JWT validated, tenant_id extracted                                       │
│     │                                                                        │
│     ▼                                                                        │
│  3. Tenant context set in request headers                                    │
│     │                                                                        │
│     ▼                                                                        │
│  4. Application calls withTenant(tenantId, callback)                         │
│     │                                                                        │
│     ▼                                                                        │
│  5. Database connection sets: SET app.current_tenant = 'tenant-uuid'         │
│     │                                                                        │
│     ▼                                                                        │
│  6. RLS policies automatically filter all queries                            │
│     │                                                                        │
│     ▼                                                                        │
│  7. Response returned (only tenant's data)                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Isolation Models Comparison

| Model | Description | Use Case | Cost |
|-------|-------------|----------|------|
| **Pool (RLS)** | Shared DB, RLS isolation | SMB tenants | $ |
| **Bridge** | Shared DB, schema per tenant | Mid-market | $$ |
| **Silo** | Dedicated DB per tenant | Enterprise | $$$ |

**Indigo Recommendation:** Start with Pool (RLS) for all tenants, offer Silo for Enterprise tier.

---

## 10. Cost Optimization

### Estimated Monthly Costs

| Service | Small (100 tenants) | Medium (500 tenants) | Large (2000 tenants) |
|---------|---------------------|----------------------|----------------------|
| **ECS Fargate** | $150 | $500 | $2,000 |
| **Aurora Serverless** | $100 | $400 | $1,500 |
| **ElastiCache** | $100 | $200 | $500 |
| **OpenSearch** | $50 | $200 | $800 |
| **CloudFront** | $50 | $150 | $500 |
| **Bedrock AI** | $100 | $500 | $2,000 |
| **Other (WAF, Secrets, etc.)** | $50 | $100 | $300 |
| **Total** | **~$600/mo** | **~$2,050/mo** | **~$7,600/mo** |

### Cost per Tenant

| Scale | Monthly Cost | Cost per Tenant |
|-------|--------------|-----------------|
| 100 tenants | $600 | $6.00 |
| 500 tenants | $2,050 | $4.10 |
| 2000 tenants | $7,600 | $3.80 |

### Savings Opportunities

1. **Reserved Capacity** - 30-50% savings on Fargate/Aurora
2. **Spot Instances** - 70% savings for non-critical workloads
3. **S3 Intelligent Tiering** - Auto-optimize storage costs
4. **Nova over Claude** - 62% savings on AI costs

---

## 11. Disaster Recovery

### Multi-Region Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-REGION DR SETUP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Primary Region (us-east-1)              Secondary Region (us-west-2)        │
│  ─────────────────────────               ──────────────────────────          │
│                                                                              │
│  ┌─────────────────┐                     ┌─────────────────┐                │
│  │  ECS Cluster    │                     │  ECS Cluster    │                │
│  │  (Active)       │                     │  (Standby)      │                │
│  └────────┬────────┘                     └────────┬────────┘                │
│           │                                       │                          │
│  ┌────────▼────────┐                     ┌────────▼────────┐                │
│  │  Aurora Primary │ ──── Replication ──▶│  Aurora Replica │                │
│  │  (Read/Write)   │                     │  (Read-only)    │                │
│  └─────────────────┘                     └─────────────────┘                │
│                                                                              │
│  ┌─────────────────┐                     ┌─────────────────┐                │
│  │  S3 Bucket      │ ──── Replication ──▶│  S3 Bucket      │                │
│  │  (Primary)      │                     │  (Replica)      │                │
│  └─────────────────┘                     └─────────────────┘                │
│                                                                              │
│                    Route 53 Health Checks + Failover                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### RTO/RPO Targets

| Tier | RTO | RPO | Strategy |
|------|-----|-----|----------|
| Standard | 4 hours | 1 hour | Single region, daily backups |
| Business | 1 hour | 15 min | Multi-AZ, continuous backup |
| Enterprise | 15 min | 1 min | Multi-region active-passive |

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up VPC with public/private subnets
- [ ] Deploy Aurora PostgreSQL Serverless
- [ ] Configure RDS Proxy
- [ ] Set up Secrets Manager

### Phase 2: Compute (Weeks 3-4)
- [ ] Create ECR repository
- [ ] Deploy ECS Fargate cluster
- [ ] Configure ALB with SSL
- [ ] Set up auto-scaling

### Phase 3: Caching & Search (Weeks 5-6)
- [ ] Deploy ElastiCache Redis
- [ ] Set up OpenSearch Serverless
- [ ] Implement caching layer
- [ ] Configure search indexing

### Phase 4: Security & Observability (Weeks 7-8)
- [ ] Configure WAF rules
- [ ] Set up CloudWatch dashboards
- [ ] Enable X-Ray tracing
- [ ] Configure alerts

### Phase 5: CI/CD & DR (Weeks 9-10)
- [ ] Set up CodePipeline
- [ ] Configure staging environment
- [ ] Implement blue-green deployments
- [ ] Set up cross-region replication

---

## Quick Reference

### Key AWS Services for Indigo

| Category | Service | Purpose |
|----------|---------|---------|
| **Compute** | ECS Fargate | Next.js application hosting |
| **Database** | Aurora PostgreSQL | Primary data store with RLS |
| **Cache** | ElastiCache Redis | Session & query caching |
| **Search** | OpenSearch Serverless | Product search |
| **CDN** | CloudFront | Static assets & edge caching |
| **AI** | Bedrock (Nova) | Content generation |
| **AI** | Personalize | Product recommendations |
| **Security** | WAF | DDoS & bot protection |
| **Secrets** | Secrets Manager | Credential management |
| **Monitoring** | CloudWatch + X-Ray | Observability |

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@proxy.rds.amazonaws.com:5432/indigo
REDIS_HOST=indigo-redis.xxxxx.cache.amazonaws.com

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# AI Services
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:...

# Search
OPENSEARCH_ENDPOINT=https://xxxxx.us-east-1.aoss.amazonaws.com
```

---

*Document created: January 2026*
*Based on AWS Well-Architected SaaS Lens and industry best practices*
*Content was rephrased for compliance with licensing restrictions*


---

## 13. Metering & Billing Integration

### Usage Metering Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         METERING & BILLING FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Application Layer                                                           │
│  ─────────────────                                                           │
│  ┌─────────────────┐                                                        │
│  │  API Request    │                                                        │
│  │  (with tenant)  │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                               │
│  │  Metering       │────▶│  Kinesis Data   │                               │
│  │  Middleware     │     │  Firehose       │                               │
│  └─────────────────┘     └────────┬────────┘                               │
│                                   │                                          │
│  Aggregation Layer                │                                          │
│  ─────────────────                ▼                                          │
│                          ┌─────────────────┐                                │
│                          │  S3 Bucket      │                                │
│                          │  (Raw Events)   │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│                                   ▼                                          │
│                          ┌─────────────────┐                                │
│                          │  Lambda         │                                │
│                          │  (Aggregator)   │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│  Billing Layer                    ▼                                          │
│  ─────────────                                                               │
│                          ┌─────────────────┐     ┌─────────────────┐        │
│                          │  DynamoDB       │────▶│  Stripe         │        │
│                          │  (Usage Table)  │     │  Metered Billing│        │
│                          └─────────────────┘     └─────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Metering Middleware Implementation

```typescript
// src/infrastructure/metering/middleware.ts
import { Firehose } from '@aws-sdk/client-firehose';

const firehose = new Firehose({ region: process.env.AWS_REGION });

interface UsageEvent {
  tenantId: string;
  eventType: 'api_call' | 'ai_request' | 'search_query' | 'storage_gb';
  quantity: number;
  metadata?: Record<string, string>;
  timestamp: string;
}

export async function recordUsage(event: UsageEvent): Promise<void> {
  await firehose.putRecord({
    DeliveryStreamName: 'indigo-usage-stream',
    Record: {
      Data: Buffer.from(JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      }) + '\n'),
    },
  });
}

// Middleware for API routes
export function withMetering(handler: Function) {
  return async (req: Request, context: any) => {
    const startTime = Date.now();
    const tenantId = context.tenantId;
    
    try {
      const response = await handler(req, context);
      
      // Record API usage
      await recordUsage({
        tenantId,
        eventType: 'api_call',
        quantity: 1,
        metadata: {
          path: new URL(req.url).pathname,
          method: req.method,
          latencyMs: String(Date.now() - startTime),
        },
        timestamp: new Date().toISOString(),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };
}
```

### AI Usage Tracking

```typescript
// src/infrastructure/metering/ai-metering.ts
import { recordUsage } from './middleware';

export async function trackAIUsage(
  tenantId: string,
  service: 'bedrock' | 'personalize' | 'comprehend' | 'rekognition',
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  // Calculate credits based on service
  const creditRates: Record<string, number> = {
    bedrock: 0.001,      // $0.001 per token
    personalize: 0.0001, // $0.0001 per recommendation
    comprehend: 0.0001,  // $0.0001 per unit
    rekognition: 0.001,  // $0.001 per image
  };
  
  const credits = (inputTokens + outputTokens) * creditRates[service];
  
  await recordUsage({
    tenantId,
    eventType: 'ai_request',
    quantity: credits,
    metadata: {
      service,
      inputTokens: String(inputTokens),
      outputTokens: String(outputTokens),
    },
    timestamp: new Date().toISOString(),
  });
}
```

### Stripe Integration for Metered Billing

```typescript
// src/infrastructure/billing/stripe-metering.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Sync usage to Stripe at end of billing period
export async function syncUsageToStripe(
  tenantId: string,
  subscriptionItemId: string,
  usage: { credits: number; timestamp: number }
): Promise<void> {
  await stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity: Math.ceil(usage.credits),
      timestamp: usage.timestamp,
      action: 'increment',
    }
  );
}

// Create metered subscription
export async function createMeteredSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId, // Metered price ID
      },
    ],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}
```

### DynamoDB Usage Table

```yaml
Resources:
  UsageTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: indigo-usage
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: tenant_id
          AttributeType: S
        - AttributeName: period
          AttributeType: S
        - AttributeName: event_type
          AttributeType: S
      KeySchema:
        - AttributeName: tenant_id
          KeyType: HASH
        - AttributeName: period
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: event-type-index
          KeySchema:
            - AttributeName: event_type
              KeyType: HASH
            - AttributeName: period
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
```

---

## 14. Tenant Onboarding Flow

### Automated Provisioning Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT ONBOARDING FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User Signs Up                                                            │
│     │                                                                        │
│     ▼                                                                        │
│  ┌─────────────────┐                                                        │
│  │  Cognito        │  ← User authentication                                 │
│  │  User Pool      │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  2. Tenant Creation                                                          │
│     │                                                                        │
│     ▼                                                                        │
│  ┌─────────────────┐     ┌─────────────────┐                               │
│  │  Step Functions │────▶│  Lambda:        │                               │
│  │  (Orchestrator) │     │  CreateTenant   │                               │
│  └────────┬────────┘     └─────────────────┘                               │
│           │                                                                  │
│           ├──────────────────────────────────────────────┐                  │
│           │                                              │                  │
│           ▼                                              ▼                  │
│  ┌─────────────────┐                          ┌─────────────────┐          │
│  │  Lambda:        │                          │  Lambda:        │          │
│  │  CreateDBSchema │                          │  CreateStripe   │          │
│  └────────┬────────┘                          │  Customer       │          │
│           │                                   └────────┬────────┘          │
│           │                                            │                    │
│           ▼                                            ▼                    │
│  ┌─────────────────┐                          ┌─────────────────┐          │
│  │  Lambda:        │                          │  Lambda:        │          │
│  │  SeedDefaults   │                          │  SendWelcome    │          │
│  └────────┬────────┘                          │  Email          │          │
│           │                                   └─────────────────┘          │
│           │                                                                  │
│           ▼                                                                  │
│  3. Tenant Ready                                                             │
│     │                                                                        │
│     ▼                                                                        │
│  ┌─────────────────┐                                                        │
│  │  EventBridge    │  → Notify other services                               │
│  │  (TenantCreated)│                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step Functions State Machine

```yaml
Resources:
  TenantOnboardingStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      StateMachineName: tenant-onboarding
      DefinitionString: !Sub |
        {
          "Comment": "Tenant Onboarding Workflow",
          "StartAt": "CreateTenantRecord",
          "States": {
            "CreateTenantRecord": {
              "Type": "Task",
              "Resource": "${CreateTenantLambda.Arn}",
              "Next": "ParallelSetup",
              "Catch": [{
                "ErrorEquals": ["States.ALL"],
                "Next": "RollbackTenant"
              }]
            },
            "ParallelSetup": {
              "Type": "Parallel",
              "Branches": [
                {
                  "StartAt": "SetupDatabase",
                  "States": {
                    "SetupDatabase": {
                      "Type": "Task",
                      "Resource": "${SetupDatabaseLambda.Arn}",
                      "End": true
                    }
                  }
                },
                {
                  "StartAt": "CreateStripeCustomer",
                  "States": {
                    "CreateStripeCustomer": {
                      "Type": "Task",
                      "Resource": "${CreateStripeCustomerLambda.Arn}",
                      "End": true
                    }
                  }
                },
                {
                  "StartAt": "SetupSearchIndex",
                  "States": {
                    "SetupSearchIndex": {
                      "Type": "Task",
                      "Resource": "${SetupSearchIndexLambda.Arn}",
                      "End": true
                    }
                  }
                }
              ],
              "Next": "SeedDefaultData"
            },
            "SeedDefaultData": {
              "Type": "Task",
              "Resource": "${SeedDefaultDataLambda.Arn}",
              "Next": "SendWelcomeEmail"
            },
            "SendWelcomeEmail": {
              "Type": "Task",
              "Resource": "${SendWelcomeEmailLambda.Arn}",
              "Next": "PublishTenantCreated"
            },
            "PublishTenantCreated": {
              "Type": "Task",
              "Resource": "arn:aws:states:::events:putEvents",
              "Parameters": {
                "Entries": [{
                  "Source": "indigo.tenants",
                  "DetailType": "TenantCreated",
                  "Detail.$": "$.tenantId"
                }]
              },
              "End": true
            },
            "RollbackTenant": {
              "Type": "Task",
              "Resource": "${RollbackTenantLambda.Arn}",
              "Next": "FailState"
            },
            "FailState": {
              "Type": "Fail",
              "Error": "TenantOnboardingFailed",
              "Cause": "Failed to onboard tenant"
            }
          }
        }
```

### Tenant Creation Lambda

```typescript
// src/infrastructure/onboarding/create-tenant.ts
import { db } from '@/infrastructure/db';
import { tenants } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

interface CreateTenantInput {
  name: string;
  slug: string;
  ownerEmail: string;
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
}

export async function handler(event: CreateTenantInput) {
  const tenantId = uuidv4();
  
  // Create tenant record
  const [tenant] = await db.insert(tenants).values({
    id: tenantId,
    name: event.name,
    slug: event.slug,
    plan: event.plan,
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      features: getPlanFeatures(event.plan),
    },
  }).returning();
  
  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    ownerEmail: event.ownerEmail,
  };
}

function getPlanFeatures(plan: string): Record<string, boolean> {
  const features: Record<string, Record<string, boolean>> = {
    starter: {
      aiDescriptions: true,
      aiSearch: false,
      recommendations: false,
      analytics: false,
    },
    growth: {
      aiDescriptions: true,
      aiSearch: true,
      recommendations: true,
      analytics: false,
    },
    pro: {
      aiDescriptions: true,
      aiSearch: true,
      recommendations: true,
      analytics: true,
    },
    enterprise: {
      aiDescriptions: true,
      aiSearch: true,
      recommendations: true,
      analytics: true,
      customDomain: true,
      sso: true,
    },
  };
  
  return features[plan] || features.starter;
}
```

---

## 15. Feature Flags & Tenant Tiers

### Feature Flag Service

```typescript
// src/infrastructure/feature-flags/service.ts
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocument.from(new DynamoDB({ region: process.env.AWS_REGION }));

interface TenantFeatures {
  tenantId: string;
  plan: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export async function getTenantFeatures(tenantId: string): Promise<TenantFeatures> {
  const result = await ddb.get({
    TableName: 'indigo-tenant-features',
    Key: { tenant_id: tenantId },
  });
  
  return result.Item as TenantFeatures;
}

export async function isFeatureEnabled(
  tenantId: string,
  feature: string
): Promise<boolean> {
  const tenantFeatures = await getTenantFeatures(tenantId);
  return tenantFeatures?.features?.[feature] ?? false;
}

export async function checkLimit(
  tenantId: string,
  limitType: string,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const tenantFeatures = await getTenantFeatures(tenantId);
  const limit = tenantFeatures?.limits?.[limitType] ?? 0;
  
  return {
    allowed: currentUsage < limit,
    limit,
    remaining: Math.max(0, limit - currentUsage),
  };
}
```

### Plan Limits Configuration

```typescript
// src/config/plan-limits.ts
export const PLAN_LIMITS = {
  starter: {
    products: 100,
    aiCredits: 50,
    storage_gb: 1,
    team_members: 1,
    api_calls_per_day: 1000,
  },
  growth: {
    products: 1000,
    aiCredits: 500,
    storage_gb: 10,
    team_members: 5,
    api_calls_per_day: 10000,
  },
  pro: {
    products: 10000,
    aiCredits: 2000,
    storage_gb: 50,
    team_members: 20,
    api_calls_per_day: 100000,
  },
  enterprise: {
    products: -1,  // Unlimited
    aiCredits: -1,
    storage_gb: -1,
    team_members: -1,
    api_calls_per_day: -1,
  },
};

export const PLAN_FEATURES = {
  starter: ['basic_store', 'basic_analytics'],
  growth: ['basic_store', 'basic_analytics', 'ai_descriptions', 'ai_search', 'recommendations'],
  pro: ['basic_store', 'basic_analytics', 'ai_descriptions', 'ai_search', 'recommendations', 'advanced_analytics', 'custom_reports'],
  enterprise: ['basic_store', 'basic_analytics', 'ai_descriptions', 'ai_search', 'recommendations', 'advanced_analytics', 'custom_reports', 'custom_domain', 'sso', 'dedicated_support', 'sla'],
};
```

---

## 16. Network Architecture

### VPC Design

```yaml
Resources:
  IndigoVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: indigo-vpc

  # Public Subnets (ALB, NAT Gateway)
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref IndigoVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref IndigoVPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      MapPublicIpOnLaunch: true

  # Private Subnets (ECS, RDS, ElastiCache)
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref IndigoVPC
      CidrBlock: 10.0.10.0/24
      AvailabilityZone: !Select [0, !GetAZs '']

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref IndigoVPC
      CidrBlock: 10.0.11.0/24
      AvailabilityZone: !Select [1, !GetAZs '']

  # NAT Gateway for private subnet internet access
  NATGateway:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NATGatewayEIP.AllocationId
      SubnetId: !Ref PublicSubnet1

  NATGatewayEIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc
```

### Security Groups

```yaml
Resources:
  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: ALB Security Group
      VpcId: !Ref IndigoVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

  ECSSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: ECS Tasks Security Group
      VpcId: !Ref IndigoVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3000
          ToPort: 3000
          SourceSecurityGroupId: !Ref ALBSecurityGroup

  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Database Security Group
      VpcId: !Ref IndigoVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref ECSSecurityGroup

  CacheSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: ElastiCache Security Group
      VpcId: !Ref IndigoVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 6379
          ToPort: 6379
          SourceSecurityGroupId: !Ref ECSSecurityGroup
```

---

## Summary

This AWS architecture provides Indigo with:

1. **Scalability** - Auto-scaling ECS Fargate + Aurora Serverless
2. **Security** - RLS isolation, WAF, VPC, encrypted data
3. **Cost Efficiency** - Pay-per-use services, ~$3-6 per tenant
4. **Reliability** - Multi-AZ, automated backups, DR ready
5. **Observability** - CloudWatch, X-Ray, centralized logging
6. **AI/ML Ready** - Bedrock, Personalize, OpenSearch integrated
7. **Billing Ready** - Metering pipeline to Stripe

### Next Steps

1. **Week 1-2**: Set up VPC, Aurora, and basic ECS deployment
2. **Week 3-4**: Add caching, search, and AI services
3. **Week 5-6**: Implement metering and billing integration
4. **Week 7-8**: Security hardening and observability
5. **Week 9-10**: CI/CD pipeline and DR setup

---

*Architecture designed following AWS Well-Architected SaaS Lens principles*
