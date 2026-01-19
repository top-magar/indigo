# AWS Well-Architected Tool Service

Complete TypeScript service for integrating AWS Well-Architected Tool into the Indigo platform.

## Overview

The `WellArchitectedService` provides programmatic access to conduct architecture reviews, track improvements, and maintain best practices across your AWS workloads using the AWS Well-Architected Framework.

## Features

- ✅ Create and manage workloads
- ✅ Conduct architecture reviews against AWS best practices
- ✅ Track improvements over time with milestones
- ✅ Get risk assessments and recommendations
- ✅ Answer questions for each pillar
- ✅ Generate review reports
- ✅ Automate reviews via API
- ✅ Full TypeScript support with proper types

## Installation

The required AWS SDK package has been added to `package.json`:

```bash
pnpm install
```

## Configuration

Add these environment variables to your `.env.local`:

```bash
# AWS Well-Architected Tool
AWS_WELLARCHITECTED_ENABLED=true
AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
AWS_WELLARCHITECTED_REVIEW_OWNER=platform-team@indigo.com
AWS_WELLARCHITECTED_REGION=us-east-1

# AWS Credentials (if not using IAM role)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## IAM Permissions

Your AWS user/role needs these permissions:

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

## Usage

### Basic Usage

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

// Create a workload
const { workloadId } = await waService.createWorkload({
  name: 'Indigo E-commerce Platform',
  description: 'Multi-tenant SaaS platform',
  environment: 'PRODUCTION',
  awsRegions: ['us-east-1'],
  reviewOwner: 'platform-team@indigo.com',
});

// Get risk counts
const risks = await waService.getRiskCounts(workloadId);
console.log('High risks:', risks.high);
console.log('Medium risks:', risks.medium);

// Create milestone after improvements
await waService.createMilestone(
  workloadId,
  'Phase 1 Complete',
  'Completed critical security improvements'
);
```

### Available Methods

#### Workload Management

```typescript
// Create workload
const result = await waService.createWorkload({
  name: string,
  description: string,
  environment: 'PRODUCTION' | 'PREPRODUCTION',
  awsRegions: string[],
  reviewOwner: string,
  // Optional fields
  architecturalDesign?: string,
  industry?: string,
  industryType?: string,
  lenses?: string[],
  notes?: string,
  tags?: Record<string, string>,
});

// List workloads
const { workloads, nextToken } = await waService.listWorkloads(maxResults?, nextToken?);

// Get workload details
const { workload } = await waService.getWorkload(workloadId);

// Update workload
const { workload } = await waService.updateWorkload(workloadId, updates);

// Delete workload
await waService.deleteWorkload(workloadId);
```

#### Lens Reviews

```typescript
// Get lens review
const { lensReview } = await waService.getLensReview(
  workloadId,
  lensAlias = 'wellarchitected',
  milestoneNumber?
);

// Get lens review report (PDF URL)
const { reportUrl } = await waService.getLensReviewReport(
  workloadId,
  lensAlias = 'wellarchitected',
  milestoneNumber?
);

// Get risk counts
const risks = await waService.getRiskCounts(
  workloadId,
  lensAlias = 'wellarchitected',
  milestoneNumber?
);
```

#### Milestones

```typescript
// Create milestone
const { milestoneNumber } = await waService.createMilestone(
  workloadId,
  name,
  notes?
);

// List milestones
const { milestones, nextToken } = await waService.listMilestones(
  workloadId,
  maxResults?,
  nextToken?
);

// Get milestone details
const { milestone } = await waService.getMilestone(workloadId, milestoneNumber);
```

#### Answers

```typescript
// Update answer
const { answer } = await waService.updateAnswer({
  workloadId: string,
  lensAlias: string,
  questionId: string,
  selectedChoices: string[],
  notes?: string,
  isApplicable?: boolean,
  reason?: string,
});

// List answers for a pillar
const { answers, nextToken } = await waService.listAnswers(
  workloadId,
  lensAlias,
  pillarId,
  maxResults?,
  nextToken?
);
```

#### Lenses

```typescript
// Associate lenses
await waService.associateLenses(workloadId, lensAliases);

// Disassociate lenses
await waService.disassociateLenses(workloadId, lensAliases);

// List available lenses
const { lenses, nextToken } = await waService.listLenses(maxResults?, nextToken?);
```

#### Utility Methods

```typescript
// Check if service is available
const isAvailable = await waService.isAvailable();
```

### Helper Functions

```typescript
import { formatRiskCounts, calculateRiskScore } from '@/infrastructure/aws/wellarchitected';

// Format risk counts for display
const summary = formatRiskCounts(risks);
// Output: "2 high, 5 medium, 3 low, 1 unanswered"

// Calculate risk score (0-100, lower is better)
const score = calculateRiskScore(risks);
// Output: 45
```

## Examples

See `src/infrastructure/aws/__examples__/wellarchitected-usage.ts` for comprehensive examples including:

