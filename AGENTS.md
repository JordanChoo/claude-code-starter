# Agent Instructions

Run `br prime` for workflow context. Use `bv --robot-triage` to find prioritized work.

---

## Agent Warnings

### Do NOT Use `br edit`

**WARNING:** `br edit` opens an interactive editor (`$EDITOR`) which Claude Code cannot use. It will hang indefinitely.

Use `br update` with flags instead:
```bash
br update <id> --title "new title"
br update <id> --description "new description"
br update <id> --design "design notes"
br update <id> --notes "additional notes"
br update <id> --acceptance "acceptance criteria"
br update <id> --status in_progress
br update <id> --add-note "Session end: <context>"
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

### Use `bv --robot-*` for Triage and `br --json` for Mutations

For querying, triage, and analysis, use `bv` robot commands (output JSON by default). See [Using bv as an AI sidecar](#using-bv-as-an-ai-sidecar) for the full command reference, output format, filtering, and usage patterns.

For mutations and detailed single-issue views, use `br` with `--json`:
```bash
br show <id> --json
br list --json
br compact --analyze --json
```

---

## When to Use OpenSpec

Skip OpenSpec for work you can describe in a single bead description. Use OpenSpec when the work needs structured thinking — multiple capabilities, architectural decisions, or complex requirements.

| Situation | Action |
|-----------|--------|
| New feature/capability | `br create` epic, then `/opsx:ff` to plan |
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
br create "Fix auth bug" -t bug -p 0 -d "..."   # Critical
br create "Add feature" -t task -p 2 -d "..."    # Standard
```

---

## Dependencies

Use `br dep` to express blocking relationships between issues:

```bash
br dep add <issue> <depends-on>     # issue depends on depends-on
bv --robot-alerts                   # Show blocked issues and blocking cascades
br show <id>                        # See blocking/blocked-by for an issue
```

Example:
```bash
br create "Implement API" -t task -p 2 -d "..."       # → br-abc
br create "Write API tests" -t task -p 2 -d "..."     # → br-def
br dep add br-def br-abc            # Tests depend on API implementation
```

---

## Sync Mechanics

**Note:** `br` is non-invasive and never executes git commands. After `br sync --flush-only`, you must manually run `git add .beads/ && git commit`.

**Always run `br sync --flush-only` at the end of your session.** It exports pending changes to JSONL. Then commit and push manually:

```bash
br sync --flush-only
git add .beads/
git commit -m "sync beads"
git push
```

### Merge Conflicts in `.beads/issues.jsonl`

Hash-based IDs make conflicts rare, but if they occur:

```bash
# WARNING: This discards ALL local beads changes in favor of remote.
# Only use when you are certain the remote version is correct.
git checkout --theirs .beads/issues.jsonl   # Accept remote version
br import -i .beads/issues.jsonl            # Re-import to rebuild DB
```

Or for manual resolution: merge the file, then run `br import`.

### Test Database Isolation

**Never pollute the production database with test issues.** Use `BEADS_DB` for manual testing:

```bash
BEADS_DB=/tmp/test.db br create "Test issue" -p 1
```

---

### Using bv as an AI sidecar

bv is a graph-aware triage engine for Beads projects (.beads/beads.jsonl). Instead of parsing JSONL or hallucinating graph traversal, use robot flags for deterministic, dependency-aware outputs with precomputed metrics (PageRank, betweenness, critical path, cycles, HITS, eigenvector, k-core).

