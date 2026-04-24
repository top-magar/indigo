# AWS Getting Started Guide for Indigo

A step-by-step guide to deploy Indigo on AWS infrastructure. This guide takes you from local development to production-ready AWS deployment.

---

## Quick Start

```bash
# Option A: Hybrid deployment (Vercel + Supabase + AWS AI services)
./scripts/aws-setup-hybrid.sh

# Option B: Full AWS deployment (ECS + Aurora + ElastiCache)
./scripts/aws-setup-full.sh

# Test AWS services connectivity
pnpm tsx scripts/test-aws-services.ts
```

---

## Prerequisites

Before starting, ensure you have:

- [ ] AWS Account with admin access
- [ ] AWS CLI v2 installed and configured
- [ ] Docker installed locally
- [ ] Node.js 20+ and pnpm installed
- [ ] Git repository cloned locally

```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/your-user"
# }
```

---

## Deployment Options

| Option | Best For | Complexity | Monthly Cost |
|--------|----------|------------|--------------|
| **Option A: Hybrid** | Starting out | Low | $50-200 |
| **Option B: Full AWS** | Production scale | High | $600-7,600 |

### Option A: Hybrid (Recommended to Start)
- **Compute**: Vercel (existing)
- **Database**: Supabase (existing)
- **AI Services**: AWS (Bedrock, Rekognition, etc.)
- **Storage**: AWS S3 + CloudFront

### Option B: Full AWS
- **Compute**: ECS Fargate
- **Database**: Aurora PostgreSQL Serverless
- **Cache**: ElastiCache Redis
- **Search**: OpenSearch Serverless
- **AI Services**: Full AWS AI stack

**This guide covers both options.**

---

## Infrastructure Files

This project includes ready-to-use AWS infrastructure:

```
infrastructure/
├── cloudformation/
│   ├── vpc.yaml           # VPC with public/private subnets
│   ├── aurora.yaml        # Aurora PostgreSQL Serverless v2
│   ├── elasticache.yaml   # ElastiCache Redis cluster
│   └── ecs.yaml           # ECS Fargate with ALB
├── iam/
│   └── indigo-app-policy.json  # IAM policy for app
└── s3/
    └── cors-config.json   # S3 CORS configuration

scripts/
├── aws-setup-hybrid.sh    # Hybrid deployment script
├── aws-setup-full.sh      # Full AWS deployment script
└── test-aws-services.ts   # Test AWS connectivity
```

---

## Phase 1: AWS Foundation Setup (30 minutes)

### Step 1.1: Create IAM User for Indigo

```bash
# Create IAM user
aws iam create-user --user-name indigo-app

# Create access keys
aws iam create-access-key --user-name indigo-app

# Save the AccessKeyId and SecretAccessKey!
```

### Step 1.2: Attach Required Policies

```bash
# Create custom policy for Indigo
aws iam create-policy \
  --policy-name IndigoAppPolicy \
  --policy-document file://infrastructure/iam/indigo-app-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name indigo-app \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/IndigoAppPolicy
```

### Step 1.3: Set Up S3 Bucket for Media

```bash
# Create S3 bucket (replace with your bucket name)
export BUCKET_NAME="indigo-media-$(aws sts get-caller-identity --query Account --output text)"

aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Set CORS for browser uploads
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file://infrastructure/s3/cors-config.json

# Block public access (CloudFront will serve files)
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Step 1.4: Create CloudFront Distribution

```bash
# Create Origin Access Control
aws cloudfront create-origin-access-control \
  --origin-access-control-config file://infrastructure/cloudfront/oac-config.json

# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://infrastructure/cloudfront/distribution-config.json

# Note the Distribution ID and Domain Name from output
```

### Step 1.5: Update Environment Variables

Add to your `.env.local`:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1

# S3 Storage
AWS_S3_BUCKET=indigo-media-123456789012
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
STORAGE_PROVIDER=s3
```

---

## Phase 2: AI Services Setup (45 minutes)

### Step 2.1: Enable Amazon Bedrock

```bash
# Request model access (required for Claude/Nova models)
# Go to: AWS Console > Bedrock > Model access > Request access

# Verify access
aws bedrock list-foundation-models --query "modelSummaries[?contains(modelId, 'claude')]"
```

### Step 2.2: Verify SES for Email

```bash
# Verify your domain or email
aws ses verify-email-identity --email-address noreply@yourdomain.com

# Check verification status
aws ses get-identity-verification-attributes \
  --identities noreply@yourdomain.com

# Request production access (removes sandbox limits)
# Go to: AWS Console > SES > Account dashboard > Request production access
```

### Step 2.3: Test AI Services

```bash
# Run the AI services test script
pnpm tsx scripts/test-aws-services.ts
```

### Step 2.4: Update Environment for AI

