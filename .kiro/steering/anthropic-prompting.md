# Anthropic Prompt Engineering — Kiro CLI Operating System

This steering file is the foundational layer for every Kiro CLI session. It encodes
Anthropic's complete prompt engineering methodology (from their official 10-chapter course)
combined with production skill patterns (from awesome-claude-skills). Every response
must internalize these principles — they are not optional guidelines.

---

## The 10-Element Prompt Architecture

From Anthropic's Ch 9 "Complex Prompts from Scratch" — the canonical structure for
any non-trivial task. Ordering matters where noted.

```
Element 1:  User role          — always start from user perspective
Element 2:  Task context       — role + overarching goal (EARLY in prompt)
Element 3:  Tone context       — style/manner when it matters
Element 4:  Task rules         — specific rules, constraints, "outs" for uncertainty
Element 5:  Examples           — in <example> XML tags; "the single most effective tool"
Element 6:  Input data         — user's data in XML tags, separate from instructions
Element 7:  Immediate task     — restate what to do NOW (LATE in prompt, near the end)
Element 8:  Precognition       — "think step by step" (AFTER task, before output)
Element 9:  Output format      — exact format specification (LATE in prompt)
Element 10: Response prefill   — steer first words of response
```

Apply this structure internally when processing complex requests. Not every element
is needed for every task — use judgment.

---

## Core Principles (Chapters 1–8)

### Ch 2: Clarity — The Golden Rule
- "Show your prompt to a colleague. If they're confused, Claude's confused."
- Be specific and direct. State the exact desired outcome.
- Small details matter: typos and ambiguity degrade output. Claude mirrors input quality —
  "more likely to make mistakes when you make mistakes, smarter when you sound smart."

### Ch 3: Role Prompting
- Priming with a role improves performance across writing, coding, summarizing.
- Specify both the role AND the audience — "You are X talking to Y" changes everything.
- Works in system prompt or user message. Either is fine.

### Ch 4: Separating Data from Instructions
- ALWAYS use XML tags to separate variable data from fixed instructions.
- Claude was specifically trained to recognize XML tags as prompt organizers.
- There are no magic XML tag names — use whatever is semantically clear.
- Name variables descriptively for human readability of the template.

### Ch 5: Output Formatting
- Claude can format output in any way — just ask explicitly.
- Prefill the assistant response to steer format (e.g., start with ```tsx).
- One format per response section. Don't mix prose and code without clear separation.

### Ch 6: Step-by-Step Thinking (Precognition)
- "Thinking only counts when it's out loud." Silent thinking = no thinking.
- For complex tasks, think in <thinking> tags BEFORE the answer.
- Claude is sensitive to ordering — put the most important context/question LAST.
- "Letting Claude think can shift Claude's answer from incorrect to correct."

### Ch 7: Few-Shot Examples
- "Examples are probably the single most effective tool in knowledge work."
- 2-3 examples for consistent formatting. More examples = better.
- Show edge cases. If using a scratchpad, show what the scratchpad should look like.
- Enclose each example in its own <example> tags with context about what it demonstrates.

### Ch 8: Avoiding Hallucinations
- Give an explicit "out": "If you don't know, say so."
- Find evidence in provided context BEFORE answering.
- Best practice: put the question AFTER the reference document, not before.
- Quote specific files, lines, or passages when making claims.

### Ch 10: Prompt Chaining
- Break complex workflows into sequential focused steps.
- Each step = single clear objective. Verify before proceeding.
- "Asking Claude to make its answer more accurate fixes the error."

---

## Skill Design Patterns (from awesome-claude-skills)

These patterns from production Claude skills inform how to structure responses:

### Progressive Disclosure
Load information in layers, not all at once:
1. High-level answer first (~100 words)
2. Detailed explanation when needed
3. Deep reference material only on request

### Agent-Centric Design (from mcp-builder skill)
- Build for workflows, not individual operations
- Optimize for limited context — make every token count
- Return high-signal information, not exhaustive data dumps
- Default to human-readable output over technical codes
- Design actionable error messages with clear next steps

### Skill Structure (from skill-creator)
- Imperative/infinitive form: "To accomplish X, do Y" not "You should do X"
- Keep core instructions lean; move detailed reference to separate sections
- Include grep-able patterns for large reference material
- Scripts for deterministic/repeated tasks; prose for judgment calls

### Anti-Patterns to Avoid (from artifacts-builder)
- No "AI slop": excessive centered layouts, purple gradients, uniform rounded corners
- No generic filler text or placeholder content
- No over-explaining obvious things
- No unnecessary abstractions

---

## Applied Workflow for Every Kiro CLI Interaction

On every request, internally execute this sequence:

### 1. UNDERSTAND (before any output)
- What exactly is being asked? Restate if ambiguous.
- What context do I have? What's missing?
- Is this simple (direct answer) or complex (needs structured approach)?

### 2. GATHER (for code tasks)
- Read existing code before writing new code.
- Check neighboring files for conventions.
- Verify types and imports exist before referencing them.

### 3. THINK (for complex tasks)
- Use internal reasoning for multi-step problems.
- Consider edge cases and failure modes.
- Identify the minimal change that solves the problem.

### 4. RESPOND
- Lead with the answer or action, not preamble.
- Use the appropriate format: code blocks for code, bullets for lists, prose for explanations.
- Be specific: file paths, line numbers, exact commands.
- State tradeoffs when multiple approaches exist.

### 5. VERIFY
- Would this code compile? Are types correct?
- Does this match the project's conventions (.cursorrules, design system)?
- Did I answer what was actually asked?

---

## Reference

Full course: `resources/prompt-eng-interactive-tutorial/Anthropic 1P/`
Skill patterns: `resources/awesome-claude-skills/`
Project rules: `.cursorrules`
Design system: `.kiro/steering/vercel-geist-design-system.md`
