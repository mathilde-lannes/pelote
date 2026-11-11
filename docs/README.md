# Pelote site

Astro + Starlight site for the public landing page and functional specs.

## Local

```bash
pnpm install
pnpm dev
```

Open the printed local URL. With `base: '/pelote'`, routes live under `/pelote/`.

## Build

```bash
pnpm build
pnpm preview
```

## Publish

GitHub Actions workflow `.github/workflows/deploy-docs.yml` builds this package and deploys `dist/` to GitHub Pages.

Public URL: https://mathilde-lannes.github.io/pelote/
