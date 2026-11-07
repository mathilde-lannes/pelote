# Pelote

Cosy autumn Ravelry companion — Instagram-style friends activity feed.

Pelote connects to Ravelry with **multi-user OAuth2 only**. Personal Basic API keys are never used for shared, preview, or store builds.

## Stack

Expo (Router) · TypeScript · Uniwind / Tailwind (Obytes template) · TanStack Query · Zustand · Expo Secure Store · EAS · GitHub Actions

## Run locally

```bash
pnpm install
cp .env.example .env   # demo mode works with blank OAuth client id
pnpm start
```

Then press `i` / `a` for simulator, or scan the QR with Expo Go / a dev client.

### Demo mode

With `EXPO_PUBLIC_ENABLE_DEMO_MODE=true` (default when no client id is set in development), the login screen offers **Browse demo feed**. Demo data is clearly labeled and never hits the Ravelry API.

### Real OAuth

1. Create an app in the [Ravelry developer portal](https://www.ravelry.com/pro/developer).
2. Set redirect URI to your AuthSession callback, e.g. `pelote://oauth` (scheme `pelote`, path `oauth`). For Expo Go, also add the Expo auth proxy redirect AuthSession prints at runtime.
3. Request scope **`offline`** (refresh token).
4. Put credentials in `.env` (local) or EAS Secrets (builds):

| Variable | Where | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_RAVELRY_CLIENT_ID` | `.env` / EAS env | Public client id |
| `RAVELRY_CLIENT_SECRET` | `.env` / EAS secret | Never commit; injected via `app.config` `extra` |
| `EXPO_TOKEN` | GitHub Actions secret | EAS CI builds |
| `EAS_PROJECT_ID` / `EXPO_ACCOUNT_OWNER` | EAS / CI env | Replace placeholders before first store build |

```bash
EXPO_PUBLIC_ENABLE_DEMO_MODE=false
EXPO_PUBLIC_RAVELRY_CLIENT_ID=your_client_id
RAVELRY_CLIENT_SECRET=your_client_secret
pnpm start
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm start` | Expo dev server |
| `pnpm lint` / `pnpm type-check` / `pnpm test` | Quality gates |
| `pnpm build:preview:android` | EAS preview APK |
| `pnpm build:production:ios` | EAS production iOS |

## CI/CD

- **PR → main:** lint (`lint-ts.yml`), type-check, unit tests (`test.yml`)
- **Merge to main:** EAS production build (`eas-build-prod.yml`) — needs `EXPO_TOKEN`
- **Release / manual:** EAS preview/staging (`eas-build-preview.yml`)

## Product slices in this repo

1. Foundation — Obytes scaffold renamed to Pelote, env shell, CI
2. OAuth — AuthSession + Secure Store tokens, refresh on 401, logout, gated tabs, `current_user`
3. Ravelry client — axios bearer wrapper for friends activity, projects, people
4. Feed MVP — photo-first friends activity + project detail (loading / empty / error)
5. Social graph — search/add/remove friends & designers; empty-feed CTA
6. Brand — rust / moss / oat / warm charcoal, Source Serif wordmark, Source Sans UI
7. CI/CD — feature branch → PR checks → main → EAS

## Hard constraints

- No personal Basic API key in the product path
- Secrets stay in env / EAS — never committed
- Production path is OAuth-only; demo is development/demo labeled only
