/**
 * Workflow Engine - Saga-based workflow execution with compensation
 * Inspired by MedusaJS's workflow SDK but adapted for Next.js/Supabase
 */

import { SupabaseClient } from "@supabase/supabase-js";

// Types
export interface WorkflowContext {
  tenantId: string;
  supabase: SupabaseClient;
  completedSteps: Array<{ id: string; output: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface StepResponse<T> {
  data: T;
  compensationData?: unknown;
}

export interface StepDefinition<TInput, TOutput> {
  id: string;
  execute: (
    input: TInput,
    context: WorkflowContext
  ) => Promise<StepResponse<TOutput>>;
  compensate?: (
    compensationData: unknown,
    context: WorkflowContext
  ) => Promise<void>;
}

export interface WorkflowDefinition<TInput, TOutput> {
  id: string;
  steps: StepDefinition<unknown, unknown>[];
  hooks?: {
    onStart?: (input: TInput, context: WorkflowContext) => Promise<void>;
    onComplete?: (output: TOutput, context: WorkflowContext) => Promise<void>;
    onError?: (error: Error, context: WorkflowContext) => Promise<void>;
  };
}

// Step creation helper
export function createStep<TInput, TOutput>(
  id: string,
  execute: (
    input: TInput,
    context: WorkflowContext
  ) => Promise<TOutput>,
  compensate?: (
    compensationData: unknown,
    context: WorkflowContext
  ) => Promise<void>
): StepDefinition<TInput, TOutput> {
  return {
    id,
    execute: async (input, context) => {
      const data = await execute(input, context);
      return { data, compensationData: data };
    },
    compensate,
  };
}

// Step with explicit compensation data
export function createStepWithCompensation<TInput, TOutput, TCompensation>(
  id: string,
  execute: (
    input: TInput,
    context: WorkflowContext
  ) => Promise<{ data: TOutput; compensationData: TCompensation }>,
  compensate: (
    compensationData: TCompensation,
    context: WorkflowContext
  ) => Promise<void>
): StepDefinition<TInput, TOutput> {
  return {
    id,
    execute: async (input, context) => {
      const result = await execute(input, context);
      return { data: result.data, compensationData: result.compensationData };
    },
    compensate: compensate as (data: unknown, ctx: WorkflowContext) => Promise<void>,
  };
}

// Workflow execution
interface CompletedStep {
  step: StepDefinition<any, any>;
  compensationData: unknown;
}

export async function runWorkflow<TInput, TOutput>(
  steps: StepDefinition<any, any>[],
  input: TInput,
  context: WorkflowContext
): Promise<TOutput> {
  const completedSteps: CompletedStep[] = [];

  try {
    let currentInput: unknown = input;

    for (const step of steps) {
      const response = await step.execute(currentInput, context);
      
      completedSteps.push({
        step,
        compensationData: response.compensationData,
      });
      
      context.completedSteps.push({
        id: step.id,
        output: response.data,
      });
      
      currentInput = response.data;
    }

    return currentInput as TOutput;
  } catch (error) {
    // Compensate in reverse order
    console.error(`Workflow failed, compensating ${completedSteps.length} steps...`);
    
    for (const { step, compensationData } of completedSteps.reverse()) {
      if (step.compensate) {
        try {
          await step.compensate(compensationData, context);
          console.log(`Compensated step: ${step.id}`);
        } catch (compensateError) {
          console.error(`Failed to compensate step ${step.id}:`, compensateError);
          // Continue compensating other steps
        }
      }
    }

    throw error;
  }
}

// Workflow definition helper
export function createWorkflow<TInput, TOutput>(
  id: string,
  builder: (input: TInput) => StepDefinition<any, any>[]
): {
  id: string;
  run: (input: TInput, context: WorkflowContext) => Promise<TOutput>;
} {
  return {
    id,
    run: async (input: TInput, context: WorkflowContext) => {
      const steps = builder(input);
      return runWorkflow<TInput, TOutput>(steps, input, context);
    },
  };
}

// Transform helper (like MedusaJS's transform)
export function transform<TInput, TOutput>(
  input: TInput,
  transformer: (data: TInput) => TOutput
): TOutput {
  return transformer(input);
}

// Parallel execution helper
export async function parallel<T extends readonly unknown[]>(
  ...promises: { [K in keyof T]: Promise<T[K]> }
): Promise<T> {
  return Promise.all(promises) as Promise<T>;
}

// Conditional step execution
export function when<TInput, TOutput>(
  condition: (input: TInput) => boolean,
  step: StepDefinition<TInput, TOutput>
): StepDefinition<TInput, TOutput | TInput> {
  return {
    id: `conditional-${step.id}`,
    execute: async (input, context) => {
      if (condition(input as TInput)) {
        return step.execute(input, context);
      }
      return { data: input as TOutput | TInput };
    },
    compensate: step.compensate as any,
  };
}
