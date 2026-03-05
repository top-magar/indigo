#!/usr/bin/env npx tsx
/**
 * dev-orchestrator.ts — Multi-agent development orchestrator for Indigo
 *
 * Architecture: Orchestrator-Workers pattern (Anthropic "Building Effective Agents")
 * Context engineering: Structured note-taking + subagent output to filesystem
 * (Anthropic "Effective Context Engineering for AI Agents")
 *
 * The orchestrator:
 *   1. Reads a task plan (TASKS.md)
 *   2. Analyzes file dependencies to find parallelizable tasks
 *   3. Spawns worker Kiro CLI sessions with scoped context
 *   4. Workers write output to filesystem (not through coordinator — reduces "telephone")
 *   5. Orchestrator validates (tsc), merges, and moves to next batch
 *
 * Usage:
 *   npx tsx scripts/dev-orchestrator.ts
 *   npx tsx scripts/dev-orchestrator.ts --plan scripts/tasks/my-plan.md
 *   npx tsx scripts/dev-orchestrator.ts --dry-run
 */

import { execSync, spawn, type ChildProcess } from "child_process"
import * as fs from "fs"
import * as path from "path"

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..")
const STATE_DIR = path.join(ROOT, ".dev-orchestrator")
const TASKS_FILE = path.join(STATE_DIR, "TASKS.md")
const NOTES_FILE = path.join(STATE_DIR, "NOTES.md")
const LOG_DIR = path.join(STATE_DIR, "logs")
const MAX_PARALLEL = 3

// ─── Types ───────────────────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  files: string[]        // files this task will CREATE or MODIFY
  reads: string[]        // files this task needs to READ
  prompt: string         // full prompt for the worker agent
  status: "pending" | "running" | "done" | "failed"
  dependsOn: string[]    // task IDs that must complete first
  batch?: number
}

interface Plan {
  name: string
  context: string        // shared project context for all workers
  tasks: Task[]
}

// ─── Core: Dependency Analysis ───────────────────────────────────────────────

/**
 * Compute parallel batches from task dependencies.
 * Tasks in the same batch have NO file write conflicts.
 * Implements Anthropic's "Sectioning" parallelization pattern.
 */
function computeBatches(tasks: Task[]): Task[][] {
  const batches: Task[][] = []
  const completed = new Set<string>()
  const remaining = [...tasks]

  while (remaining.length > 0) {
    const batch: Task[] = []
    const batchFiles = new Set<string>()

    for (let i = remaining.length - 1; i >= 0; i--) {
      const task = remaining[i]

      // Check: all dependencies completed?
      const depsReady = task.dependsOn.every((d) => completed.has(d))
      if (!depsReady) continue

      // Check: no file write conflicts with other tasks in this batch?
      const hasConflict = task.files.some((f) => batchFiles.has(f))
      if (hasConflict) continue

      // Add to batch
      batch.push(task)
      task.files.forEach((f) => batchFiles.add(f))
      remaining.splice(i, 1)

      if (batch.length >= MAX_PARALLEL) break
    }

    if (batch.length === 0 && remaining.length > 0) {
      console.error("❌ Circular dependency detected!")
      console.error("   Remaining tasks:", remaining.map((t) => t.id))
      process.exit(1)
    }

    batch.forEach((t) => {
      t.batch = batches.length
      completed.add(t.id)
    })
    batches.push(batch)
  }

  return batches
}

// ─── Core: Worker Prompt Builder ─────────────────────────────────────────────

/**
 * Build a scoped prompt for a worker agent.
 *
 * Follows Anthropic's context engineering principles:
 * - Minimal context: only what the worker needs
 * - Clear boundaries: explicit file scope
 * - Output to filesystem: worker writes results, not back through coordinator
 * - Structured notes: worker logs progress to a file
 */
function buildWorkerPrompt(task: Task, plan: Plan): string {
  return `You are a focused development worker on the Indigo e-commerce platform.

## YOUR TASK
${task.title}

## TASK DETAILS
${task.prompt}

## PROJECT CONTEXT
${plan.context}

## CRITICAL RULES
1. You may ONLY create or modify these files:
${task.files.map((f) => `   - ${f}`).join("\n")}

2. You may READ these files for reference:
${task.reads.map((f) => `   - ${f}`).join("\n")}

3. Do NOT modify any file not listed above.
4. Write MINIMAL code — no verbose implementations.
5. After EVERY file change, run: npx tsc --noEmit 2>&1 | head -5
6. If tsc shows errors in files you don't own, STOP and report the issue.

## WHEN DONE
1. Run \`npx tsc --noEmit\` and confirm 0 errors
2. Write a brief summary of what you did to: ${path.join(STATE_DIR, "logs", task.id + ".done")}
   Format: one line per file changed, what was changed and why.
3. Say "TASK COMPLETE" as your final message.

## IF STUCK
Write the blocker to: ${path.join(STATE_DIR, "logs", task.id + ".blocked")}
Then say "TASK BLOCKED" as your final message.
`
}

