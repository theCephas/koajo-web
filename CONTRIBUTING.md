# Git Collaboration Guidelines

## 1. Pull Request Rules

- Keep your branch up-to-date with the latest `dev` before opening a PR.
- Target `dev` for all feature work (including API integrations) and bug fixes.
- Never push directly to `main`. Concern yourself only with the `dev` branch
- Open a PR to `dev` only when the feature/fix is complete and ready for review. Use Draft PRs for early feedback; avoid merging WIP.
- Always request at least one reviewer. Respond to feedback promptly.
- Ensure the PR passes linting, type checks, and tests before requesting merge.
- PR title format: `[#issue-id] <type>(<scope>): <short description>` (example: `[#123] feat(user-profile): add user avatar upload`).

## 2. General Git Workflow

The goal of our Git workflow is to maintain a clean and efficient codebase, promote collaboration, and ensure smooth deployment. The following are the key aspects of our Git collaboration process:

### 1.1 Commit Messages

Commit messages should be concise yet descriptive enough to explain the what and why of the changes.

Follow this format:

```
<type>(<scope>): <short description>

<optional detailed explanation>
```

Types:

- feat: New feature or functionality
- fix: Bug fix
- chore: Routine tasks or updates (e.g., dependency upgrades)
- docs: Documentation changes
- style: Formatting changes (no code functionality affected)
- refactor: Code restructuring (no feature changes)
- test: Adding or modifying tests
- perf: Performance improvements

Examples:

```
feat(authentication): add login functionality with JWT
fix(button): correct color rendering issue on hover
```

### 1.2 Pull Requests

Before creating a pull request (PR), ensure your branch is up-to-date with the latest `dev` branch to avoid unnecessary conflicts.

PR titles should start with the related issue ID (if applicable) and be followed by a short description. Example:

```
[#123] feat(user-profile): add user avatar upload
```

Provide a summary in the PR description explaining:

- What has been changed
- Why the changes are necessary
- Any related issues or bug fixes

### 1.3 Code Review Process

Moved to Section 1: Pull Request Rules.

## 2. Branch Naming Conventions

Branch naming conventions are key to maintaining an organized and easily navigable Git history. The following branch names will be used to keep everything clear and consistent.

### 2.1 Main Branches

- main: This branch contains the stable, production-ready code. Only fully reviewed and tested code should be merged here.
- dev: This is the development branch, the subject of your concern, used for integrating features and bug fixes before merging into `main`.

### 2.2 Feature Branches

Feature branches are used for developing new features. They should be created off of the `dev` branch.

Format:

```
feat/<feature-name>
```

Examples:

```
feat/user-authentication
feat/payment-integration
feat/api-integration
```

### 2.3 Bugfix Branches

Bugfix branches are used for addressing bugs or issues in the codebase.

Format:

```
fix/<bugfix-description>
```

Examples:

```
fix/login-error-handling
fix/navbar-display-issue
```

### 2.4 Hotfix Branches

Hotfix branches are used for urgent fixes that need to go directly into the `main` branch without waiting for the next release cycle.

Format:

```
hotfix/<description>
```

Examples:

```
hotfix/crash-on-load
hotfix/fix-500-error
```

### 2.5 Release Branches

Release branches are used to prepare for production deployment. They are created off the `dev` branch.

Format:

```
release/<version-number>
```

Examples:

```
release/1.0.0
release/2.1.3
```

### 2.6 Other Branches

`chore`: Tasks that are not features or fixes but help maintain the project (e.g., updates to dependencies or configuration).

Format:

```
chore/<description>
```

Examples:

```
chore/dependency-updates
chore/code-cleanup
```

### 2.7 Branch Creation

- Always create branches based on the latest `dev` branch to ensure you're working on the most current codebase.
- Use descriptive names for feature and bugfix branches to clarify the focus of the work being done.

## 3. Merging and Rebasing

### 3.1 Merge Process

- Merge to `dev`: All feature branches should be merged into `dev` via pull requests. This ensures that new features or bug fixes are tested in an integrated environment before they make it to production.
- Merge to `main`: Once `dev` has been tested and is stable, a pull request should be created to merge `dev` into `main`.

#### Collaboration Rules

- `dev` is the integration branch. All new features and bug fixes must be merged into `dev` via pull requests.
- Never push directly to `main`. The `main` branch only receives changes through a PR from `dev` after verification.
- Only open a pull request to `dev` when the feature/fix is complete and ready for review (avoid WIP merges). Use Draft PRs if you need early feedback.
- Do not push directly to `dev` either; always use PRs so reviews and checks can run.

### 3.2 Rebasing (if needed)

If you’re working on a branch for an extended period, periodically rebase your branch onto the latest `dev` to stay up-to-date and avoid conflicts:

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/dev
```

## 4. Git Hooks

To enforce best practices, you may want to consider using Git hooks like Husky to run linting and tests before commits and pushes. This ensures that the code always meets the minimum standards before being shared.

- Pre-commit: Lint and format the code before committing.
- Pre-push: Run tests before pushing code to remote.

## 5. Additional Best Practices

- Always pull the latest code from the `dev` branch before starting work.
- Frequently commit small, logical chunks of work to avoid large, difficult-to-review changes.
- Use issues to track bugs, features, and improvements, and link them to corresponding PRs.
- Avoid force-pushing to shared branches (`main`, `dev`).

## 6. Naming Conventions

### 6.1 File and Directory Names

- Default to kebab-case for files and directories: `user-profile-card.tsx`, `payment-history.sass`.
- Hooks use PascalCase starting with `use`: `useIsServerSide.tsx`, `useValidateForm.ts`.
- Utility files exporting a single function may use camelCase matching the function: `formatDate.ts`, `encryptPayload.ts`.
- Component names should match their file names (PascalCase in code; kebab-case on disk unless it’s a hook file).

### 6.2 Variable, Function, and Type Names

- Variables, functions: camelCase (`userId`, `fetchUserProfile`).
- React components, classes, types, interfaces, and enums: PascalCase (`UserCard`, `ApiResponse`, `UserRole`).
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`).
- Avoid abbreviations; prefer descriptive names. Align variable names with domain terms.

### 6.3 Assets (images, icons, videos)

- Use kebab-case, no spaces: `hero-banner.jpg`, `icon-user.svg`, `landing-illustration.webp`.
- Include density/variant suffixes where relevant: `logo@2x.png`, `thumbnail-dark.png`.
- Prefer modern, optimized formats: images `webp`/`svg` when possible; videos per platform guidance.
- Place assets under appropriate folders in `public/media/` and keep names consistent with usage.

## 7. Project Structure and Assets Policy

- All assets must live under `public/media/`. Do not store assets elsewhere in the repository.
- Required subfolders under `public/media/`:
  - `public/media/icons/` – SVGs and icon assets
  - `public/media/images/` – images and illustrations
  - `public/media/videos/` – video files (managed by `next-video`)
- Enforce naming via Section 6.3 and keep paths consistent across imports.