```bash
# Add to .env.local
AWS_REKOGNITION_ENABLED=true
AWS_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
AWS_COMPREHEND_ENABLED=true
AWS_TRANSLATE_ENABLED=true
AWS_POLLY_ENABLED=true
AWS_TEXTRACT_ENABLED=true

# Email
EMAIL_PROVIDER=ses
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

---

## Phase 3: Full AWS Deployment (Option B)

Skip this phase if using Hybrid deployment (Option A).

### Step 3.1: Deploy VPC Infrastructure

```bash
# Deploy VPC CloudFormation stack
aws cloudformation create-stack \
  --stack-name indigo-vpc \
  --template-body file://infrastructure/cloudformation/vpc.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name indigo-vpc

# Get VPC outputs
aws cloudformation describe-stacks \
  --stack-name indigo-vpc \
  --query "Stacks[0].Outputs"
```

### Step 3.2: Deploy Aurora PostgreSQL

```bash
# Create Secrets Manager secret for database
aws secretsmanager create-secret \
  --name indigo/database \
  --generate-secret-string '{
    "SecretStringTemplate": "{\"username\": \"indigo_admin\"}",
    "GenerateStringKey": "password",
    "PasswordLength": 32,
    "ExcludeCharacters": "\"@/\\"
  }'

# Deploy Aurora stack
aws cloudformation create-stack \
  --stack-name indigo-database \
  --template-body file://infrastructure/cloudformation/aurora.yaml \
  --parameters \
    ParameterKey=VPCStackName,ParameterValue=indigo-vpc \
    ParameterKey=DBSecretArn,ParameterValue=$(aws secretsmanager describe-secret --secret-id indigo/database --query ARN --output text)

# Wait for completion (takes ~15-20 minutes)
aws cloudformation wait stack-create-complete --stack-name indigo-database
```

### Step 3.3: Deploy ElastiCache Redis

```bash
# Deploy Redis stack
aws cloudformation create-stack \
  --stack-name indigo-cache \
  --template-body file://infrastructure/cloudformation/elasticache.yaml \
  --parameters \
    ParameterKey=VPCStackName,ParameterValue=indigo-vpc

aws cloudformation wait stack-create-complete --stack-name indigo-cache
```

### Step 3.4: Build and Push Docker Image

```bash
# Create ECR repository
aws ecr create-repository --repository-name indigo

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Build production image
docker build -t indigo:latest -f Dockerfile.production .

# Tag and push
export ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/indigo
docker tag indigo:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

### Step 3.5: Deploy ECS Fargate

```bash
# Deploy ECS stack
aws cloudformation create-stack \
  --stack-name indigo-ecs \
  --template-body file://infrastructure/cloudformation/ecs.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=VPCStackName,ParameterValue=indigo-vpc \
    ParameterKey=DatabaseStackName,ParameterValue=indigo-database \
    ParameterKey=CacheStackName,ParameterValue=indigo-cache \
    ParameterKey=ImageUri,ParameterValue=$ECR_URI:latest

aws cloudformation wait stack-create-complete --stack-name indigo-ecs

# Get ALB URL
aws cloudformation describe-stacks \
  --stack-name indigo-ecs \
  --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerUrl'].OutputValue" \
  --output text
```

### Step 3.6: Run Database Migrations

```bash
# Get database connection string from Secrets Manager
export DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id indigo/database \
  --query SecretString \
  --output text | jq -r '"postgresql://\(.username):\(.password)@\(.host):5432/indigo"')

# Run migrations
pnpm db:push
```

---

## Phase 4: CI/CD Pipeline Setup (30 minutes)

### Step 4.1: Store Secrets in AWS

```bash
# Store all application secrets
aws secretsmanager create-secret \
  --name indigo/app \
  --secret-string '{
    "AUTH_SECRET": "your-auth-secret",
    "STRIPE_SECRET_KEY": "sk_live_xxx",
    "STRIPE_WEBHOOK_SECRET": "whsec_xxx",
    "SUPABASE_SERVICE_ROLE_KEY": "your-key"
  }'
```

### Step 4.2: Create CodePipeline

```bash
# Deploy CI/CD stack
aws cloudformation create-stack \
  --stack-name indigo-pipeline \
  --template-body file://infrastructure/cloudformation/pipeline.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=GitHubOwner,ParameterValue=your-github-username \
    ParameterKey=GitHubRepo,ParameterValue=indigo \
    ParameterKey=GitHubBranch,ParameterValue=main \
    ParameterKey=GitHubToken,ParameterValue=ghp_xxx
```

---

## Phase 5: Monitoring & Alerts (20 minutes)

### Step 5.1: Deploy CloudWatch Dashboard

