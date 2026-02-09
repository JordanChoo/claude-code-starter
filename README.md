# Vue Firebase Starter (Claude Code Edition)

A boilerplate template designed for **Claude Code-first development** powered by **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — a lightweight, spec-driven workflow where you describe what you want, and AI implements it with full traceability.

## Philosophy

This template is built for people who work **with** Claude Code rather than writing code manually. Your workflow is:

1. **Describe** what you want ("Add a user profile page with avatar upload")
2. **Review** what Claude Code generates
3. **Guide** with feedback ("Make the avatar circular" or "Add error handling")
4. **Repeat** until complete

You don't need to know TypeScript, Vue, or Firebase deeply — Claude Code handles the implementation details.

## Why Use OpenSpec?

Without structure, AI-assisted development becomes chaotic — context gets lost between sessions, changes are hard to track, and you lose visibility into what's been done.

OpenSpec solves this:

- **Context survives sessions** — Specs and changes persist locally, so Claude Code picks up where it left off
- **Work is traceable** — Every code change links back to a spec and change artifact
- **Progress is visible** — Track what's done, what's in progress, and what's left
- **Lightweight** — Minimal overhead, no heavy PM infrastructure

**Rule of thumb:** If it takes more than 5 minutes, use OpenSpec.

> **Avoid this:** "Hey Claude, add user authentication to my app"
>
> **Do this instead:** Start a new change describing the auth requirements, then let OpenSpec break it into trackable tasks.

## How It Works

```
/opsx:new (describe what you want) → /opsx:ff (generate artifacts) → /opsx:apply (implement) → /opsx:archive (complete)
```

Each step creates artifacts that persist, so nothing gets lost.

## What's Included

**Core Workflow:**
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — Spec-driven development with structured change tracking

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
- Claude Code CLI installed

### Setup

After cloning this template, ask Claude Code:

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
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

**3. Authenticate the GitHub CLI:**
```bash
gh auth login
```

Follow the prompts to authenticate.

## Working with Claude Code

### Starting Development

All work flows through OpenSpec. This keeps your work organized and helps Claude Code understand context across sessions.

**1. Initialize OpenSpec (first time only):**
```bash
openspec init --tools claude
```

**2. Start a new change:**
```bash
/opsx:new
```
Describe what you want to build in plain language — features, user flows, requirements.

**3. Fast-forward through artifact creation:**
```bash
/opsx:ff
```
Claude Code analyzes your change and creates structured tasks.

**4. Implement the tasks:**
```bash
/opsx:apply
```
Claude Code picks up tasks and implements them.

**5. Archive when complete:**
```bash
/opsx:archive
```

### Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `/opsx:new` | Start a new change |
| `/opsx:ff` | Fast-forward artifact creation |
| `/opsx:apply` | Implement tasks from a change |
| `/opsx:continue` | Continue working on a change |
| `/opsx:verify` | Verify implementation matches artifacts |
| `/opsx:archive` | Archive a completed change |
| `/opsx:explore` | Think through ideas before starting |

### Ad-Hoc Requests

For quick changes outside OpenSpec, just describe what you want:

| Instead of coding... | Ask Claude Code... |
|---------------------|---------------------|
| Writing a Vue component | "Create a user profile component that shows name, email, and avatar" |
| Setting up routes | "Add a /settings route that shows user preferences" |
| Writing Firestore queries | "Create a function to get all posts by the current user, sorted by date" |
| Handling auth | "Add Google login to the login page" |

Use ad-hoc requests for small tweaks. Use OpenSpec for features.

## Extending with WHobson Agents

For additional specialized capabilities, install plugins from the [WHobson Agents](https://github.com/wshobson/agents) marketplace. It provides **100+ specialized AI agents** across categories like security, testing, DevOps, and more.

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
2. **Start changes normally** with `/opsx:new`
3. **Plugins work automatically** during implementation via `/opsx:apply`
4. **Run security scans** before archiving with `/security-scanning:security-audit`
5. **Use orchestration** for complex features with `/full-stack-orchestration:full-stack-feature "feature name"`

## Tips for Working with Claude Code

1. **Be specific about behavior** — "Show a loading spinner while saving" is better than "add loading state"
2. **Describe the user experience** — "When the user clicks Save, disable the button and show 'Saving...'"
3. **Ask for explanations** — "Explain what this component does" helps you understand and review
4. **Iterate incrementally** — Build features in small steps, reviewing each one
5. **Use OpenSpec** — For anything beyond a quick fix, start a new change first

## Project Structure

Claude Code understands this structure and will place files appropriately:

```
src/
├── components/      # Reusable UI pieces
├── composables/     # Shared logic (hooks)
├── firebase/        # Firebase helpers (auth, database, storage)
├── router/          # Page routes
├── stores/          # App state (Pinia)
├── views/           # Full pages
└── types/           # TypeScript definitions
```

You don't need to memorize this — just ask Claude Code where things go.

## Opinionated Rules

This template includes pre-configured rules (in `.claude/rules/`) that guide how Claude Code works. These aren't restrictions — they're guardrails that ensure consistency and prevent common mistakes.

**Why opinionated?** Without rules, Claude Code might name files differently each time, forget conventions, or make inconsistent choices. These rules encode best practices so you get predictable, professional results.

### Key Rules

| Rule | What It Does | Why It Matters |
|------|--------------|----------------|
| **Data Models** | Claude Code references `.claude/rules/firebase-data-models.md` before any database changes | Prevents schema drift and ensures type safety |
| **Environment Variables** | Secrets go in Google Secret Manager, not code | Keeps credentials secure and deployment-ready |
| **Security Scanning** | Mandatory security scans before commits and deployments | Catches vulnerabilities early |
| **Linting** | ESLint with TypeScript and Vue support | Consistent code quality |

### You Don't Need to Memorize These

Claude Code reads these rules automatically. They're documented so you can:
- Understand why Claude Code makes certain choices
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

| Command | Builds App | Deploys Hosting | Deploys Firestore Rules |
|---------|------------|-----------------|-------------------------|
| `npm run deploy` | Yes | Yes | Yes |
| `npm run deploy:rules` | No | No | Yes |
| `npm run deploy:hosting` | No | Yes | No |

### Important: Deploy Security Rules

The `firestore.rules` file contains security rules that protect your database. These rules are **automatically included** when you run `npm run deploy`.

If you only want to update security rules without redeploying the app:

```bash
npm run deploy:rules
```

### Manual Deployment

You can also ask Claude Code:

> "Help me deploy this to Firebase Hosting"

Claude Code will guide you through the process.

## Tech Stack (For Reference)

You don't need to know these deeply, but Claude Code uses:
- **Vue 3** with TypeScript
- **Vite** for development
- **Tailwind CSS** for styling
- **Firebase** for backend (auth, database, storage)
- **Pinia** for state management

## License

MIT
