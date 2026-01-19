# Indigo AWS Infrastructure

This directory contains all AWS infrastructure-as-code for the Indigo platform.

## Directory Structure

```
infrastructure/
├── cloudformation/          # CloudFormation templates
│   ├── vpc.yaml            # VPC with public/private subnets
│   ├── aurora.yaml         # Aurora PostgreSQL Serverless v2
│   ├── elasticache.yaml    # ElastiCache Redis cluster
│   ├── ecs.yaml            # ECS Fargate with ALB
│   ├── s3-cloudfront.yaml  # S3 + CloudFront CDN
│   ├── waf.yaml            # Web Application Firewall
│   └── monitoring.yaml     # CloudWatch dashboards & alarms
├── iam/
│   └── indigo-app-policy.json  # IAM policy for application
└── s3/
    └── cors-config.json    # S3 CORS configuration
```

## Deployment Order

For full AWS deployment, deploy stacks in this order:

1. **VPC** - Network foundation
2. **S3 + CloudFront** - Media storage (can be parallel)
3. **Aurora** - Database (depends on VPC)
4. **ElastiCache** - Cache (depends on VPC)
5. **ECS** - Application (depends on VPC, Aurora, ElastiCache)
6. **WAF** - Security (depends on ECS/ALB)
7. **Monitoring** - Observability (depends on ECS)

## Quick Deploy

```bash
# Deploy all stacks
./scripts/aws-setup-full.sh

# Or deploy individually
aws cloudformation create-stack \
  --stack-name indigo-vpc \
  --template-body file://infrastructure/cloudformation/vpc.yaml
```

## Stack Dependencies

```
                    ┌─────────────┐
                    │     VPC     │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │  Aurora   │    │ElastiCache│    │S3+CloudFrt│
   └─────┬─────┘    └─────┬─────┘    └───────────┘
         │                │
         └────────┬───────┘
                  │
                  ▼
            ┌───────────┐
            │    ECS    │
            └─────┬─────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
   ┌───────────┐    ┌───────────┐
   │    WAF    │    │ Monitoring│
   └───────────┘    └───────────┘
```

## Cost Estimates

| Stack | Small | Medium | Large |
|-------|-------|--------|-------|
| VPC | $35 | $35 | $35 |
| Aurora | $100 | $400 | $1,500 |
| ElastiCache | $100 | $200 | $500 |
| ECS | $150 | $500 | $2,000 |
| S3+CloudFront | $50 | $150 | $500 |
| WAF | $10 | $20 | $50 |
| Monitoring | $5 | $10 | $20 |
| **Total** | **~$450** | **~$1,315** | **~$4,605** |

## Environment Variables

After deployment, add these to your `.env.local`:

```bash
# From Aurora stack
DATABASE_URL=postgresql://user:pass@proxy.rds.amazonaws.com:5432/indigo

# From ElastiCache stack
REDIS_HOST=xxx.cache.amazonaws.com
REDIS_PORT=6379

# From S3+CloudFront stack
AWS_S3_BUCKET=indigo-media-xxx
AWS_CLOUDFRONT_DOMAIN=xxx.cloudfront.net
```

## Cleanup

To delete all resources:

```bash
# Delete in reverse order
aws cloudformation delete-stack --stack-name indigo-monitoring
aws cloudformation delete-stack --stack-name indigo-waf
aws cloudformation delete-stack --stack-name indigo-ecs
aws cloudformation delete-stack --stack-name indigo-cache
aws cloudformation delete-stack --stack-name indigo-database
aws cloudformation delete-stack --stack-name indigo-storage
aws cloudformation delete-stack --stack-name indigo-vpc
```

⚠️ **Warning**: Deleting Aurora will delete all data. Enable deletion protection in production.

## Security Notes

- All databases are in private subnets (no public access)
- RDS Proxy handles connection pooling
- WAF protects against common attacks
- All traffic encrypted in transit (TLS)
- Secrets stored in AWS Secrets Manager
- IAM follows least-privilege principle
