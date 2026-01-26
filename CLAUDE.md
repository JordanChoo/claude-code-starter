# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project-Specific Instructions

Add your project-specific instructions here.

## Testing

Always run tests before committing:
- `npm test` or equivalent for your stack
- `npm run lint` to check for lint errors

## Code Style

Follow existing patterns in the codebase.

ESLint is configured with TypeScript and Vue support:
- `npm run lint` - check for errors
- `npm run lint:fix` - auto-fix issues

A pre-commit hook runs lint-staged automatically.

## Glossary

| Term | Definition |
|------|------------|
| **Agent** | A Claude Code instance working on a specific task or work stream |
| **Epic** | A large feature or body of work broken down into multiple tasks |
| **PRD** | Product Requirements Document - defines what needs to be built |
| **Task** | A single unit of work within an epic, typically tracked as a GitHub issue |
| **Frontmatter** | YAML metadata at the top of markdown files between `---` markers |
| **Work Stream** | A subset of files/components assigned to an agent within an epic |
