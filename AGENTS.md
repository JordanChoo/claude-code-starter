# Agent Instructions

Run `bd prime` for workflow context, or install hooks (`bd hooks install`) for auto-injection.

---

## Agent Warnings

### Do NOT Use `bd edit`

**WARNING:** `bd edit` opens an interactive editor (`$EDITOR`) which Claude Code cannot use. It will hang indefinitely.

Use `bd update` with flags instead:
```bash
bd update <id> --title "new title"
bd update <id> --description "new description"
bd update <id> --design "design notes"
bd update <id> --notes "additional notes"
bd update <id> --acceptance "acceptance criteria"
bd update <id> --status in_progress
bd update <id> --add-note "Session end: <context>"
```

### Non-Interactive Shell Commands

Some shell environments alias `cp`, `mv`, and `rm` to their `-i` (interactive) variants,
which causes commands to hang waiting for confirmation. **Use force flags specifically to
bypass these interactive alias prompts**, not as a blanket rule for all file operations:

```bash
cp -f source dest           # Avoids hanging if cp is aliased to cp -i
mv -f source dest           # Avoids hanging if mv is aliased to mv -i
rm -f file                  # Avoids hanging if rm is aliased to rm -i
rm -rf directory            # Avoids hanging if rm is aliased to rm -i
cp -rf source dest          # Avoids hanging if cp is aliased to cp -i
```

> **WARNING:** Force flags do NOT override DCG protection. DCG may still block destructive
> commands on protected paths (e.g., `rm -rf ./src`) even with `-f`. This is intentional.
> See `.claude/rules/destructive-command-guard.md` for allowlisted exceptions.

Other commands that may prompt:
- `scp` — use `-o BatchMode=yes`
- `ssh` — use `-o BatchMode=yes`
- `apt-get` — use `-y` flag
- `brew` — use `HOMEBREW_NO_AUTO_UPDATE=1`

### Use `--json` for Structured Output

Always prefer `--json` flag when processing `bd` output programmatically:
```bash
bd ready --json
bd list --json
bd show <id> --json
bd stats --json
bd compact --analyze --json
```

---

## When to Use OpenSpec

Skip OpenSpec for work you can describe in a single bead description. Use OpenSpec when the work needs structured thinking — multiple capabilities, architectural decisions, or complex requirements.

| Situation | Action |
|-----------|--------|
| New feature/capability | `bd create` epic, then `/opsx:ff` to plan |
| Need to think through a problem | `/opsx:explore` |
| Need structured planning | `/opsx:ff <name>` or `/opsx:new <name>` |

---

## Priority Scale

Beads uses numeric priorities 0-4 (or P0-P4). Do NOT use "high"/"medium"/"low".

| Priority | Meaning | Use When |
|----------|---------|----------|
| P0 | Critical | Production down, data loss, security breach |
| P1 | High | Blocks other work, must fix this session |
| P2 | Medium | Standard work, default for most tasks |
| P3 | Low | Nice to have, do when convenient |
| P4 | Backlog | Someday/maybe, future consideration |

```bash
bd create "Fix auth bug" -t bug -p 0 -d "..."   # Critical
bd create "Add feature" -t task -p 2 -d "..."    # Standard
```

---

## Dependencies

Use `bd dep` to express blocking relationships between issues:

```bash
bd dep add <issue> <depends-on>     # issue depends on depends-on
bd blocked                          # Show all blocked issues
bd show <id>                        # See blocking/blocked-by for an issue
```

Example:
```bash
bd create "Implement API" -t task -p 2 -d "..."       # → bd-abc
bd create "Write API tests" -t task -p 2 -d "..."     # → bd-def
bd dep add bd-def bd-abc            # Tests depend on API implementation
```

---

## Sync and Debounce Mechanics

Beads auto-exports to JSONL with a **30-second debounce** after mutations. This means:
- Multiple changes within 30 seconds get batched into one JSONL flush
- Without `bd sync`, changes may sit in the debounce window when you end your session
- The user may think you pushed, but the JSONL is still dirty

**Always run `bd sync` at the end of your session.** It forces an immediate:
1. Export pending changes to JSONL (bypasses 30s debounce)
2. Commit to git
3. Pull from remote
4. Import any remote updates
5. Push to remote

### Merge Conflicts in `.beads/issues.jsonl`

Hash-based IDs make conflicts rare, but if they occur:

```bash
# WARNING: This discards ALL local beads changes in favor of remote.
# Only use when you are certain the remote version is correct.
git checkout --theirs .beads/issues.jsonl   # Accept remote version
bd import -i .beads/issues.jsonl            # Re-import to rebuild DB
```

Or for manual resolution: merge the file, then run `bd import`.

### Test Database Isolation

**Never pollute the production database with test issues.** Use `BEADS_DB` for manual testing:

```bash
BEADS_DB=/tmp/test.db bd create "Test issue" -p 1
```

---

## Daemon Management

The Beads daemon handles RPC communication and auto-sync. If you encounter daemon issues:

```bash
bd daemons list               # Show running daemons
bd daemons health             # Check daemon health
bd daemons killall            # Clean up stale sockets/processes
```