**Scope boundary:** bv handles *what to work on* (triage, priority, planning). For agent-to-agent coordination (messaging, work claiming, file reservations), use [MCP Agent Mail](https://github.com/Dicklesworthstone/mcp_agent_mail).

**⚠️ CRITICAL: Use ONLY `--robot-*` flags. Bare `bv` launches an interactive TUI that blocks your session.**

#### The Workflow: Start With Triage

**`bv --robot-triage` is your single entry point.** It returns everything you need in one call:
- `quick_ref`: at-a-glance counts + top 3 picks
- `recommendations`: ranked actionable items with scores, reasons, unblock info
- `quick_wins`: low-effort high-impact items
- `blockers_to_clear`: items that unblock the most downstream work
- `project_health`: status/type/priority distributions, graph metrics
- `commands`: copy-paste shell commands for next steps

```bash
bv --robot-triage        # THE MEGA-COMMAND: start here
bv --robot-next          # Minimal: just the single top pick + claim command

# Token-optimized output (TOON) for lower LLM context usage:
bv --robot-triage --format toon
export BV_OUTPUT_FORMAT=toon
bv --robot-next
```

#### Other Commands

**Planning:**
| Command | Returns |
|---------|---------|
| `--robot-plan` | Parallel execution tracks with `unblocks` lists |
| `--robot-priority` | Priority misalignment detection with confidence |

**Graph Analysis:**
| Command | Returns |
|---------|---------|
| `--robot-insights` | Full metrics: PageRank, betweenness, HITS (hubs/authorities), eigenvector, critical path, cycles, k-core, articulation points, slack |
| `--robot-label-health` | Per-label health: `health_level` (healthy\|warning\|critical), `velocity_score`, `staleness`, `blocked_count` |
| `--robot-label-flow` | Cross-label dependency: `flow_matrix`, `dependencies`, `bottleneck_labels` |
| `--robot-label-attention [--attention-limit=N]` | Attention-ranked labels by: (pagerank × staleness × block_impact) / velocity |

**History & Change Tracking:**
| Command | Returns |
|---------|---------|
| `--robot-history` | Bead-to-commit correlations: `stats`, `histories` (per-bead events/commits/milestones), `commit_index` |
| `--robot-diff --diff-since <ref>` | Changes since ref: new/closed/modified issues, cycles introduced/resolved |

**Other Commands:**
| Command | Returns |
|---------|---------|
| `--robot-burndown <sprint>` | Sprint burndown, scope changes, at-risk items |
| `--robot-forecast <id\|all>` | ETA predictions with dependency-aware scheduling |
| `--robot-alerts` | Stale issues, blocking cascades, priority mismatches |
| `--robot-suggest` | Hygiene: duplicates, missing deps, label suggestions, cycle breaks |
| `--robot-graph [--graph-format=json\|dot\|mermaid]` | Dependency graph export |
| `--export-graph <file.html>` | Self-contained interactive HTML visualization |

#### Scoping & Filtering

```bash
bv --robot-plan --label backend              # Scope to label's subgraph
bv --robot-insights --as-of HEAD~30          # Historical point-in-time
bv --recipe actionable --robot-plan          # Pre-filter: ready to work (no blockers)
bv --recipe high-impact --robot-triage       # Pre-filter: top PageRank scores
bv --robot-triage --robot-triage-by-track    # Group by parallel work streams
bv --robot-triage --robot-triage-by-label    # Group by domain
```

#### Understanding Robot Output

**All robot JSON includes:**
- `data_hash` — Fingerprint of source beads.jsonl (verify consistency across calls)
- `status` — Per-metric state: `computed|approx|timeout|skipped` + elapsed ms
- `as_of` / `as_of_commit` — Present when using `--as-of`; contains ref and resolved SHA

**Two-phase analysis:**
- **Phase 1 (instant):** degree, topo sort, density — always available immediately
- **Phase 2 (async, 500ms timeout):** PageRank, betweenness, HITS, eigenvector, cycles — check `status` flags

**For large graphs (>500 nodes):** Some metrics may be approximated or skipped. Always check `status`.

#### jq Quick Reference

```bash
bv --robot-triage | jq '.quick_ref'                        # At-a-glance summary
bv --robot-triage | jq '.recommendations[0]'               # Top recommendation
bv --robot-plan | jq '.plan.summary.highest_impact'        # Best unblock target
bv --robot-insights | jq '.status'                         # Check metric readiness
bv --robot-insights | jq '.Cycles'                         # Circular deps (must fix!)
bv --robot-label-health | jq '.results.labels[] | select(.health_level == "critical")'
```

**Performance:** Phase 1 instant, Phase 2 async (500ms timeout). Prefer `--robot-plan` over `--robot-insights` when speed matters. Results cached by data hash.

Use bv instead of parsing beads.jsonl—it computes PageRank, critical paths, cycles, and parallel tracks deterministically.

---

## Complete Workflow

### 1. Orient

```bash
bv --robot-triage      # Prioritized work, recommendations, project health
bv --robot-next        # Quick: single top pick + claim command
```

Select the top recommendation OR continue in-progress work.

### 2. Pick Work

```bash
br update <id> --status in_progress   # Claim it
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
br create "<change-name>" -t epic -p 1 -l "openspec:<change-name>" -d "## Overview
<change description>

## Reference
- openspec/changes/<change-name>/proposal.md
- openspec/changes/<change-name>/design.md

## Acceptance Criteria
- <how to verify completion>"

# For each task in tasks.md, create a child issue with FULL context
br create "<task description>" -t task -p 2 -l "openspec:<change-name>" -d "## Spec Reference
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

**Issues must be self-contained.** The test: could someone implement this issue correctly with ONLY the `br` description and access to the codebase? If not, add more context.

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
br create "Found: <issue>" -t bug -p 2 --discovered-from <current-id> -d "## Description
<what was found>

## Context
- Discovered while working on <current task>
- <relevant details>"
```

### 6. Close

```bash
# Delete planning artifacts (git history preserves them)
rm -rf openspec/changes/<name>

# Commit artifact cleanup
git add -A
git commit -m "chore: cleanup planning artifacts (br-<epic-id>)"

# Close beads issues
br close <id1> <id2> <id3> --reason "Completed"
```

Then follow the [canonical sync sequence](#sync-mechanics) to flush beads changes, commit, and push.

**If ending your session**, follow the full [Landing the Plane](#landing-the-plane-session-completion) checklist — it includes syncing plus quality gates, context hand-off, and cleanup steps.

---

## Commit Discipline

### Every Commit Needs a Bead

No commit without an associated bead issue. No exceptions.

```bash
# Before you commit, ensure:
# 1. A bead exists for this work
# 2. The bead is in_progress
# 3. You reference the TASK bead ID (not epic ID)

git commit -m "feat: add mobile nav component (br-<task-id>)"
```

### Commit Message Format

```
<type>: <description> (br-<task-id>)
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`

**Use parentheses `(br-xxx)`, not brackets.** This format enables `br doctor` to detect orphaned issues by cross-referencing open issues against git history.

### What This Means in Practice

- **No drive-by commits** — Even small fixes get a bead first
- **No orphan commits** — Every change traces to a decision/request
- **No wave commits** — Never bundle multiple tasks into one commit
- **No epic IDs in commits** — Always use the task bead ID

---

## Parallel Agent Work Rules

When launching multiple Claude Code agents to work concurrently:

### Pre-Launch Checklist

1. **Create ALL beads FIRST** — Every task gets a `br create` BEFORE any agent launches
2. **Map files to tasks** — Ensure each agent has a non-overlapping set of files
3. **Identify dependencies** — If Task B imports from Task A's output, they MUST be serialized. Use `br dep add` to express this.

### Per-Agent Rules

- Each Claude Code agent knows its bead ID and file scope
- Each Claude Code agent commits ONLY its own files
- Each commit references the task bead ID (never epic ID)

### Commit Order

Even if agents finish simultaneously, commit in dependency order:

```bash
# REQUIRED — per-task commit pattern
1. br create "Task A" → project-abc
2. br create "Task B" → project-def
3. br create "Task C" → project-ghi
4. Launch agents A, B, C (each knows bead ID + file scope)
5. Agent A finishes → git add <A's files> && git commit -m "feat: ... (br-project-abc)" → br close abc
6. Agent B finishes → git add <B's files> && git commit -m "feat: ... (br-project-def)" → br close def
7. Agent C finishes → git add <C's files> && git commit -m "feat: ... (br-project-ghi)" → br close ghi
```

### Forbidden

**No wave commits** — each agent commits only its own task's files with the task bead ID. See [Commit Discipline](#commit-discipline) for the full rule and rationale.

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
br create "<change-name>" -t epic -p 1 -l "openspec:<change-name>" -d "..."

# Sync and push planning to main
br sync --flush-only
git add -A
git commit -m "plan: <change-name> (br-<epic-id>)"
git push

# ═══════════════════════════════════════════════════════
# PHASE 2: Implement on feature branch
# ═══════════════════════════════════════════════════════
git checkout -b feature/<change-name>

# Create task beads from tasks.md
br create "<task 1>" -t task -p 2 -l "openspec:<change-name>" -d "..."
br create "<task 2>" -t task -p 2 -l "openspec:<change-name>" -d "..."

# Implement each task
br update <task-1-id> --status in_progress
# ... write code ...
br sync --flush-only && git add .beads/ <files> && git commit -m "feat: <desc> (br-<task-1-id>)"
br close <task-1-id> --reason "Completed"

# Repeat for each task...

# ═══════════════════════════════════════════════════════
# PHASE 3: Prepare for PR
# ═══════════════════════════════════════════════════════
# Delete planning artifacts
rm -rf openspec/changes/<change-name>
br sync --flush-only && git add -A && git commit -m "chore: cleanup planning artifacts (br-<epic-id>)"
git push -u origin feature/<change-name>

# Close epic
br close <epic-id> --reason "Completed"

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
br create "TODO: <description>" -t task -p 2 -d "## Requirements
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
br close <id1> <id2> --reason "Completed"             # Finished work (batch close)
br update <id> --status in_progress                    # Partially done (WIP)
br update <id> --add-note "Session end: <context>"     # Context for next session
```

### 5. Agent Mail Sign-Off

```bash
# Release all file reservations
release_file_reservations(project_key, agent_name)

# Send sign-off message on your work thread
send_message(..., thread_id="claude-<bead-id>",
  subject="[claude-<id>] Signing off",
  body_md="Session complete. File reservations released.")
```

### 6. Sync and Push (MANDATORY)

```bash
br sync --flush-only
git add -A
git commit -m "chore: session end - <summary> (br-<id>)"
git push
git status  # MUST show "up to date with origin"
```

### 7. Clean Up

```bash
git stash clear                                  # If appropriate
git branch -d feature/<name>                     # Merged branches
git remote prune origin                          # Stale remote refs
```

### 8. Hand Off Context

Provide a copy-pasteable prompt for the next session:

```
Continue work on br-<id>: <issue title>. <Brief context about what's been done and what's next>.
```

Also include:
```
## Next Session Context
- Current epic: <id and name>
- Ready work: `bv --robot-triage` for prioritized recommendations
- Blocked items: <any blockers>
- Notes: <important context>
```

### Critical Rules

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing — that leaves work stranded locally
- NEVER say "ready to push when you are" — YOU must push
- If `git push` fails, resolve the issue and retry until it succeeds
- ALWAYS run `br sync --flush-only` before committing, then `git add .beads/`

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
br doctor              # Health check
br doctor --fix        # Auto-fix issues (gitignore, sync divergence)
bv --robot-triage      # Project health, status distributions, graph metrics
```

### Compacting Old Issues

Compaction targets closed issues 30+ days old to keep the database lean:

```bash
br compact --analyze --json    # Find compaction candidates
br compact --apply --id <id> --summary summary.txt   # Compact with summary
```

### Context Rot Prevention

If Claude Code forgets about Beads mid-session:
- **Kill sessions earlier** — One task per session for complex work
- **Explicit reminders** — "Run `bv --robot-triage`" at session start
- **Granular tasks** — Anything over ~2 minutes = its own bead

---

## MCP Agent Mail: coordination for multi-agent workflows

### What it is

- A mail-like layer that lets coding agents coordinate asynchronously via MCP tools and resources.
- Provides identities, inbox/outbox, searchable threads, and advisory file reservations, with human-auditable artifacts in Git.

### Why it's useful

- Prevents agents from stepping on each other with explicit file reservations (leases) for files/globs.
- Keeps communication out of your token budget by storing messages in a per-project archive.
- Offers quick reads (`resource://inbox/...`, `resource://thread/...`) and macros that bundle common flows.

### How to use effectively

**1) Same repository**

- Register an identity: call `ensure_project`, then `register_agent` using this repo's absolute path as `project_key`.
- Reserve files before you edit: `file_reservation_paths(project_key, agent_name, ["src/**"], ttl_seconds=3600, exclusive=true)` to signal intent and avoid conflict.
- Communicate with threads: use `send_message(..., thread_id="FEAT-123")`; check inbox with `fetch_inbox` and acknowledge with `acknowledge_message`.
- Read fast: `resource://inbox/{Agent}?project=<abs-path>&limit=20` or `resource://thread/{id}?project=<abs-path>&include_bodies=true`.
- Tip: set `AGENT_NAME` in your environment so the pre-commit guard can block commits that conflict with others' active exclusive file reservations.

**2) Across different repos in one project (e.g., Next.js frontend + FastAPI backend)**

- Option A (single project bus): register both sides under the same `project_key` (shared key/path). Keep reservation patterns specific (e.g., `frontend/**` vs `backend/**`).
- Option B (separate projects): each repo has its own `project_key`; use `macro_contact_handshake` or `request_contact`/`respond_contact` to link agents, then message directly. Keep a shared `thread_id` (e.g., ticket key) across repos for clean summaries/audits.

### Macros vs granular tools

- Prefer macros when you want speed or are on a smaller model: `macro_start_session`, `macro_prepare_thread`, `macro_file_reservation_cycle`, `macro_contact_handshake`.
- Use granular tools when you need control: `register_agent`, `file_reservation_paths`, `send_message`, `fetch_inbox`, `acknowledge_message`.

### Common pitfalls

- "from_agent not registered": always `register_agent` in the correct `project_key` first.
- "FILE_RESERVATION_CONFLICT": adjust patterns, wait for expiry, or use a non-exclusive reservation when appropriate.
- Auth errors: if JWT+JWKS is enabled, include a bearer token with a `kid` that matches server JWKS; static bearer is used only when JWT is disabled.

### Conflict Resolution Protocol (MANDATORY)

> **STOP**: When `macro_start_session` or `file_reservation_paths` returns **any** items in `conflicts`, you MUST follow this protocol before proceeding. Do NOT dismiss conflicts.

#### 1. STOP — Do NOT proceed with any file edits

No work until conflicts are resolved. Advisory reservations exist to be respected.

#### 2. Investigate the conflicting agent

```
whois(project_key, agent_name, include_recent_commits=true)
```

Check their `last_active_ts`, `inception_ts`, and `task_description`.

#### 3. Determine if the agent is stale or active

| Signal | Meaning | Action |
|--------|---------|--------|
| `last_active_ts == inception_ts` AND no messages on bead thread | Dead session — registered but never worked | Force-release and proceed (step 4) |
| `last_active_ts` recent AND messages exist on thread | **Active agent** | Coordinate or wait (step 5) |
| `expires_ts` already in the past | Expired reservation | Safe to proceed — no action needed |

#### 4. Force-release stale reservations

If the agent is confirmed stale:

```
force_release_file_reservation(project_key, your_agent_name, reservation_id,
  note="Agent <name> stale: last_active == inception, no thread messages")
```

Document the release in the Agent Mail thread:

```
send_message(..., thread_id="claude-<bead-id>",
  subject="[claude-<id>] Force-released stale reservations from <agent>",
  body_md="Agent <name> was stale. Released their reservations to unblock work.")
```

#### 5. If the agent is active — DO NOT proceed

Send a coordination message and wait:

```
send_message(..., to=["<active-agent>"], thread_id="claude-<bead-id>",
  subject="[claude-<id>] Conflict: requesting file access",
  body_md="I need to work on <files>. Can you release or coordinate?",
  ack_required=true, importance="high")
```

If no response within a reasonable time, **escalate to the human operator** via `AskUserQuestion`. Never force-release an active agent's reservations.

#### 6. Verify bead ownership

Before claiming a bead as `in_progress`:

```bash
br show <id> --json
```

If the bead is already `in_progress`, search Agent Mail threads for the bead ID. Only claim it if the prior agent is confirmed stale (per step 3).

### Pre-commit Guard

Agent Mail provides a pre-commit guard that blocks commits touching files reserved by other agents. This adds hard enforcement at commit time.

**For projects using husky** (like this one), add the guard to `.husky/pre-commit`:

```bash
# .husky/pre-commit
npx lint-staged
# Agent Mail file reservation guard (requires AGENT_NAME env var)
# python -m mcp_agent_mail.hooks.precommit_guard "$PROJECT_KEY"
```

> **Note:** Set `AGENT_NAME` in your shell environment so the guard can identify the committing agent.

---

## Integrating with Beads (dependency-aware task planning)

Beads provides a lightweight, dependency-aware issue database and a CLI (`br`) for selecting "ready work," setting priorities, and tracking status. It complements MCP Agent Mail's messaging, audit trail, and file-reservation signals. Project: [steveyegge/beads](https://github.com/steveyegge/beads)

### Recommended conventions

- **Single source of truth**: Use **Beads** for task status/priority/dependencies; use **Agent Mail** for conversation, decisions, and attachments (audit).
- **Shared identifiers**: Use the Beads issue id (e.g., `br-123`) as the Mail `thread_id` and prefix message subjects with `[br-123]`.
- **Reservations**: When starting a `br-###` task, call `file_reservation_paths(...)` for the affected paths; include the issue id in the `reason` and release on completion.

### Typical flow (agents)

1. **Pick ready work** (Beads)
   - `br ready --json` → choose one item (highest priority, no blockers)
2. **Reserve edit surface** (Mail)
   - `file_reservation_paths(project_key, agent_name, ["src/**"], ttl_seconds=3600, exclusive=true, reason="br-123")`
3. **Announce start** (Mail)
   - `send_message(..., thread_id="br-123", subject="[br-123] Start: <short title>", ack_required=true)`
4. **Work and update**
   - Reply in-thread with progress and attach artifacts/images; keep the discussion in one thread per issue id
5. **Complete and release**
   - `br close br-123 --reason "Completed"` (Beads is status authority)
   - `release_file_reservations(project_key, agent_name, paths=["src/**"])`
   - Final Mail reply: `[br-123] Completed` with summary and links

### Mapping cheat-sheet

- **Mail `thread_id`** ↔ `br-###`
- **Mail subject**: `[br-###] …`
- **File reservation `reason`**: `br-###`
- **Commit messages (optional)**: include `br-###` for traceability

### Event mirroring (optional automation)

- On `br update --status blocked`, send a high-importance Mail message in thread `br-###` describing the blocker.
- On Mail "ACK overdue" for a critical decision, add a Beads label (e.g., `needs-ack`) or bump priority to surface it in `br ready`.

### Pitfalls to avoid

- Don't create or manage tasks in Mail; treat Beads as the single task queue.
- Always include `br-###` in message `thread_id` to avoid ID drift across tools.
