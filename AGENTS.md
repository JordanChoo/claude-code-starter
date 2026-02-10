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

# Agent Instructions

This project uses **Beads** (`bd`) for issue tracking and **OpenSpec** for planning.

Run `bd onboard` if you haven't already this session.

---

## When to Use Beads vs OpenSpec

| Situation | Tool | Action |
|-----------|------|--------|
| New feature/capability | Both | `bd create` epic, then `/opsx:ff` to plan |
| Planning complete, ready to build | Both | Convert tasks to beads, implement directly |
| Bug fix, small task, tech debt | Beads only | `bd create` directly, implement |
| Discovered issue during work | Beads only | `bd create "Found: <issue>" -t bug --discovered-from <current-id>` |
| Tracking what's ready | Beads | `bd ready` |
| Work complete | Beads | Clean up artifacts, `bd close <id> --reason "Completed"` |
| Need to think through a problem | OpenSpec | `/opsx:explore` |
| Need structured planning | OpenSpec | `/opsx:ff <name>` or `/opsx:new <name>` |

**Rule of thumb:** If you can describe the work in a single bead description, skip OpenSpec. If the work needs structured thinking (multiple capabilities, architectural decisions, complex requirements), use OpenSpec to plan first.

---

## Complete Workflow

### 1. Orient

```bash
bd ready --json      # See unblocked, prioritized work
```

Select highest priority ready issue OR continue in-progress work.

### 2. Pick Work

```bash
bd update <id> --status in_progress   # Claim it
```

### 3. Plan (if needed)

For non-trivial changes, use OpenSpec to produce planning artifacts:

```bash
/opsx:explore          # Think through the problem (optional)
/opsx:ff <name>        # Generate all planning artifacts at once
```

This creates `openspec/changes/<name>/` with:
- `proposal.md` — Why, what capabilities, impact
- `specs/<capability>/spec.md` — Requirements using WHEN/THEN scenarios
- `design.md` — Technical decisions and approach
- `tasks.md` — Implementation outline (reference only)

**For trivial fixes, skip this step entirely.**

### 4. Convert Tasks to Beads Issues

When planning artifacts are ready, create beads issues from `tasks.md`:

```bash
# Create epic for the change
bd create "<change-name>" -t epic -p 1 -l "openspec:<change-name>" -d "## Overview
<change description>

## Reference
- openspec/changes/<change-name>/proposal.md
- openspec/changes/<change-name>/design.md

## Acceptance Criteria
- <how to verify completion>"

# For each task in tasks.md, create a child issue with FULL context
bd create "<task description>" -t task -p 2 -l "openspec:<change-name>" -d "## Spec Reference
openspec/changes/<change-name>/specs/<capability>/spec.md

## Requirements
- <specific implementation requirements>

## Acceptance Criteria
- <how to verify this task is done>

## Files to Modify
- <list of files this task touches>

## Design Context
- <relevant architectural decisions from design.md>"
```

**Issues must be self-contained.** The test: could someone implement this issue correctly with ONLY the `bd` description and access to the codebase? If not, add more context.

**Three-field separation for rich issues:**

| Field | Content | Purpose |
|-------|---------|---------|
| Description (`-d`) | Implementation steps, files, snippets, testing commands | What to do mechanically |
| Design (in description) | Architecture context, relevant design decisions | Why we're doing it this way |
| Notes (in description) | Spec references with paths, line numbers | Where to find more context |

### 5. Implement

Write code directly, referencing OpenSpec artifacts and bead descriptions. No `/opsx:apply` — just build it.

File any discovered issues during work:
```bash
bd create "Found: <issue>" -t bug -p 2 --discovered-from <current-id> -d "## Description
<what was found>

## Context
- Discovered while working on <current task>
- <relevant details>"
```

### 6. Close

```bash
# Delete planning artifacts (git history preserves them)
rm -rf openspec/changes/<name>

# Close the bead
bd close <id> --reason "Completed"

# Sync and push
bd sync && git push
```

---

## Commit Discipline

