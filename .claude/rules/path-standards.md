# Path Standards Specification

## Overview
This specification defines file path usage standards within the Claude Code PM system to ensure document portability, privacy protection, and consistency.

## Core Principles

### 1. Privacy Protection
- **Prohibit** absolute paths containing usernames
- **Prohibit** exposing local directory structure in public documentation  
- **Prohibit** including complete local paths in GitHub Issue comments

### 2. Portability Principles
- **Prefer** relative paths for referencing project files
- **Ensure** documentation works across different development environments
- **Avoid** environment-specific path formats

## Path Format Standards

### Project File References ✅
```markdown
# Correct Examples
- `internal/auth/server.go` 
- `cmd/server/main.go`
- `.claude/commands/pm/sync.md`

# Incorrect Examples ❌
- `/Users/username/project/internal/auth/server.go`
- `C:\Users\username\project\cmd\server\main.go`
```

### Cross-Project/Worktree References ✅
```markdown
# Correct Examples
- `../project-name/internal/auth/server.go`
- `../worktree-name/src/components/Button.tsx`

# Incorrect Examples ❌
- `/Users/username/parent-dir/project-name/internal/auth/server.go`
- `/home/user/projects/worktree-name/src/components/Button.tsx`
```

### Code Comment File References ✅
```go
// Correct Examples
// See internal/processor/converter.go for data transformation
// Configuration loaded from configs/production.yml

// Incorrect Examples ❌  
// See /Users/username/parent-dir/project-name/internal/processor/converter.go
```

## Implementation Rules

### Documentation Generation Rules
1. **Issue sync templates**: Use relative path template variables
2. **Progress reports**: Automatically convert absolute paths to relative paths
3. **Technical documentation**: Use project root relative paths consistently

### Path Variable Standards
```yaml
# Template variable definitions
project_root: "."              # Current project root directory
worktree_path: "../{name}"     # Worktree relative path  
internal_path: "internal/"     # Internal modules directory
config_path: "configs/"        # Configuration files directory
```

### Automatic Cleanup Rules
```bash
# Path normalization function
# Handles variable directory depths (not just 2 levels)
normalize_paths() {
  local content="$1"
  # Remove macOS user paths (any depth after username)
  content=$(echo "$content" | sed -E "s|/Users/[^/]+/[^[:space:]]*|../|g")
  # Remove Linux user paths (any depth after username)
  content=$(echo "$content" | sed -E "s|/home/[^/]+/[^[:space:]]*|../|g")
  # Remove Windows paths (any depth after username)
  content=$(echo "$content" | sed -E "s|C:\\\\Users\\\\[^\\\\]+\\\\[^[:space:]]*|..\\\\|g")
  echo "$content"
}
```

## PM Command Integration

PM skill commands (`/pm:*`) automatically apply these path standards. See the PM skill documentation for command details.

Key integrations:
- **issue-sync**: Cleans path formats before sync, uses relative path templates
- **epic-sync**: Standardizes task file paths, cleans GitHub issue body paths

## Validation Checks

### Automated Check Script
```bash
# Check for absolute path violations (uses grep for portability)
check_absolute_paths() {
  echo "Checking for absolute path violations..."
  grep -rn "/Users/\|/home/\|C:\\\\Users" .claude/ || echo "✅ No absolute paths found"
}

# Check GitHub sync content
check_sync_content() {
  echo "Checking sync content path formats..."
  # Implement specific check logic
}
```

### Manual Review Checklist
- [ ] GitHub Issue comments contain no absolute paths
- [ ] Local documentation uses relative paths consistently
- [ ] Code comment paths follow standards
- [ ] Configuration file paths are standardized

## Error Handling

### When Absolute Paths Are Found
1. **Immediate Action**: Clean published public content
2. **Batch Fix**: Update local documentation formats
3. **Prevention**: Update generation templates

### Emergency Procedures
If privacy information has been leaked:
1. Immediately edit GitHub Issues/comments
2. Clean Git history if necessary:
   ```bash
   # Using BFG Repo-Cleaner (recommended)
   # Install: brew install bfg
   bfg --replace-text passwords.txt repo.git

   # Or using git filter-branch (slower)
   git filter-branch --tree-filter 'find . -name "*.md" -exec sed -i "" "s|/Users/username/|../|g" {} \;' HEAD

   # Force push after cleaning (coordinate with team!)
   git push --force-with-lease
   ```
3. Update related documentation and templates
4. Establish monitoring to prevent recurrence

## Example Comparisons

### Documentation Before/After
```markdown
# Before ❌
- ✅ Implemented `/Users/username/parent-dir/project-name/internal/auth/server.go` core logic

# After ✅  
- ✅ Implemented `../project-name/internal/auth/server.go` core logic
```

### GitHub Comment Format
```markdown
# Correct Format ✅
## 📦 Deliverables
- `internal/formatter/batch.go` - Batch formatter
- `internal/processor/sorter.go` - Sorting algorithm  
- `cmd/server/main.go` - Server entry point

# Incorrect Format ❌
## 📦 Deliverables  
- `/Users/username/parent-dir/project-name/internal/formatter/batch.go`
```

This specification ensures project documentation maintains professionalism, portability, and privacy security.