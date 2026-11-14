---
title: Instagram ↔ Ravelry parallel
description: Reference lists of Instagram screens and Ravelry API surfaces, plus a mapping for Pelote’s layout.
---

**Status:** research reference

Use this page when deciding which Ravelry capabilities belong in an Instagram-shaped information architecture.

## Instagram screens (reference)

- **Home**
  - For You
  - Following
  - Activity / notifications
  - Add content
- **Reels**
- **Messaging**
  - Write message
  - Conversations
- **Search**
  - Search bar
  - Saved posts
  - Filters
  - Posts
- **Profile**
  - Profile picture
  - Stats
  - Bio
  - Settings
  - Content
    - Posts
    - Reels
    - Tagged
- **Post insights**
  - Picture
  - Stats
  - Overview
  - Engagement
  - Audience

### Add content (Instagram)

Bottom tabs switch content type: **post**, **story**, **reel**, **live**. Default is **reel**.

## Ravelry API surfaces (reference)

Based on documented Ravelry API collections / domains:

- Search
- Bundles and bundled items
- Shopping cart
- Comments
- Designers
- Drafts
- Favorites
- Fiber
- Forums and forum posts
- Friends (add, list, activities)
- Library
- Messages
- Needles
- Packs
- Patterns
- Products
- Projects
- Queue
- Saved searches
- Shops
- Stash
- Yarns

## What to keep on Ravelry

- Friends activities
- Patterns
  - Highlights (GET `/patterns/highlights.json`)
  - Hot right now (GET `/patterns/search.json?sort=recently_popular`)
  - Most recent (GET `/patterns/search.json?sort=recently-added`)
  - Popular (GET `/patterns/search.json?sort=popularity`)
- Projects
- Designers
- Yarns
- Products

## Mapping: what fits the Instagram layout

| Instagram surface | Strong Ravelry match | Notes |
| --- | --- | --- |
| Home → Following | **Friends activities** | |
| Home → For You | **Pattern highlights** | GET `/patterns/highlights.json` |
| Home → Activity / notifications | - | |
| Home → Add content | **Projects**, **Drafts**, **Stash**, **Queue** | Create/update craft content, not media formats. |
| Messaging → Conversations / write | **Messages** | |
| Search → Search bar | **Search**, **Patterns**, **Designers**, **Yarns** | |
| Search → Saved posts | **Favorites**, **Saved searches** | |
| Search → Filters | **Saved searches** (+ search query params) | Filters as persisted or ad-hoc search constraints. |
| Search → Posts (results grid) | **Patterns hot right now** | Photo/result grids of craft objects instead of IG posts. |
| Profile → Picture / bio / stats | **People / user** (via friends & related user payloads), project counts, friend counts | Profile chrome from the signed-in (or viewed) user. |
| Profile → Settings | App settings (not a Ravelry collection) | Local / product settings; Ravelry account settings stay on Ravelry. |
| Profile → Content → Posts | **Projects**| Primary owned content grid. |
| Profile → Content → Reels | **Library** | |
| Profile → Content → Tagged | **Stash**  |  |
| Post insights → Picture | **Projects** (photos), **Stash** (photos), **Patterns** (photos) | Detail hero media. |
| Post insights → Overview / stats | **Projects**, **Patterns**, **Queue**, **Stash** item detail | Status, pattern, yarn, dates, notes — craft metadata, not IG analytics. |
| Post insights → Engagement | **Comments**, **Favorites** | Comments and favorite counts/lists where available. |
| Post insights → Audience | — | No creator audience / reach analytics in the listed API surfaces. |

## Ravelry items with weak or no Instagram slot

These are real product surfaces on Ravelry but do not map cleanly onto Instagram’s IA. They need Pelote-native placements (extra tabs, profile sections, commerce flows, etc.) if used:

| Ravelry surface | Why it doesn’t fit Instagram |
| --- | --- |
| Shopping cart | Commerce checkout, not social IA |
| Packs | Inventory / kit concept |
| Needles | Tool inventory |
| Fiber | Material inventory (related to stash, not posts) |
| Forums / forum posts | Forum UX, not IG feed / DMs / profile grid |
| Shops | Marketplace directory |
| Products | Commerce catalog (search results only if forced) |
| Yarns | Catalog / stash companion (searchable; not a tab) |
| Drafts | Creator WIP before publish (maps only under Add content) |
| Bundles / bundled items | Curated sets — closer to collections than IG albums |
| Stash | Personal inventory; partial Home/profile photo use only |
| Queue | Personal to-knit list; partial “saved” / Home use |
| Library | Owned patterns shelf |
| Saved searches | Utility under Search filters, not a top-level IG screen |

## Suggested IA takeaway for Pelote

Keep Instagram’s **tab skeleton** (Home, Search, Add, Messages, Profile) and map Ravelry where the metaphor holds:

1. **Home** ← friends activities (+ optional discovery later).
2. **Search** ← patterns / designers / yarns / shops / products + favorites / queue / library / saved searches.
3. **Add** ← projects (and maybe stash / queue / favorite actions), ignoring story / reel / live.
4. **Messages** ← messages.
5. **Profile** ← user + projects (+ stash as secondary content).
6. **Detail / insights** ← project or pattern detail with comments & favorites; skip audience analytics.

Leave forums, cart, needles, packs, and most commerce as non-Instagram extensions unless product goals explicitly expand beyond the companion feed.
