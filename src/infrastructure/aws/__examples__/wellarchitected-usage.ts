/**
 * AWS Well-Architected Tool Usage Examples
 * 
 * This file demonstrates how to use the WellArchitectedService
 * for conducting architecture reviews and tracking improvements.
 */

import { WellArchitectedService, formatRiskCounts, calculateRiskScore } from '../wellarchitected';

/**
 * Example 1: Create a new workload
 */
export async function createIndigoPlatformWorkload() {
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
    notes: 'Initial workload creation for architecture review',
    tags: {
      Environment: 'Production',
      Team: 'Platform',
      Project: 'Indigo',
    },
  });

  if (result.success) {
    console.log('✅ Workload created successfully!');
    console.log('Workload ID:', result.workloadId);
    console.log('Workload ARN:', result.workloadArn);
    
    // Save workload ID to environment variable for future use
    console.log('\nAdd this to your .env.local:');
    console.log(`AWS_WELLARCHITECTED_WORKLOAD_ID=${result.workloadId}`);
  } else {
    console.error('❌ Failed to create workload:', result.error);
  }

  return result;
}

/**
 * Example 2: List all workloads
 */
export async function listAllWorkloads() {
  const waService = new WellArchitectedService();

  const { workloads, nextToken } = await waService.listWorkloads(10);

  console.log(`Found ${workloads.length} workload(s):\n`);

  workloads.forEach((workload, index) => {
    console.log(`${index + 1}. ${workload.WorkloadName}`);
    console.log(`   ID: ${workload.WorkloadId}`);
    console.log(`   Updated: ${workload.UpdatedAt}\n`);
  });

  if (nextToken) {
    console.log('More results available. Use nextToken for pagination.');
  }

  return workloads;
}

/**
 * Example 3: Get risk counts for a workload
 */
export async function checkWorkloadRisks(workloadId: string) {
  const waService = new WellArchitectedService();

  const risks = await waService.getRiskCounts(workloadId);

  console.log('📊 Risk Assessment:\n');
  console.log(`🔴 High Risk:      ${risks.high}`);
  console.log(`🟡 Medium Risk:    ${risks.medium}`);
  console.log(`🟢 Low Risk:       ${risks.low}`);
  console.log(`⚪ No Risk:        ${risks.none}`);
  console.log(`❓ Unanswered:     ${risks.unanswered}`);
  console.log(`⊘  Not Applicable: ${risks.notApplicable}\n`);

  const riskScore = calculateRiskScore(risks);
  console.log(`Risk Score: ${riskScore}/100 (lower is better)`);
  console.log(`Summary: ${formatRiskCounts(risks)}`);

  // Alert if high risks exist
  if (risks.high > 0) {
    console.log('\n⚠️  WARNING: High-risk items require immediate attention!');
  }

  return risks;
}

/**
 * Example 4: Get detailed lens review
 */
export async function getLensReviewDetails(workloadId: string) {
  const waService = new WellArchitectedService();

  const result = await waService.getLensReview(workloadId);

  if (result.success && result.lensReview) {
    const review = result.lensReview;
    
    console.log('📋 Lens Review Details:\n');
    console.log(`Lens: ${review.LensName}`);
    console.log(`Lens Alias: ${review.LensAlias}`);
    console.log(`Lens Version: ${review.LensVersion}`);
    console.log(`Updated: ${review.UpdatedAt}\n`);

    console.log('Pillar Risk Counts:');
    review.PillarReviewSummaries?.forEach((pillar) => {
      console.log(`\n${pillar.PillarName}:`);
      console.log(`  High: ${pillar.RiskCounts?.HIGH || 0}`);
      console.log(`  Medium: ${pillar.RiskCounts?.MEDIUM || 0}`);
      console.log(`  Unanswered: ${pillar.RiskCounts?.UNANSWERED || 0}`);
    });
  } else {
    console.error('❌ Failed to get lens review:', result.error);
  }

  return result;
}

/**
 * Example 5: Create a milestone after improvements
 */
export async function createImprovementMilestone(workloadId: string, phase: string) {
  const waService = new WellArchitectedService();

  const date = new Date().toISOString().split('T')[0];
  const milestoneName = `${phase} Complete - ${date}`;
  const notes = `Completed ${phase} improvements and architectural changes`;

  const result = await waService.createMilestone(workloadId, milestoneName, notes);

  if (result.success) {
    console.log('✅ Milestone created successfully!');
    console.log(`Milestone #${result.milestoneNumber}: ${milestoneName}`);
  } else {
    console.error('❌ Failed to create milestone:', result.error);
  }

  return result;
}

/**
 * Example 6: List all milestones to track progress
 */
export async function listWorkloadMilestones(workloadId: string) {
  const waService = new WellArchitectedService();

  const { milestones } = await waService.listMilestones(workloadId);

  console.log(`📅 Found ${milestones.length} milestone(s):\n`);

  milestones.forEach((milestone, index) => {
    console.log(`${index + 1}. ${milestone.MilestoneName}`);
    console.log(`   Number: ${milestone.MilestoneNumber}`);
    console.log(`   Recorded: ${milestone.RecordedAt}\n`);
  });

  return milestones;
}

/**
 * Example 7: Update an answer to a question
 */
export async function updateQuestionAnswer(
  workloadId: string,
  questionId: string,
  selectedChoices: string[]
) {
  const waService = new WellArchitectedService();

  const result = await waService.updateAnswer({
    workloadId,
    lensAlias: 'wellarchitected',
    questionId,
    selectedChoices,
    notes: 'Updated answer based on current architecture implementation',
  });

  if (result.success) {
    console.log('✅ Answer updated successfully!');
    console.log(`Question: ${result.answer?.QuestionTitle}`);
    console.log(`Risk: ${result.answer?.Risk}`);
  } else {
    console.error('❌ Failed to update answer:', result.error);
  }

  return result;
}

