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
