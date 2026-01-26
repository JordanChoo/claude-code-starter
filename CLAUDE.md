# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project-Specific Instructions

Add your project-specific instructions here.

## Testing

Always run tests before committing:
- `npm test` or equivalent for your stack
- `npm run lint` to check for lint errors

## Security

Always run security scan before committing:
- `/security-scanning:security-audit`

See [.claude/rules/security-scanning.md](.claude/rules/security-scanning.md) for full security workflow.

## Code Style

Follow existing patterns in the codebase.

See [.claude/rules/linting.md](.claude/rules/linting.md) for ESLint configuration and commands.

## Glossary

| Term | Definition |
|------|------------|
| **Agent** | A Claude Code instance working on a specific task or work stream |
| **Epic** | A large feature or body of work broken down into multiple tasks |
| **PRD** | Product Requirements Document - defines what needs to be built |
| **Task** | A single unit of work within an epic, typically tracked as a GitHub issue |
| **Frontmatter** | YAML metadata at the top of markdown files between `---` markers |
| **Work Stream** | A subset of files/components assigned to an agent within an epic |
