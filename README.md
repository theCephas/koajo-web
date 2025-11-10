# Koajo Frontend

Next.js application powered by pnpm. Uses the App Router (`app/`), TypeScript, and Sass modules.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS, Sass modules
- pnpm for dependency management

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm installed globally: `npm i -g pnpm`

## Environment Variables

Create a `.env.local` in the project root. Common variables:

```
NEXT_PUBLIC_API_URL=https://api.koajo.com
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See `lib/config/env.ts` for defaults and usage.

## Installation

```bash
pnpm install
```

## Development

Run the dev server (includes `next-video` watcher for media syncing):

```bash
pnpm dev
```

Open http://localhost:3000

Entry is under `app/` (App Router). Edit files in `app/` and `components/` — the server reloads automatically.

## Build and Run

```bash
pnpm build
pnpm start
```

## Linting

```bash
pnpm lint
```

## Project Structure

- `app/` – routes, layouts, and pages (App Router)
- `components/` and `components2/` (temporary - will be remove after some time) – UI components and modules
- `lib/` – configuration, hooks, services, and utilities
- `data/` – static data and seeds
- `public/` – static assets (images, icons, videos)
- `styles/` – global styles and Sass utilities

### Assets Policy

- All assets must live under `public/media/`. Do not place assets anywhere else in the repo.
- Use the following structure:
  - `public/media/icons/` – SVGs and icon assets
  - `public/media/images/` – images and illustrations
  - `public/media/videos/` – video files (managed by `next-video`)
- Keep names in kebab-case and follow the naming rules below.

## Media Handling

This project uses `next-video` to manage videos under `public/media/videos`. The watcher runs during `pnpm dev`.

## Contributing

Please read `CONTRIBUTING.md` for commit conventions, branching, PRs, and review process.

### Collaboration Rules

- `dev` is the integration branch. All new features (api integration for example) and bug fixes must target `dev` via pull requests.
- Never push directly to `main`. 
- Open a PR to `dev` only when your feature/fix is complete and ready for review. Use Draft PRs for early feedback; avoid merging WIP.
- Do not push directly to `dev`; always create a PR so reviews and checks can run.

### File Naming Conventions

- Default: kebab-case for files and directories (e.g., `user-profile-card.tsx`, `payment-history.sass`).
- Hooks: PascalCase files starting with `use` (e.g., `useIsServerSide.tsx`, `useValidateForm.ts`).
- Utilities that export only a single function may use camelCase matching the function (e.g., `formatDate.ts`).
- Component names should match their file names (PascalCase in code; kebab-case on disk unless it’s a hook).

## Deployment

The app is compatible with platforms that support Next.js (e.g., Vercel). Build with `pnpm build` and serve with `pnpm start`, or use your platform’s Next.js adapter.

## License

Proprietary — internal use only unless otherwise specified.
