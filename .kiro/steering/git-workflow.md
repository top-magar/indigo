# Git Workflow

## Commit Rules

- Commit after every logical unit of work (not at the end of a session)
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Single concise line, imperative mood
- Run `npx tsc --noEmit` before committing — never commit with type errors
- `git add -A && git commit -m "type: description"` — stage everything, no partial commits

## When to Commit

- After fixing a bug → `fix: description`
- After adding a feature → `feat: description`
- After refactoring → `refactor: description`
- After updating docs → `docs: description`
- After cleanup → `chore: description`

## Branch Convention

- Work on the current branch (check with `git branch --show-current`)
- Don't create new branches unless asked

## Never

- Never commit .env files
- Never commit with type errors
- Never leave a session with uncommitted changes