### Every Commit Needs a Bead

No commit without an associated bead issue. No exceptions (except `bd sync` commits which are automated).

```bash
# Before you commit, ensure:
# 1. A bead exists for this work
# 2. The bead is in_progress
# 3. You reference the TASK bead ID (not epic ID)

git commit -m "feat: add mobile nav component [bd-<task-id>]"
```

### Commit Message Format

```
<type>: <description> [bd-<task-id>]
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`

### What This Means in Practice

- **No drive-by commits** — Even small fixes get a bead first
- **No orphan commits** — Every change traces to a decision/request
- **No wave commits** — Never bundle multiple tasks into one commit
- **No epic IDs in commits** — Always use the task bead ID

---

## Parallel Agent Work Rules

When launching multiple agents to work concurrently:

### Pre-Launch Checklist

1. **Create ALL beads FIRST** — Every task gets a `bd create` BEFORE any agent launches
2. **Map files to tasks** — Ensure each agent has a non-overlapping set of files
3. **Identify dependencies** — If Task B imports from Task A's output, they MUST be serialized

### Per-Agent Rules

- Each agent knows its bead ID and file scope
- Each agent commits ONLY its own files
- Each commit references the task bead ID (never epic ID)

### Commit Order

Even if agents finish simultaneously, commit in dependency order:

```bash
# REQUIRED — per-task commit pattern
1. bd create "Task A" → project-abc
2. bd create "Task B" → project-def
3. bd create "Task C" → project-ghi
4. Launch agents A, B, C (each knows bead ID + file scope)
5. Agent A finishes → git add <A's files> && git commit -m "feat: ... [bd-project-abc]" → bd close abc
6. Agent B finishes → git add <B's files> && git commit -m "feat: ... [bd-project-def]" → bd close def
7. Agent C finishes → git add <C's files> && git commit -m "feat: ... [bd-project-ghi]" → bd close ghi
```

### Forbidden

```bash
# NEVER DO THIS — "wave commit" pattern
git add -A && git commit -m "feat: everything [bd-<epic-id>]"
```

---

## Git Branch Strategy

### When to Use Feature Branches

| Work Type | Branch? | Example |
|-----------|---------|---------|
| Epic / multi-task initiative | YES — `feature/<name>` | `feature/add-user-auth` |
| New feature spanning multiple files | YES — `feature/<name>` | `feature/dark-mode` |
| Architectural change | YES — `feature/<name>` | `feature/migrate-to-postgres` |
| Work with OpenSpec planning | YES — `feature/<name>` | `feature/billing-improvements` |
| Single-commit bug fix | NO — direct to `main` | Fix typo, patch edge case |
| Documentation update | NO — direct to `main` | Update README |
| Config change | NO — direct to `main` | Update eslint rule |

### Planning on Main, Implementation on Feature Branch

```
main:     [plan artifacts] ─────────────────────── [merge PR] → [delete artifacts]
                            \                      /
feature:                     └── [implement] ── [PR] ──┘
```

**Why plan on main?** Planning is visible to everyone before work starts. Artifacts serve as documentation during review. Git history preserves them after deletion.

### Complete Feature Branch Workflow

