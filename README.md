# Vue Firebase Starter (Claude Code Edition)

A boilerplate template designed for **Claude Code-first development** powered by **[Claude Code PM](https://github.com/automazeio/ccpm)** — a spec-driven workflow where you describe what you want, and AI implements it with full traceability.

## Philosophy

This template is built for people who work **with** Claude Code rather than writing code manually. Your workflow is:

1. **Describe** what you want ("Add a user profile page with avatar upload")
2. **Review** what Claude Code generates
3. **Guide** with feedback ("Make the avatar circular" or "Add error handling")
4. **Repeat** until complete

You don't need to know TypeScript, Vue, or Firebase deeply — Claude Code handles the implementation details.

## Why Use the PM System?

Without structure, AI-assisted development becomes chaotic — context gets lost between sessions, changes are hard to track, and you lose visibility into what's been done.

The PM system solves this:

- **Context survives sessions** — PRDs and tasks persist locally, so Claude Code picks up where it left off
- **Work is traceable** — Every code change links back to a GitHub issue and PRD requirement
- **Progress is visible** — Track what's done, what's in progress, and what's blocked
- **Parallel work is possible** — Multiple tasks can be worked on independently

**Rule of thumb:** If it takes more than 5 minutes, use the PM system.

> **Avoid this:** "Hey Claude, add user authentication to my app"
>
> **Do this instead:** Create a PRD describing the auth requirements, then let the PM system break it into trackable tasks.

## How It Works

```
PRD (what you want) → Epic (implementation plan) → Tasks (individual work items) → GitHub Issues (tracking) → Code
```

Each step creates artifacts that persist, so nothing gets lost.

## What's Included

**Core Workflow:**
- **[Claude Code PM](https://github.com/automazeio/ccpm)** — Spec-driven development with GitHub issue tracking

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

The PM system syncs tasks to GitHub Issues. Set this up before using `/pm:epic-sync`:

**1. Create a GitHub repository** for your project (or use an existing one).

**2. Connect your local repo to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

**3. Authenticate the GitHub CLI:**
```bash
gh auth login
```

Follow the prompts to authenticate. This enables Claude Code to create and manage issues.

## Working with Claude Code

### Starting Development

All work flows through the PM (Project Management) system. This keeps your work organized, creates GitHub issues for tracking, and helps Claude Code understand context across sessions.

**1. Initialize the PM system (first time only):**
```bash
/pm:init
```

**2. Create a Product Requirements Document (PRD):**
```bash
/pm:prd-new user-profiles
```
This creates a PRD file. Describe what you want to build in plain language — features, user flows, requirements.

**3. Parse the PRD into an implementation plan:**
```bash
/pm:prd-parse user-profiles
```
Claude Code analyzes your PRD and creates a structured epic with tasks.

**4. Decompose into workable tasks:**
```bash
/pm:epic-decompose user-profiles
```
Breaks the epic into individual tasks that can be worked on independently.

**5. Sync to GitHub Issues:**
```bash
/pm:epic-sync user-profiles
```
Creates GitHub issues for each task, enabling tracking and parallel work.

**6. Start working on tasks:**
```bash
/pm:issue-start [issue-number]
```
Claude Code picks up the task, analyzes what needs to be done, and implements it.

### Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `/pm:status` | See overall project status |
| `/pm:next` | Get the next task to work on |
| `/pm:issue-close [number]` | Mark a task as complete |
| `/pm:epic-status [name]` | Check progress on an epic |
| `/pm:help` | See all available commands |

### Ad-Hoc Requests

For quick changes outside the PM system, just describe what you want:

| Instead of coding... | Ask Claude Code... |
|---------------------|---------------------|
| Writing a Vue component | "Create a user profile component that shows name, email, and avatar" |
| Setting up routes | "Add a /settings route that shows user preferences" |
| Writing Firestore queries | "Create a function to get all posts by the current user, sorted by date" |
| Handling auth | "Add Google login to the login page" |

Use ad-hoc requests for small tweaks. Use the PM system for features.

## Extending with WHobson Agents

For additional specialized capabilities, you can install the [WHobson Agents](https://github.com/wshobson/agents) plugin. It provides **100+ specialized AI agents** across categories like security, testing, DevOps, and more.

```bash
# Add the marketplace
/plugin marketplace add wshobson/agents

# Install plugins as needed
/plugin install security-scanning
/plugin install api-development
```
## Tips for Working with Claude Code

1. **Be specific about behavior** — "Show a loading spinner while saving" is better than "add loading state"
2. **Describe the user experience** — "When the user clicks Save, disable the button and show 'Saving...'"
3. **Ask for explanations** — "Explain what this component does" helps you understand and review
4. **Iterate incrementally** — Build features in small steps, reviewing each one
5. **Use the PM system** — For anything beyond a quick fix, create a PRD first

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

## Testing

Linting runs automatically on every commit via a pre-commit hook — you don't need to run it manually.

To check or fix lint issues manually:
```bash
npm run lint      # Check for lint errors
npm run lint:fix  # Auto-fix lint issues
```

## Deployment

When you're ready to deploy, ask Claude Code:

> "Help me deploy this to Firebase Hosting"

Claude Code will guide you through:
1. Building the production bundle
2. Configuring Firebase Hosting (if not already done)
3. Deploying to your Firebase project

## Tech Stack (For Reference)

You don't need to know these deeply, but Claude Code uses:
- **Vue 3** with TypeScript
- **Vite** for development
- **Tailwind CSS** for styling
- **Firebase** for backend (auth, database, storage)
- **Pinia** for state management

## License

MIT
