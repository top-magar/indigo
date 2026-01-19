#!/usr/bin/env tsx
/**
 * Create Deployment Milestone Script
 * 
 * Creates a milestone in AWS Well-Architected Tool after a deployment.
 * This helps track architecture changes over time and compare risk assessments.
 * 
 * Usage:
 *   tsx scripts/create-deployment-milestone.ts
 * 
 * Environment Variables:
 *   AWS_WELLARCHITECTED_WORKLOAD_ID - The workload ID (required)
 *   DEPLOYMENT_VERSION - Version/tag of the deployment (required)
 *   DEPLOYMENT_NOTES - Optional notes about the deployment
 *   AWS_ACCESS_KEY_ID - AWS access key
 *   AWS_SECRET_ACCESS_KEY - AWS secret key
 *   AWS_REGION - AWS region (default: us-east-1)
 */

import { WellArchitectedService, formatRiskCounts } from '../src/infrastructure/aws/wellarchitected';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

async function createMilestone() {
  console.log(colorize('\n📅 Create Deployment Milestone\n', 'bold'));

  // Validate environment variables
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID;
  if (!workloadId) {
    console.error(colorize('❌ ERROR: AWS_WELLARCHITECTED_WORKLOAD_ID environment variable is not set', 'red'));
    console.error('\nPlease set the workload ID:');
    console.error('  export AWS_WELLARCHITECTED_WORKLOAD_ID=<your-workload-id>');
    console.error('\nOr add it to your GitHub Secrets:');
    console.error('  AWS_WELLARCHITECTED_WORKLOAD_ID');
    process.exit(1);
  }

  const deploymentVersion = process.env.DEPLOYMENT_VERSION;
  if (!deploymentVersion) {
    console.error(colorize('❌ ERROR: DEPLOYMENT_VERSION environment variable is not set', 'red'));
    console.error('\nPlease set the deployment version:');
    console.error('  export DEPLOYMENT_VERSION=v1.2.3');
    console.error('\nOr pass it in your CI/CD pipeline:');
    console.error('  DEPLOYMENT_VERSION=${{ github.ref_name }}');
    process.exit(1);
  }

  const deploymentNotes = process.env.DEPLOYMENT_NOTES || 'Production deployment';

  console.log(colorize('Configuration:', 'cyan'));
  console.log(`  Workload ID: ${workloadId}`);
  console.log(`  Version: ${deploymentVersion}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

  // Initialize service
  const waService = new WellArchitectedService();

  // Check if service is available
  console.log('Checking service availability...');
  const isAvailable = await waService.isAvailable();
  
  if (!isAvailable) {
    console.error(colorize('\n❌ ERROR: AWS Well-Architected Tool is not available', 'red'));
    console.error('\nPossible causes:');
    console.error('  1. AWS credentials are not configured correctly');
    console.error('  2. IAM permissions do not include wellarchitected:* actions');
    console.error('  3. AWS region is incorrect');
    console.error('  4. Network connectivity issues');
    console.error('\nPlease check your configuration and try again.');
    process.exit(1);
  }

  console.log(colorize('✅ Service available\n', 'green'));

  // Get workload details
  console.log('Fetching workload details...');
  const workloadResult = await waService.getWorkload(workloadId);
  
  if (!workloadResult.success || !workloadResult.workload) {
    console.error(colorize(`\n❌ ERROR: Failed to get workload: ${workloadResult.error}`, 'red'));
    console.error('\nPlease verify:');
    console.error(`  1. Workload ID "${workloadId}" exists`);
    console.error('  2. You have permission to access this workload');
    console.error('  3. The workload has not been deleted');
    process.exit(1);
  }

  const workload = workloadResult.workload;
  console.log(colorize(`✅ Workload found: ${workload.WorkloadName}\n`, 'green'));

  // Get current risk counts before creating milestone
  console.log('Analyzing current risks...');
  const risks = await waService.getRiskCounts(workloadId);
  
  console.log(colorize('\n📊 Current Risk Status\n', 'bold'));
  console.log('━'.repeat(50));
  console.log(`${colorize('🔴 High Risk:', 'red')}      ${risks.high}`);
  console.log(`${colorize('🟡 Medium Risk:', 'yellow')}    ${risks.medium}`);
  console.log(`${colorize('🟢 Low Risk:', 'green')}       ${risks.low}`);
  console.log(`${colorize('⚪ No Risk:', 'cyan')}        ${risks.none}`);
  console.log(`${colorize('❓ Unanswered:', 'blue')}     ${risks.unanswered}`);
  console.log('━'.repeat(50));
  console.log(`Summary: ${formatRiskCounts(risks)}\n`);

  // Create milestone name with date
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const milestoneName = `Deployment ${deploymentVersion} - ${date}`;

  console.log('Creating milestone...');
  console.log(`  Name: ${milestoneName}`);
  console.log(`  Notes: ${deploymentNotes}\n`);

  const result = await waService.createMilestone(
    workloadId,
    milestoneName,
    deploymentNotes
  );

  if (!result.success) {
    console.error(colorize(`\n❌ ERROR: Failed to create milestone: ${result.error}`, 'red'));
    console.error('\nPossible causes:');
    console.error('  1. Insufficient IAM permissions (need wellarchitected:CreateMilestone)');
    console.error('  2. Workload is in an invalid state');
    console.error('  3. Milestone name already exists');
    console.error('\nPlease check the error message and try again.');
    process.exit(1);
  }

  // Success
  console.log(colorize('✅ Milestone created successfully!\n', 'green'));
  console.log(colorize('Milestone Details:', 'bold'));
  console.log(`  Number: ${result.milestoneNumber}`);
  console.log(`  Name: ${milestoneName}`);
  console.log(`  Workload: ${workload.WorkloadName}`);
  console.log(`  Date: ${date}`);

  // List recent milestones
  console.log('\n' + colorize('Recent Milestones:', 'cyan'));
  const { milestones } = await waService.listMilestones(workloadId, 5);
  
  if (milestones.length > 0) {
    console.log('━'.repeat(50));
    milestones.forEach((milestone, index) => {
      const isNew = milestone.MilestoneNumber === result.milestoneNumber;
      const prefix = isNew ? colorize('→', 'green') : ' ';
      const name = isNew ? colorize(milestone.MilestoneName || '', 'green') : milestone.MilestoneName;
      console.log(`${prefix} #${milestone.MilestoneNumber}: ${name}`);
      console.log(`  Recorded: ${milestone.RecordedAt}`);
      if (index < milestones.length - 1) console.log('');
    });
    console.log('━'.repeat(50));
  }

  // Provide helpful next steps
  console.log('\n' + colorize('Next Steps:', 'cyan'));
  console.log('  1. View milestone in AWS Console to see risk comparison');
  console.log('  2. Compare with previous milestones to track improvements');
  console.log('  3. Review any new high-risk items introduced in this deployment');
  console.log('  4. Update workload answers if architecture has changed');

  console.log('\n' + colorize('Resources:', 'bold'));
  console.log(`  • AWS Console: https://console.aws.amazon.com/wellarchitected/home?region=${process.env.AWS_REGION || 'us-east-1'}#/workload/${workloadId}`);
  console.log(`  • Milestone #${result.milestoneNumber}: View in console for detailed comparison`);

  // Warn if high risks exist
  if (risks.high > 0) {
    console.log('\n' + colorize('⚠️  Warning:', 'yellow'));
    console.log(`  This deployment has ${risks.high} high-risk item(s).`);
    console.log('  Consider addressing these before the next deployment.');
  }

  console.log(colorize('\n🎉 Milestone created successfully!\n', 'green'));
  process.exit(0);
}

// Run the script
createMilestone().catch((error) => {
  console.error(colorize('\n❌ Unexpected error occurred:', 'red'));
  console.error(error);
  console.error('\nPlease check your configuration and try again.');
  process.exit(1);
});
