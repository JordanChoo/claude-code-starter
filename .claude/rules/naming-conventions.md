# Naming Conventions

Standard naming conventions for all PM artifacts.

## Feature Names

Used for PRDs, Epics, and derived artifacts.

**Format**: kebab-case
- Lowercase letters, numbers, and hyphens only
- Must start with a letter
- No spaces or special characters

**Examples**: `user-auth`, `payment-v2`, `notification-system`

**Invalid**: `UserAuth`, `user_auth`, `user auth`, `123-feature`

## File Structure

| Artifact | Location | Example |
|----------|----------|---------|
| PRD | `.claude/prds/{feature-name}.md` | `.claude/prds/user-auth.md` |
| Epic directory | `.claude/epics/{feature-name}/` | `.claude/epics/user-auth/` |
| Epic file | `.claude/epics/{feature-name}/epic.md` | `.claude/epics/user-auth/epic.md` |
| Task (unsynced) | `.claude/epics/{feature-name}/{task-name}.md` | `.claude/epics/user-auth/setup-database.md` |
| Task (synced) | `.claude/epics/{feature-name}/{issue-number}-{task-name}.md` | `.claude/epics/user-auth/42-setup-database.md` |
| Analysis | `.claude/epics/{feature-name}/{issue-number}-analysis.md` | `.claude/epics/user-auth/42-analysis.md` |
| GitHub mapping | `.claude/epics/{feature-name}/github-mapping.md` | `.claude/epics/user-auth/github-mapping.md` |

## Task File Naming

### Before GitHub Sync

Tasks are created with descriptive kebab-case names:
- `setup-database.md`
- `create-api-endpoints.md`
- `add-authentication.md`

This allows easy identification of task content without opening the file.

### After GitHub Sync

Tasks are renamed to include the GitHub issue number as a prefix:
- `42-setup-database.md`
- `43-create-api-endpoints.md`
- `44-add-authentication.md`

**Benefits**:
- Direct link between local file and GitHub issue
- Easy to find: issue #42 → `42-*.md`
- Clear sync status: no number prefix = not yet synced
- Preserves descriptive name for readability

### Task Name Guidelines

- Use kebab-case (lowercase with hyphens)
- Keep names concise but descriptive (3-5 words)
- Start with a verb when possible: `setup-`, `create-`, `add-`, `fix-`, `update-`
- Avoid generic names: prefer `setup-user-database` over `database`

**Good examples**:
- `setup-database-schema`
- `create-login-api`
- `add-password-validation`
- `fix-session-timeout`

**Avoid**:
- `task1`, `task-001`
- `database`, `api`
- `Setup_Database_Schema`
- `setupDatabaseSchema`

## Commit Messages

**Format**: `Issue #{number}: {description}`

**Examples**:
- `Issue #42: Add user authentication schema`
- `Issue #43: Create login API endpoint`
- `Issue #44: Fix password validation bug`

## Branch Naming

**Format**: `epic/{feature-name}`

**Examples**:
- `epic/user-auth`
- `epic/payment-v2`
- `epic/notification-system`

## Labels

### Epic Labels
- `epic` - Marks issue as an epic
- `epic:{feature-name}` - Links to specific epic

### Task Labels
- `task` - Marks issue as a task
- `epic:{feature-name}` - Links task to its parent epic
- `in-progress` - Task is being worked on

## Finding Task Files

### By Issue Number (Synced Tasks)
```bash
# Find task file for issue #42
ls .claude/epics/*/42-*.md
```

### By Task Name (Unsynced Tasks)
```bash
# Find unsynced tasks (no number prefix)
ls .claude/epics/*/*.md | grep -v '/[0-9]' | grep -v epic.md
```

### By GitHub URL in Frontmatter (Legacy)
```bash
# Find task by GitHub URL (for older naming convention)
grep -l "github:.*issues/42" .claude/epics/*/*.md
```
