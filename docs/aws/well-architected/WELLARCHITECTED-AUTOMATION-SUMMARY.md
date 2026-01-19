# AWS Well-Architected Tool Automation - Implementation Summary

## What Was Created

### GitHub Actions Workflows

#### 1. `.github/workflows/wa-tool-check.yml`
**Purpose**: Automated weekly risk checking

**Features**:
- ✅ Runs weekly on Monday at midnight UTC
- ✅ Manual trigger with configurable threshold
- ✅ Checks for high-risk items in architecture review
- ✅ Fails workflow if risks exceed threshold (default: 0)
- ✅ Posts results to Slack (optional)
- ✅ Provides detailed risk breakdown by pillar
- ✅ Includes helpful error messages and next steps

**Triggers**:
- Scheduled: `cron: '0 0 * * 1'` (Monday at midnight)
- Manual: `workflow_dispatch` with inputs:
  - `max_high_risks`: Maximum allowed high-risk items (default: 0)
  - `notify_slack`: Send results to Slack (default: false)

**Required Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_WELLARCHITECTED_WORKLOAD_ID`
- `AWS_REGION` (optional, defaults to us-east-1)
- `SLACK_WEBHOOK_URL` (optional, for notifications)

#### 2. `.github/workflows/wa-tool-milestone.yml`
**Purpose**: Automated milestone creation after deployments

**Features**:
- ✅ Triggers after successful "Deploy to Production" workflow
- ✅ Manual trigger with version and notes inputs
- ✅ Creates milestone with deployment version and date
- ✅ Captures current risk assessment snapshot
- ✅ Lists recent milestones for comparison
- ✅ Posts to Slack (optional)
- ✅ Warns if high risks exist

**Triggers**:
- After deployment: `workflow_run` on "Deploy to Production" completion
- Manual: `workflow_dispatch` with inputs:
  - `version`: Deployment version (required)
  - `notes`: Deployment notes (optional)

**Required Secrets**: Same as wa-tool-check.yml

### Automation Scripts

#### 1. `scripts/check-wa-risks.ts`
**Purpose**: Standalone script to check for high-risk items

**Features**:
- ✅ Colored terminal output for better readability
- ✅ Detailed risk breakdown by pillar
- ✅ Risk score calculation (0-100, lower is better)
- ✅ Helpful error messages with troubleshooting steps
- ✅ Exit code 1 if risks exceed threshold
- ✅ Links to AWS Console and documentation

**Usage**:
```bash
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export MAX_HIGH_RISKS=0
tsx scripts/check-wa-risks.ts
```

**Environment Variables**:
- `AWS_WELLARCHITECTED_WORKLOAD_ID` (required)
- `MAX_HIGH_RISKS` (optional, default: 0)
- `AWS_ACCESS_KEY_ID` (required)
- `AWS_SECRET_ACCESS_KEY` (required)
- `AWS_REGION` (optional, default: us-east-1)

**Output Example**:
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

📋 Pillar Breakdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Operational Excellence
  High: 1
  Medium: 2
  Unanswered: 3

Security
  High: 1
  Medium: 1

Reliability
  ✓ No issues

Performance Efficiency
  Medium: 2
  Low: 1

Cost Optimization
  Low: 2
  Unanswered: 5

Sustainability
  ✓ No issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ FAILED: Found 2 high-risk item(s) (max allowed: 0)

Action Required:
  1. Review high-risk items in the AWS Well-Architected Tool console
  2. Address the identified risks by implementing best practices
  3. Update answers in the workload review
  4. Re-run this check to verify improvements

Resources:
  • AWS Console: https://console.aws.amazon.com/wellarchitected/...
  • Well-Architected Framework: https://aws.amazon.com/architecture/well-architected/
  • Best Practices: https://docs.aws.amazon.com/wellarchitected/...
```

#### 2. `scripts/create-deployment-milestone.ts`
**Purpose**: Standalone script to create a milestone after deployment

**Features**:
- ✅ Colored terminal output
- ✅ Current risk assessment display
- ✅ Lists recent milestones for comparison
- ✅ Helpful next steps and resources
- ✅ Warns if high risks exist
- ✅ Links to AWS Console

