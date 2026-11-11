---
title: Friends
description: Find, add, and remove Ravelry friends and designers in Pelote.
---

**Status:** current

## Goal

Let the user manage who fills the Home feed by listing current friends and looking up Ravelry people or designers to follow.

## User

A signed-in Ravelry user.

## Happy path

1. Open the Friends tab (“Friends & designers”).
2. See the current friends list from Ravelry.
3. Type a Ravelry username or designer name; after a short debounce, search results appear.
4. Add a person → friendship is created on Ravelry; friends list and feed queries refresh.
5. Remove a friend → friendship is destroyed by `friendship_id`; lists refresh.

## Rules

- There is **no** Ravelry people full-text search collection. Resolve people with `GET people/{username}.json`. Designer name search uses `GET designers/search.json` (linked users when present).
- List friends: `GET people/{username}/friends/list.json` → keep friendship `id` for destroy.
- Add: `POST people/{username}/friends/create.json?friend_user_id=`
- Remove: `POST people/{username}/friends/{friendship_id}/destroy.json` (POST, not DELETE).
- The Ravelry developer app must allow **read & write** for friend mutations.
- Search input is trimmed and debounced (~300ms).

## Empty and error states

| Situation | Behavior |
| --- | --- |
| Loading friends or search | Centered spinner |
| No friends and not searching | “No friends yet…” copy |
| Add/remove fails (incl. 401/403) | Flash message; write failures hint at read/write app permissions |
| Friendship id missing on remove | Flash message that the friendship could not be found |

## Out of scope

- Following without a Ravelry friendship
- Bulk import of friends
- Blocking or muting outside Ravelry’s friend model

## Open questions

- None recorded.