---

## Complete Workflow

### 1. Orient

```bash
bd ready --json      # See unblocked, prioritized work
bd stats --json      # Project overview (open/closed/blocked counts)
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
| Design (`--design`) | Architecture context, relevant design decisions | Why we're doing it this way |
| Notes (`--notes`) | Spec references with paths, line numbers | Where to find more context |

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

# Commit cleanup and close issues
git add -A
git commit -m "chore: cleanup planning artifacts (bd-<epic-id>)"
bd close <id1> <id2> <id3> --reason "Completed"

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

git commit -m "feat: add mobile nav component (bd-<task-id>)"
```

### Commit Message Format

```
<type>: <description> (bd-<task-id>)
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`

**Use parentheses `(bd-xxx)`, not brackets.** This format enables `bd doctor` to detect orphaned issues by cross-referencing open issues against git history.

### What This Means in Practice

- **No drive-by commits** — Even small fixes get a bead first
- **No orphan commits** — Every change traces to a decision/request
- **No wave commits** — Never bundle multiple tasks into one commit
- **No epic IDs in commits** — Always use the task bead ID

---

## Parallel Agent Work Rules

When launching multiple Claude Code agents to work concurrently:

### Pre-Launch Checklist

1. **Create ALL beads FIRST** — Every task gets a `bd create` BEFORE any agent launches
2. **Map files to tasks** — Ensure each agent has a non-overlapping set of files
3. **Identify dependencies** — If Task B imports from Task A's output, they MUST be serialized. Use `bd dep add` to express this.

### Per-Agent Rules

- Each Claude Code agent knows its bead ID and file scope
- Each Claude Code agent commits ONLY its own files
- Each commit references the task bead ID (never epic ID)

### Commit Order

Even if agents finish simultaneously, commit in dependency order:

```bash
# REQUIRED — per-task commit pattern
1. bd create "Task A" → project-abc
2. bd create "Task B" → project-def
3. bd create "Task C" → project-ghi
4. Launch agents A, B, C (each knows bead ID + file scope)
5. Agent A finishes → git add <A's files> && git commit -m "feat: ... (bd-project-abc)" → bd close abc
6. Agent B finishes → git add <B's files> && git commit -m "feat: ... (bd-project-def)" → bd close def
7. Agent C finishes → git add <C's files> && git commit -m "feat: ... (bd-project-ghi)" → bd close ghi
```

### Forbidden

```bash
# NEVER DO THIS — "wave commit" pattern
git add -A && git commit -m "feat: everything (bd-<epic-id>)"
```

**Exceptions:** `git add -A` is acceptable ONLY for:
- Cleanup commits that delete planning artifacts after per-task commits are complete
- Session-end metadata commits where all code changes were already committed per-task

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
git commit -m "plan: <change-name> (bd-<epic-id>)"
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
bd sync && git add <files> && git commit -m "feat: <desc> (bd-<task-1-id>)"
bd close <task-1-id> --reason "Completed"

# Repeat for each task...

# ═══════════════════════════════════════════════════════
# PHASE 3: Prepare for PR
# ═══════════════════════════════════════════════════════
# Delete planning artifacts
rm -rf openspec/changes/<change-name>
bd sync && git add -A && git commit -m "chore: cleanup planning artifacts (bd-<epic-id>)"
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
bd close <id1> <id2> --reason "Completed"             # Finished work (batch close)
bd update <id> --status in_progress                    # Partially done (WIP)
bd update <id> --add-note "Session end: <context>"     # Context for next session
```

### 5. Sync and Push (MANDATORY)

```bash
bd sync
git add -A
git commit -m "chore: session end - <summary> (bd-<id>)"
git push
git status  # MUST show "up to date with origin"
```

### 6. Clean Up

```bash
git stash clear                                  # If appropriate
git branch -d feature/<name>                     # Merged branches
git remote prune origin                          # Stale remote refs
```

### 7. Hand Off Context

Provide a copy-pasteable prompt for the next session:

```
Continue work on bd-<id>: <issue title>. <Brief context about what's been done and what's next>.
```

Also include:
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
- If `git push` fails, resolve the issue and retry until it succeeds
- ALWAYS run `bd sync` before committing

---

## Checking GitHub Issues and PRs

Use `gh` CLI for GitHub operations, not browser tools:

```bash
gh issue list --limit 30       # List open issues
gh pr list --limit 30          # List open PRs
gh issue view <number>         # View specific issue
gh pr view <number>            # View specific PR
```

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
bd doctor --fix        # Auto-fix issues (gitignore, daemon, sync divergence)
bd stats --json        # Project statistics
```

### Compacting Old Issues

Compaction targets closed issues 30+ days old to keep the database lean:

```bash
bd compact --analyze --json    # Find compaction candidates
bd compact --apply --id <id> --summary summary.txt   # Compact with summary
```

### Context Rot Prevention

If Claude Code forgets about Beads mid-session:
- **Kill sessions earlier** — One task per session for complex work
- **Explicit reminders** — "Check `bd ready`" at session start
- **Granular tasks** — Anything over ~2 minutes = its own bead
