# Linting Standards

ESLint with TypeScript and Vue support is configured for this project.

## Running Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix
```

## Pre-commit Hook

Husky runs lint-staged on every commit, which:
- Runs ESLint with `--fix` on staged `.js`, `.ts`, and `.vue` files
- Prevents commits if unfixable errors exist

## Configuration

The ESLint flat config is defined in `eslint.config.js`:

- **TypeScript**: Uses `typescript-eslint` with recommended rules
- **Vue 3**: Uses `eslint-plugin-vue` with recommended rules
- **Ignores**: `dist/`, `node_modules/`, config files

## Key Rules

### TypeScript
- Unused variables are errors (prefix with `_` to ignore)
- `any` type triggers warnings

### Vue
- Multi-word component names rule is disabled
- `v-html` triggers warnings (XSS risk)

## Before Committing

Always run lint before committing:

```bash
npm run lint:fix
```

The pre-commit hook will catch issues, but running lint manually first avoids commit failures.

## Adding Exceptions

For one-off exceptions, use inline comments:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data
```

For file-wide exceptions, add at the top:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

Avoid disabling rules project-wide unless absolutely necessary.
