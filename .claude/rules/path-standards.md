# Path Standards

Rules for file path references in project configuration and documentation.

## Rules

1. **Use relative paths from project root** in all configuration and documentation files
2. **Never hardcode absolute paths** (e.g., `/Users/`, `/home/`, `C:\`)
3. **Never include user-specific path segments** (e.g., `/Users/jordan/`, `/home/dev/`)
4. **Use consistent format**: prefer `src/foo/bar.ts` over `./src/foo/bar.ts`
5. **Shell scripts may compute absolute paths at runtime** using variables like `$(pwd)` or `$PROJECT_DIR`

## Exceptions

- `.claude/rules/` documentation may include example paths for illustration purposes
- Generated output (logs, build artifacts) may contain absolute paths
- Git configuration files may reference absolute paths as needed by git

## Validation

Run the path standards validation script:

```bash
bash .claude/scripts/check-path-standards.sh
```