// ─── Core: Worker Spawner ────────────────────────────────────────────────────

function spawnWorker(task: Task, plan: Plan): Promise<{ task: Task; success: boolean }> {
  return new Promise((resolve) => {
    const prompt = buildWorkerPrompt(task, plan)
    const promptFile = path.join(LOG_DIR, `${task.id}.prompt.md`)
    fs.writeFileSync(promptFile, prompt)

    console.log(`  🚀 [${task.id}] Starting: ${task.title}`)
    console.log(`     Files: ${task.files.join(", ")}`)

    // Spawn kiro-cli in non-interactive mode with the prompt piped in
    const child: ChildProcess = spawn(
      "kiro-cli",
      ["chat", "/model", "claude-sonnet-4-20250514", "/tools", "trust-all"],
      {
        cwd: ROOT,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, TERM: "dumb" },
      }
    )

    let output = ""
    const logFile = path.join(LOG_DIR, `${task.id}.log`)

    child.stdout?.on("data", (data: Buffer) => {
      const text = data.toString()
      output += text
      fs.appendFileSync(logFile, text)
    })

    child.stderr?.on("data", (data: Buffer) => {
      fs.appendFileSync(logFile, `[STDERR] ${data.toString()}`)
    })

    // Send the prompt
    child.stdin?.write(prompt + "\n")

    // Set timeout (10 minutes per task)
    const timeout = setTimeout(() => {
      console.log(`  ⏰ [${task.id}] Timeout — killing worker`)
      child.kill("SIGTERM")
    }, 10 * 60 * 1000)

    child.on("close", (code) => {
      clearTimeout(timeout)
      const doneFile = path.join(LOG_DIR, `${task.id}.done`)
      const blockedFile = path.join(LOG_DIR, `${task.id}.blocked`)
      const success = fs.existsSync(doneFile) || code === 0

      if (fs.existsSync(blockedFile)) {
        console.log(`  🚫 [${task.id}] BLOCKED: ${fs.readFileSync(blockedFile, "utf-8").trim()}`)
        resolve({ task, success: false })
      } else if (success) {
        console.log(`  ✅ [${task.id}] Complete`)
        resolve({ task, success: true })
      } else {
        console.log(`  ❌ [${task.id}] Failed (exit code ${code})`)
        resolve({ task, success: false })
      }
    })
  })
}

// ─── Core: TypeScript Validator ──────────────────────────────────────────────

function validateTypeScript(): { ok: boolean; errors: string } {
  try {
    execSync("npx tsc --noEmit 2>&1", { cwd: ROOT, encoding: "utf-8" })
    return { ok: true, errors: "" }
  } catch (e: unknown) {
    const err = e as { stdout?: string }
    return { ok: false, errors: err.stdout || "Unknown error" }
  }
}

// ─── Core: Git Safety ────────────────────────────────────────────────────────

function gitCheckpoint(message: string) {
  try {
    execSync("git add -A && git stash", { cwd: ROOT, encoding: "utf-8" })
    console.log(`  📦 Git checkpoint: ${message}`)
  } catch {
    // Not a git repo or nothing to stash — that's fine
  }
}

// ─── Plan Parser ─────────────────────────────────────────────────────────────

