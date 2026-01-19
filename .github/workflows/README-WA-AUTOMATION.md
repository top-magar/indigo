# AWS Well-Architected Tool Automation

This directory contains GitHub Actions workflows for automating AWS Well-Architected Tool reviews and milestone tracking.

## Workflows

### 1. Well-Architected Risk Check (`wa-tool-check.yml`)

Automatically checks for high-risk items in your architecture review.

**Triggers:**
- **Scheduled**: Weekly on Monday at midnight UTC
- **Manual**: Via workflow dispatch

**Features:**
- ✅ Checks for high-risk items
- ✅ Fails workflow if risks exceed threshold
- ✅ Posts results to Slack (optional)
- ✅ Provides detailed risk breakdown by pillar
- ✅ Includes helpful error messages and next steps

**Configuration:**

```yaml
# Manual trigger inputs
max_high_risks: 0  # Maximum allowed high-risk items (default: 0)
notify_slack: false  # Send results to Slack (default: false)
```

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key with Well-Architected permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_WELLARCHITECTED_WORKLOAD_ID` - Your workload ID
- `AWS_REGION` - AWS region (optional, defaults to us-east-1)
- `SLACK_WEBHOOK_URL` - Slack webhook URL (optional, for notifications)

**Example Output:**

```
🔍 AWS Well-Architected Risk Check

Configuration:
  Workload ID: abc123def456
  Max High Risks: 0
  AWS Region: us-east-1

✅ Service available
✅ Workload found: Indigo E-commerce Platform

📊 Risk Assessment Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 High Risk:        2 ⚠️  ATTENTION REQUIRED
🟡 Medium Risk:      5
🟢 Low Risk:         3
⚪ No Risk:         15
❓ Unanswered:       8 (needs review)
⊘  Not Applicable:  2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: 35/100 (lower is better)
Summary: 2 high, 5 medium, 3 low, 8 unanswered

❌ FAILED: Found 2 high-risk item(s) (max allowed: 0)
```

### 2. Well-Architected Deployment Milestone (`wa-tool-milestone.yml`)

Automatically creates milestones after successful deployments.

**Triggers:**
- **After Deployment**: When "Deploy to Production" workflow completes successfully
- **Manual**: Via workflow dispatch

**Features:**
- ✅ Creates milestone with deployment version
- ✅ Captures current risk assessment
- ✅ Lists recent milestones for comparison
- ✅ Posts to Slack (optional)
- ✅ Warns if high risks exist

**Configuration:**

```yaml
# Manual trigger inputs
version: v1.2.3  # Deployment version (required)
notes: Production deployment  # Deployment notes (optional)
```

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key with Well-Architected permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_WELLARCHITECTED_WORKLOAD_ID` - Your workload ID
- `AWS_REGION` - AWS region (optional, defaults to us-east-1)
- `SLACK_WEBHOOK_URL` - Slack webhook URL (optional, for notifications)

**Example Output:**

```
📅 Create Deployment Milestone

Configuration:
  Workload ID: abc123def456
  Version: v1.2.3
  AWS Region: us-east-1

✅ Service available
✅ Workload found: Indigo E-commerce Platform

📊 Current Risk Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 High Risk:      0
🟡 Medium Risk:    3
🟢 Low Risk:       2
⚪ No Risk:       20
❓ Unanswered:     5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 3 medium, 2 low, 5 unanswered

✅ Milestone created successfully!

Milestone Details:
  Number: 5
  Name: Deployment v1.2.3 - 2025-01-15
  Workload: Indigo E-commerce Platform
  Date: 2025-01-15
```

## Scripts

### 1. Check Well-Architected Risks (`scripts/check-wa-risks.ts`)

Standalone script to check for high-risk items.

**Usage:**

```bash
# Set environment variables
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export MAX_HIGH_RISKS=0  # Optional, defaults to 0

# Run the script
tsx scripts/check-wa-risks.ts
```

**Features:**
- ✅ Colored terminal output
- ✅ Detailed risk breakdown by pillar
- ✅ Risk score calculation
- ✅ Helpful error messages
- ✅ Exit code 1 if risks exceed threshold

**Environment Variables:**
- `AWS_WELLARCHITECTED_WORKLOAD_ID` - Workload ID (required)
- `MAX_HIGH_RISKS` - Maximum allowed high-risk items (default: 0)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (default: us-east-1)

### 2. Create Deployment Milestone (`scripts/create-deployment-milestone.ts`)

Standalone script to create a milestone after deployment.

**Usage:**

```bash
# Set environment variables
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export DEPLOYMENT_VERSION=v1.2.3
export DEPLOYMENT_NOTES="Production deployment with new features"
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Run the script
tsx scripts/create-deployment-milestone.ts
```

**Features:**
- ✅ Colored terminal output
- ✅ Current risk assessment
- ✅ Lists recent milestones
- ✅ Helpful next steps
- ✅ Warns if high risks exist

**Environment Variables:**
- `AWS_WELLARCHITECTED_WORKLOAD_ID` - Workload ID (required)
- `DEPLOYMENT_VERSION` - Deployment version (required)
- `DEPLOYMENT_NOTES` - Deployment notes (optional)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (default: us-east-1)

## Setup Instructions

### 1. Create a Workload

First, create a workload in AWS Well-Architected Tool:

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

const result = await waService.createWorkload({
  name: 'Indigo E-commerce Platform',
  description: 'Multi-tenant SaaS e-commerce platform',
  environment: 'PRODUCTION',
  awsRegions: ['us-east-1'],
  reviewOwner: 'platform-team@indigo.com',
  lenses: ['wellarchitected'],
});

