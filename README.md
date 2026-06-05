# GitHub PR Dashboard

A fast, keyboard-navigable dashboard for tracking open pull requests across multiple GitHub repositories.

Built with Next.js 16, React 19, Tailwind v4, and shadcn/ui components.

## Features

- **Multi-repo view** — add as many `owner/repo` pairs as you like; PRs are grouped by repo and sorted by last-updated
- **PR detail panel** — description, diff stats, reviews, inline review threads, and comments all rendered as Markdown
- **CI status** — coloured dot per PR row showing passing / failing / running / neutral check-run status
- **Review summary** — approval / changes-requested counts per PR, deduped to each reviewer's latest state
- **Keyboard navigation** — `j`/`↓` and `k`/`↑` cycle PRs; `r` refreshes; arrow keys auto-expand collapsed repos
- **Filter bar** — search by title and/or filter to PRs that need your review
- **Auto-refresh** — optional 5-minute background refresh with a status indicator
- **Dark mode** — system preference detected, toggleable, persisted; no flash of wrong theme
- **SAML SSO support** — surfaces actionable errors when a token needs SSO authorisation

## Getting started

### Prerequisites

- Node.js 20+
- A GitHub [Personal Access Token](https://github.com/settings/tokens) with the `repo` scope (or `public_repo` for public repos only)

### Local development

```bash
git clone <repo-url>
cd github-pr-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your PAT and add repos in `owner/repo` format (one per line), then click **Save & Load Dashboard**.

Credentials are stored in your browser's `localStorage` — nothing is sent to any server other than the GitHub API.

### Production build

```bash
npm run build
npm start
```

### Docker

The image uses a multi-stage build and Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) for a minimal final layer.

```bash
# Build
docker build -t gh-pr-dashboard .

# Run
docker run -p 3000:3000 gh-pr-dashboard
```

The container exposes port `3000`. Fonts are downloaded at **build time** and bundled into the image, so the container needs no outbound internet access (except to reach `api.github.com`).

## Project structure

```
app/
  layout.tsx       Root layout — fonts, FOUC-prevention script, TooltipProvider
  page.tsx         Orchestrator — view state, data fetching, keyboard nav
  globals.css      Tailwind v4 + amber OKLCH theme + Markdown prose styles
  icon.svg         Favicon
components/
  PRList.tsx       Sidebar — repo groups, PR rows, CI dots, filter bar
  PRDetail.tsx     Main panel — PR header, Markdown body, reviews, threads
  Settings.tsx     First-run / settings form
  ui/              shadcn-generated primitives (Button, Badge, Tooltip, …)
lib/
  github.ts        GitHub REST client — typed fetchers, error classes
  utils.ts         cn() utility (clsx + tailwind-merge)
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI library | shadcn/ui (Base UI primitives, not Radix) |
| Styling | Tailwind v4, OKLCH colour tokens |
| Fonts | Inter, Source Serif 4, JetBrains Mono (via `next/font`) |
| Markdown | react-markdown + remark-gfm |
| Auth | Browser `localStorage` — token never leaves the client |

## Contributing

1. Fork the repo and create a branch: `git checkout -b my-feature`
2. Make your changes — run `npm run lint` and `npm run build` before pushing
3. Open a pull request with a clear description of what changed and why

A few conventions to keep in mind:

- All icon SVGs live inline in the component that uses them — no icon library dependency
- Avoid adding new `dependencies` unless strictly necessary; prefer inlining small utilities
- The shadcn components use **Base UI** as their primitive layer (not Radix) — check `components/ui/` before assuming Radix API compatibility
- Keep `lib/github.ts` free of any React imports; it is a pure fetch layer
