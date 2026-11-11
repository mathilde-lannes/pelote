---
title: Feed
description: Home feed of friends’ project activity on Pelote.
---

**Status:** current

## Goal

Show an Instagram-style, photo-first Home feed of activity from people the signed-in user follows on Ravelry.

## User

A signed-in Ravelry user who has (or will add) friends and designers.

## Happy path

1. Open the Feed tab.
2. Pelote loads friends’ activity and keeps only Home-eligible items with usable photos (or queued patterns).
3. The user scrolls a vertical list of activity cards, pulls to refresh, and loads more pages as they near the end.
4. Tapping into related UI (avatar / project) can open profiles or project detail routes.

## Rules

- Home includes only normalized types: **project photo**, **stash photo**, and **queued pattern**.
- Favourites and handspun activity stay **off** Home (reserved for later surfaces).
- Project and stash items need a usable photo URL; queued patterns may appear without one.
- Source data is Ravelry `people/{username}/friends/activity.json` (paginated).
- Empty feed prompts the user to find friends and designers.

## Empty and error states

| Situation | Behavior |
| --- | --- |
| Loading (or no user yet) | Spinner and “Loading friends’ activity…” |
| Request failed | “Couldn’t load your feed” with Retry |
| No Home-eligible items | Wordmark + copy to add friends; button to Friends tab |
| Fetching next page | Footer spinner |

## Out of scope

- Publishing or editing projects inside Pelote
- Likes / comments owned by Pelote
- A separate “For you” discovery feed

## Open questions

- **New projects on Home** — Ravelry friends activity does not expose a “new project” activity type (only photo / stash / queue / favorite / handspun). Showing newly created projects likely needs a projects fan-out per friend, with caching and rate-limit care. Tracked in the repo `ROADMAP.md`.