console.log('Workload ID:', result.workloadId);
// Save this ID for the next step
```

### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_WELLARCHITECTED_WORKLOAD_ID` | Workload ID from step 1 | `abc123def456` |
| `AWS_REGION` | AWS region (optional) | `us-east-1` |
| `SLACK_WEBHOOK_URL` | Slack webhook (optional) | `https://hooks.slack.com/services/...` |

### 3. Set Up IAM Permissions

Create an IAM policy with Well-Architected permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "wellarchitected:GetWorkload",
        "wellarchitected:ListWorkloads",
        "wellarchitected:GetLensReview",
        "wellarchitected:CreateMilestone",
        "wellarchitected:ListMilestones"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach this policy to the IAM user whose credentials you're using.

### 4. Enable Workflows

The workflows are automatically enabled when you commit them to your repository.

**To manually trigger:**
1. Go to **Actions** tab in GitHub
2. Select the workflow (e.g., "Well-Architected Risk Check")
3. Click **Run workflow**
4. Fill in the inputs (if any)
5. Click **Run workflow**

### 5. Configure Slack Notifications (Optional)

To receive Slack notifications:

1. Create a Slack webhook:
   - Go to https://api.slack.com/apps
   - Create a new app or select existing
   - Enable **Incoming Webhooks**
   - Create a webhook URL for your channel

2. Add the webhook URL to GitHub Secrets:
   - Secret name: `SLACK_WEBHOOK_URL`
   - Value: Your webhook URL

3. Enable notifications in workflow:
   - Set `notify_slack: true` when manually triggering
   - Or let scheduled runs notify automatically

## Integration with CI/CD

### Option 1: Pre-Deployment Check

Add risk check before deploying to production:

```yaml
# .github/workflows/deploy.yml
jobs:
  check-architecture:
    name: Check Architecture Risks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - name: Check Risks
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_WELLARCHITECTED_WORKLOAD_ID: ${{ secrets.AWS_WELLARCHITECTED_WORKLOAD_ID }}
        run: tsx scripts/check-wa-risks.ts
  
  deploy:
    needs: check-architecture
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps
```

### Option 2: Post-Deployment Milestone

Create milestone after successful deployment:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps
  
  create-milestone:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - name: Create Milestone
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_WELLARCHITECTED_WORKLOAD_ID: ${{ secrets.AWS_WELLARCHITECTED_WORKLOAD_ID }}
          DEPLOYMENT_VERSION: ${{ github.ref_name }}
        run: tsx scripts/create-deployment-milestone.ts
```

## Best Practices

### 1. Regular Reviews

- **Weekly**: Automated risk checks (already configured)
- **Monthly**: Manual review of medium/low risks
- **Quarterly**: Full architecture review with team

### 2. Milestone Strategy

Create milestones:
- ✅ After every production deployment (automated)
- ✅ Before major architecture changes
- ✅ After completing improvement phases
- ✅ Quarterly for trend tracking

### 3. Risk Management

**High Risks (RED):**
- Address immediately before next deployment
- Block deployments if high risks exist
- Assign owner and due date

**Medium Risks (YELLOW):**
- Plan improvements in next sprint
- Track in backlog
- Review monthly

**Low Risks (GREEN):**
- Consider for optimization
- Review quarterly
- Document as technical debt

### 4. Team Collaboration

Assign pillar owners:
- **Operational Excellence**: DevOps Lead
- **Security**: Security Engineer
- **Reliability**: SRE Lead
- **Performance Efficiency**: Backend Lead
- **Cost Optimization**: FinOps Manager
- **Sustainability**: Platform Architect

## Troubleshooting

### Workflow Fails with "Service Not Available"

**Cause**: AWS credentials or permissions issue

**Solution**:
1. Verify secrets are set correctly in GitHub
2. Check IAM permissions include `wellarchitected:*`
3. Ensure AWS region is correct
4. Test credentials locally:
   ```bash
   aws wellarchitected list-workloads --region us-east-1
   ```

### Workflow Fails with "Workload Not Found"

**Cause**: Workload ID is incorrect or workload was deleted

**Solution**:
1. List workloads to find correct ID:
   ```bash
   aws wellarchitected list-workloads --region us-east-1
   ```
2. Update `AWS_WELLARCHITECTED_WORKLOAD_ID` secret
3. Verify workload exists in AWS Console

### Script Exits with "High Risks Found"

**Cause**: Architecture has high-risk items (this is expected behavior)

**Solution**:
1. View workload in AWS Console
2. Review high-risk items
3. Implement recommended improvements
4. Update answers in workload review
5. Re-run the check

### Slack Notifications Not Working

**Cause**: Webhook URL is incorrect or not set

**Solution**:
1. Verify `SLACK_WEBHOOK_URL` secret is set
2. Test webhook URL:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message"}' \
     YOUR_WEBHOOK_URL
   ```
3. Ensure webhook has permission to post to channel

## Resources

- [AWS Well-Architected Tool Documentation](https://docs.aws.amazon.com/wellarchitected/)
- [Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Implementation Guide](../../WELLARCHITECTED-SETUP.md)
- [Service README](../../src/infrastructure/aws/README-WELLARCHITECTED.md)
- [Usage Examples](../../src/infrastructure/aws/__examples__/wellarchitected-usage.ts)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Implementation Guide](../../WELLARCHITECTED-SETUP.md)
3. Check AWS CloudTrail for API errors
4. Contact the platform team

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
