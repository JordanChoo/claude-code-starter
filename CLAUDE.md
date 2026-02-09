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

## Spec-Driven Workflow

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for structured, spec-driven development. Key commands:
- `/opsx:new` — Start a new change
- `/opsx:ff` — Fast-forward through artifact creation
- `/opsx:apply` — Implement tasks from a change
- `/opsx:archive` — Archive a completed change

See `openspec/` directory for specs and changes.
