# Spec Template

Use this to plan features before coding. Copy to `.kiro/specs/{feature-name}/`.

## 1. Requirements (`requirements.md`)

```markdown
# {Feature Name} — Requirements

## Problem
What user problem does this solve?

## User Stories
- As a {role}, I want to {action} so that {benefit}.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Out of Scope
- What this does NOT include.
```

## 2. Design (`design.md`)

```markdown
# {Feature Name} — Design

## Approach
How we'll build it. Architecture decisions.

## Data Model
New tables, columns, or schema changes.

## UI
Wireframe or description of the interface.

## API
New server actions or API routes.

## Security
Tenant isolation, input validation, auth checks.
```

## 3. Tasks (`tasks.md`)

```markdown
# {Feature Name} — Tasks

- [ ] Task 1 — description (estimated effort)
- [ ] Task 2 — description
- [ ] Task 3 — description

## Dependencies
What must exist before this can start.

## Verification
How to confirm it works.
```
