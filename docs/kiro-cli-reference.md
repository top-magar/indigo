# Kiro CLI Documentation Reference

> Fetched from https://kiro.dev/docs/cli/ on 2026-04-13

## Table of Contents
1. Custom Agents — Creating, Configuration Reference, Examples
2. Steering — Workspace/global steering files
3. Hooks — agentSpawn, preToolUse, postToolUse, stop
4. Skills — SKILL.md format, activation, locations
5. Subagents — Parallel execution, configuring access
6. Delegate (deprecated) — Background tasks

---

## 1. Custom Agents

### File Locations
- **Local (workspace)**: `.kiro/agents/<name>.json`
- **Global (user-wide)**: `~/.kiro/agents/<name>.json`
- Local takes precedence over global with same name

### Configuration Fields
- `name` — Agent identifier
- `description` — Human-readable description
- `prompt` — Inline text or `file://./path/to/prompt.md` (relative to config file)
- `model` — Model ID (e.g., `"claude-sonnet-4"`)
- `tools` — Available tools: `"read"`, `"write"`, `"shell"`, `"aws"`, `"@mcp-server"`, `"*"`
- `allowedTools` — Auto-approved tools (supports wildcards: `"read"`, `"@git/*"`, `"code_*"`)
- `toolAliases` — Remap tool names: `{"@git/git_status": "status"}`
- `toolsSettings` — Per-tool config: `{"write": {"allowedPaths": ["src/**"]}}`
- `resources` — Context files: `"file://README.md"`, `"skill://.kiro/skills/**/SKILL.md"`
- `hooks` — Commands at trigger points
- `mcpServers` — MCP server definitions
- `includeMcpJson` — Include servers from mcp.json files
- `keyboardShortcut` — e.g., `"ctrl+shift+r"` (modifiers: ctrl, shift; keys: a-z, 0-9)
- `welcomeMessage` — Shown when switching to agent

### Tool Names (simplified)
- `read` (alias: `fs_read`) — Read files
- `write` (alias: `fs_write`) — Write files
- `shell` (alias: `execute_bash`) — Execute commands
- `aws` (alias: `use_aws`) — AWS CLI
- `code` — Code intelligence
- `knowledge` — Knowledge base search
- `subagent` (alias: `agent_crew`) — Spawn subagents
- `todo_list` (alias: `todo`) — Task tracking
- `@server_name` — All tools from MCP server
- `@server_name/tool_name` — Specific MCP tool
- `*` — All tools (only in `tools`, NOT in `allowedTools`)
- `@builtin` — All built-in tools

### Prompt File Resolution
- Relative: `"file://./prompt.md"` → relative to agent config file directory
- Absolute: `"file:///home/user/prompts/agent.md"`

### Complete Example
```json
{
  "name": "aws-rust-agent",
  "description": "Specialized agent for AWS and Rust development",
  "prompt": "file://./prompts/aws-rust-expert.md",
  "model": "claude-sonnet-4",
  "tools": ["read", "write", "shell", "aws", "@git", "@fetch/fetch_url"],
  "toolAliases": {"@git/git_status": "status"},
  "allowedTools": ["read", "@git/git_status"],
  "toolsSettings": {
    "write": {"allowedPaths": ["src/**", "tests/**"]},
    "aws": {"allowedServices": ["s3", "lambda"], "autoAllowReadonly": true}
  },
  "resources": ["file://README.md", "file://docs/**/*.md"],
  "hooks": {
    "agentSpawn": [{"command": "git status"}],
    "postToolUse": [{"matcher": "fs_write", "command": "cargo fmt --all"}]
  },
  "keyboardShortcut": "ctrl+shift+r",
  "welcomeMessage": "Ready to help!"
}
```

---

## 2. Steering

### Locations
- **Workspace**: `.kiro/steering/*.md` — project-specific
- **Global**: `~/.kiro/steering/*.md` — all workspaces
- Workspace overrides global on conflict

### Foundational Files
- `product.md` — Product purpose, users, features
- `tech.md` — Frameworks, libraries, constraints
- `structure.md` — File organization, naming, architecture

### Custom Agents + Steering
Custom agents do NOT auto-load steering. Add explicitly:
```json
{"resources": ["file://.kiro/steering/**/*.md"]}
```

### AGENTS.md
Always included automatically. Place in workspace root or `~/.kiro/steering/`.

---

## 3. Hooks

### Triggers
- `agentSpawn` — Agent initialized. STDOUT → context.
- `userPromptSubmit` — User sends message. STDOUT → context.
- `preToolUse` — Before tool. Exit 0=allow, exit 2=block (STDERR→LLM).
- `postToolUse` — After tool. Informational only.
- `stop` — Assistant finishes responding. No matcher.

### Matcher
- `"write"` or `"fs_write"` — both work (aliases supported)
- `"@git"` — all git MCP tools
- `"*"` — all tools
- No matcher — applies to all

### Config
```json
{
  "hooks": {
    "agentSpawn": [{"command": "git status"}],
    "preToolUse": [{"matcher": "shell", "command": "echo audit"}],
    "postToolUse": [{"matcher": "write", "command": "prettier --write"}],
    "stop": [{"command": "npx tsc --noEmit"}]
  }
}
```

### Timeout
Default: 30s. Configure with `timeout_ms`.

---

## 4. Skills

### Format
```
my-skill/
├── SKILL.md        # Required — frontmatter + instructions
└── references/     # Optional — loaded on demand
    └── guide.md
```

### SKILL.md
```markdown
---
name: my-skill
description: When to activate. Kiro matches this against requests.
---
## Instructions here...
```

### Locations
- `.kiro/skills/` — workspace (project-specific)
- `~/.kiro/skills/` — global (personal)

### Custom Agents
Must explicitly include:
```json
{"resources": ["skill://.kiro/skills/*/SKILL.md"]}
```

---

## 5. Subagents

### Capabilities
- Autonomous execution with own context
- Live progress tracking
- Parallel execution
- Result aggregation

### Available Tools in Subagents
✅ read, write, shell, code, MCP tools
❌ web_search, web_fetch, introspect, todo_list, use_aws, grep, glob

### Configuring Access
```json
{
  "toolsSettings": {
    "subagent": {
      "availableAgents": ["reviewer", "tester", "docs-*"],
      "trustedAgents": ["reviewer", "tester"]
    }
  }
}
```
- `availableAgents` — which agents can be spawned (glob patterns)
- `trustedAgents` — auto-approved without prompts (glob patterns)

### Usage
```
> Use the backend agent to refactor the payment module
```

---

## 6. Delegate (DEPRECATED → use Subagents)

Background task execution. Being replaced by subagents.
Enable: `kiro-cli settings chat.enableDelegate true`
