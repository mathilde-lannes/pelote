# Pelote

Instagram-style Ravelry companion — dark-mode photo feed of friends’ projects.

Pelote connects to Ravelry with **multi-user OAuth2 only**. Personal Basic API keys are never used for shared, preview, or store builds.

## Stack

Expo (Router) · TypeScript · Uniwind / Tailwind (Obytes template) · TanStack Query · Zustand · Expo Secure Store · EAS · GitHub Actions

## Run locally

```bash
pnpm install
cp .env.example .env
pnpm start
```

Then press `i` / `a` for simulator, or scan the QR with Expo Go / a dev client.

### OAuth

1. Create an app in the [Ravelry developer portal](https://www.ravelry.com/pro/developer).
2. Set redirect URI to your AuthSession callback, e.g. `pelote://oauth` (scheme `pelote`, path `oauth`).
3. Request scope **`offline`** (refresh token).
4. Put credentials in `.env` (local) — **not** as `EXPO_PUBLIC_*` for the secret:

| Variable | Where | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_RAVELRY_CLIENT_ID` | `.env` / EAS env | Public client id |
| `RAVELRY_CLIENT_SECRET` | `.env` / EAS Secret | Never commit; copied into `app.config` `extra` at **native/EAS build** time |
| `EXPO_TOKEN` | GitHub Actions secret | EAS CI builds |
| `EAS_PROJECT_ID` / `EXPO_ACCOUNT_OWNER` | `.env`, GitHub Actions secret, and EAS environment | Same Expo project UUID (and account owner) must be present for local CI config evaluation and for the remote EAS build environment. Preview and production builds fail if the project id is missing or not a UUID |

```bash
EXPO_PUBLIC_RAVELRY_CLIENT_ID=your_client_id
RAVELRY_CLIENT_SECRET=your_client_secret
# Secret is baked into the binary — Metro restart is not enough:
pnpm ios
```

This project uses a **dev client** (not Expo Go) because of native modules such as MMKV.

## Ship to production

Checklist before the first store / TestFlight build:

1. **Expo / EAS project**
   - Create the project on [expo.dev](https://expo.dev) and set `EAS_PROJECT_ID` to that project's UUID and `EXPO_ACCOUNT_OWNER` to the Expo account owner.
2. **Ravelry OAuth**
   - Production redirect URI must match the store app scheme, e.g. `pelote://oauth`.
   - Set scope `offline`.
3. **EAS Secrets / environment variables** (project → Secrets / Environment for preview and production)
   - `EAS_PROJECT_ID` — required; `app.config.ts` reads it during config evaluation on the EAS worker (before updates URL / `extra.eas.projectId` are set).
   - `EXPO_ACCOUNT_OWNER` — Expo account owner (defaults to `pelote` in CI if unset).
   - `RAVELRY_CLIENT_SECRET` — required; read by `app.config.ts` into `extra.ravelryClientSecret` during the EAS build.
   - `EXPO_PUBLIC_RAVELRY_CLIENT_ID` — public client id.
4. **CI**
   - GitHub Actions secrets `EXPO_TOKEN` and `EAS_PROJECT_ID` for EAS builds. Use the same project UUID as in the EAS environment so the runner can evaluate `app.config` before the EAS command starts.
5. **Build**
   - Runtime version is always `package.json` `version` (`runtimeVersion.policy: appVersion`). Commit a bump there before any native production build so that version stays available for later `eas update`s.
   - Local cloud: `pnpm build:production:ios` / `pnpm build:production:android`
   - Local machine: `pnpm build:production:ios:local` / `pnpm build:production:android:local` — these run `check:runtime-app-version` first and fail if the version matches the parent commit
   - Or run **New App Version** (bumps `package.json`) and let the GitHub release trigger `eas-build-prod.yml`
   - Or run **EAS Production Build** manually. If that commit did not already change the app version, the workflow bumps it before the native build
6. **Submit**
   - Use EAS Submit / App Store Connect / Play Console as usual after the build finishes.

Note: with on-device token exchange, the client secret is present inside the app binary (via `extra`). For a stricter confidential-client setup later, move the code→token exchange to a backend and keep `RAVELRY_CLIENT_SECRET` only on the server.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm start` | Expo dev server |
| `pnpm ios` | Native rebuild (picks up `RAVELRY_CLIENT_SECRET` into `extra`) |
| `pnpm lint` / `pnpm type-check` / `pnpm test` | Quality gates |
| `pnpm build:preview:android` | EAS preview APK |
| `pnpm build:production:ios` | EAS production iOS |
| `pnpm check:runtime-app-version` | Fail if `package.json` version was not bumped vs the parent commit |
| `pnpm build:production:ios:local` | Local production iOS build after the runtime-version check |

## CI/CD

- **PR → main:** lint (`lint-ts.yml`), type-check, unit tests (`test.yml`)
- **Merge to main:** lint, type-check, and unit tests. A merge does not publish a native production binary
- **New App Version:** bumps `package.json` (runtime version under the `appVersion` policy), tags, and opens a GitHub release. That release runs preview and production EAS builds. `eas.json` `autoIncrement` only bumps the store build number / version code
- **Manual:** EAS preview (`eas-build-preview.yml`) or EAS production (`eas-build-prod.yml`). Production still needs `EXPO_TOKEN` and the EAS secrets above

## Product slices in this repo

1. Foundation — Obytes scaffold renamed to Pelote, env shell, CI
2. OAuth — AuthSession + Secure Store tokens, refresh on 401, logout, gated tabs, `current_user`
3. Ravelry client — axios bearer wrapper for friends activity, projects, people
4. Feed MVP — photo-first friends activity + project detail (loading / empty / error)
5. Social graph — search/add/remove friends & designers; empty-feed CTA
6. Brand — Instagram dark UI (black / white / muted gray), quiet white Pelote wordmark, Source Sans UI
7. CI/CD — feature branch → PR checks → versioned release → EAS

## Hard constraints

- No personal Basic API key in the product path
- Secrets stay in env / EAS — never committed
- Auth is multi-user OAuth2 only
