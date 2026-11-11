---
title: Settings
description: Account readout and sign-out for Pelote.
---

**Status:** current

## Goal

Give the signed-in user a simple account and about screen, and a way to log out.

## User

A signed-in Ravelry user.

## Happy path

1. Open the Settings tab.
2. See Account (Ravelry username, Auth = OAuth2) and About (app name, version, environment, Appearance = Dark).
3. Tap **Log out** → session clears and the app returns to login.

## Rules

- Appearance is dark-only in product UI for now.
- Footer copy states that Pelote never ships a personal Ravelry Basic API key; store builds require per-user OAuth2.
- Version and environment come from the app env config.

## Empty and error states

| Situation | Behavior |
| --- | --- |
| Username unavailable | Show “—” for Ravelry user |

## Out of scope

- Theme switcher (light mode)
- Language picker on this screen (i18n may exist elsewhere in the template)
- In-app links to App Store / Play Store until listings exist

## Open questions

- None recorded.
