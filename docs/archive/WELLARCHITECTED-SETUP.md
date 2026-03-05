# AWS Well-Architected Tool Setup Guide

## Installation Complete ✅

The AWS Well-Architected Tool service has been successfully integrated into the Indigo platform.

## What Was Created

### 1. Core Service (`src/infrastructure/aws/wellarchitected.ts`)

Complete TypeScript service with the following methods:

**Workload Management:**
- `createWorkload()` - Create new workloads
- `listWorkloads()` - List all workloads
- `getWorkload()` - Get workload details
- `updateWorkload()` - Update workload information
- `deleteWorkload()` - Delete a workload

**Lens Reviews:**
- `getLensReview()` - Get lens review details
- `getLensReviewReport()` - Generate PDF report URL
- `getRiskCounts()` - Get risk counts by severity

**Milestones:**
- `createMilestone()` - Create improvement milestones
- `listMilestones()` - List all milestones
- `getMilestone()` - Get milestone details

**Answers:**
- `updateAnswer()` - Update question answers
- `listAnswers()` - List answers for a pillar

**Lenses:**
- `associateLenses()` - Associate lenses with workload
- `disassociateLenses()` - Remove lenses from workload
- `listLenses()` - List available lenses

**Utilities:**
- `isAvailable()` - Check service availability
- `formatRiskCounts()` - Format risk counts for display
- `calculateRiskScore()` - Calculate risk score (0-100)

### 2. Usage Examples (`src/infrastructure/aws/__examples__/wellarchitected-usage.ts`)

12 comprehensive examples demonstrating:
- Creating workloads
- Checking risks
- Creating milestones
- Generating reports
- CI/CD integration
- Complete workflows

### 3. Documentation (`src/infrastructure/aws/README-WELLARCHITECTED.md`)

Complete documentation including:
- Installation instructions
- Configuration guide
- API reference
- Integration patterns
- Best practices
- Troubleshooting

### 4. Package Updates

- Added `@aws-sdk/client-wellarchitected` to `package.json`
- Exported service from `src/infrastructure/aws/index.ts`
- Added configuration to `awsConfig` object

## Next Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install the `@aws-sdk/client-wellarchitected` package.

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# AWS Well-Architected Tool
AWS_WELLARCHITECTED_ENABLED=true
AWS_WELLARCHITECTED_REVIEW_OWNER=platform-team@indigo.com
AWS_WELLARCHITECTED_REGION=us-east-1

# AWS Credentials (if not using IAM role)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### 3. Set Up IAM Permissions

Create an IAM policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "wellarchitected:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach this policy to your IAM user or role.

### 4. Create Your First Workload

Run this code to create a workload for the Indigo platform:

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

const result = await waService.createWorkload({
  name: 'Indigo E-commerce Platform',
  description: 'Multi-tenant SaaS e-commerce platform with Next.js, Supabase, and AWS services',
  environment: 'PRODUCTION',
  awsRegions: ['us-east-1'],
  reviewOwner: 'platform-team@indigo.com',
  architecturalDesign: 'Next.js 16 App Router, Supabase PostgreSQL, AWS S3/CloudFront, Stripe',
  industry: 'Retail',
  industryType: 'E-commerce',
  lenses: ['wellarchitected'],
  tags: {
    Environment: 'Production',
    Team: 'Platform',
    Project: 'Indigo',
  },
});

if (result.success) {
  console.log('Workload ID:', result.workloadId);
  // Add this to your .env.local:
  // AWS_WELLARCHITECTED_WORKLOAD_ID=<workload-id>
}
```

### 5. Test the Integration

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

// Check if service is available
const isAvailable = await waService.isAvailable();
console.log('Service available:', isAvailable);

// List workloads
const { workloads } = await waService.listWorkloads();
console.log('Workloads:', workloads.length);
```

## Usage Examples

### Check Risk Counts

```typescript
const waService = new WellArchitectedService();
const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;

const risks = await waService.getRiskCounts(workloadId);
console.log('High risks:', risks.high);
console.log('Medium risks:', risks.medium);
console.log('Low risks:', risks.low);
```

### Create Milestone After Deployment

```typescript
const waService = new WellArchitectedService();
const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;

await waService.createMilestone(
  workloadId,
  'Deployment v2.5.0 - 2025-01-15',
  'Production deployment with new features'
);
```

### Generate Review Report

```typescript
const waService = new WellArchitectedService();
const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;

const { reportUrl } = await waService.getLensReviewReport(workloadId);
console.log('Report URL:', reportUrl);
// URL is valid for 15 minutes
```

## Automation (GitHub Actions)

✅ **Pre-configured workflows are ready to use!**

We've created GitHub Actions workflows for automated risk checking and milestone creation:

### 1. Weekly Risk Check (`wa-tool-check.yml`)

Automatically checks for high-risk items every Monday at midnight:
- ✅ Fails if high risks exceed threshold
- ✅ Posts results to Slack (optional)
- ✅ Provides detailed risk breakdown
- ✅ Manual trigger available

### 2. Deployment Milestone (`wa-tool-milestone.yml`)

Automatically creates milestones after successful deployments:
- ✅ Captures risk assessment snapshot
- ✅ Lists recent milestones for comparison
- ✅ Posts to Slack (optional)
- ✅ Manual trigger available

