# AWS Well-Architected Tool Implementation Guide

> Complete guide for implementing the AWS Well-Architected Tool (WA Tool) for the Indigo e-commerce platform.

## Table of Contents

1. [Overview](#overview)
2. [What is AWS Well-Architected Tool?](#what-is-aws-well-architected-tool)
3. [Benefits for Indigo Platform](#benefits-for-indigo-platform)
4. [Getting Started](#getting-started)
5. [CLI Commands Reference](#cli-commands-reference)
6. [API Integration](#api-integration)
7. [Automation Strategies](#automation-strategies)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Best Practices](#best-practices)
10. [Monitoring & Continuous Improvement](#monitoring--continuous-improvement)

---

## Overview

The AWS Well-Architected Tool provides programmatic access to conduct architecture reviews, track improvements, and maintain best practices across your AWS workloads. This guide shows how to integrate it into the Indigo platform's development and operations workflow.

**Key Capabilities:**
- Conduct architecture reviews against AWS best practices
- Track improvements over time with milestones
- Generate reports and recommendations
- Automate reviews via CLI/API
- Integrate with CI/CD pipelines

---

## What is AWS Well-Architected Tool?

The WA Tool is a service in the AWS Management Console that helps you review your workloads against current AWS best practices. It uses the AWS Well-Architected Framework's six pillars:

1. **Operational Excellence** - Run and monitor systems
2. **Security** - Protect information and systems
3. **Reliability** - Recover from failures
4. **Performance Efficiency** - Use resources efficiently
5. **Cost Optimization** - Avoid unnecessary costs
6. **Sustainability** - Minimize environmental impact

### How It Works

1. **Create a Workload** - Define your application/system
2. **Answer Questions** - Respond to pillar-specific questions
3. **Review Risks** - Identify high/medium/low risks
4. **Get Recommendations** - Receive actionable improvement plans
5. **Track Progress** - Create milestones to measure improvement

---

## Benefits for Indigo Platform

### 1. Proactive Risk Identification
- Discover architectural issues before they become production problems
- Identify single points of failure (like the single NAT Gateway)
- Find security gaps (secrets in environment variables)
- Detect cost optimization opportunities

### 2. Continuous Improvement
- Track architecture evolution with milestones
- Measure improvement over time
- Document architectural decisions
- Maintain compliance with best practices

### 3. Team Alignment
- Shared understanding of architecture quality
- Consistent evaluation criteria
- Clear improvement priorities
- Stakeholder-ready reports

### 4. Cost Savings
- Identify over-provisioned resources
- Find unused or underutilized services
- Optimize data transfer costs
- Right-size compute resources

---

## Getting Started

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **IAM Permissions** for Well-Architected Tool

### Required IAM Permissions

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

### Access the Tool

**Option 1: AWS Console**
1. Navigate to AWS Console
2. Search for "Well-Architected Tool"
3. Click "Define workload"

**Option 2: AWS CLI**
```bash
aws wellarchitected list-workloads
```

**Option 3: API/SDK**
Use AWS SDK for programmatic access (see API Integration section)

---

## CLI Commands Reference

### Workload Management

#### Create a Workload
```bash
aws wellarchitected create-workload \
  --workload-name "Indigo E-commerce Platform" \
  --description "Multi-tenant SaaS e-commerce platform" \
  --environment PRODUCTION \
  --aws-regions us-east-1 \
  --lenses wellarchitected \
  --review-owner "platform-team@indigo.com"
```

#### List Workloads
```bash
aws wellarchitected list-workloads
```

#### Get Workload Details
```bash
aws wellarchitected get-workload \
  --workload-id <WORKLOAD_ID>
```

#### Update Workload
```bash
aws wellarchitected update-workload \
  --workload-id <WORKLOAD_ID> \
  --description "Updated description" \
  --environment PRODUCTION
```

#### Delete Workload
```bash
aws wellarchitected delete-workload \
  --workload-id <WORKLOAD_ID>
```

### Lens Management

#### List Available Lenses
```bash
aws wellarchitected list-lenses
```

#### Associate Lens with Workload
```bash
aws wellarchitected associate-lenses \
  --workload-id <WORKLOAD_ID> \
  --lens-aliases wellarchitected
```

#### Disassociate Lens
```bash
aws wellarchitected disassociate-lenses \
  --workload-id <WORKLOAD_ID> \
  --lens-aliases wellarchitected
```

### Answer Management

#### List Questions
```bash
aws wellarchitected list-answers \
  --workload-id <WORKLOAD_ID> \
  --lens-alias wellarchitected \
  --pillar-id operationalExcellence
```

#### Update Answer
```bash
aws wellarchitected update-answer \
  --workload-id <WORKLOAD_ID> \
  --lens-alias wellarchitected \
  --question-id <QUESTION_ID> \
  --selected-choices <CHOICE_ID> \
  --notes "Implementation notes"
```

### Milestone Management

#### Create Milestone
```bash
aws wellarchitected create-milestone \
  --workload-id <WORKLOAD_ID> \
  --milestone-name "Phase 1 Complete" \
  --notes "Completed critical security and reliability improvements"
```

#### List Milestones
```bash
aws wellarchitected list-milestones \
  --workload-id <WORKLOAD_ID>
```

#### Get Milestone
```bash
aws wellarchitected get-milestone \
  --workload-id <WORKLOAD_ID> \
  --milestone-number 1
```

### Report Generation

#### Get Lens Review
```bash
aws wellarchitected get-lens-review \
  --workload-id <WORKLOAD_ID> \
  --lens-alias wellarchitected
```

#### Get Lens Review Report
```bash
aws wellarchitected get-lens-review-report \
  --workload-id <WORKLOAD_ID> \
  --lens-alias wellarchitected
```

---

## API Integration

### Node.js/TypeScript Integration

#### Install AWS SDK
```bash
pnpm add @aws-sdk/client-wellarchitected
```

#### Create WA Tool Service

Create `src/infrastructure/aws/wellarchitected.ts`:

```typescript
import {
  WellArchitectedClient,
  CreateWorkloadCommand,
  ListWorkloadsCommand,
  GetLensReviewCommand,
  CreateMilestoneCommand,
  UpdateAnswerCommand,
  type CreateWorkloadCommandInput,
  type UpdateAnswerCommandInput,
} from '@aws-sdk/client-wellarchitected';

export class WellArchitectedService {
  private client: WellArchitectedClient;

  constructor() {
    this.client = new WellArchitectedClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Create a new workload
   */
  async createWorkload(params: {
    name: string;
    description: string;
    environment: 'PRODUCTION' | 'PREPRODUCTION';
    awsRegions: string[];
    reviewOwner: string;
  }) {
    const input: CreateWorkloadCommandInput = {
      WorkloadName: params.name,
      Description: params.description,
      Environment: params.environment,
      AwsRegions: params.awsRegions,
      Lenses: ['wellarchitected'],
      ReviewOwner: params.reviewOwner,
    };

    const command = new CreateWorkloadCommand(input);
    const response = await this.client.send(command);
    
    return {
      workloadId: response.WorkloadId,
      workloadArn: response.WorkloadArn,
    };
  }

  /**
   * List all workloads
   */
  async listWorkloads() {
    const command = new ListWorkloadsCommand({});
    const response = await this.client.send(command);
    
    return response.WorkloadSummaries || [];
  }

  /**
   * Get lens review for a workload
   */
  async getLensReview(workloadId: string, lensAlias: string = 'wellarchitected') {
    const command = new GetLensReviewCommand({
      WorkloadId: workloadId,
      LensAlias: lensAlias,
    });
    
    const response = await this.client.send(command);
    return response.LensReview;
  }

  /**
   * Create a milestone
   */
  async createMilestone(workloadId: string, name: string, notes?: string) {
    const command = new CreateMilestoneCommand({
      WorkloadId: workloadId,
      MilestoneName: name,
      ClientRequestToken: `milestone-${Date.now()}`,
    });
    
    const response = await this.client.send(command);
    return {
      milestoneNumber: response.MilestoneNumber,
      workloadId: response.WorkloadId,
    };
  }

  /**
   * Update an answer to a question
   */
  async updateAnswer(params: {
    workloadId: string;
    lensAlias: string;
    questionId: string;
    selectedChoices: string[];
    notes?: string;
  }) {
    const input: UpdateAnswerCommandInput = {
      WorkloadId: params.workloadId,
      LensAlias: params.lensAlias,
      QuestionId: params.questionId,
      SelectedChoices: params.selectedChoices,
      Notes: params.notes,
    };

    const command = new UpdateAnswerCommand(input);
    const response = await this.client.send(command);
    
    return response.Answer;
  }

  /**
   * Get risk counts for a workload
   */
  async getRiskCounts(workloadId: string) {
    const lensReview = await this.getLensReview(workloadId);
    
    return {
      high: lensReview?.RiskCounts?.HIGH || 0,
      medium: lensReview?.RiskCounts?.MEDIUM || 0,
      low: lensReview?.RiskCounts?.LOW || 0,
      none: lensReview?.RiskCounts?.NONE || 0,
      unanswered: lensReview?.RiskCounts?.UNANSWERED || 0,
    };
  }
}
```

#### Usage Example

```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

const waService = new WellArchitectedService();

// Create workload
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

---

## Automation Strategies

### 1. Automated Review Creation

Create a script to automatically create/update workloads:

**`scripts/wa-tool-sync.ts`**
```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

async function syncWorkload() {
  const waService = new WellArchitectedService();
  
  // Check if workload exists
  const workloads = await waService.listWorkloads();
  const existing = workloads.find(w => w.WorkloadName === 'Indigo Platform');
  
  if (!existing) {
    // Create new workload
    const { workloadId } = await waService.createWorkload({
      name: 'Indigo E-commerce Platform',
      description: 'Multi-tenant SaaS e-commerce platform with Next.js, Supabase, and AWS services',
      environment: 'PRODUCTION',
      awsRegions: ['us-east-1'],
      reviewOwner: process.env.WA_REVIEW_OWNER || 'platform-team@indigo.com',
    });
    
    console.log('Created workload:', workloadId);
  } else {
    console.log('Workload already exists:', existing.WorkloadId);
  }
}

syncWorkload().catch(console.error);
```

### 2. CI/CD Integration

Add to your GitHub Actions workflow:

**`.github/workflows/wa-tool-check.yml`**
```yaml
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
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Get Risk Counts
        run: |
          WORKLOAD_ID="${{ secrets.WA_WORKLOAD_ID }}"
          
          aws wellarchitected get-lens-review \
            --workload-id $WORKLOAD_ID \
            --lens-alias wellarchitected \
            --query 'LensReview.RiskCounts' \
            --output json > risks.json
          
          cat risks.json
      
      - name: Check for High Risks
        run: |
          HIGH_RISKS=$(jq '.HIGH // 0' risks.json)
          
          if [ "$HIGH_RISKS" -gt 0 ]; then
            echo "::error::Found $HIGH_RISKS high-risk items"
            exit 1
          fi
```

### 3. Automated Milestone Creation

Create milestones after major deployments:

**`scripts/create-wa-milestone.ts`**
```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

async function createDeploymentMilestone() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.WA_WORKLOAD_ID!;
  
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

### 4. Dashboard Integration

Add WA Tool metrics to your dashboard:

**`src/app/dashboard/well-architected/page.tsx`**
```typescript
import { WellArchitectedService } from '@/infrastructure/aws/wellarchitected';

export default async function WellArchitectedPage() {
  const waService = new WellArchitectedService();
  const workloadId = process.env.WA_WORKLOAD_ID!;
  
  const risks = await waService.getRiskCounts(workloadId);
  const lensReview = await waService.getLensReview(workloadId);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Well-Architected Review</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="High Risks" value={risks.high} variant="error" />
        <StatCard title="Medium Risks" value={risks.medium} variant="warning" />
        <StatCard title="Low Risks" value={risks.low} variant="info" />
        <StatCard title="Unanswered" value={risks.unanswered} variant="default" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pillar Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display pillar-specific risk counts */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Implementation Roadmap

### Phase 1: Setup (Week 1)

**Day 1-2: Initial Setup**
- [ ] Create IAM role with WA Tool permissions
- [ ] Install AWS SDK for WA Tool
- [ ] Create WellArchitectedService class
- [ ] Test CLI access

**Day 3-4: Workload Creation**
- [ ] Create Indigo Platform workload
- [ ] Define architecture components
- [ ] Set review owner and stakeholders
- [ ] Document workload scope

**Day 5: Initial Review**
- [ ] Answer Operational Excellence questions
- [ ] Answer Security questions
- [ ] Answer Reliability questions
- [ ] Create baseline milestone

### Phase 2: Complete Review (Week 2)

**Day 1-2: Remaining Pillars**
- [ ] Answer Performance Efficiency questions
- [ ] Answer Cost Optimization questions
- [ ] Answer Sustainability questions

**Day 3-4: Risk Analysis**
- [ ] Review all identified risks
- [ ] Prioritize high/medium risks
- [ ] Create improvement plan
- [ ] Assign owners to action items

**Day 5: Documentation**
- [ ] Generate review report
- [ ] Document findings
- [ ] Share with stakeholders
- [ ] Create tracking spreadsheet

### Phase 3: Automation (Week 3)

**Day 1-2: CI/CD Integration**
- [ ] Create GitHub Actions workflow
- [ ] Add automated risk checks
- [ ] Set up notifications
- [ ] Test automation

**Day 3-4: Dashboard Integration**
- [ ] Create WA Tool dashboard page
- [ ] Add risk count widgets
- [ ] Display pillar scores
- [ ] Add trend charts

**Day 5: Milestone Automation**
- [ ] Create deployment milestone script
- [ ] Integrate with deployment pipeline
- [ ] Test milestone creation
- [ ] Document process

### Phase 4: Continuous Improvement (Ongoing)

**Monthly Tasks**
- [ ] Review and update answers
- [ ] Track improvement progress
- [ ] Create monthly milestone
- [ ] Generate progress report

**Quarterly Tasks**
- [ ] Complete full re-review
- [ ] Update architecture documentation
- [ ] Stakeholder presentation
- [ ] Adjust improvement priorities

---

## Best Practices

### 1. Regular Reviews

**Frequency:**
- **Full Review**: Quarterly (every 3 months)
- **Partial Review**: Monthly (focus on changed areas)
- **Risk Check**: Weekly (automated via CI/CD)

**Triggers for Ad-Hoc Reviews:**
- Major architecture changes
- New service adoption
- Security incidents
- Performance issues
- Cost spikes

### 2. Answer Quality

**Do:**
- ✅ Provide detailed notes for each answer
- ✅ Include links to documentation
- ✅ Reference specific resources (ARNs, IDs)
- ✅ Explain why choices were made
- ✅ Document planned improvements

**Don't:**
- ❌ Rush through questions
- ❌ Guess at answers
- ❌ Leave notes empty
- ❌ Ignore "Not Applicable" options
- ❌ Skip difficult questions

### 3. Milestone Strategy

**When to Create Milestones:**
- After completing a phase of improvements
- Before major architecture changes
- After production deployments
- Quarterly for trend tracking
- Before and after incidents

**Milestone Naming Convention:**
```
[Type] [Version/Phase] - [Date]

Examples:
- Baseline - 2024-01-15
- Phase 1 Complete - 2024-02-28
- Deployment v2.5.0 - 2024-03-10
- Post-Incident Review - 2024-03-15
- Q1 2024 Review - 2024-03-31
```

### 4. Team Collaboration

**Assign Pillar Owners:**
- **Operational Excellence**: DevOps Lead
- **Security**: Security Engineer
- **Reliability**: SRE Lead
- **Performance Efficiency**: Backend Lead
- **Cost Optimization**: FinOps Manager
- **Sustainability**: Platform Architect

**Review Process:**
1. Pillar owner answers questions
2. Team reviews answers together
3. Architect validates responses
4. Document decisions and rationale
5. Create action items for improvements

### 5. Integration with Existing Processes

**Link to:**
- Architecture Decision Records (ADRs)
- Incident post-mortems
- Cost optimization reviews
- Security audits
- Performance testing results
- Capacity planning

---

## Monitoring & Continuous Improvement

### Key Metrics to Track

1. **Risk Trend**
   - High risk count over time
   - Medium risk count over time
   - Total unanswered questions

2. **Improvement Velocity**
   - Risks resolved per month
   - Time to resolve high risks
   - Questions answered per review

3. **Pillar Scores**
   - Score per pillar (0-100)
   - Improvement rate per pillar
   - Weakest pillar identification

4. **Review Completion**
   - Percentage of questions answered
   - Time to complete review
   - Frequency of reviews

### Reporting Dashboard

Create a dashboard to visualize WA Tool metrics:

```typescript
// src/app/dashboard/well-architected/metrics.ts

export async function getWAMetrics(workloadId: string) {
  const waService = new WellArchitectedService();
  
  // Get current risks
  const currentRisks = await waService.getRiskCounts(workloadId);
  
  // Get historical milestones
  const milestones = await waService.listMilestones(workloadId);
  
  // Calculate trends
  const trend = calculateRiskTrend(milestones);
  
  return {
    current: currentRisks,
    trend,
    lastReview: milestones[0]?.RecordedAt,
    totalMilestones: milestones.length,
  };
}
```

### Alerting

Set up alerts for:
- New high-risk items identified
- Increase in risk count
- Unanswered questions > 10
- No review in > 90 days

**Example Slack Notification:**
```typescript
async function notifyHighRisks(workloadId: string) {
  const risks = await waService.getRiskCounts(workloadId);
  
  if (risks.high > 0) {
    await sendSlackMessage({
      channel: '#platform-alerts',
      text: `⚠️ Well-Architected Review Alert`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${risks.high} high-risk items* identified in Well-Architected review.\n\nPlease review and create action items.`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View in Console' },
              url: `https://console.aws.amazon.com/wellarchitected/workloads/${workloadId}`,
            },
          ],
        },
      ],
    });
  }
}
```

---

## Next Steps

1. **Immediate Actions**
   - [ ] Set up IAM permissions
   - [ ] Create initial workload
   - [ ] Complete baseline review
   - [ ] Create first milestone

2. **Week 1 Goals**
   - [ ] Answer all questions
   - [ ] Document high-risk items
   - [ ] Create improvement plan
   - [ ] Set up automation

3. **Month 1 Goals**
   - [ ] Resolve critical high risks
   - [ ] Integrate with CI/CD
   - [ ] Create dashboard
   - [ ] Train team on process

4. **Ongoing**
   - [ ] Monthly reviews
   - [ ] Quarterly full reviews
   - [ ] Track improvement metrics
   - [ ] Refine automation

---

## Resources

### Official Documentation
- [AWS Well-Architected Tool User Guide](https://docs.aws.amazon.com/wellarchitected/latest/userguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [WA Tool API Reference](https://docs.aws.amazon.com/wellarchitected/latest/APIReference/)
- [WA Tool CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/wellarchitected/index.html)

### Labs & Workshops
- [Well-Architected Labs](https://wellarchitectedlabs.com/)
- [WA Tool with CloudFormation Lab](https://wellarchitectedlabs.com/well-architectedtool/300_labs/300_using_wat_with_cloudformation_and_custom_lambda/)

### Related Indigo Documentation
- [AWS Well-Architected Review](./AWS-WELL-ARCHITECTED-REVIEW.md) - Completed review findings
- [AWS Integration Plan](./AWS-INTEGRATION-PLAN.md) - Overall AWS strategy
- [AWS Abstraction Layer](./AWS-ABSTRACTION-LAYER-COMPLETE.md) - Service abstractions

---

**Last Updated:** January 14, 2026  
**Maintained By:** Platform Team  
**Review Frequency:** Quarterly
