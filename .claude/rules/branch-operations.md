# Branch Operations

Git branches enable parallel development by allowing multiple developers to work on the same repository with isolated changes.

## Mandatory Epic Branch Isolation Rule

> **CRITICAL**: Every epic MUST have its own dedicated branch created from the main branch. No epic work should ever be done directly on the main branch.

### Why This Is Required

1. **Development Isolation** - Changes are contained until ready for merge
2. **Easy Rollback** - Entire epic can be discarded without affecting main
3. **Parallel Development** - Multiple epics can progress simultaneously
4. **Code Review** - All epic changes go through PR review before merge
5. **Clean History** - Main branch remains stable and deployable

### Verification Before Starting Work

Before any epic work begins, verify:

1. [ ] Epic branch exists: `git branch -a | grep epic/{name}`
2. [ ] Branch was created from latest main
3. [ ] Branch is pushed to remote with upstream tracking

## Creating Branches

Always create branches from a clean main branch:
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create branch for epic
git checkout -b epic/{name}
git push -u origin epic/{name}
```

The branch will be created and pushed to origin with upstream tracking.

## Working in Branches

### Agent Commits
- Agents commit directly to the branch
- Use small, focused commits
- Commit message format: `Issue #{number}: {description}`
- Example: `Issue #1234: Add user authentication schema`

### File Operations
```bash
# Working directory is the current directory
# (no need to change directories like with worktrees)

# Normal git operations work
git add {files}
git commit -m "Issue #{number}: {change}"

# View branch status
git status
git log --oneline -5
```

## Parallel Work in Same Branch

Multiple agents can work in the same branch if they coordinate file access:
```bash
# Before modifying shared files:
# 1. Pull latest changes
git pull origin epic/{name}

# 2. Check git status for conflicts
git status

# 3. Communicate with team about which files you're modifying

# Agent A works on API
git add src/api/*
git commit -m "Issue #1234: Add user endpoints"

# Agent B works on UI (after pulling A's changes)
git pull origin epic/{name}  # Get latest changes first
git add src/ui/*
git commit -m "Issue #1235: Add dashboard component"
```

See `agent-coordination.md` for detailed multi-agent coordination protocols.

## Merging Branches

When epic is complete, merge back to main:
```bash
# From main repository
git checkout main
git pull origin main

# Merge epic branch
git merge epic/{name}

# If successful, clean up
git branch -d epic/{name}
git push origin --delete epic/{name}
```

## Handling Conflicts

If merge conflicts occur:
```bash
# Conflicts will be shown
git status

# Human resolves conflicts
# Then continue merge
git add {resolved-files}
git commit
```

## Branch Management

### List Active Branches
```bash
git branch -a
```

### Remove Stale Branch
```bash
# Delete local branch
git branch -d epic/{name}

# Delete remote branch
git push origin --delete epic/{name}
```

### Check Branch Status
```bash
# Current branch info
git branch -v

# Compare with main
git log --oneline main..epic/{name}
```

## Guidelines

**Do:**
- One branch per epic (not per issue)
- Always start from updated main
- Commit frequently (small commits are easier to merge)
- Pull before push (avoid conflicts)
- Use descriptive branches: `epic/feature-name`

**Don't:**
- Work on epic tasks directly in main branch
- Create epic branches from other branches (only from main)
- Merge incomplete epics into main
- Force push to main branch
- Use `--force` flags unless explicitly required

## Common Issues

### Branch Already Exists
```bash
# Delete old branch first
git branch -D epic/{name}
git push origin --delete epic/{name}
# Then create new one
```

### Cannot Push Branch
```bash
# Check if branch exists remotely
git ls-remote origin epic/{name}

# Push with upstream
git push -u origin epic/{name}
```

### Merge Conflicts During Pull
```bash
# Stash changes if needed
git stash

# Pull and rebase
git pull --rebase origin epic/{name}

# Restore changes
git stash pop
```