**Usage**:
```bash
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export DEPLOYMENT_VERSION=v1.2.3
export DEPLOYMENT_NOTES="Production deployment with new features"
tsx scripts/create-deployment-milestone.ts
```

**Environment Variables**:
- `AWS_WELLARCHITECTED_WORKLOAD_ID` (required)
- `DEPLOYMENT_VERSION` (required)
- `DEPLOYMENT_NOTES` (optional)
- `AWS_ACCESS_KEY_ID` (required)
- `AWS_SECRET_ACCESS_KEY` (required)
- `AWS_REGION` (optional, default: us-east-1)

**Output Example**:
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

Creating milestone...
  Name: Deployment v1.2.3 - 2025-01-15
  Notes: Production deployment with new features

✅ Milestone created successfully!

Milestone Details:
  Number: 5
  Name: Deployment v1.2.3 - 2025-01-15
  Workload: Indigo E-commerce Platform
  Date: 2025-01-15

Recent Milestones:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ #5: Deployment v1.2.3 - 2025-01-15
  Recorded: 2025-01-15T10:30:00Z

  #4: Deployment v1.2.2 - 2025-01-08
  Recorded: 2025-01-08T14:20:00Z

  #3: Deployment v1.2.1 - 2025-01-01
  Recorded: 2025-01-01T09:15:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. View milestone in AWS Console to see risk comparison
  2. Compare with previous milestones to track improvements
  3. Review any new high-risk items introduced in this deployment
  4. Update workload answers if architecture has changed

Resources:
  • AWS Console: https://console.aws.amazon.com/wellarchitected/...
  • Milestone #5: View in console for detailed comparison

🎉 Milestone created successfully!
```

### Documentation

#### 1. `.github/workflows/README-WA-AUTOMATION.md`
**Purpose**: Comprehensive automation documentation

**Contents**:
- Workflow descriptions and features
- Script usage and examples
- Setup instructions
- Configuration guide
- Integration patterns
- Best practices
- Troubleshooting guide
- Resources and links

#### 2. `docs/WELLARCHITECTED-AUTOMATION-QUICKSTART.md`
**Purpose**: Quick start guide for getting automation running in 5 minutes

**Contents**:
- Step-by-step setup instructions
- Testing procedures
- Customization options
- Slack notification setup
- Troubleshooting
- Next steps

#### 3. Updated `WELLARCHITECTED-SETUP.md`
**Purpose**: Main setup guide with automation section

**Changes**:
- Added "Automation (GitHub Actions)" section
- Links to automation documentation
- Quick setup instructions
- References to new workflows and scripts

## Key Features

### 1. Automated Risk Checking
- **Frequency**: Weekly (Monday at midnight UTC)
- **Action**: Checks for high-risk items
- **Result**: Fails if risks exceed threshold
- **Notification**: Optional Slack alerts

### 2. Deployment Milestones
- **Trigger**: After successful deployments
- **Action**: Creates milestone with version and date
- **Result**: Captures risk assessment snapshot
- **Notification**: Optional Slack alerts

### 3. Colored Terminal Output
- **Red**: High risks, errors
- **Yellow**: Medium risks, warnings
- **Green**: Success, no risks
- **Blue**: Unanswered questions
- **Cyan**: Information

### 4. Comprehensive Error Handling
- Validates environment variables
- Checks service availability
- Verifies workload exists
- Provides helpful error messages
- Includes troubleshooting steps

### 5. Slack Integration
- Success notifications
- Failure alerts
- Detailed risk summaries
- Links to AWS Console
- Links to workflow runs

## Setup Requirements

### GitHub Secrets (Required)
1. `AWS_ACCESS_KEY_ID` - AWS access key
2. `AWS_SECRET_ACCESS_KEY` - AWS secret key
3. `AWS_WELLARCHITECTED_WORKLOAD_ID` - Workload ID

### GitHub Secrets (Optional)
1. `AWS_REGION` - AWS region (defaults to us-east-1)
2. `SLACK_WEBHOOK_URL` - Slack webhook for notifications

### IAM Permissions
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

## Usage Examples

### Manual Risk Check (GitHub Actions)
1. Go to **Actions** tab
2. Select **Well-Architected Risk Check**
3. Click **Run workflow**
4. Set `max_high_risks: 0`
5. Set `notify_slack: true`
6. Click **Run workflow**

### Manual Milestone Creation (GitHub Actions)
1. Go to **Actions** tab
2. Select **Well-Architected Deployment Milestone**
3. Click **Run workflow**
4. Enter `version: v1.2.3`
5. Enter `notes: Production deployment`
6. Click **Run workflow**

### Local Risk Check
```bash
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
tsx scripts/check-wa-risks.ts
```

### Local Milestone Creation
```bash
export AWS_WELLARCHITECTED_WORKLOAD_ID=abc123def456
export DEPLOYMENT_VERSION=v1.2.3
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
tsx scripts/create-deployment-milestone.ts
```

## Integration with CI/CD

### Pre-Deployment Risk Check
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

### Post-Deployment Milestone
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
- **Weekly**: Automated risk checks (configured)
- **Monthly**: Manual review of medium/low risks
- **Quarterly**: Full architecture review with team

### 2. Milestone Strategy
- ✅ After every production deployment (automated)
- ✅ Before major architecture changes
- ✅ After completing improvement phases
- ✅ Quarterly for trend tracking

### 3. Risk Management
- **High Risks**: Address immediately, block deployments
- **Medium Risks**: Plan improvements in next sprint
- **Low Risks**: Consider for optimization, review quarterly

### 4. Team Collaboration
- Assign pillar owners
- Review automation results weekly
- Track improvements over time
- Celebrate risk reductions

## Testing

### Test Risk Check Locally
```bash
# Set environment variables
export AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Run the script
tsx scripts/check-wa-risks.ts