```bash
aws cloudformation create-stack \
  --stack-name indigo-monitoring \
  --template-body file://infrastructure/cloudformation/monitoring.yaml \
  --parameters \
    ParameterKey=ECSStackName,ParameterValue=indigo-ecs \
    ParameterKey=AlertEmail,ParameterValue=alerts@yourdomain.com
```

### Step 5.2: Set Up Alarms

The monitoring stack creates these alarms:
- CPU utilization > 80%
- Memory utilization > 80%
- 5xx error rate > 1%
- Response time p99 > 3s
- Database connections > 80%

---

## Quick Start Scripts

### One-Command Setup (Hybrid)

```bash
# Run the setup script for hybrid deployment
./scripts/aws-setup-hybrid.sh
```

### One-Command Setup (Full AWS)

```bash
# Run the full AWS setup script
./scripts/aws-setup-full.sh
```

---

## Environment Variables Reference

### Hybrid Deployment (Option A)

```bash
# .env.local for Hybrid deployment
# Keep existing Vercel/Supabase config, add:

# AWS Core
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1

# Storage
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=indigo-media-xxx
AWS_CLOUDFRONT_DOMAIN=xxx.cloudfront.net

# Email
EMAIL_PROVIDER=ses
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# AI Services
AWS_REKOGNITION_ENABLED=true
AWS_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
AWS_COMPREHEND_ENABLED=true
AWS_TRANSLATE_ENABLED=true
AWS_POLLY_ENABLED=true
AWS_TEXTRACT_ENABLED=true
```

### Full AWS Deployment (Option B)

```bash
# .env.local for Full AWS deployment

# AWS Core
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1

# Database (Aurora)
DATABASE_URL=postgresql://user:pass@xxx.rds.amazonaws.com:5432/indigo
SUDO_DATABASE_URL=postgresql://admin:pass@xxx.rds.amazonaws.com:5432/indigo

# Cache (ElastiCache)
REDIS_HOST=xxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_AUTH_TOKEN=xxx

# Storage
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=indigo-media-xxx
AWS_CLOUDFRONT_DOMAIN=xxx.cloudfront.net

# Email
EMAIL_PROVIDER=ses
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# AI Services (all enabled)
AWS_REKOGNITION_ENABLED=true
AWS_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
AWS_COMPREHEND_ENABLED=true
AWS_TRANSLATE_ENABLED=true
AWS_POLLY_ENABLED=true
AWS_TEXTRACT_ENABLED=true
AWS_PERSONALIZE_ENABLED=true
AWS_OPENSEARCH_ENABLED=true
AWS_FORECAST_ENABLED=true

# Search (OpenSearch)
AWS_OPENSEARCH_DOMAIN_ENDPOINT=https://xxx.us-east-1.aoss.amazonaws.com

# Auth
AUTH_SECRET=xxx
AUTH_URL=https://yourdomain.com
```

---

## Cost Breakdown

### Hybrid Deployment (Option A)

| Service | Monthly Cost |
|---------|--------------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| S3 (100GB) | $2.30 |
| CloudFront (500GB) | $42.50 |
| SES (10K emails) | $1.00 |
| Bedrock (1M tokens) | $18.00 |
| Rekognition (50K images) | $50.00 |
| **Total** | **~$160/month** |

### Full AWS Deployment (Option B)

See `docs/AWS-SAAS-ARCHITECTURE.md` for detailed cost breakdown:
- Small (100 tenants): ~$600/month
- Medium (500 tenants): ~$2,050/month
- Large (2000 tenants): ~$7,600/month

---

## Troubleshooting

### Common Issues

**1. Bedrock Model Access Denied**
```bash
# Check model access status
aws bedrock list-foundation-models --query "modelSummaries[?modelId=='amazon.nova-micro-v1:0']"

# Solution: Request access in AWS Console > Bedrock > Model access
```

**2. SES Sandbox Limits**
```bash
# Check if in sandbox
aws ses get-account --query "ProductionAccessEnabled"

# Solution: Request production access in AWS Console > SES
```

**3. S3 CORS Errors**
```bash
# Verify CORS configuration
aws s3api get-bucket-cors --bucket $BUCKET_NAME

# Solution: Re-apply CORS config
aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://infrastructure/s3/cors-config.json
```

**4. ECS Task Failing to Start**
```bash
# Check task logs
aws logs get-log-events \
  --log-group-name /ecs/indigo \
  --log-stream-name $(aws logs describe-log-streams --log-group-name /ecs/indigo --query "logStreams[0].logStreamName" --output text)

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Memory limits too low
```

---

## Next Steps

After completing this guide:

1. **Configure Custom Domain** - Set up Route 53 for your domain
2. **Enable WAF** - Add web application firewall rules
3. **Set Up Backups** - Configure automated database backups
4. **Multi-Region** - Set up disaster recovery in secondary region

See `docs/AWS-SAAS-ARCHITECTURE.md` for advanced configurations.

---

*Document created: January 2026*
