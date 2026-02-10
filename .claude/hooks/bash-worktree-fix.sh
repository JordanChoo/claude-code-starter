#!/usr/bin/env bash
#
# bash-worktree-fix.sh — Claude Code pre-tool-use hook
#
# Detects when running inside a git worktree and rewrites Bash commands
# to execute in the worktree root, preventing commands from accidentally
# running in the main repository's working directory.
#
# Configuration (in .claude/settings.json):
#   "hooks": {
#     "pre-tool-use": {
#       "Bash": {
#         "enabled": true,
#         "script": ".claude/hooks/bash-worktree-fix.sh",
#         "apply_to_subagents": true
#       }
#     }
#   }

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)

CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Nothing to do if either field is missing
if [[ -z "$CWD" || -z "$COMMAND" ]]; then
  exit 0
fi

# Detect git worktree: .git is a *file* (not a directory) containing
# "gitdir: <path>" when inside a worktree.
GIT_FILE="$CWD/.git"
if [[ ! -f "$GIT_FILE" ]]; then
  # Not a worktree — allow command unchanged
  exit 0
fi

# Read the worktree root from git
WORKTREE_ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null || true)

if [[ -z "$WORKTREE_ROOT" ]]; then
  exit 0
fi

# If cwd already matches the worktree root, nothing to fix
if [[ "$CWD" == "$WORKTREE_ROOT" ]]; then
  exit 0
fi

# Rewrite the command to run inside the worktree root
ESCAPED_ROOT=$(echo "$WORKTREE_ROOT" | jq -Rs '.[:-1]')

jq -n \
  --argjson root "$ESCAPED_ROOT" \
  --arg cmd "$COMMAND" \
  '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: ("Adjusted working directory to worktree root: " + $root),
      updatedInput: {
        command: ("cd " + $root + " && " + $cmd)
      }
    }
  }'