### Setup Instructions

1. **Configure GitHub Secrets** (required):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_WELLARCHITECTED_WORKLOAD_ID`
   - `AWS_REGION` (optional, defaults to us-east-1)
   - `SLACK_WEBHOOK_URL` (optional, for notifications)

2. **Enable Workflows**:
   - Workflows are automatically enabled when committed
   - Go to **Actions** tab to manually trigger

3. **Test the Automation**:
   ```bash
   # Test risk check locally
   export AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
   tsx scripts/check-wa-risks.ts
   
   # Test milestone creation locally
   export DEPLOYMENT_VERSION=v1.0.0
   tsx scripts/create-deployment-milestone.ts
   ```

**📖 Full Documentation**: See [`.github/workflows/README-WA-AUTOMATION.md`](.github/workflows/README-WA-AUTOMATION.md)

## Integration Patterns

### 1. Dashboard Widget

Create a dashboard page to display Well-Architected metrics:

```typescript
// src/app/dashboard/well-architected/page.tsx
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

export default async function WellArchitectedPage() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;
  
  const risks = await waService.getRiskCounts(workloadId);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Architecture Review</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="High Risks" value={risks.high} variant="error" />
        <StatCard title="Medium Risks" value={risks.medium} variant="warning" />
        <StatCard title="Low Risks" value={risks.low} variant="info" />
        <StatCard title="Unanswered" value={risks.unanswered} />
      </div>
    </div>
  );
}
```

### 2. CI/CD Risk Check

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/wa-tool-check.yml
name: Well-Architected Review

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly
  workflow_dispatch:

jobs:
  check-risks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Check High Risks
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_WELLARCHITECTED_WORKLOAD_ID: ${{ secrets.WA_WORKLOAD_ID }}
        run: |
          tsx scripts/check-wa-risks.ts
```

Create `scripts/check-wa-risks.ts`:

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

async function checkRisks() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;
  
  const risks = await waService.getRiskCounts(workloadId);
  
  console.log('Risk Assessment:');
  console.log(`  High: ${risks.high}`);
  console.log(`  Medium: ${risks.medium}`);
  console.log(`  Low: ${risks.low}`);
  
  if (risks.high > 0) {
    console.error(`\n❌ FAILED: Found ${risks.high} high-risk items`);
    process.exit(1);
  }
  
  console.log('\n✅ PASSED: No high-risk items');
}

checkRisks().catch(console.error);
```

### 3. Automated Milestone Creation

Create milestones after deployments:

```typescript
// scripts/create-deployment-milestone.ts
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

async function createMilestone() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;
  const version = process.env.DEPLOYMENT_VERSION || 'unknown';
  
  const date = new Date().toISOString().split('T')[0];
  const name = `Deployment ${version} - ${date}`;
  
  await waService.createMilestone(workloadId, name);
  console.log('Milestone created:', name);
}

createMilestone().catch(console.error);
```

## Best Practices

### 1. Regular Reviews

- **Full Review**: Quarterly (every 3 months)
- **Partial Review**: Monthly (focus on changed areas)
- **Risk Check**: Weekly (automated via CI/CD)

### 2. Milestone Strategy

Create milestones:
- After completing improvement phases
- Before major architecture changes
- After production deployments
- Quarterly for trend tracking

### 3. Answer Quality

- Provide detailed notes for each answer
- Include links to documentation
- Reference specific resources (ARNs, IDs)
- Explain why choices were made
- Document planned improvements

### 4. Team Collaboration

Assign pillar owners:
- **Operational Excellence**: DevOps Lead
- **Security**: Security Engineer
- **Reliability**: SRE Lead
- **Performance Efficiency**: Backend Lead
- **Cost Optimization**: FinOps Manager
- **Sustainability**: Platform Architect

## Troubleshooting

### Service Not Available

```typescript
const waService = new WellArchitectedService();
const isAvailable = await waService.isAvailable();

if (!isAvailable) {
  console.error('Check:');
  console.error('1. AWS credentials are configured');
  console.error('2. IAM permissions include wellarchitected:*');
  console.error('3. AWS region is correct');
}
```

### Common Errors

**Access Denied**
- Check IAM permissions
- Ensure `wellarchitected:*` is allowed

**Workload Not Found**
- Verify workload ID is correct
- Check if workload was deleted

**Invalid Lens Alias**
- Use 'wellarchitected' for the standard lens
- Check available lenses with `listLenses()`

## Resources

- [Implementation Guide](docs/AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)
- [Service README](src/infrastructure/aws/README-WELLARCHITECTED.md)
- [Usage Examples](src/infrastructure/aws/__examples__/wellarchitected-usage.ts)
- [AWS Documentation](https://docs.aws.amazon.com/wellarchitected/)

## Summary

✅ **Created:**
- Complete WellArchitectedService class with all methods
- Comprehensive usage examples (12 examples)
- Detailed documentation and README
- TypeScript types and interfaces
- Helper functions for risk formatting

✅ **Updated:**
- package.json with @aws-sdk/client-wellarchitected
- AWS index.ts to export the service
- AWS config with Well-Architected settings

✅ **Ready to use:**
- Install dependencies: `pnpm install`
- Configure environment variables
- Set up IAM permissions
- Create your first workload

---

**Next Action:** Run `pnpm install` to install the AWS SDK package.