/**
 * Example 8: List questions for a specific pillar
 */
export async function listPillarQuestions(
  workloadId: string,
  pillarId: 'operationalExcellence' | 'security' | 'reliability' | 'performance' | 'costOptimization' | 'sustainability'
) {
  const waService = new WellArchitectedService();

  const { answers } = await waService.listAnswers(
    workloadId,
    'wellarchitected',
    pillarId
  );

  console.log(`📝 Questions for ${pillarId}:\n`);

  answers.forEach((answer, index) => {
    console.log(`${index + 1}. ${answer.QuestionTitle}`);
    console.log(`   Risk: ${answer.Risk || 'Not assessed'}`);
    console.log(`   Answered: ${answer.IsApplicable !== false ? 'Yes' : 'No'}\n`);
  });

  return answers;
}

/**
 * Example 9: Generate and get review report
 */
export async function getWorkloadReport(workloadId: string) {
  const waService = new WellArchitectedService();

  const result = await waService.getLensReviewReport(workloadId);

  if (result.success && result.reportUrl) {
    console.log('✅ Report generated successfully!');
    console.log(`Report URL: ${result.reportUrl}`);
    console.log('\nNote: URL is valid for 15 minutes');
  } else {
    console.error('❌ Failed to generate report:', result.error);
  }

  return result;
}

/**
 * Example 10: Check if Well-Architected Tool is available
 */
export async function checkServiceAvailability() {
  const waService = new WellArchitectedService();

  const isAvailable = await waService.isAvailable();

  if (isAvailable) {
    console.log('✅ AWS Well-Architected Tool is available and configured');
  } else {
    console.log('❌ AWS Well-Architected Tool is not available');
    console.log('Please check your AWS credentials and IAM permissions');
  }

  return isAvailable;
}

/**
 * Example 11: Complete workflow - Create workload and track improvements
 */
export async function completeWorkflowExample() {
  const waService = new WellArchitectedService();

  console.log('🚀 Starting Well-Architected Tool workflow...\n');

  // Step 1: Check availability
  console.log('Step 1: Checking service availability...');
  const isAvailable = await waService.isAvailable();
  if (!isAvailable) {
    console.error('Service not available. Exiting.');
    return;
  }
  console.log('✅ Service available\n');

  // Step 2: Create workload
  console.log('Step 2: Creating workload...');
  const createResult = await waService.createWorkload({
    name: 'Indigo Platform - Demo',
    description: 'Demo workload for testing',
    environment: 'PREPRODUCTION',
    awsRegions: ['us-east-1'],
    reviewOwner: 'demo@indigo.com',
  });

  if (!createResult.success) {
    console.error('Failed to create workload. Exiting.');
    return;
  }

  const workloadId = createResult.workloadId!;
  console.log(`✅ Workload created: ${workloadId}\n`);

  // Step 3: Get initial risk assessment
  console.log('Step 3: Getting initial risk assessment...');
  const initialRisks = await waService.getRiskCounts(workloadId);
  console.log(`Initial risks: ${formatRiskCounts(initialRisks)}\n`);

  // Step 4: Create baseline milestone
  console.log('Step 4: Creating baseline milestone...');
  await waService.createMilestone(workloadId, 'Baseline', 'Initial architecture state');
  console.log('✅ Baseline milestone created\n');

  // Step 5: Simulate answering questions and improvements
  console.log('Step 5: After improvements, create another milestone...');
  await waService.createMilestone(
    workloadId,
    'Phase 1 Complete',
    'Completed security and reliability improvements'
  );
  console.log('✅ Phase 1 milestone created\n');

  // Step 6: Get updated risk assessment
  console.log('Step 6: Getting updated risk assessment...');
  const updatedRisks = await waService.getRiskCounts(workloadId);
  console.log(`Updated risks: ${formatRiskCounts(updatedRisks)}\n`);

  // Step 7: Generate report
  console.log('Step 7: Generating review report...');
  const reportResult = await waService.getLensReviewReport(workloadId);
  if (reportResult.success) {
    console.log(`✅ Report URL: ${reportResult.reportUrl}\n`);
  }

  console.log('🎉 Workflow complete!');
  console.log(`\nWorkload ID: ${workloadId}`);
  console.log('You can now view this workload in the AWS Console');
}

/**
 * Example 12: Automated CI/CD integration
 */
export async function cicdRiskCheck(workloadId: string, maxHighRisks: number = 0) {
  const waService = new WellArchitectedService();

  console.log('🔍 Running CI/CD risk check...\n');

  const risks = await waService.getRiskCounts(workloadId);

  console.log('Risk Assessment:');
  console.log(`  High: ${risks.high}`);
  console.log(`  Medium: ${risks.medium}`);
  console.log(`  Low: ${risks.low}\n`);

  if (risks.high > maxHighRisks) {
    console.error(`❌ FAILED: Found ${risks.high} high-risk items (max allowed: ${maxHighRisks})`);
    console.error('Please address high-risk items before deploying to production');
    process.exit(1);
  }

  console.log('✅ PASSED: Risk check successful');
  return true;
}

// Export all examples for easy testing
export const examples = {
  createIndigoPlatformWorkload,
  listAllWorkloads,
  checkWorkloadRisks,
  getLensReviewDetails,
  createImprovementMilestone,
  listWorkloadMilestones,
  updateQuestionAnswer,
  listPillarQuestions,
  getWorkloadReport,
  checkServiceAvailability,
  completeWorkflowExample,
  cicdRiskCheck,
};
