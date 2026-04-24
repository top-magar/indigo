# AWS Well-Architected Tool Documentation

This directory contains comprehensive documentation for the AWS Well-Architected Tool integration in the Indigo e-commerce platform.

## Overview

The AWS Well-Architected Tool helps review and improve cloud architectures based on AWS best practices across six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.

## Documentation Files

### Implementation Guides

1. **[AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md](./AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)**
   - Complete implementation guide for the Well-Architected Tool service
   - API reference and usage examples
   - Configuration and setup instructions
   - Best practices and patterns

2. **[AWS-WELL-ARCHITECTED-REVIEW.md](./AWS-WELL-ARCHITECTED-REVIEW.md)**
   - Detailed architecture review documentation
   - Pillar-by-pillar analysis
   - Risk assessments and recommendations
   - Improvement tracking

### Automation Guides

3. **[WELLARCHITECTED-AUTOMATION-QUICKSTART.md](./WELLARCHITECTED-AUTOMATION-QUICKSTART.md)**
   - Quick start guide for CI/CD automation
   - GitHub Actions workflow setup
   - Automated risk checking
   - Milestone creation automation

4. **[WELLARCHITECTED-AUTOMATION-SUMMARY.md](./WELLARCHITECTED-AUTOMATION-SUMMARY.md)**
   - Complete automation implementation summary
   - CI/CD integration details
   - Workflow configurations
   - Testing and validation results

### Implementation Summaries

5. **[AWS-WA-TOOL-COMPLETE.md](./AWS-WA-TOOL-COMPLETE.md)**
   - Complete implementation summary
   - Feature overview and capabilities
   - Integration points with platform
   - Deployment and usage status

6. **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)**
   - Detailed implementation timeline
   - Technical decisions and rationale
   - Challenges and solutions
   - Future enhancements

## Quick Links

### Setup and Configuration
- [Main Setup Guide](../../../WELLARCHITECTED-SETUP.md) - Quick setup in root directory
- [IAM Permissions](../../../infrastructure/iam/indigo-app-policy.json) - Required AWS permissions
- [Environment Variables](../../../.env.example) - Configuration options

### Automation
- [GitHub Workflows](../../../.github/workflows/) - CI/CD automation
  - `wa-tool-check.yml` - Risk checking on PRs
  - `wa-tool-milestone.yml` - Milestone creation on releases
- [Scripts](../../../scripts/) - Utility scripts
  - `check-wa-risks.ts` - Risk checking script
  - `create-deployment-milestone.ts` - Milestone creation script
  - `test-wellarchitected.ts` - Testing script

### Code Examples
- [Service Implementation](../../../src/infrastructure/aws/wellarchitected.ts) - Main service class
- [Usage Examples](../../../src/infrastructure/aws/__examples__/wellarchitected-usage.ts) - Code examples

## Key Features

### Architecture Reviews
- Create and manage workloads
- Conduct reviews across 6 pillars
- Track risks (high, medium, low)
- Get actionable recommendations

### Automation
- Automated risk checking in CI/CD
- Milestone creation on deployments
- PDF report generation
- Risk monitoring dashboard

### Integration
- Seamless platform integration
- Environment-based configuration
- Comprehensive error handling
- Detailed logging and metrics

## Getting Started

1. **Setup**: Follow [WELLARCHITECTED-SETUP.md](../../../WELLARCHITECTED-SETUP.md)
2. **Configure**: Set environment variables in `.env.local`
3. **Review**: Read [AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md](./AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md)
4. **Automate**: Set up workflows from [WELLARCHITECTED-AUTOMATION-QUICKSTART.md](./WELLARCHITECTED-AUTOMATION-QUICKSTART.md)
5. **Test**: Run `pnpm tsx scripts/test-wellarchitected.ts`

## Environment Variables

```bash
# AWS Well-Architected Tool
AWS_WELLARCHITECTED_ENABLED=true
AWS_WELLARCHITECTED_REVIEW_OWNER=platform-team@indigo.com
AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
AWS_WELLARCHITECTED_REGION=us-east-1

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## IAM Permissions

Required permissions:
- `wellarchitected:CreateWorkload`
- `wellarchitected:GetWorkload`
- `wellarchitected:UpdateWorkload`
- `wellarchitected:ListWorkloads`
- `wellarchitected:GetLensReview`
- `wellarchitected:CreateMilestone`
- `wellarchitected:ListMilestones`
- `wellarchitected:UpdateAnswer`
- `wellarchitected:ListAnswers`
- `wellarchitected:GetLensReviewReport`

See [infrastructure/iam/indigo-app-policy.json](../../../infrastructure/iam/indigo-app-policy.json) for complete policy.

## Best Practices

1. **Regular Reviews** - Conduct quarterly or before major releases
2. **Track Milestones** - Create milestones to track improvements
3. **Address High Risks** - Prioritize fixing high-risk items immediately
4. **Automate Checks** - Use CI/CD to prevent deploying with high risks
5. **Document Decisions** - Add notes explaining architectural choices

## Support

For issues or questions:
- Check [AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md](./AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md) for detailed documentation
- Review [Usage Examples](../../../src/infrastructure/aws/__examples__/wellarchitected-usage.ts)
- See [AGENTS.md](../../../AGENTS.md) for integration guidelines

## Statistics

- **Total Documents**: 6
- **Implementation Guides**: 2
- **Automation Guides**: 2
- **Summaries**: 2
- **Code Examples**: 2
- **Scripts**: 3
- **Workflows**: 2

Last Updated: 2024
