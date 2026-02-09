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

## Task Tracking

This project uses [Beads](https://github.com/steveyegge/beads/) (`bd`) for git-backed task tracking. Tasks live in `.beads/` and are versioned alongside code. Key commands:
- `bd ready` — Show unblocked tasks ready for work
- `bd create "Title" -p 0` — Create a new task (priority 0 = highest)
- `bd update <id> --claim` — Claim a task and mark it in-progress
- `bd show <id>` — View task details and history

Use Beads to track implementation tasks during `/opsx:apply`.
