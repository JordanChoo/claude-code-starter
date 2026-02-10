# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project Overview

<!-- TODO: Fill in your project-specific details -->
Add your project overview here.

## Working Style

When tackling any non-trivial task:

1. **Analyze first** — Read and understand ALL relevant code before making changes
2. **Map dependencies** — Identify interactions and side effects
3. **Clarify requirements** — If ANYTHING is unclear, STOP and ASK
4. **Design before coding** — Think through the approach first
5. **Implement carefully** — Follow the plan systematically

### Forbidden
- Making reactive changes without understanding root causes
- Fixing one bug and creating another (going in circles)
- Changing approach multiple times mid-task
- Quick fixes that break other things

### If You Get Stuck
- STOP — Don't keep trying random fixes
- Add `console.log` at critical points to understand actual behavior
- ASK — Request clarification or context
- REDESIGN — Create a new plan based on better understanding

## Integrated Workflow

- **[Beads](https://github.com/steveyegge/beads/)** (`bd`) — Single system of record for ALL work. Git-backed issue tracking in `.beads/`.
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Planning scratchpad for structured thinking. Artifacts in `openspec/` are temporary.

See `AGENTS.md` for the complete workflow, commit discipline, and session close protocol.

## Issue Tracking Rules

### Every `bd create` MUST include `-d`

```bash
# FORBIDDEN — will be rejected
bd create "Update file.ts" -t task

# REQUIRED — every issue needs full context
bd create "Title" -t task -p 2 -d "## Requirements
- What needs to be done

## Acceptance Criteria
- How to verify it's done

## Context
- Relevant file paths, spec references"
```

## Testing

Always run tests before committing:
- `npm test` or equivalent for your stack
- `npm run lint` to check for lint errors

## Security

Always run security scan before committing:
- `/security-scanning:security-audit`

See [.claude/rules/security-scanning.md](.claude/rules/security-scanning.md) for full security workflow.

## Destructive Command Guard

[DCG](https://github.com/Dicklesworthstone/destructive_command_guard) is required as a Claude Code hook. If a command is blocked:
1. Read the reason — use `dcg explain "<command>"` for details
2. Find a safer alternative
3. Only allowlist with justification in `~/.config/dcg/config.toml`

## Code Style

Follow existing patterns in the codebase.

See [.claude/rules/linting.md](.claude/rules/linting.md) for ESLint configuration and commands.
