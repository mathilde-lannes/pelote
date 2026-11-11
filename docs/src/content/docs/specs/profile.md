---
title: Profile
description: Public Ravelry profile grid and vertical project feed in Pelote.
---

**Status:** current

## Goal

Show a maker’s public Ravelry presence as an Instagram-style profile grid, then a vertical feed of that user’s projects.

## User

A signed-in user browsing their own or another person’s public projects.

## Happy path

1. Open `/user/{username}` (e.g. from feed or friends).
2. See avatar, username, about/first name when present, and project count.
3. Browse a 3-column project photo grid.
4. Tap a tile → open `/user/{username}/feed/{projectId}` to scroll that user’s projects vertically starting at the tapped post.

## Rules

- Profile data comes from Ravelry person + projects list helpers (not invented endpoints).
- Grid tiles prefer the best available project photo; projects without photos show the project name on a placeholder.
- Project count reflects Ravelry’s total when available, not only the currently loaded page.
- Back navigation returns through the user profile layout stack.

## Empty and error states

| Situation | Behavior |
| --- | --- |
| Missing username param | “Missing username” |
| Loading person/projects | Spinner |
| Person request failed | “Couldn’t load this profile.” |
| No public projects | “No public projects yet.” |

## Out of scope

- Editing bio, avatar, or projects inside Pelote
- Private project visibility beyond what Ravelry returns to the authed user
- Stories / highlights

## Open questions

- None recorded.
