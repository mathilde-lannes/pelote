---
title: Auth
description: Sign-in, onboarding, and OAuth2 session rules for Pelote.
---

**Status:** current

## Goal

Let a Ravelry user open Pelote with their own account, without embedding a personal Basic API key in the app.

## User

Anyone with a Ravelry account who installs Pelote.

## Happy path

1. First launch shows onboarding (“Friends’ knitting, photo-first”), then Continue.
2. Login offers **Sign in with Ravelry** (OAuth2 Authorization Code + PKCE-style AuthSession flow).
3. After consent, Pelote exchanges the code for tokens (including refresh via the `offline` scope), loads the current user, and lands on the Home feed tabs.
4. Later launches reuse the stored session until the user logs out or refresh fails.

## Rules

- Product auth is **OAuth2-only**. Never ship a personal Ravelry Basic API key in shared, preview, or store builds.
- Required scope includes **`offline`** so the session can refresh.
- Redirect URI must match AuthSession (e.g. `pelote://oauth`) and the Ravelry developer app settings.
- Missing client credentials show an error on the login screen instead of starting OAuth.
- First-time users see onboarding before login; returning users skip it.

## Empty and error states

| Situation | Behavior |
| --- | --- |
| User cancels or dismisses the OAuth sheet | Stay on login; no error toast required |
| OAuth or token exchange fails | Show the error message on login |
| Tokens saved but current-user fetch fails | Signed in, but show that the Ravelry profile could not load |
| Auth status still idle | Hold the tab shell blank until status resolves |
| Signed out | Redirect to `/login` |
| First time | Redirect to `/onboarding` |

## Out of scope

- Email/password accounts owned by Pelote
- Basic API key login for end users
- Account deletion inside Pelote (managed on Ravelry)

## Open questions

- None recorded.