```bash
# ═══════════════════════════════════════════════════════
# PHASE 1: Plan on main
# ═══════════════════════════════════════════════════════
git checkout main && git pull

# Create planning artifacts
/opsx:ff <change-name>

# Create epic bead
bd create "<change-name>" -t epic -p 1 -l "openspec:<change-name>" -d "..."

# Push planning to main
bd sync
git add -A
git commit -m "plan: <change-name> [bd-<epic-id>]"
git push

# ═══════════════════════════════════════════════════════
# PHASE 2: Implement on feature branch
# ═══════════════════════════════════════════════════════
git checkout -b feature/<change-name>

# Create task beads from tasks.md
bd create "<task 1>" -t task -p 2 -l "openspec:<change-name>" -d "..."
bd create "<task 2>" -t task -p 2 -l "openspec:<change-name>" -d "..."

# Implement each task
bd update <task-1-id> --status in_progress
# ... write code ...
bd sync && git add <files> && git commit -m "feat: <desc> [bd-<task-1-id>]"
bd close <task-1-id> --reason "Completed"

# Repeat for each task...

# ═══════════════════════════════════════════════════════
# PHASE 3: Prepare for PR
# ═══════════════════════════════════════════════════════
# Delete planning artifacts
rm -rf openspec/changes/<change-name>
bd sync && git add -A && git commit -m "chore: cleanup planning artifacts [bd-<epic-id>]"
git push -u origin feature/<change-name>

# Close epic
bd close <epic-id> --reason "Completed"

# Create PR
gh pr create --title "feat: <change-name>" --body "..."

# ═══════════════════════════════════════════════════════
# PHASE 4: After merge
# ═══════════════════════════════════════════════════════
git checkout main && git pull
git branch -d feature/<change-name>
```

---

## Label Conventions

| Label | Purpose |
|-------|---------|
| `openspec:<change-name>` | Links issue to OpenSpec change |
| `spec:<spec-name>` | Links to specific spec file |
| `discovered` | Issue found during other work |
| `tech-debt` | Technical debt items |
| `blocked-external` | Blocked by external dependency |

---

## Landing the Plane (Session Completion)

**When ending a work session, ALL steps below are MANDATORY. Work is NOT complete until `git push` succeeds.**

### 1. File Issues for Remaining Work

```bash
bd create "TODO: <description>" -t task -p 2 -d "## Requirements
- <what needs doing>
## Context
- <relevant details>"
```

### 2. Run Quality Gates (if code changed)

```bash
npm test && npm run lint && npm run build
```

File P0 issues if anything is broken.

### 3. Clean Up OpenSpec Artifacts

Delete any completed change directories: `rm -rf openspec/changes/<name>`

### 4. Update All Tracking

```bash
bd close <id> --reason "Completed"                     # Finished work
bd update <id> --status in_progress                    # Partially done (WIP)
bd update <id> --add-note "Session end: <context>"     # Context for next session
```

### 5. Sync and Push (MANDATORY)

```bash
bd sync
git add -A
git commit -m "chore: session end - <summary> [bd-<id>]"
git push
git status  # MUST show "up to date with origin"
```

### 6. Clean Up

```bash
git stash clear                                  # If appropriate
git branch -d feature/<name>                     # Merged branches
git fetch --prune                                # Stale remote refs
```

### 7. Hand Off Context

```
## Next Session Context
- Current epic: <id and name>
- Ready work: `bd ready` shows N issues
- Blocked items: <any blockers>
- Notes: <important context>
```

### Critical Rules

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing — that leaves work stranded locally
- NEVER say "ready to push when you are" — YOU must push
- ALWAYS run `bd sync` before committing

---

## OpenSpec Commands NOT Used

The following commands exist but are intentionally disabled in this workflow. Beads handles execution tracking, and git history preserves artifacts:

- `/opsx:apply` — Implement directly from artifacts instead
- `/opsx:verify` — Use quality gates (tests, lint, build) instead
- `/opsx:archive` — Delete change directories directly (`rm -rf`)
- `/opsx:sync` — Edit specs manually when behavior changes
- `/opsx:continue` — Use `/opsx:ff` to generate everything at once
- `/opsx:bulk-archive` — Not needed without archive step
- `/opsx:onboard` — This document IS the onboarding

---

## Beads Maintenance

### Regular Health Checks

```bash
bd doctor              # Health check
bd doctor --fix        # Auto-fix issues
```

### Compacting Old Issues

```bash
bd compact --analyze --json    # Find compaction candidates (closed 30+ days)
bd compact --apply --id <id> --summary summary.txt   # Compact with summary
```

### Context Rot Prevention

If the agent forgets about Beads mid-session:
- **Kill sessions earlier** — One task per session for complex work
- **Explicit reminders** — "Check `bd ready`" at session start
- **Granular tasks** — Anything over ~2 minutes = its own bead
