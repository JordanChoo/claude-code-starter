# Security Scanning Rule

## Mandatory Pre-Commit Security Check

> **STOP**: Before ANY commit, you MUST run a security scan.

This rule ensures all code changes are scanned for vulnerabilities before being committed to the repository.

---

## When to Scan

Security scanning is REQUIRED before:

| Action | Scan Required |
|--------|---------------|
| `git commit` | Yes |
| Closing tasks | Yes |
| Deploying to any environment | Yes |
| Creating a PR | Yes |

---

## How to Scan

Run the security scanning plugin:

```bash
/security-scanning:security-sast
```

---

## Commit Workflow

Follow this sequence for every commit:

```
1. Complete code changes
         │
         ▼
2. Run /security-scanning:security-sast
         │
         ▼
3. Review scan results
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Issues?     No issues
    │         │
    ▼         ▼
Fix them    Proceed
    │         │
    └────┬────┘
         │
         ▼
4. git commit
```

---

## Handling Scan Results

| Severity | Action | Can Commit? |
|----------|--------|-------------|
| Critical | MUST fix immediately | No |
| High | MUST fix before commit | No |
| Medium | Should fix, document if deferred | Yes, with justification |
| Low | Optional, note in commit message | Yes |

### If Issues Are Found

1. **Critical/High**: Fix the vulnerability before proceeding
2. **Medium**: Either fix or document why it's deferred
3. **Low**: Note in commit message if not addressing

### Example Commit with Deferred Issue

```bash
git commit -m "$(cat <<'EOF'
feat: Add user export functionality

Security note: Medium-severity issue deferred (CSV injection).
Mitigation: Server-side sanitization in place.
Follow-up: Issue #XX created for additional client-side escaping.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Integration with Workflow

### Before Closing Tasks

```bash
# 1. Run security scan
/security-scanning:security-sast

# 2. If clean, close/archive the task
```

### Before Deployment

```bash
# 1. Run security scan
/security-scanning:security-sast

# 2. If clean, proceed with deployment
./scripts/verify-env.sh && npm run build && firebase deploy
```

### During Session Close

The session close protocol (see AGENTS.md "Landing the Plane") MUST include a security scan:

1. Complete all code changes
2. Run `/security-scanning:security-sast`
3. Fix any Critical/High issues
4. Proceed with `git commit` → `bd sync` → `git push`

> **Note:** Never skip the security scan during session close, even for "documentation-only" changes.
> Configuration files and rule changes can introduce security issues too.

---

## Common Vulnerabilities to Watch For

| Category | Examples |
|----------|----------|
| Injection | SQL injection, XSS, command injection |
| Authentication | Weak passwords, missing auth checks |
| Sensitive Data | Exposed API keys, hardcoded credentials |
| Dependencies | Vulnerable npm packages |
| Configuration | Debug mode enabled, permissive CORS |

---

## Bypassing (Emergency Only)

If you must commit without scanning (critical hotfix):

1. **Document reason** in commit message:
   ```
   SECURITY-BYPASS: [reason]
   ```

2. **Create follow-up task** for security review

3. **Run scan immediately after** the emergency is resolved

> **Warning**: Bypassing should be rare. If bypassing frequently, review your workflow.

---

## Quick Reference

```bash
# Standard scan before commit
/security-scanning:security-sast

# Scan before deploy
/security-scanning:security-sast

# Check specific file or directory
/security-scanning:security-sast --path src/auth/
```
