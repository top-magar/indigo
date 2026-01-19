# AWS Well-Architected Tool Automation - Quick Start

Get automated architecture reviews running in 5 minutes.

## Prerequisites

- ✅ AWS Well-Architected Tool workload created
- ✅ AWS credentials with `wellarchitected:*` permissions
- ✅ GitHub repository with Actions enabled

## Step 1: Get Your Workload ID

If you haven't created a workload yet:

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

const result = await waService.createWorkload({
  name: 'Indigo E-commerce Platform',
  description: 'Multi-tenant SaaS e-commerce platform',
  environment: 'PRODUCTION',
  awsRegions: ['us-east-1'],
  reviewOwner: 'platform-team@indigo.com',
});

console.log('Workload ID:', result.workloadId);
// Copy this ID for the next step
```

Or list existing workloads:

```bash
aws wellarchitected list-workloads --region us-east-1
```

## Step 2: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | ✅ Yes |
| `AWS_WELLARCHITECTED_WORKLOAD_ID` | Workload ID from Step 1 | ✅ Yes |
| `AWS_REGION` | AWS region (e.g., us-east-1) | ⚪ Optional |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | ⚪ Optional |

## Step 3: Commit the Workflows

The workflows are already created in `.github/workflows/`:
- `wa-tool-check.yml` - Weekly risk check
- `wa-tool-milestone.yml` - Deployment milestones

Commit and push them to your repository:

```bash
git add .github/workflows/wa-tool-*.yml
git add scripts/check-wa-risks.ts
git add scripts/create-deployment-milestone.ts
git commit -m "Add Well-Architected Tool automation"
git push
```

## Step 4: Test the Automation

### Test Risk Check

1. Go to **Actions** tab in GitHub
2. Select **Well-Architected Risk Check**
3. Click **Run workflow**
4. Leave defaults and click **Run workflow**
5. Wait for completion (~30 seconds)

**Expected Result**: ✅ Workflow passes (or fails if high risks exist)

### Test Milestone Creation

1. Go to **Actions** tab in GitHub
2. Select **Well-Architected Deployment Milestone**
3. Click **Run workflow**
4. Enter version: `v1.0.0-test`
5. Click **Run workflow**
6. Wait for completion (~30 seconds)

**Expected Result**: ✅ Milestone created successfully

## Step 5: Test Locally (Optional)

Test the scripts on your local machine:

```bash
# Install dependencies
pnpm install

# Set environment variables
export AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Test risk check
tsx scripts/check-wa-risks.ts

# Test milestone creation
export DEPLOYMENT_VERSION=v1.0.0-local-test
tsx scripts/create-deployment-milestone.ts
```

## What Happens Next?

### Automated Risk Checks

Every Monday at midnight UTC:
1. Workflow runs automatically
2. Checks for high-risk items
3. Fails if risks exceed threshold (default: 0)
4. Posts results to Slack (if configured)

### Deployment Milestones

After every successful deployment:
1. Workflow triggers automatically
2. Creates milestone with version and date
3. Captures current risk assessment
4. Posts to Slack (if configured)

## Customization

### Change Risk Check Schedule

Edit `.github/workflows/wa-tool-check.yml`:

```yaml
on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'
    
    # Run every Monday and Friday at midnight
    - cron: '0 0 * * 1,5'
```

### Allow Some High Risks

Edit the workflow or pass as input:

```yaml
# In workflow file
env:
  MAX_HIGH_RISKS: 2  # Allow up to 2 high risks

# Or when manually triggering
max_high_risks: 2
```

### Customize Milestone Names

Edit `scripts/create-deployment-milestone.ts`:

```typescript
// Change this line
const milestoneName = `Deployment ${deploymentVersion} - ${date}`;

// To something like
const milestoneName = `Release ${deploymentVersion}`;
```

## Slack Notifications

To enable Slack notifications:

### 1. Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Enable **Incoming Webhooks**
4. Click **Add New Webhook to Workspace**
5. Select channel (e.g., `#architecture`)
6. Copy the webhook URL

### 2. Add to GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Your webhook URL
5. Click **Add secret**

### 3. Test Notification

Run a workflow manually and check your Slack channel.

## Troubleshooting

### "Service Not Available"

**Problem**: AWS credentials or permissions issue

**Solution**:
```bash
# Test credentials
aws wellarchitected list-workloads --region us-east-1

# If this fails, check:
# 1. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
# 2. IAM user has wellarchitected:* permissions
# 3. AWS region is correct
```

### "Workload Not Found"

**Problem**: Workload ID is incorrect

**Solution**:
```bash
# List all workloads
aws wellarchitected list-workloads --region us-east-1

# Update GitHub secret with correct ID
```

### "High Risks Found" (Workflow Fails)

**Problem**: Architecture has high-risk items (expected behavior)

**Solution**:
1. This is working as intended - high risks should fail the workflow
2. View workload in AWS Console
3. Address the high-risk items
4. Update answers in the review
5. Re-run the workflow

### Slack Notifications Not Working

**Problem**: Webhook URL is incorrect or not set

**Solution**:
```bash
# Test webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_WEBHOOK_URL

# If this fails, regenerate webhook in Slack
```

## Next Steps

### 1. Complete Your Architecture Review

1. Go to [AWS Well-Architected Tool Console](https://console.aws.amazon.com/wellarchitected/)
2. Select your workload
3. Answer all questions in each pillar
4. Review recommendations
5. Implement improvements

### 2. Integrate with Deployment Pipeline

Add risk check before production deployments:

```yaml
# .github/workflows/deploy.yml
jobs:
  check-architecture:
    uses: ./.github/workflows/wa-tool-check.yml
    secrets: inherit
  
  deploy:
    needs: check-architecture
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps
```

### 3. Set Up Dashboard Widget

Create a dashboard page to display metrics:

```typescript
// src/app/dashboard/architecture/page.tsx
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

export default async function ArchitecturePage() {
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

### 4. Schedule Regular Reviews

Set up a recurring calendar event:
- **Weekly**: Review automation results
- **Monthly**: Address medium/low risks
- **Quarterly**: Full team architecture review

## Resources

- 📖 [Full Automation Documentation](.github/workflows/README-WA-AUTOMATION.md)
- 📖 [Setup Guide](../WELLARCHITECTED-SETUP.md)
- 📖 [Implementation Guide](AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)
- 📖 [Usage Examples](../src/infrastructure/aws/__examples__/wellarchitected-usage.ts)
- 🔗 [AWS Well-Architected Tool](https://console.aws.amazon.com/wellarchitected/)
- 🔗 [Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## Summary

✅ **You now have:**
- Automated weekly risk checks
- Automated deployment milestones
- Slack notifications (optional)
- Local testing scripts
- Full documentation

✅ **Next actions:**
1. Complete your architecture review in AWS Console
2. Address any high-risk items
3. Monitor weekly automation results
4. Track improvements over time with milestones

---

**Questions?** Check the [troubleshooting section](#troubleshooting) or review the [full documentation](.github/workflows/README-WA-AUTOMATION.md).
