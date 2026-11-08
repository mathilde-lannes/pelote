# Pelote roadmap

## Feed

- **New projects on Home** — Find a way to show friends’ newly created/published projects in the feed. Ravelry `friends/activity.json` does not expose a “new project” `activity_type_key` (only photo / stash / queue / favorite / handspun). Likely needs a projects fan-out (e.g. recent `projects/{username}/list` per friend) merged into Home, with caching and rate-limit care.
