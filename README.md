# Vue Firebase Starter (Gemini CLI Edition)

A boilerplate template designed for **[Gemini CLI-first development](./CLAUDE.md)** powered by **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** and **[Beads](https://github.com/steveyegge/beads/)** — a spec-driven workflow with git-backed task tracking where you describe what you want, and AI implements it with full traceability.

## Philosophy

This template is built for people who work **with** Gemini CLI rather than writing code manually. Your workflow is:

1. **Describe** what you want ("Add a user profile page with avatar upload")
2. **Review** what Gemini CLI generates
3. **Guide** with feedback ("Make the avatar circular" or "Add error handling")
4. **Repeat** until complete

You don't need to know TypeScript, Vue, or Firebase deeply — Gemini CLI handles the implementation details.

## Why Use OpenSpec?

Without structure, AI-assisted development becomes chaotic — context gets lost between sessions, changes are hard to track, and you lose visibility into what's been done.

OpenSpec + Beads solve this:

- **Context survives sessions** — Specs, changes, and tasks persist locally in git, so Gemini CLI picks up where it left off
- **Work is traceable** — Every code change links back to a spec and a tracked task
- **Progress is visible** — `bd ready` shows what's unblocked, what's in progress, and what's left
- **Lightweight** — Minimal overhead, no heavy PM infrastructure
- **Agent-native** — Beads uses hash-based IDs and JSON storage designed for AI agents working in parallel

**Rule of thumb:** If it takes more than 5 minutes, use OpenSpec.

> **Avoid this:** "Hey Claude, add user authentication to my app"
>
> **Do this instead:** Start a new change describing the auth requirements, then let OpenSpec break it into trackable tasks.

## How It Works

```
/opsx:new (describe what you want) → /opsx:ff (generate artifacts) → bd create (track tasks) → implement directly → bd close (complete)
```

**OpenSpec** handles the *what* (specs, changes, artifacts). **Beads** handles the *tracking* (tasks, dependencies, progress). Both persist in git, so nothing gets lost.

## What's Included

**Core Workflow:**
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Spec-driven development with structured change tracking
- **[Beads](https://github.com/steveyegge/beads/)** — Git-backed task tracking designed for AI agents

**Safety:**
- **[DCG](https://github.com/Dicklesworthstone/destructive_command_guard)** — Destructive Command Guard hook that blocks dangerous commands before execution

**Pre-configured Stack:**
- **Authentication** — Email/password and Google sign-in ready to use
- **Firebase Integration** — Firestore database, Cloud Storage, and Auth pre-wired
- **Routing** — Protected routes that redirect unauthenticated users
- **State Management** — Pinia store for auth state
- **Styling** — Tailwind CSS configured and ready
- **ESLint + Husky** — Linting and pre-commit hooks configured

## Getting Started

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- A Firebase project ([create one](https://console.firebase.google.com))
- Gemini CLI CLI installed
- Beads CLI: `npm install -g @beads/bd` ([docs](https://github.com/steveyegge/beads/))
(Note: If `npm install` fails, ensure you have access to the `@beads` npm registry or consult Beads documentation for alternative installation methods.)
- DCG (Destructive Command Guard): see [install instructions](#destructive-command-guard-dcg) below

### Setup

After cloning this template, ask Gemini CLI:

> "Set up this project: install dependencies, create the .env file from the example, and tell me what Firebase credentials I need to add."

Or run these commands yourself:
```bash
npm install
cp .env.example .env
```

Then add your Firebase credentials to `.env`.

### GitHub Setup

For tracking changes with GitHub Issues, set up the GitHub CLI:

**1. Create a GitHub repository** for your project (or use an existing one).

**2. Connect your local repo to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git # Replace YOUR_USERNAME and YOUR_REPO
```

**3. Authenticate the GitHub CLI:**
```bash
gh auth login
```

Follow the prompts to authenticate.

## Working with Gemini CLI

### Starting Development

All work flows through OpenSpec and Beads. This keeps your work organized and helps Gemini CLI understand context across sessions.

**1. Initialize (first time only):**
```bash
openspec init --tools gemini
bd init
```

**2. Start a new change:**
```bash
/opsx:new <name>
```
Describe what you want to build in plain language — features, user flows, requirements.

**3. Fast-forward through artifact creation:**
```bash
/opsx:ff <name>
```
Gemini CLI analyzes your change and creates structured artifacts (proposal, specs, design, tasks).

**4. Create tasks to track work:**
```bash
bd create "Implement user auth API" -t task -p 2 -d "## Requirements
- What needs to be done
## Acceptance Criteria
- How to verify it's done"

bd create "Add login UI component" -t task -p 2 -d "..."
```
Beads tracks each task in `.beads/`, versioned alongside your code. Every `bd create` **must** include `-d` with a description.

**5. Implement the tasks:**
```bash
bd update <id> --status in_progress  # claim a task
# ... write code directly, referencing OpenSpec artifacts ...
bd close <id> --reason "Completed"   # mark complete
```

**6. Clean up when complete:**
```bash
rm -rf openspec/changes/<name>       # delete planning artifacts
bd sync && git push                  # sync and push
```

### Quick Commands Reference

**OpenSpec (planning — use only when needed):**

| Command | Purpose |
|---------|---------|
| `/opsx:explore` | Explore and refine ideas interactively before starting a new change |
| `/opsx:new <name>` | Start a new change step-by-step |
| `/opsx:ff <name>` | Generate all planning artifacts at once |

**Beads (execution tracking):**

| Command | Purpose |
|---------|---------|
| `bd ready` | Show unblocked tasks ready for work |
| `bd create "Title" -t task -p 2 -d "..."` | Create a task (must include `-d`) |
| `bd update <id> --status in_progress` | Claim a task |
| `bd close <id> --reason "Completed"` | Mark a task as complete |
| `bd sync` | Sync tracking with git |

### Ad-Hoc Requests

For quick changes outside OpenSpec, just describe what you want:

| Instead of coding... | Ask Gemini CLI... |
|---------------------|---------------------|
| Writing a Vue component | "Create a user profile component that shows name, email, and avatar" |
| Setting up routes | "Add a /settings route that shows user preferences" |
| Writing Firestore queries | "Create a function to get all posts by the current user, sorted by date" |
| Handling auth | "Add Google login to the login page" |

Use ad-hoc requests for small tweaks. Use OpenSpec + Beads for features.

## Extending with WHobson Agents

This template includes a few foundational agents within the `.claude/agents/` directory (e.g., `code-analyzer.md`, `parallel-worker.md`) that are core to the workflow. For additional specialized capabilities, install plugins from the [WHobson Agents](https://github.com/wshobson/agents) marketplace. It provides **100+ specialized AI agents** across categories like security, testing, DevOps, and more.

### Recommended Plugins for This Stack

```bash
# Add the marketplace (first time only)
/plugin marketplace add wshobson/agents

# Install recommended plugins
/plugin install javascript-typescript --global
/plugin install full-stack-orchestration --global
/plugin install security-scanning --global
/plugin install code-review-ai --global
/plugin install debugging-toolkit --global
/plugin install git-pr-workflows --global
/plugin install code-documentation --global
```

### Plugin Reference

| Plugin | Purpose | When to Use |
|--------|---------|-------------|
| `javascript-typescript` | TypeScript patterns, advanced typing | During implementation |
| `full-stack-orchestration` | Coordinates 7+ agents for complete features | Feature development spanning Vue + Firebase |
| `security-scanning` | Vulnerability detection | Before closing tasks or deploying |
| `code-review-ai` | Code quality analysis | Before PRs |
| `debugging-toolkit` | Troubleshooting help | When stuck on bugs |
| `git-pr-workflows` | Git and PR automation | Creating PRs, branch management |
| `code-documentation` | Documentation generation | Documenting code and APIs |

### Using Plugins with OpenSpec

Plugins enhance your existing workflow without changing it:

1. **Install plugins once** (globally available across projects)
2. **Start changes normally** with `/opsx:new` or `/opsx:ff`
3. **Plugins work automatically** during implementation
4. **Run security scans** before committing with `/security-scanning:security-audit`
5. **Use orchestration** for complex features with `/full-stack-orchestration:full-stack-feature "feature name"`

## Destructive Command Guard (DCG)

[DCG](https://github.com/Dicklesworthstone/destructive_command_guard) is a **required** safety hook that blocks destructive commands before Gemini CLI can execute them. It protects against accidental `git reset --hard`, `rm -rf`, `git push --force`, and 49+ other dangerous patterns.

### Install DCG

```bash
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/destructive_command_guard/master/install.sh?$(date +%s)" | bash -s -- --easy-mode # Installs DCG with a basic set of common rules.
```

DCG runs automatically as a Gemini CLI pre-execution hook — no additional configuration needed.

### What It Blocks

| Category | Examples |
|----------|----------|
| **Git** | `git reset --hard`, `git push --force`, `git clean -f`, `git branch -D` |
| **Filesystem** | `rm -rf` on non-temp paths, inline destructive scripts |
| **Databases** | `DROP TABLE`, `TRUNCATE`, destructive SQL (via packs) |
| **Cloud/Infra** | AWS/GCP/Azure destructive ops, `terraform destroy` (via packs) |

### If a Command Is Blocked

```bash
# Understand why it was blocked
dcg explain "git reset --hard"
```

DCG will explain the rule and suggest safer alternatives. See [.claude/rules/destructive-command-guard.md](.claude/rules/destructive-command-guard.md) for full configuration.

## Git Worktrees (Parallel Agent Work)

This template supports [git worktrees](https://git-scm.com/docs/git-worktree) for running multiple Gemini CLI agents in parallel on the same repository. Each agent works in its own worktree, avoiding file conflicts.

### Why Worktrees?

When Gemini CLI spawns parallel sub-agents (e.g., one building the API while another builds the UI), they need isolated working directories. Git worktrees provide this without cloning the repo multiple times — each worktree shares the same `.git` history but has its own checked-out files.

### Creating a Worktree

```bash
# Create a worktree for a specific task
git worktree add ../my-project-task-a feature/task-a

# Create a worktree on a new branch
git worktree add -b feature/task-b ../my-project-task-b main

# List active worktrees
git worktree list

# Remove a worktree when done
git worktree remove ../my-project-task-a
```

### Bash Worktree Hook

A pre-tool-use hook at `.claude/hooks/bash-worktree-fix.sh` automatically detects when Gemini CLI is running inside a worktree and adjusts Bash commands to execute in the correct worktree root. This prevents commands from accidentally running in the main repository directory.

To enable the hook and default permissions:

1. Copy the example settings if `.claude/settings.json` does not exist:
```bash
cp -n .claude/settings.json.example .claude/settings.json
```
2. If `.claude/settings.json` already exists, you will need to manually merge the relevant `hooks` configuration from `.claude/settings.json.example` to preserve your existing settings.

Or add the hook manually to your `.claude/settings.json`:

```json
{
  "hooks": {
    "pre-tool-use": {
      "Bash": {
        "enabled": true,
        "script": ".claude/hooks/bash-worktree-fix.sh",
        "description": "Automatically prepends worktree path to Bash commands when in a worktree",
        "apply_to_subagents": true
      }
    }
  }
}
```

### How Parallel Agents Use Worktrees

The `parallel-worker` agent (`.claude/agents/parallel-worker.md`) coordinates this workflow:

1. **Main agent** creates worktrees and assigns file scopes to sub-agents
2. **Sub-agents** work independently in their own worktrees — no file conflicts
3. **Main agent** consolidates results and cleans up worktrees

Each sub-agent commits only its assigned files, and commits are serialized in dependency order. See `AGENTS.md` for the full parallel agent rules and commit discipline.

### Cleanup

```bash
# List worktrees
git worktree list

# Remove finished worktrees
git worktree remove ../my-project-task-a
git worktree remove ../my-project-task-b

# Prune stale worktree references
git worktree prune
```

## Tips for Working with Gemini CLI

1. **Be specific about behavior** — "Show a loading spinner while saving" is better than "add loading state"
2. **Describe the user experience** — "When the user clicks Save, disable the button and show 'Saving...'"
3. **Ask for explanations** — "Explain what this component does" helps you understand and review
4. **Iterate incrementally** — Build features in small steps, reviewing each one
5. **Use OpenSpec + Beads** — For anything beyond a quick fix, start a new change and track tasks

## Project Structure

Gemini CLI understands this structure and will place files appropriately:

```
src/
├── components/      # Reusable UI pieces
├── composables/      # Shared logic (Vue Composables)
├── firebase/        # Firebase helpers (auth, database, storage)
├── router/          # Page routes
├── stores/          # App state (Pinia)
├── views/           # Full pages
└── types/           # TypeScript definitions
```

You don't need to memorize this — just ask Gemini CLI where things go.

## Opinionated Rules

This template includes pre-configured rules (in `.claude/rules/`) that guide how Gemini CLI works. These aren't restrictions — they're guardrails that ensure consistency and prevent common mistakes.

**Why opinionated?** Without rules, Gemini CLI might name files differently each time, forget conventions, or make inconsistent choices. These rules encode best practices so you get predictable, professional results.

### Key Rules

| Rule | What It Does | Why It Matters |
|------|--------------|----------------|
| **Data Models** | Gemini CLI references `.claude/rules/firebase-data-models.md` before any database changes | Prevents schema drift and ensures type safety |
| **Environment Variables** | Secrets go in Google Secret Manager, not code | Keeps credentials secure and deployment-ready |
| **Security Scanning** | Mandatory security scans before commits and deployments | Catches vulnerabilities early |
| **Destructive Command Guard** | DCG hook blocks dangerous commands before execution | Prevents accidental data loss |
| **Linting** | ESLint with TypeScript and Vue support | Consistent code quality |

### You Don't Need to Memorize These

Gemini CLI reads these rules automatically. They're documented so you can:
- Understand why Gemini CLI makes certain choices
- Customize them if your project has different needs
- Trust that conventions are being followed consistently

To view all rules: `ls .claude/rules/`

## Testing

Linting runs automatically on every commit via a pre-commit hook — you don't need to run it manually.

To check or fix lint issues manually:
```bash
npm run lint      # Check for lint errors
npm run lint:fix  # Auto-fix lint issues
```

## Deployment

### First-Time Setup

Before your first deployment, initialize Firebase in your project:

```bash
firebase login
firebase use --add  # Select your Firebase project
```

### Deploy Commands

```bash
# Full deployment (build + hosting + Firestore rules)
npm run deploy

# Deploy only Firestore security rules
npm run deploy:rules

# Deploy only hosting (skip rules)
npm run deploy:hosting
```

### What Gets Deployed

| Command | Builds App | Deploys Hosting | Deploys Firestore Rules | Deploys Storage Rules |
|---------|------------|-----------------|-------------------------|-----------------------|
| `npm run deploy` | Yes | Yes | Yes | Yes |
| `npm run deploy:rules` | No | No | Yes | No |
| `npm run deploy:hosting` | Yes | Yes | No | No |

### Important: Deploy Security Rules

The `firestore.rules` file contains security rules that protect your database. These rules are **automatically included** when you run `npm run deploy`.

If you only want to update security rules without redeploying the app:

```bash
npm run deploy:rules
```

### Manual Deployment

You can also ask Gemini CLI:

> "Help me deploy this to Firebase Hosting"

Gemini CLI will guide you through the process.

## Tech Stack (For Reference)

You don't need to know these deeply, but Gemini CLI uses:
- **Vue 3** with TypeScript
- **Vite** for development
- **Tailwind CSS** for styling
- **Firebase** for backend (auth, database, storage)
- **Pinia** for state management

## License

MIT
