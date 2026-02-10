# Test Execution Rule

Standard patterns for running tests across all testing commands.

## Project-Specific Commands

### Vitest (Unit + Component)

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run tests/unit/stores/auth.test.ts

# Run tests matching a pattern
npx vitest run -t "Auth Store"
```

### Playwright (E2E)

```bash
# Prerequisites: Start Firebase emulators first
npm run firebase:emulators:ci

# Run all E2E tests (in another terminal)
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run a specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run only chromium
npx playwright test --project=chromium
```

### Firebase Emulators

```bash
# Start emulators for local development (uses real project)
npm run firebase:emulators

# Start emulators for CI/testing (no real project needed)
npm run firebase:emulators:ci
```

### Test Directory Structure

```
tests/
  setup/
    vitest.setup.ts       # Global Vitest setup (jest-dom matchers)
    firebase-emulator.ts  # Emulator REST API helpers for E2E
  unit/                   # Unit tests (mock all external deps)
    stores/
      auth.test.ts
  component/              # Component tests (mock store, real DOM)
    views/
      LoginView.test.ts
  e2e/                    # E2E tests (no mocks, real emulators)
    auth.spec.ts
```

---

## Core Principles

1. **Always use test-runner agent** from `.claude/agents/test-runner.md`
2. **Mocking by test type**:
   - **Unit tests**: Mock external dependencies for isolation and speed
   - **Integration tests**: Use real services where practical; mock only unstable externals
   - **E2E tests**: No mocking - test the full system with real services
3. **Verbose output** - capture everything for debugging
4. **Check test structure first** - before assuming code bugs

## Execution Pattern

```markdown
Execute tests for: {target}

Requirements:
- Run with verbose output
- Apply mocking rules per test type (see Core Principles)
- Capture full stack traces
- Analyze test structure if failures occur
```

## Template Variables

These placeholders are filled by the test runner:
- `{target}` - Test file, directory, or pattern to run
- `{count}` - Number of tests executed
- `{time}` - Execution time in seconds
- `{test_name}` - Name of the failing test
- `{file}` - File containing the test
- `{line}` - Line number of failure
- `{message}` - Error message
- `{suggestion}` - Recommended fix

## Output Focus

### Success
Keep it simple:
```
✅ All tests passed ({count} tests in {time}s)
```

### Failure
Focus on what failed:
```
❌ Test failures: {count}

{test_name} - {file}:{line}
  Error: {message}
  Fix: {suggestion}
```

## Common Issues

- Test not found → Check file path
- Timeout → Kill process, report incomplete
- Framework missing → Install dependencies

## Cleanup

Always clean up after tests:
```bash
# Kill test processes for all supported frameworks
pkill -f "jest|mocha|pytest|phpunit|rspec|ctest" 2>/dev/null || true
pkill -f "mvn.*test|gradle.*test|gradlew.*test" 2>/dev/null || true
pkill -f "dotnet.*test|cargo.*test|go.*test|swift.*test|flutter.*test" 2>/dev/null || true
```

## Important Notes

- Don't parallelize tests (avoid conflicts)
- Let each test complete fully
- Report failures with actionable fixes
- Focus output on failures, not successes