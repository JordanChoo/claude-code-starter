# Destructive Command Guard (DCG)

## Overview

This project requires [DCG](https://github.com/Dicklesworthstone/destructive_command_guard) as a Claude Code hook that intercepts and blocks destructive commands before execution. DCG protects against accidental data loss from commands like `git reset --hard`, `rm -rf ./src`, or `DROP TABLE`.

---

## Mandatory Requirement

> **STOP**: DCG must be installed and active before any Claude Code session. It runs as a pre-execution hook on all Bash commands.

---

## Installation

```bash
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/destructive_command_guard/master/install.sh?$(date +%s)" | bash -s -- --easy-mode
```

### Version Pinning (Recommended)

For reproducible installs, download and review the script first:

```bash
# Download, review, then install
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/destructive_command_guard/master/install.sh" -o /tmp/dcg-install.sh
less /tmp/dcg-install.sh  # Review the script
bash /tmp/dcg-install.sh --easy-mode
```

When a tagged release is available, prefer pinning to that version over `master`.

Verify installation:
```bash
dcg --version
```

---

## What DCG Blocks

### Git Operations
| Command | Why It's Blocked |
|---------|-----------------|
| `git reset --hard` | Destroys uncommitted work |
| `git push --force` / `-f` | Rewrites remote history |
| `git clean -f` | Permanently deletes untracked files |
| `git checkout -- <file>` | Discards file changes |
| `git branch -D` | Force-deletes without merge check |
| `git stash drop` / `clear` | Destroys stashed work |

### Filesystem Operations
| Command | Why It's Blocked |
|---------|-----------------|
| `rm -rf` on non-temp paths | Irreversible deletion |
| Inline destructive scripts | `python -c "os.remove(...)"`, `node -e "fs.unlinkSync(...)"` |

### Additional Packs (49+)
DCG supports modular security packs for databases, cloud providers, containers, Kubernetes, CI/CD, and more. View available packs:
```bash
dcg packs --verbose
```

---

## Configuration

Config location: `~/.config/dcg/config.toml`

### Recommended Packs for This Project

```toml
[packs]
enabled = [
    "core.filesystem",
    "core.git",
    "containers.docker",
]
```

### Allowlisting Commands

If DCG blocks a command you need to run:

```toml
[allowlist]
commands = ["git push --force-with-lease origin main"]
patterns = ["npm run build:.*"]
```

### Project-Specific Allowlist

The standard workflow requires deleting planning artifacts regularly. Add this to your allowlist:

```toml
[allowlist]
patterns = [
    "rm -rf openspec/changes/.*",    # Planning artifact cleanup (standard close workflow)
]
```

**Why this is safe:**
- `openspec/changes/` contains temporary planning artifacts only
- Git history preserves all deleted files
- This deletion is a required step in the standard close workflow (see AGENTS.md)

---

## When DCG Blocks a Command

1. **Read the reason** — DCG explains why the command was blocked
2. **Use `dcg explain`** to understand the rule:
   ```bash
   dcg explain "git reset --hard"
   ```
3. **Find a safer alternative** — DCG suggests non-destructive alternatives
4. **Allowlist only if necessary** — Add to config with justification

---

## Safe Operations (Always Allowed)

DCG allows standard development commands:
- `git status`, `git log`, `git diff`, `git add`, `git commit`, `git push`, `git pull`
- `git branch -d` (safe delete with merge verification)
- `git stash`, `git stash pop`, `git stash list`
- `git checkout -b <branch>` (new branch creation)
- `grep "rm -rf"` (pattern matching in data, not execution)

---

## Settings Permissions and DCG

`.claude/settings.local.json` permissions can undermine DCG protection:

| Permission | Risk |
|-----------|------|
| `Bash(bash:*)` | Allows arbitrary script execution, bypassing all other restrictions |
| `Bash(yes:*)` | Auto-confirms prompts that DCG relies on for user verification |
| `Bash(curl:*)` | Allows unrestricted network requests |

Periodically review your `.claude/settings.local.json` and remove overly broad permissions that are no longer needed.

---

## Quick Reference

```bash
# Check installation
dcg --version

# Understand why a command was blocked
dcg explain "<command>"

# View enabled security packs
dcg packs --verbose
```
