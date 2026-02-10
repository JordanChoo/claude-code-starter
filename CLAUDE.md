<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.
<!-- OPENSPEC:END -->

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

This project uses two complementary tools:

- **[Beads](https://github.com/steveyegge/beads/)** (`bd`) — Single system of record for ALL work. Git-backed issue tracking in `.beads/`.
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Planning scratchpad for structured thinking. Artifacts in `openspec/` are temporary.

**Beads answers:** "Where are we in building it?"
**OpenSpec answers:** "What should we build?"

### Quick Reference

```bash
# Beads (execution tracking)
bd ready                                    # Find available work
bd create "Title" -t task -p 2 -d "..."     # Create issue (MUST include -d)
bd update <id> --status in_progress         # Claim work
bd close <id> --reason "Completed"          # Complete work
bd sync                                     # Sync with git

# OpenSpec (planning — use only when needed)
/opsx:explore                               # Think through a problem
/opsx:ff <name>                             # Generate all planning artifacts
/opsx:new <name>                            # Step-by-step artifact creation
```

### Workflow Summary

1. **Pick work** — `bd ready` → `bd update <id> --status in_progress`
2. **Plan (if needed)** — `/opsx:explore` or `/opsx:ff <name>`
3. **Implement** — Write code directly, referencing artifacts
4. **Close** — `rm -rf openspec/changes/<name>` → `bd close <id>` → `bd sync && git push`

See `AGENTS.md` for the full detailed workflow.

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

### One Commit Per Task, One Bead Per Task

Every git commit MUST reference a bead ID. Every task gets its own commit.

```bash
# Commit format — use parentheses (enables bd doctor orphan detection)
git commit -m "feat: description (bd-<task-id>)"
```

See AGENTS.md for detailed rules on parallel agents, feature branches, and commit discipline.

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