1. Creating workloads
2. Listing workloads
3. Checking risk counts
4. Getting lens review details
5. Creating milestones
6. Listing milestones
7. Updating answers
8. Listing questions by pillar
9. Generating reports
10. Checking service availability
11. Complete workflow example
12. CI/CD integration example

## Integration Patterns

### Dashboard Integration

```typescript
// src/app/dashboard/well-architected/page.tsx
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

export default async function WellArchitectedPage() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;
  
  const risks = await waService.getRiskCounts(workloadId);
  const { lensReview } = await waService.getLensReview(workloadId);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Well-Architected Review</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="High Risks" value={risks.high} variant="error" />
        <StatCard title="Medium Risks" value={risks.medium} variant="warning" />
        <StatCard title="Low Risks" value={risks.low} variant="info" />
        <StatCard title="Unanswered" value={risks.unanswered} variant="default" />
      </div>
    </div>
  );
}
```

### CI/CD Integration

```yaml
# .github/workflows/wa-tool-check.yml
name: Well-Architected Review

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  wa-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Check Risks
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_WELLARCHITECTED_WORKLOAD_ID: ${{ secrets.WA_WORKLOAD_ID }}
        run: |
          tsx scripts/check-wa-risks.ts
```

### Automated Milestone Creation

```typescript
// scripts/create-wa-milestone.ts
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

async function createDeploymentMilestone() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID!;
  
  const version = process.env.DEPLOYMENT_VERSION || 'unknown';
  const date = new Date().toISOString().split('T')[0];
  
  await waService.createMilestone(
    workloadId,
    `Deployment ${version} - ${date}`,
    `Production deployment of version ${version}`
  );
  
  console.log('Milestone created successfully');
}

createDeploymentMilestone().catch(console.error);
```

## AWS Well-Architected Framework Pillars

The service supports all six pillars:

1. **Operational Excellence** (`operationalExcellence`)
   - Run and monitor systems
   - Continuous improvement
   - Automation

2. **Security** (`security`)
   - Protect information and systems
   - Identity and access management
   - Data protection

3. **Reliability** (`reliability`)
   - Recover from failures
   - Scale to meet demand
   - Mitigate disruptions

4. **Performance Efficiency** (`performance`)
   - Use resources efficiently
   - Select right resource types
   - Monitor performance

5. **Cost Optimization** (`costOptimization`)
   - Avoid unnecessary costs
   - Understand spending
   - Optimize over time

6. **Sustainability** (`sustainability`)
   - Minimize environmental impact
   - Reduce energy consumption
   - Efficient resource usage

## Best Practices

### Regular Reviews

- **Full Review**: Quarterly (every 3 months)
- **Partial Review**: Monthly (focus on changed areas)
- **Risk Check**: Weekly (automated via CI/CD)

### Answer Quality

✅ **Do:**
- Provide detailed notes for each answer
- Include links to documentation
- Reference specific resources (ARNs, IDs)
- Explain why choices were made
- Document planned improvements

❌ **Don't:**
- Rush through questions
- Guess at answers
- Leave notes empty
- Ignore "Not Applicable" options
- Skip difficult questions

### Milestone Strategy

Create milestones:
- After completing a phase of improvements
- Before major architecture changes
- After production deployments
- Quarterly for trend tracking
- Before and after incidents

Naming convention:
```
[Type] [Version/Phase] - [Date]

Examples:
- Baseline - 2024-01-15
- Phase 1 Complete - 2024-02-28
- Deployment v2.5.0 - 2024-03-10
- Post-Incident Review - 2024-03-15
- Q1 2024 Review - 2024-03-31
```

## Troubleshooting

### Service Not Available

```typescript
const isAvailable = await waService.isAvailable();
if (!isAvailable) {
  console.error('Check:');
  console.error('1. AWS credentials are configured');
  console.error('2. IAM permissions include wellarchitected:*');
  console.error('3. AWS region is correct');
}
```

### Common Errors

**Error: Access Denied**
- Check IAM permissions
- Ensure `wellarchitected:*` is allowed

**Error: Workload Not Found**
- Verify workload ID is correct
- Check if workload was deleted

**Error: Invalid Lens Alias**
- Use 'wellarchitected' for the standard lens
- Check available lenses with `listLenses()`

## Resources

- [AWS Well-Architected Tool User Guide](https://docs.aws.amazon.com/wellarchitected/latest/userguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [WA Tool API Reference](https://docs.aws.amazon.com/wellarchitected/latest/APIReference/)
- [Implementation Guide](../../../docs/AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)

## Related Documentation

- [AWS Well-Architected Review](../../../docs/AWS-WELL-ARCHITECTED-REVIEW.md)
- [AWS Integration Plan](../../../docs/AWS-INTEGRATION-PLAN.md)
- [AWS Abstraction Layer](../../../docs/AWS-ABSTRACTION-LAYER-COMPLETE.md)

---

**Last Updated:** January 2025  
**Maintained By:** Platform Team
