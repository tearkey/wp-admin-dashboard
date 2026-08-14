# PR Docker previews + Docker self-hosting

Two additions: a GitHub Actions workflow that builds a Docker image for every pull
request and comments the exact command to run that build locally, and a Docker-based
self-hosting setup (Dockerfile, compose example, `.env.example`).

## 1. PR preview workflow

New file `.github/workflows/pr-preview.yml`, triggered on `pull_request`
(`opened`, `synchronize`, `reopened`) and `pull_request` close for cleanup.

Steps:

1. Checkout the PR head.
2. Log in to GitHub Container Registry (GHCR) with the built-in `GITHUB_TOKEN` —
   no third-party secrets needed.
3. Build the image with Buildx and layer caching (`type=gha`), tagging it
   `ghcr.io/<owner>/techtrick-cms:pr-<number>` and `:pr-<number>-<sha>`.
4. Push the image (only for same-repo PRs; fork PRs build without pushing since
   `GITHUB_TOKEN` is read-only there — the job still validates the build).
5. Post or update a single sticky comment on the PR (matched by a hidden marker
   so repeat pushes edit the same comment instead of spamming) containing:
   - image tag and digest
   - `docker run --rm -p 3000:3000 ghcr.io/<owner>/techtrick-cms:pr-<number>`
   - the local preview URL `http://localhost:3000/admin`
   - commit SHA and build time

Permissions on the job: `contents: read`, `packages: write`, `pull-requests: write`.

A second small job on `pull_request: closed` deletes the PR image tag from GHCR
so the registry stays clean.

The existing `ci.yml` (brand check, lint, typecheck, build) is unchanged and keeps
gating merges.

## 2. Dockerfile

Multi-stage, Node 20 Alpine, running the real SSR server:

- **deps stage** — copy `package.json` + `package-lock.json`, `npm ci`.
- **build stage** — copy source, run `npm run build` with `NITRO_PRESET=node-server`
  so Nitro emits a Node server entry instead of the default Cloudflare worker output.
- **runtime stage** — `node:20-alpine`, copy only `.output/`, run as a non-root
  `node` user, `EXPOSE 3000`, `ENV PORT=3000 HOST=0.0.0.0 NODE_ENV=production`,
  `CMD ["node", ".output/server/index.mjs"]`, plus a `HEALTHCHECK` hitting `/admin`.

Also add `.dockerignore` (node_modules, `.output`, `.git`, `.lovable`, logs, editor
files) to keep the build context small.

## 3. docker-compose.yml

Example single-service compose file:

```yaml
services:
  techtrick-cms:
    build: .
    # image: ghcr.io/techtrick/techtrick-cms:latest
    ports: ["3000:3000"]
    env_file: .env
    restart: unless-stopped
```

Commented-out block showing how to sit it behind a reverse proxy (Caddy/Traefik
labels) for TLS, since the app itself does not terminate TLS.

## 4. .env.example

Documents every knob the container reads, with comments and safe defaults:

- `PORT` / `HOST` — server bind (3000 / 0.0.0.0)
- `NODE_ENV` — production
- `NITRO_PRESET` — node-server (build-time; why it is needed)
- A commented "no application secrets are required today — the app ships with mock
  data" note, plus a placeholder `VITE_APP_NAME` showing the `VITE_` prefix rule
  for anything that must reach the browser.

`.env` is added to `.gitignore` (currently only `*.local` is ignored).

## 5. Documentation

README **Self-hosting** section gains a "Docker" subsection: build and run with
Docker, run with compose, pull a PR preview image from GHCR, and a pointer to
`.env.example`. CONTRIBUTING gets one line noting that each PR gets a preview
image comment.

## Assumptions

- The GHCR image name follows the repo (`techtrick/techtrick-cms`) from
  `package.json`; the workflow derives it from `${{ github.repository }}` so a fork
  works unchanged.
- Nitro's `node-server` preset is used for Docker; the Cloudflare target stays the
  default for the platform build. This will be verified during implementation and
  the Dockerfile adjusted if the preset name differs for the pinned Nitro beta.

## Verification

Build the image locally, run it, and curl `/admin` for a 200; run
`npm run check:brand` and the typecheck so the new files pass CI. Workflow YAML is
validated by parsing it; the PR comment path can only be exercised on a real PR.