function parsePlan(filePath: string): Plan {
  const content = fs.readFileSync(filePath, "utf-8")
  const plan: Plan = { name: "", context: "", tasks: [] }

  let currentSection = ""
  let currentTask: Partial<Task> | null = null

  for (const line of content.split("\n")) {
    if (line.startsWith("# ")) {
      plan.name = line.slice(2).trim()
    } else if (line.startsWith("## Context")) {
      currentSection = "context"
    } else if (line.startsWith("## Tasks")) {
      currentSection = "tasks"
    } else if (line.startsWith("### ") && currentSection === "tasks") {
      // Save previous task
      if (currentTask?.id) plan.tasks.push(currentTask as Task)

      const match = line.match(/^### \[([\w-]+)\] (.+)/)
      if (match) {
        currentTask = {
          id: match[1],
          title: match[2],
          files: [],
          reads: [],
          prompt: "",
          status: "pending",
          dependsOn: [],
        }
      }
    } else if (currentTask) {
      if (line.startsWith("- writes: ")) {
        currentTask.files = line.slice(10).split(",").map((f) => f.trim())
      } else if (line.startsWith("- reads: ")) {
        currentTask.reads = line.slice(9).split(",").map((f) => f.trim()).filter(Boolean)
      } else if (line.startsWith("- depends: ")) {
        currentTask.dependsOn = line.slice(11).split(",").map((d) => d.trim()).filter(Boolean)
      } else if (line.startsWith("- prompt: ")) {
        currentTask.prompt = line.slice(10)
      } else if (currentTask.prompt !== undefined && currentTask.prompt !== "") {
        currentTask.prompt += "\n" + line
      }
    } else if (currentSection === "context") {
      plan.context += line + "\n"
    }
  }

  // Save last task
  if (currentTask?.id) plan.tasks.push(currentTask as Task)

  return plan
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const planArg = args.find((a) => !a.startsWith("--"))

  // Setup state directory
  fs.mkdirSync(STATE_DIR, { recursive: true })
  fs.mkdirSync(LOG_DIR, { recursive: true })

  // Check for plan file
  const planFile = planArg || TASKS_FILE
  if (!fs.existsSync(planFile)) {
    console.log("📋 No task plan found. Creating example plan...\n")
    createExamplePlan()
    console.log(`Edit ${TASKS_FILE} with your tasks, then run again.`)
    return
  }

  const plan = parsePlan(planFile)
  console.log(`\n🏗️  Orchestrator: ${plan.name}`)
  console.log(`   Tasks: ${plan.tasks.length}`)

  // Compute batches
  const batches = computeBatches(plan.tasks)
  console.log(`   Batches: ${batches.length}`)
  console.log()

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`━━━ Batch ${i + 1}/${batches.length} (${batch.length} parallel tasks) ━━━`)

    for (const task of batch) {
      console.log(`  📌 [${task.id}] ${task.title}`)
      console.log(`     Writes: ${task.files.join(", ")}`)
      if (task.dependsOn.length) console.log(`     After: ${task.dependsOn.join(", ")}`)
    }

    if (dryRun) {
      console.log("  (dry run — skipping execution)\n")
      continue
    }

    // Run all tasks in this batch in parallel
    const results = await Promise.all(batch.map((task) => spawnWorker(task, plan)))

    // Check results
    const failed = results.filter((r) => !r.success)
    if (failed.length > 0) {
      console.log(`\n⚠️  ${failed.length} task(s) failed in batch ${i + 1}:`)
      failed.forEach((r) => console.log(`   - [${r.task.id}] ${r.task.title}`))
      console.log("   Check logs in .dev-orchestrator/logs/")
    }

    // Validate TypeScript after each batch
    console.log("\n  🔍 Running tsc --noEmit...")
    const { ok, errors } = validateTypeScript()
    if (ok) {
      console.log("  ✅ TypeScript: 0 errors")
    } else {
      console.log("  ❌ TypeScript errors detected:")
      console.log(errors.split("\n").slice(0, 10).map((l) => `     ${l}`).join("\n"))
      console.log("\n  ⛔ Stopping orchestrator. Fix errors before continuing.")
      break
    }

    // Write progress notes (structured note-taking pattern)
    const note = `\n## Batch ${i + 1} — ${new Date().toISOString()}\n${results.map((r) => `- [${r.success ? "✅" : "❌"}] ${r.task.id}: ${r.task.title}`).join("\n")}\n`
    fs.appendFileSync(NOTES_FILE, note)

    console.log()
  }

  console.log("🏁 Orchestration complete!")
  console.log(`   Notes: ${NOTES_FILE}`)
  console.log(`   Logs:  ${LOG_DIR}/`)
}

// ─── Example Plan Generator ──────────────────────────────────────────────────

function createExamplePlan() {
  const example = `# Indigo Editor Feature Sprint

## Context
Next.js 16 + Tailwind CSS v4 + Zustand + Supabase + Stripe Connect.
Store: src/features/editor/store.ts (Zustand, 1226 lines)
Types: src/types/blocks.ts (BaseBlock with responsiveOverrides)
Design system: rounded-lg, p-4 max, text-muted-foreground
Run \`npx tsc --noEmit\` after every change — must be 0 errors.

## Tasks

### [T1] Create AI page generation service
- writes: src/features/ai/generate-page.ts
- reads: src/types/blocks.ts
- depends:
- prompt: Create a service that takes a text prompt and returns StoreBlock[].
  Export: \`export async function generatePage(prompt: string): Promise<StoreBlock[]>\`
  Use a simple template-based approach for now — map keywords to block types.
  Import StoreBlock from @/types/blocks.

### [T2] Create AI generation dialog component
- writes: src/features/editor/components/ai-generation-dialog.tsx
- reads: src/components/ui/dialog.tsx, src/components/ui/button.tsx
- depends:
- prompt: Create a dialog with a textarea for the prompt and a Generate button.
  Props: \`{ open: boolean; onOpenChange: (open: boolean) => void; onGenerate: (blocks: StoreBlock[]) => void }\`
  Use shadcn Dialog, Button, Textarea. Keep it minimal — under 60 lines.

### [T3] Wire AI generation into editor
- writes: src/app/(editor)/storefront/visual-editor.tsx
- reads: src/features/ai/generate-page.ts, src/features/editor/components/ai-generation-dialog.tsx
- depends: T1, T2
- prompt: Import AIGenerationDialog and generatePage into visual-editor.
  Add state for dialog open/close. Add a button in the header area.
  On generate, call generatePage() and setBlocks() with the result.
`

  fs.writeFileSync(TASKS_FILE, example)
  console.log(`Created: ${TASKS_FILE}`)
}

// ─── Run ─────────────────────────────────────────────────────────────────────

main().catch(console.error)
