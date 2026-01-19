/**
 * AWS Well-Architected Tool Service
 * 
 * Provides programmatic access to conduct architecture reviews,
 * track improvements, and maintain best practices across AWS workloads.
 * 
 * Features:
 * - Create and manage workloads
 * - Conduct architecture reviews
 * - Track improvements with milestones
 * - Get risk assessments and recommendations
 * - Automate reviews via API
 */

import {
  WellArchitectedClient,
  CreateWorkloadCommand,
  ListWorkloadsCommand,
  GetWorkloadCommand,
  UpdateWorkloadCommand,
  DeleteWorkloadCommand,
  GetLensReviewCommand,
  CreateMilestoneCommand,
  ListMilestonesCommand,
  GetMilestoneCommand,
  UpdateAnswerCommand,
  ListAnswersCommand,
  GetLensReviewReportCommand,
  AssociateLensesCommand,
  DisassociateLensesCommand,
  ListLensesCommand,
  type CreateWorkloadCommandInput,
  type UpdateAnswerCommandInput,
  type WorkloadSummary,
  type LensReview,
  type MilestoneSummary,
  type Answer,
  type LensSummary,
  type Environment,
  type RiskCounts,
} from '@aws-sdk/client-wellarchitected';

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Lazy-initialized client
let waClient: WellArchitectedClient | null = null;

function getWAClient(): WellArchitectedClient {
  if (!waClient) {
    waClient = new WellArchitectedClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined, // Uses default credential chain (IAM role, env vars, etc.)
    });
  }
  return waClient;
}

// Type definitions for better developer experience
export interface CreateWorkloadParams {
  name: string;
  description: string;
  environment: Environment;
  awsRegions: string[];
  reviewOwner: string;
  architecturalDesign?: string;
  industry?: string;
  industryType?: string;
  lenses?: string[];
  notes?: string;
  tags?: Record<string, string>;
}

export interface CreateWorkloadResult {
  success: boolean;
  workloadId?: string;
  workloadArn?: string;
  error?: string;
}

export interface UpdateAnswerParams {
  workloadId: string;
  lensAlias: string;
  questionId: string;
  selectedChoices: string[];
  notes?: string;
  isApplicable?: boolean;
  reason?: string;
}

export interface RiskCountsResult {
  high: number;
  medium: number;
  low: number;
  none: number;
  unanswered: number;
  notApplicable: number;
}

export interface MilestoneResult {
  success: boolean;
  milestoneNumber?: number;
  workloadId?: string;
  error?: string;
}

/**
 * AWS Well-Architected Tool Service
 * 
 * Provides methods to interact with the AWS Well-Architected Tool API
 */
export class WellArchitectedService {
  private client: WellArchitectedClient;

  constructor() {
    this.client = getWAClient();
  }

  /**
   * Create a new workload
   * 
   * @param params - Workload creation parameters
   * @returns Workload ID and ARN
   */
  async createWorkload(params: CreateWorkloadParams): Promise<CreateWorkloadResult> {
    try {
      const input: CreateWorkloadCommandInput = {
        WorkloadName: params.name,
        Description: params.description,
        Environment: params.environment,
        AwsRegions: params.awsRegions,
        Lenses: params.lenses || ['wellarchitected'],
        ReviewOwner: params.reviewOwner,
        ArchitecturalDesign: params.architecturalDesign,
        Industry: params.industry,
        IndustryType: params.industryType,
        Notes: params.notes,
        Tags: params.tags,
        ClientRequestToken: `workload-${Date.now()}`,
      };

      const command = new CreateWorkloadCommand(input);
      const response = await this.client.send(command);

      return {
        success: true,
        workloadId: response.WorkloadId,
        workloadArn: response.WorkloadArn,
      };
    } catch (error) {
      console.error('[WellArchitected] Create workload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workload',
      };
    }
  }

