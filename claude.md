> This project was generated from the [Obytes React Native Template](https://github.com/obytes/react-native-template-obytes). Pelote is an Instagram-style Ravelry companion (friends’ project photo feed).

## What: Technology Stack

- **Expo SDK 54** with React Native 0.81.5 - Managed React Native development
- **TypeScript** - Strict type safety throughout
- **Expo Router 6** - File-based routing (like Next.js)
- **TailwindCSS** via Uniwind/Nativewind - Utility-first styling for React Native
- **Zustand** - Lightweight global state management
- **React Query** - Server state and data fetching
- **TanStack Form + Zod** - Type-safe form handling and validation
- **MMKV** - Encrypted local storage
- **Jest + React Testing Library** - Unit testing

## What: Project Structure

```
src/
├── app/              # Expo Router file-based routes (add new routes here)
├── features/         # Feature modules (auth, feed, friends, onboarding, …)
├── components/ui/    # Pre-built UI components (button, input, modal, etc.)
├── lib/              # Utilities (api client, auth, i18n, storage, ravelry/)
├── translations/     # i18n files (en.json, ar.json - add more languages)
└── global.css        # TailwindCSS configuration

Root Files:
├── env.ts           # Environment config (CUSTOMIZE bundle IDs, API URLs)
├── app.config.ts    # Expo configuration
└── README.md        # Project-specific documentation
```

## How: Ravelry API (required reading)

**Canonical docs:** [https://www.ravelry.com/api](https://www.ravelry.com/api) (login required). Treat that page as the source of truth for endpoints, params, and response shapes.

**Before adding or changing any Ravelry call:**

1. Confirm the method exists in the [Ravelry API docs](https://www.ravelry.com/api) — do not invent paths from other APIs or guess REST conventions.
2. Implement against the documented path/params/response in `src/lib/ravelry/` (axios client + normalizers).
3. Keep product auth **OAuth2-only** (Bearer). Never put a personal Basic API key in the app path.

**App wiring:**

| Concern | Location |
| --- | --- |
| HTTP client + 401 refresh | `src/lib/api/client.tsx` |
| OAuth authorize / token / refresh | `src/lib/ravelry/oauth.ts` |
| Typed Ravelry helpers | `src/lib/ravelry/api.ts` |
| Base URL | `EXPO_PUBLIC_API_URL` → `https://api.ravelry.com/` |

**Known product constraints (verify against docs when changing):**

- There is **no** people full-text search collection. Resolve people with `GET people/{username}.json`. Designer name search uses `GET designers/search.json` (linked `users` when present).
- Friends (documented paths used in `src/lib/ravelry/api.ts`):
  - List: `GET people/{username}/friends/list.json` → `friendships[]` (keep `id` for destroy)
  - Add: `POST people/{username}/friends/create.json?friend_user_id=`
  - Remove: `POST people/{username}/friends/{friendship_id}/destroy.json` (POST, not DELETE)
  - Activity: `GET people/{username}/friends/activity.json`
- Paths end in `.json`. Prefer documented response roots (`user`, `project`, `designers`, `friendships`, …) when normalizing.
- Scope used by this app includes **`offline`** (refresh token). Redirect URI matches AuthSession (e.g. `pelote://oauth`). The Ravelry developer app must allow **read & write** for friend mutations.

## How: Development Workflow

**Essential Commands:**
```bash
pnpm start              # Start dev server
pnpm ios/android        # Run on platform (native rebuild picks up RAVELRY_CLIENT_SECRET into extra)
pnpm lint               # ESLint check
pnpm type-check         # TypeScript validation
pnpm test               # Run Jest tests
pnpm check-all          # All quality checks
```

**Environment-Specific:**
```bash
pnpm start:preview              # Preview environment
pnpm ios:production             # Production iOS
pnpm build:production:ios       # EAS production build
```

## How: Key Patterns

- **Create features**: New folder in `src/features/[your-feature]/` with screens, components, API hooks
- **Add routes**: Create files in `src/app/` (file-based routing)
- **Forms**: Use TanStack Form + Zod (see `src/features/auth/components/login-form.tsx`)
- **Data fetching**: Use React Query (see `src/features/feed/api.ts`)
- **Ravelry data**: Call helpers in `@/lib/ravelry/api`, not raw axios from feature screens
- **Global state**: Use Zustand (see `src/features/auth/use-auth-store.tsx`)
- **Styling**: NativeWind/Tailwind classes (see `src/components/ui/button.tsx`)
- **Storage**: Use MMKV via `src/lib/storage.tsx` for sensitive data
- **Imports**: Always use `@/` prefix, never relative imports

## How: Essential Rules

- ✅ **DO** consult [Ravelry API docs](https://www.ravelry.com/api) before new/changed API usage
- ✅ **DO** use absolute imports: `@/components/ui/button`
- ✅ **DO** follow feature-based structure: `src/features/[name]/`
- ✅ **DO** use TanStack Form for forms (not react-hook-form)
- ✅ **DO** use MMKV storage for sensitive data (not AsyncStorage)
- ✅ **DO** use EAS Build for production: `pnpm build:production:ios`
- ✅ **DO** prefix client-readable env vars with `EXPO_PUBLIC_*` (never the OAuth client secret)
- ❌ **DO NOT** invent Ravelry endpoints or params that are not in the official docs
- ❌ **DO NOT** use personal Basic API keys in the product path
- ❌ **DO NOT** modify `android/` or `ios/` directly (use Expo config plugins)