# Expected: Detailed risk report with colored output
```

### Test Milestone Creation Locally
```bash
# Set environment variables
export AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
export DEPLOYMENT_VERSION=v1.0.0-test
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Run the script
tsx scripts/create-deployment-milestone.ts

# Expected: Milestone created with success message
```

### Test GitHub Actions
1. Commit and push workflows
2. Go to **Actions** tab
3. Manually trigger each workflow
4. Verify successful execution
5. Check Slack notifications (if configured)

## Troubleshooting

### Common Issues

**"Service Not Available"**
- Check AWS credentials
- Verify IAM permissions
- Ensure correct AWS region

**"Workload Not Found"**
- Verify workload ID is correct
- Check if workload was deleted
- List workloads to find correct ID

**"High Risks Found" (Workflow Fails)**
- This is expected behavior
- Review high-risk items in AWS Console
- Address the risks
- Re-run the workflow

**Slack Notifications Not Working**
- Verify webhook URL is correct
- Test webhook with curl
- Check webhook permissions

## Resources

- 📖 [Full Automation Documentation](.github/workflows/README-WA-AUTOMATION.md)
- 📖 [Quick Start Guide](docs/WELLARCHITECTED-AUTOMATION-QUICKSTART.md)
- 📖 [Setup Guide](WELLARCHITECTED-SETUP.md)
- 📖 [Implementation Guide](docs/AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)
- 📖 [Usage Examples](src/infrastructure/aws/__examples__/wellarchitected-usage.ts)
- 🔗 [AWS Well-Architected Tool](https://console.aws.amazon.com/wellarchitected/)
- 🔗 [Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## Summary

✅ **Created:**
- 2 GitHub Actions workflows (risk check, milestone creation)
- 2 automation scripts (TypeScript with colored output)
- 3 documentation files (README, quick start, summary)
- Updated main setup guide

✅ **Features:**
- Automated weekly risk checking
- Automated deployment milestones
- Slack notifications (optional)
- Colored terminal output
- Comprehensive error handling
- Detailed documentation
- Local testing support

✅ **Ready to use:**
1. Configure GitHub Secrets
2. Commit workflows to repository
3. Test manually or wait for scheduled run
4. Monitor results and track improvements

---

**Next Action**: Follow the [Quick Start Guide](docs/WELLARCHITECTED-AUTOMATION-QUICKSTART.md) to get automation running in 5 minutes.