  /**
   * List all workloads
   * 
   * @param maxResults - Maximum number of results to return
   * @param nextToken - Token for pagination
   * @returns Array of workload summaries
   */
  async listWorkloads(
    maxResults?: number,
    nextToken?: string
  ): Promise<{ workloads: WorkloadSummary[]; nextToken?: string }> {
    try {
      const command = new ListWorkloadsCommand({
        MaxResults: maxResults,
        NextToken: nextToken,
      });
      const response = await this.client.send(command);

      return {
        workloads: response.WorkloadSummaries || [],
        nextToken: response.NextToken,
      };
    } catch (error) {
      console.error('[WellArchitected] List workloads failed:', error);
      return { workloads: [] };
    }
  }

  /**
   * Get workload details
   * 
   * @param workloadId - The workload ID
   * @returns Workload details
   */
  async getWorkload(workloadId: string) {
    try {
      const command = new GetWorkloadCommand({
        WorkloadId: workloadId,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        workload: response.Workload,
      };
    } catch (error) {
      console.error('[WellArchitected] Get workload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workload',
      };
    }
  }

  /**
   * Update workload details
   * 
   * @param workloadId - The workload ID
   * @param updates - Fields to update
   * @returns Updated workload
   */
  async updateWorkload(
    workloadId: string,
    updates: {
      description?: string;
      environment?: Environment;
      awsRegions?: string[];
      architecturalDesign?: string;
      reviewOwner?: string;
      isReviewOwnerUpdateAcknowledged?: boolean;
      industryType?: string;
      industry?: string;
      notes?: string;
    }
  ) {
    try {
      const command = new UpdateWorkloadCommand({
        WorkloadId: workloadId,
        Description: updates.description,
        Environment: updates.environment,
        AwsRegions: updates.awsRegions,
        ArchitecturalDesign: updates.architecturalDesign,
        ReviewOwner: updates.reviewOwner,
        IsReviewOwnerUpdateAcknowledged: updates.isReviewOwnerUpdateAcknowledged,
        IndustryType: updates.industryType,
        Industry: updates.industry,
        Notes: updates.notes,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        workload: response.Workload,
      };
    } catch (error) {
      console.error('[WellArchitected] Update workload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workload',
      };
    }
  }

  /**
   * Delete a workload
   * 
   * @param workloadId - The workload ID
   * @returns Success status
   */
  async deleteWorkload(workloadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteWorkloadCommand({
        WorkloadId: workloadId,
        ClientRequestToken: `delete-${Date.now()}`,
      });
      await this.client.send(command);

      return { success: true };
    } catch (error) {
      console.error('[WellArchitected] Delete workload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workload',
      };
    }
  }

  /**
   * Get lens review for a workload
   * 
   * @param workloadId - The workload ID
   * @param lensAlias - The lens alias (default: 'wellarchitected')
   * @param milestoneNumber - Optional milestone number for historical review
   * @returns Lens review details
   */
  async getLensReview(
    workloadId: string,
    lensAlias: string = 'wellarchitected',
    milestoneNumber?: number
  ): Promise<{ success: boolean; lensReview?: LensReview; error?: string }> {
    try {
      const command = new GetLensReviewCommand({
        WorkloadId: workloadId,
        LensAlias: lensAlias,
        MilestoneNumber: milestoneNumber,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        lensReview: response.LensReview,
      };
    } catch (error) {
      console.error('[WellArchitected] Get lens review failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lens review',
      };
    }
  }

  /**
   * Get lens review report (PDF URL)
   * 
   * @param workloadId - The workload ID
   * @param lensAlias - The lens alias (default: 'wellarchitected')
   * @param milestoneNumber - Optional milestone number
   * @returns Report URL
   */
  async getLensReviewReport(
    workloadId: string,
    lensAlias: string = 'wellarchitected',
    milestoneNumber?: number
  ) {
    try {
      const command = new GetLensReviewReportCommand({
        WorkloadId: workloadId,
        LensAlias: lensAlias,
        MilestoneNumber: milestoneNumber,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        reportUrl: response.LensReviewReport?.LensReviewReportUrl,
      };
    } catch (error) {
      console.error('[WellArchitected] Get lens review report failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get report',
      };
    }
  }

  /**
   * Create a milestone
   * 
   * @param workloadId - The workload ID
   * @param name - Milestone name
   * @param notes - Optional notes
   * @returns Milestone number and workload ID
   */
  async createMilestone(
    workloadId: string,
    name: string,
    notes?: string
  ): Promise<MilestoneResult> {
    try {
      const command = new CreateMilestoneCommand({
        WorkloadId: workloadId,
        MilestoneName: name,
        ClientRequestToken: `milestone-${Date.now()}`,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        milestoneNumber: response.MilestoneNumber,
        workloadId: response.WorkloadId,
      };
    } catch (error) {
      console.error('[WellArchitected] Create milestone failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create milestone',
      };
    }
  }

  /**
   * List milestones for a workload
   * 
   * @param workloadId - The workload ID
   * @param maxResults - Maximum number of results
   * @param nextToken - Token for pagination
   * @returns Array of milestone summaries
   */
  async listMilestones(
    workloadId: string,
    maxResults?: number,
    nextToken?: string
  ): Promise<{ milestones: MilestoneSummary[]; nextToken?: string }> {
    try {
      const command = new ListMilestonesCommand({
        WorkloadId: workloadId,
        MaxResults: maxResults,
        NextToken: nextToken,
      });
      const response = await this.client.send(command);

      return {
        milestones: response.MilestoneSummaries || [],
        nextToken: response.NextToken,
      };
    } catch (error) {
      console.error('[WellArchitected] List milestones failed:', error);
      return { milestones: [] };
    }
  }

  /**
   * Get milestone details
   * 
   * @param workloadId - The workload ID
   * @param milestoneNumber - The milestone number
   * @returns Milestone details
   */
  async getMilestone(workloadId: string, milestoneNumber: number) {
    try {
      const command = new GetMilestoneCommand({
        WorkloadId: workloadId,
        MilestoneNumber: milestoneNumber,
      });
      const response = await this.client.send(command);

      return {
        success: true,
        milestone: response.Milestone,
      };
    } catch (error) {
      console.error('[WellArchitected] Get milestone failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get milestone',
      };
    }
  }

  /**
   * Update an answer to a question
   * 
   * @param params - Answer update parameters
   * @returns Updated answer
   */
  async updateAnswer(params: UpdateAnswerParams) {
    try {
      const input: UpdateAnswerCommandInput = {
        WorkloadId: params.workloadId,
        LensAlias: params.lensAlias,
        QuestionId: params.questionId,
        SelectedChoices: params.selectedChoices,
        Notes: params.notes,
        IsApplicable: params.isApplicable,
        Reason: params.reason as any,
      };

      const command = new UpdateAnswerCommand(input);
      const response = await this.client.send(command);

      return {
        success: true,
        answer: response.Answer,
      };
    } catch (error) {
      console.error('[WellArchitected] Update answer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update answer',
      };
    }
  }

  /**
   * List answers for a pillar
   * 
   * @param workloadId - The workload ID
   * @param lensAlias - The lens alias
   * @param pillarId - The pillar ID
   * @param maxResults - Maximum number of results
   * @param nextToken - Token for pagination
   * @returns Array of answers
   */
  async listAnswers(
    workloadId: string,
    lensAlias: string,
    pillarId: string,
    maxResults?: number,
    nextToken?: string
  ): Promise<{ answers: Answer[]; nextToken?: string }> {
    try {
      const command = new ListAnswersCommand({
        WorkloadId: workloadId,
        LensAlias: lensAlias,
        PillarId: pillarId,
        MaxResults: maxResults,
        NextToken: nextToken,
      });
      const response = await this.client.send(command);

      return {
        answers: response.AnswerSummaries || [],
        nextToken: response.NextToken,
      };
    } catch (error) {
      console.error('[WellArchitected] List answers failed:', error);
      return { answers: [] };
    }
  }

  /**
   * Get risk counts for a workload
   * 
   * @param workloadId - The workload ID
   * @param lensAlias - The lens alias (default: 'wellarchitected')
   * @param milestoneNumber - Optional milestone number
   * @returns Risk counts by severity
   */
  async getRiskCounts(
    workloadId: string,
    lensAlias: string = 'wellarchitected',
    milestoneNumber?: number
  ): Promise<RiskCountsResult> {
    const result = await this.getLensReview(workloadId, lensAlias, milestoneNumber);

    if (!result.success || !result.lensReview) {
      return {
        high: 0,
        medium: 0,
        low: 0,
        none: 0,
        unanswered: 0,
        notApplicable: 0,
      };
    }

    const riskCounts = result.lensReview.RiskCounts || {};

    return {
      high: riskCounts.HIGH || 0,
      medium: riskCounts.MEDIUM || 0,
      low: riskCounts.LOW || 0,
      none: riskCounts.NONE || 0,
      unanswered: riskCounts.UNANSWERED || 0,
      notApplicable: riskCounts.NOT_APPLICABLE || 0,
    };
  }

  /**
   * Associate lenses with a workload
   * 
   * @param workloadId - The workload ID
   * @param lensAliases - Array of lens aliases to associate
   * @returns Success status
   */
  async associateLenses(
    workloadId: string,
    lensAliases: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new AssociateLensesCommand({
        WorkloadId: workloadId,
        LensAliases: lensAliases,
      });
      await this.client.send(command);

      return { success: true };
    } catch (error) {
      console.error('[WellArchitected] Associate lenses failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to associate lenses',
      };
    }
  }

  /**
   * Disassociate lenses from a workload
   * 
   * @param workloadId - The workload ID
   * @param lensAliases - Array of lens aliases to disassociate
   * @returns Success status
   */
  async disassociateLenses(
    workloadId: string,
    lensAliases: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DisassociateLensesCommand({
        WorkloadId: workloadId,
        LensAliases: lensAliases,
      });
      await this.client.send(command);

      return { success: true };
    } catch (error) {
      console.error('[WellArchitected] Disassociate lenses failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disassociate lenses',
      };
    }
  }

  /**
   * List available lenses
   * 
   * @param maxResults - Maximum number of results
   * @param nextToken - Token for pagination
   * @returns Array of lens summaries
   */
  async listLenses(
    maxResults?: number,
    nextToken?: string
  ): Promise<{ lenses: LensSummary[]; nextToken?: string }> {
    try {
      const command = new ListLensesCommand({
        MaxResults: maxResults,
        NextToken: nextToken,
      });
      const response = await this.client.send(command);

      return {
        lenses: response.LensSummaries || [],
        nextToken: response.NextToken,
      };
    } catch (error) {
      console.error('[WellArchitected] List lenses failed:', error);
      return { lenses: [] };
    }
  }

  /**
   * Check if Well-Architected Tool is available and configured
   * 
   * @returns True if service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.listWorkloads(1);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Helper function to format risk counts for display
 */
export function formatRiskCounts(risks: RiskCountsResult): string {
  const parts: string[] = [];

  if (risks.high > 0) parts.push(`${risks.high} high`);
  if (risks.medium > 0) parts.push(`${risks.medium} medium`);
  if (risks.low > 0) parts.push(`${risks.low} low`);
  if (risks.unanswered > 0) parts.push(`${risks.unanswered} unanswered`);

  return parts.length > 0 ? parts.join(', ') : 'No risks identified';
}

/**
 * Helper function to calculate risk score (0-100)
 * Lower is better
 */
export function calculateRiskScore(risks: RiskCountsResult): number {
  const total = risks.high + risks.medium + risks.low + risks.none + risks.unanswered;
  if (total === 0) return 0;

  // Weight: High = 10, Medium = 5, Low = 2, Unanswered = 3
  const weightedRisks =
    risks.high * 10 + risks.medium * 5 + risks.low * 2 + risks.unanswered * 3;

  const maxPossibleRisk = total * 10; // If all were high risk
  const score = (weightedRisks / maxPossibleRisk) * 100;

  return Math.round(score);
}
