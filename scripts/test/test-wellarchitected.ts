#!/usr/bin/env tsx
/**
 * Test script for AWS Well-Architected Tool integration
 * 
 * Usage:
 *   tsx scripts/test-wellarchitected.ts
 * 
 * Environment variables required:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_REGION (optional, defaults to us-east-1)
 */

import { WellArchitectedService, formatRiskCounts, calculateRiskScore } from '../src/infrastructure/aws/wellarchitected';

async function main() {
  console.log('🧪 Testing AWS Well-Architected Tool Integration\n');

  const waService = new WellArchitectedService();

  // Test 1: Check service availability
  console.log('Test 1: Checking service availability...');
  const isAvailable = await waService.isAvailable();
  
  if (isAvailable) {
    console.log('✅ Service is available and configured\n');
  } else {
    console.error('❌ Service is not available');
    console.error('Please check:');
    console.error('  1. AWS credentials are configured');
    console.error('  2. IAM permissions include wellarchitected:*');
    console.error('  3. AWS region is correct\n');
    process.exit(1);
  }

  // Test 2: List existing workloads
  console.log('Test 2: Listing existing workloads...');
  const { workloads } = await waService.listWorkloads(5);
  console.log(`✅ Found ${workloads.length} workload(s)\n`);

  if (workloads.length > 0) {
    console.log('Existing workloads:');
    workloads.forEach((workload, index) => {
      console.log(`  ${index + 1}. ${workload.WorkloadName}`);
      console.log(`     ID: ${workload.WorkloadId}`);
      console.log(`     Environment: ${workload.Environment}`);
      console.log(`     Updated: ${workload.UpdatedAt}\n`);
    });
  }

  // Test 3: List available lenses
  console.log('Test 3: Listing available lenses...');
  const { lenses } = await waService.listLenses(5);
  console.log(`✅ Found ${lenses.length} lens(es)\n`);

  if (lenses.length > 0) {
    console.log('Available lenses:');
    lenses.forEach((lens, index) => {
      console.log(`  ${index + 1}. ${lens.LensName}`);
      console.log(`     Alias: ${lens.LensAlias}`);
      console.log(`     Type: ${lens.LensType}\n`);
    });
  }

  // Test 4: If workload ID is provided, get risk counts
  const workloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID;
  
  if (workloadId) {
    console.log('Test 4: Getting risk counts for workload...');
    console.log(`Workload ID: ${workloadId}\n`);

    const risks = await waService.getRiskCounts(workloadId);
    
    console.log('📊 Risk Assessment:');
    console.log(`  🔴 High Risk:      ${risks.high}`);
    console.log(`  🟡 Medium Risk:    ${risks.medium}`);
    console.log(`  🟢 Low Risk:       ${risks.low}`);
    console.log(`  ⚪ No Risk:        ${risks.none}`);
    console.log(`  ❓ Unanswered:     ${risks.unanswered}`);
    console.log(`  ⊘  Not Applicable: ${risks.notApplicable}\n`);

    const riskScore = calculateRiskScore(risks);
    console.log(`Risk Score: ${riskScore}/100 (lower is better)`);
    console.log(`Summary: ${formatRiskCounts(risks)}\n`);

    if (risks.high > 0) {
      console.log('⚠️  WARNING: High-risk items require immediate attention!\n');
    }

    // Test 5: Get lens review details
    console.log('Test 5: Getting lens review details...');
    const { lensReview } = await waService.getLensReview(workloadId);
    
    if (lensReview) {
      console.log('✅ Lens Review Retrieved\n');
      console.log(`Lens: ${lensReview.LensName}`);
      console.log(`Version: ${lensReview.LensVersion}`);
      console.log(`Updated: ${lensReview.UpdatedAt}\n`);

      if (lensReview.PillarReviewSummaries && lensReview.PillarReviewSummaries.length > 0) {
        console.log('Pillar Risk Counts:');
        lensReview.PillarReviewSummaries.forEach((pillar) => {
          console.log(`\n  ${pillar.PillarName}:`);
          console.log(`    High: ${pillar.RiskCounts?.HIGH || 0}`);
          console.log(`    Medium: ${pillar.RiskCounts?.MEDIUM || 0}`);
          console.log(`    Low: ${pillar.RiskCounts?.LOW || 0}`);
          console.log(`    Unanswered: ${pillar.RiskCounts?.UNANSWERED || 0}`);
        });
        console.log();
      }
    }

    // Test 6: List milestones
    console.log('Test 6: Listing milestones...');
    const { milestones } = await waService.listMilestones(workloadId, 5);
    console.log(`✅ Found ${milestones.length} milestone(s)\n`);

    if (milestones.length > 0) {
      console.log('Recent milestones:');
      milestones.forEach((milestone, index) => {
        console.log(`  ${index + 1}. ${milestone.MilestoneName}`);
        console.log(`     Number: ${milestone.MilestoneNumber}`);
        console.log(`     Recorded: ${milestone.RecordedAt}\n`);
      });
    }
  } else {
    console.log('ℹ️  Skipping workload-specific tests (no AWS_WELLARCHITECTED_WORKLOAD_ID set)\n');
    console.log('To test with a specific workload, set:');
    console.log('  export AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id\n');
  }

  console.log('🎉 All tests completed successfully!\n');
  console.log('Next steps:');
  console.log('  1. Create a workload if you don\'t have one');
  console.log('  2. Answer questions in the AWS Console');
  console.log('  3. Create milestones to track improvements');
  console.log('  4. Integrate with your CI/CD pipeline\n');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
