# Standard Patterns for Commands

This file defines common patterns that all PM skill commands (`/pm:*`) should follow to maintain consistency and simplicity. These patterns apply to slash commands, not bash commands.

## Core Principles

1. **Fail Fast** - Check critical prerequisites, then proceed
2. **Trust the System** - Don't over-validate things that rarely fail
3. **Clear Errors** - When something fails, say exactly what and how to fix it
4. **Minimal Output** - Show what matters, skip decoration

## Standard Validations

### Minimal Preflight
Only check what's absolutely necessary:
```markdown
## Quick Check
1. If command needs specific directory/file:
   - Check it exists: `test -f {file} || echo "❌ {file} not found"`
   - If missing, tell user exact command to fix it
2. If command needs GitHub:
   - Assume `gh` is authenticated (it usually is)
   - Only check on actual failure
```

### Error Messages
Keep them short and actionable:
```markdown
❌ {What failed}: {Exact solution}
Example: "❌ Epic not found: Run /pm:prd-parse feature-name"
```

## Standard Output Formats

### Success Output
```markdown
✅ {Action} complete
  - {Key result 1}
  - {Key result 2}
Next: {Single suggested action}
```

### List Output
```markdown
{Count} {items} found:
- {item 1}: {key detail}
- {item 2}: {key detail}
```

### Progress Output
```markdown
{Action}... {current}/{total}
```

## File Operations

### Check and Create
```markdown
# Don't ask permission, just create what's needed
mkdir -p .claude/{directory} 2>/dev/null
```

### Read with Fallback
```markdown
# Try to read, continue if missing
if [ -f {file} ]; then
  # Read and use file
else
  # Use sensible default
fi
```

## Common Patterns to Avoid

### DON'T: Over-validate
```markdown
# Bad - too many checks
1. Check directory exists
2. Check permissions
3. Check git status
4. Check GitHub auth
5. Check rate limits
6. Validate every field
```

### DO: Check essentials
```markdown
# Good - just what's needed
1. Check target exists
2. Try the operation
3. Handle failure clearly
```

### DON'T: Verbose output
```markdown
# Bad - too much information
🎯 Starting operation...
📋 Validating prerequisites...
✅ Step 1 complete
✅ Step 2 complete
📊 Statistics: ...
💡 Tips: ...
```

### DO: Concise output
```markdown
# Good - just results
✅ Done: 3 files created
Failed: auth.test.js (syntax error - line 42)
```

### DON'T: Ask too many questions
```markdown
# Bad - too interactive
"Continue? (yes/no)"
"Overwrite? (yes/no)"
"Are you sure? (yes/no)"
```

### DO: Smart defaults
```markdown
# Good - proceed with sensible defaults
# Only ask when destructive or ambiguous
"This will delete 10 files. Continue? (yes/no)"
```

## Quick Reference

### Tools
See Claude Code tool documentation for available tools. Common tools include Read, Write, Edit, Glob, Grep, and Bash.

### Status Indicators
Use status emojis only for final outcomes, not for intermediate steps or decoration:
- ✅ Success - Use only for final success message
- ❌ Error - Always include solution
- ⚠️ Warning - Only if action needed
- No emoji for progress steps or normal output

### Exit Strategies
- Success: Brief confirmation
- Failure: Clear error + exact fix
- Partial: Show what worked, what didn't

## When to Validate vs Trust

### Validate (check before proceeding)
- File exists before reading specific content from it
- Directory exists before creating files in it
- Required parameters are provided

### Trust (don't pre-check)
- GitHub CLI authentication (handle on failure)
- Git repository validity (let git commands fail)
- File system permissions (handle on failure)
- Network connectivity (let requests fail)

**Example - Good balance:**
```bash
# Check: File must exist to proceed
[ -f .claude/epics/feature/epic.md ] || echo "❌ Epic not found"

# Trust: gh is authenticated (handle failure)
gh issue create ... || echo "❌ GitHub failed. Run: gh auth login"
```