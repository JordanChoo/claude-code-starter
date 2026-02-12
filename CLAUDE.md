# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Session Start Protocol (MANDATORY)

> **STOP**: Before doing ANY work, complete these steps IN ORDER.

1. **Read `AGENTS.md`** — Complete workflow, commit discipline, coordination rules
2. **Start Agent Mail session** — `macro_start_session` with this project's absolute path and `file_reservation_paths`
3. **Resolve conflicts** — If step 2 returned `file_reservations.conflicts`, **STOP**. Follow the Conflict Resolution Protocol in `AGENTS.md`. Do NOT proceed until conflicts are resolved or confirmed stale.
4. **Check inbox** — Read messages from other agents before planning work
5. **Verify bead ownership** — If your target bead is already `in_progress`, check its Agent Mail thread for an active agent. Only claim it if the prior agent is confirmed stale.
6. **Announce intent** — `send_message` with `thread_id="claude-<bead-id>"` before starting

Skipping these steps causes uncoordinated work, merge conflicts, and duplicated effort.

## Pre-Implementation Checklist (MANDATORY)

> **STOP**: After the Session Start Protocol and before editing ANY file, evaluate these gates.

### Branching Strategy

Check the work type against the Git Branch Strategy table in `AGENTS.md`:

| Work Type | Branch? |
|-----------|---------|
| Epic / multi-task initiative | **YES** — `feature/<name>` |
| New feature spanning multiple files | **YES** — `feature/<name>` |
| Architectural change | **YES** — `feature/<name>` |
| Work with OpenSpec planning | **YES** — `feature/<name>` |
| Single-commit bug fix | NO — direct to `main` |
| Documentation update | NO — direct to `main` |
| Config change | NO — direct to `main` |

**If YES:** Create the feature branch before any edits. See `AGENTS.md` "Complete Feature Branch Workflow" for the full sequence.

### Pre-Edit Verification

Before the first file edit, confirm:

1. [ ] **Correct branch** — Am I on the right branch for this work type?
2. [ ] **Bead exists** — Is there a bead for this work? (`br show <id>`)
3. [ ] **Bead is in_progress** — (`br update <id> --status in_progress`)
4. [ ] **No file reservation conflicts** — Did Agent Mail confirm no conflicts? If conflicts were reported, was the Conflict Resolution Protocol completed?
5. [ ] **No active agent on this bead** — Was bead ownership verified per Session Start Protocol step 5?

Skipping this checklist leads to commits on wrong branches that cannot be easily undone after push.

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

- **[Beads](https://github.com/steveyegge/beads/)** (`br`) — Single system of record for ALL work. Git-backed issue tracking in `.beads/`.
- **[Beads Viewer](https://github.com/Dicklesworthstone/beads_viewer)** (`bv`) — Graph-aware triage engine. Use `bv --robot-triage` for work prioritization and dependency analysis. **Never run bare `bv`** (launches interactive TUI).
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Planning scratchpad for structured thinking. Artifacts in `openspec/` are temporary.

See `AGENTS.md` for the complete workflow, commit discipline, and session close protocol.

## Issue Tracking Rules

### Every `br create` MUST include `-d`

```bash
# FORBIDDEN — will be rejected
br create "Update file.ts" -t task

# REQUIRED — every issue needs full context
br create "Title" -t task -p 2 -d "## Requirements
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
- `/security-scanning:security-sast`

See [.claude/rules/security-scanning.md](.claude/rules/security-scanning.md) for full security workflow.

## Destructive Command Guard

[DCG](https://github.com/Dicklesworthstone/destructive_command_guard) is required as a Claude Code hook. If a command is blocked:
1. Read the reason — use `dcg explain "<command>"` for details
2. Find a safer alternative
3. Only allowlist with justification in `~/.config/dcg/config.toml`

## Code Style

Follow existing patterns in the codebase.

See [.claude/rules/linting.md](.claude/rules/linting.md) for ESLint configuration and commands.
