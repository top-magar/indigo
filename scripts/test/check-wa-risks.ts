#!/usr/bin/env tsx
/**
 * Well-Architected Risk Check Script
 * 
 * Checks for high-risk items in the AWS Well-Architected Tool workload.
 * Exits with error code 1 if high risks exceed the threshold.
 * 
 * Usage:
 *   tsx scripts/check-wa-risks.ts
 * 
 * Environment Variables:
 *   AWS_WELLARCHITECTED_WORKLOAD_ID - The workload ID to check (required)
 *   MAX_HIGH_RISKS - Maximum allowed high-risk items (default: 0)
 *   AWS_ACCESS_KEY_ID - AWS access key
 *   AWS_SECRET_ACCESS_KEY - AWS secret key
 *   AWS_REGION - AWS region (default: us-east-1)
 */

import { WellArchitectedService, formatRiskCounts, calculateRiskScore } from '../src/infrastructure/aws/wellarchitected';

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

async function checkRisks() {
  console.log(colorize('\n🔍 AWS Well-Architected Risk Check\n', 'bold'));

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

  const maxHighRisks = parseInt(process.env.MAX_HIGH_RISKS || '0', 10);

  console.log(colorize('Configuration:', 'cyan'));
  console.log(`  Workload ID: ${workloadId}`);
  console.log(`  Max High Risks: ${maxHighRisks}`);
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

  // Get risk counts
  console.log('Analyzing risks...');
  const risks = await waService.getRiskCounts(workloadId);

  // Display risk summary
  console.log(colorize('\n📊 Risk Assessment Summary\n', 'bold'));
  console.log('━'.repeat(50));
  
  console.log(`${colorize('🔴 High Risk:', 'red')}      ${risks.high.toString().padStart(3)} ${risks.high > 0 ? colorize('⚠️  ATTENTION REQUIRED', 'red') : ''}`);
  console.log(`${colorize('🟡 Medium Risk:', 'yellow')}    ${risks.medium.toString().padStart(3)}`);
  console.log(`${colorize('🟢 Low Risk:', 'green')}       ${risks.low.toString().padStart(3)}`);
  console.log(`${colorize('⚪ No Risk:', 'cyan')}        ${risks.none.toString().padStart(3)}`);
  console.log(`${colorize('❓ Unanswered:', 'blue')}     ${risks.unanswered.toString().padStart(3)} ${risks.unanswered > 0 ? colorize('(needs review)', 'blue') : ''}`);
  console.log(`⊘  Not Applicable: ${risks.notApplicable.toString().padStart(3)}`);
  
  console.log('━'.repeat(50));

  // Calculate and display risk score
  const riskScore = calculateRiskScore(risks);
  const scoreColor = riskScore > 50 ? 'red' : riskScore > 25 ? 'yellow' : 'green';
  console.log(`\n${colorize('Risk Score:', 'bold')} ${colorize(`${riskScore}/100`, scoreColor)} (lower is better)`);
  console.log(`${colorize('Summary:', 'bold')} ${formatRiskCounts(risks)}`);

  // Get lens review for pillar breakdown
  console.log('\n' + colorize('📋 Pillar Breakdown\n', 'bold'));
  console.log('━'.repeat(50));
  
  const lensReview = await waService.getLensReview(workloadId);
  if (lensReview.success && lensReview.lensReview?.PillarReviewSummaries) {
    lensReview.lensReview.PillarReviewSummaries.forEach((pillar) => {
      const pillarHighRisks = pillar.RiskCounts?.HIGH || 0;
      const pillarMediumRisks = pillar.RiskCounts?.MEDIUM || 0;
      const pillarLowRisks = pillar.RiskCounts?.LOW || 0;
      const pillarUnanswered = pillar.RiskCounts?.UNANSWERED || 0;
      
      const pillarName = pillar.PillarName || 'Unknown';
      const hasIssues = pillarHighRisks > 0 || pillarMediumRisks > 0 || pillarUnanswered > 0;
      
      console.log(`\n${colorize(pillarName, hasIssues ? 'yellow' : 'green')}`);
      if (pillarHighRisks > 0) console.log(`  ${colorize('High:', 'red')} ${pillarHighRisks}`);
      if (pillarMediumRisks > 0) console.log(`  ${colorize('Medium:', 'yellow')} ${pillarMediumRisks}`);
      if (pillarLowRisks > 0) console.log(`  ${colorize('Low:', 'green')} ${pillarLowRisks}`);
      if (pillarUnanswered > 0) console.log(`  ${colorize('Unanswered:', 'blue')} ${pillarUnanswered}`);
      if (!hasIssues && pillarLowRisks === 0) console.log(`  ${colorize('✓ No issues', 'green')}`);
    });
  }
  
  console.log('\n' + '━'.repeat(50));

  // Check if high risks exceed threshold
  if (risks.high > maxHighRisks) {
    console.log(colorize(`\n❌ FAILED: Found ${risks.high} high-risk item(s) (max allowed: ${maxHighRisks})`, 'red'));
    console.log('\n' + colorize('Action Required:', 'bold'));
    console.log('  1. Review high-risk items in the AWS Well-Architected Tool console');
    console.log('  2. Address the identified risks by implementing best practices');
    console.log('  3. Update answers in the workload review');
    console.log('  4. Re-run this check to verify improvements');
    console.log('\n' + colorize('Resources:', 'bold'));
    console.log(`  • AWS Console: https://console.aws.amazon.com/wellarchitected/home?region=${process.env.AWS_REGION || 'us-east-1'}#/workload/${workloadId}`);
    console.log('  • Well-Architected Framework: https://aws.amazon.com/architecture/well-architected/');
    console.log('  • Best Practices: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html');
    console.log('');
    process.exit(1);
  }

  // Success
  console.log(colorize('\n✅ PASSED: Risk check successful', 'green'));
  
  if (risks.medium > 0 || risks.low > 0) {
    console.log(colorize('\n💡 Recommendations:', 'cyan'));
    if (risks.medium > 0) {
      console.log(`  • Address ${risks.medium} medium-risk item(s) to improve architecture`);
    }
    if (risks.low > 0) {
      console.log(`  • Consider addressing ${risks.low} low-risk item(s) for optimization`);
    }
  }

  if (risks.unanswered > 0) {
    console.log(colorize('\n📝 Note:', 'yellow'));
    console.log(`  • ${risks.unanswered} question(s) remain unanswered`);
    console.log('  • Complete the review for a comprehensive assessment');
  }

  console.log(colorize('\n🎉 No high-risk items detected. Architecture review looks good!\n', 'green'));
  process.exit(0);
}

// Run the check
checkRisks().catch((error) => {
  console.error(colorize('\n❌ Unexpected error occurred:', 'red'));
  console.error(error);
  console.error('\nPlease check your configuration and try again.');
  process.exit(1);
});
