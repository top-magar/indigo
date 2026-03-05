# Anthropic Prompting Principles — Applied to All AI Interactions

This steering file ensures every AI response in this project follows Anthropic's prompt engineering best practices. These rules apply FIRST, before any task-specific logic.

## Core Principles

### 1. Be Clear and Direct
- Treat every task as if explaining to a skilled new hire with zero context
- Golden Rule: if a colleague reading the prompt would be confused, rewrite it
- State the exact desired outcome, format, and constraints upfront
- Small details matter — typos and ambiguity degrade output quality

### 2. Separate Data from Instructions
- Use XML tags to separate structure: `<context>`, `<instructions>`, `<examples>`, `<constraints>`
- Never mix variable data inline with fixed instructions
- Template prompts so the skeleton is reusable with different inputs
- XML tags are Claude's preferred delimiter — use them over markdown fences for prompt structure

### 3. Assign Roles When It Matters
- Prime with a role to set expertise level, tone, and style
- "You are a senior Next.js/TypeScript developer building a production e-commerce platform"
- Specify the audience too — who the output is for changes the response
- Role prompting works in system prompts or user messages

### 4. Think Step by Step (Precognition)
- For complex tasks: think out loud BEFORE answering — silent thinking doesn't count
- Use `<thinking>` tags to separate reasoning from final output
- Break multi-step problems into explicit numbered steps
- Ordering matters — put the most important context/question last

### 5. Format Output Explicitly
- Specify exact format: TypeScript code blocks, JSON, bullet lists, tables
- Pre-fill the response start to steer format (e.g., start with ```tsx)
- Use structured output for anything that will be parsed programmatically
- One format per response — don't mix prose and code without clear separation

### 6. Use Examples (Few-Shot)
- Provide 2-3 examples of desired input→output for consistent formatting
- Examples are the most reliable way to get exact output structure
- Show both good and bad examples when teaching patterns to avoid

### 7. Prevent Hallucinations
- Say "I don't know" or "not enough information" when uncertain
- Find evidence in provided context BEFORE answering
- Quote or reference specific files/lines when making claims about code
- Never invent API signatures, config options, or library features — verify first

### 8. Chain Over Mega-Prompts
- Break complex workflows into sequential focused steps
- Each step should have a single clear objective
- Pass output of one step as input to the next
- Verify intermediate results before proceeding

## Applied to This Project (Indigo)

When working on Indigo code, always:

1. **Read before writing** — check existing code patterns before generating new code
2. **Verify types** — run `npx tsc --noEmit` mentally; never produce code with obvious type errors
3. **Follow existing conventions** — match the patterns in `.cursorrules` and neighboring files
4. **Minimal changes** — write only what's needed, don't refactor unrelated code
5. **Explain tradeoffs** — when multiple approaches exist, state why you chose one

## Prompt Structure Template

For complex tasks, structure prompts internally as:

```
<context>
  Project state, relevant files, current errors
</context>

<instructions>
  Specific task with numbered steps
</instructions>

<constraints>
  What NOT to do, banned patterns, size limits
</constraints>

<examples>
  Input → Expected output (when format matters)
</examples>
```

## Reference

Full Anthropic prompt engineering course: `resources/prompt-eng-interactive-tutorial/Anthropic 1P/`
- Ch 2: Being Clear and Direct
- Ch 3: Role Prompting
- Ch 4: Separating Data and Instructions
- Ch 5: Formatting Output
- Ch 6: Thinking Step by Step
- Ch 7: Few-Shot Examples
- Ch 8: Avoiding Hallucinations
- Ch 9: Complex Prompts from Scratch
- Ch 10: Prompt Chaining, Tool Use, Search & Retrieval
