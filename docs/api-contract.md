# Hosting API contract

Techtrick CMS talks to your own hosting over HTTPS. All calls are made
server-side from `src/lib/cms/provider.ts` using two environment variables:

| Variable           | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `CMS_API_BASE_URL` | Base URL of your API, e.g. `https://example.com/cms-api` |
| `CMS_API_TOKEN`    | Bearer token sent as `Authorization: Bearer …`           |

When either is missing every screen falls back to sample data and shows a
**Not connected** notice; nothing is written.

Requests are `GET` or `POST` with a JSON body. Every response must be:

```json
{ "data": <payload> }
```

Non-2xx responses are treated as "not connected" and the screen falls back to
sample data with the error message shown.

## Endpoints

### Security

| Method | Path                 | Body / Response                                                                                    |
| ------ | -------------------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/security/posture`  | `{ score, checks: [{id,label,status,detail}], events: [{id,at,type,detail,ip}], controls: {...} }` |
| POST   | `/security/controls` | body = controls object (rate limiting, 2FA, IP allow/deny, header toggles)                         |

### Optimizer

| Method | Path                         | Body / Response                                             |
| ------ | ---------------------------- | ----------------------------------------------------------- |
| GET    | `/optimizer/images`          | `ImageIssue[]` — `{ path, bytes, width, height, reason }`   |
| POST   | `/optimizer/images/convert`  | `{ paths[], dryRun }` → `{ converted, savedBytes }`         |
| GET    | `/optimizer/database/tables` | `DbTable[]` — `{ name, rows, bytes, overheadBytes }`        |
| POST   | `/optimizer/database/run`    | `{ action, tables[], dryRun }` → `{ affected, freedBytes }` |
| GET    | `/optimizer/files`           | `CleanupItem[]` — `{ path, bytes, kind }`                   |
| POST   | `/optimizer/files/clean`     | `{ paths[], dryRun }` → `{ removed, freedBytes }`           |
| POST   | `/optimizer/cache/purge`     | `{ urls[] }` → `{ purged }`                                 |

`dryRun: true` must report what _would_ change and modify nothing.

## Third-party APIs

These are called directly, not through your hosting:

| Secret                 | Used by                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `PAGESPEED_API_KEY`    | Google PageSpeed Insights v5 (optional; avoids rate limits)         |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API v4 — zone settings, rulesets, analytics, cache purge |
| `CLOUDFLARE_ZONE_ID`   | The zone the admin manages                                          |

Cloudflare credentials are read inside server-function handlers only and are
never returned to the browser.

## Security expectations for your implementation

- Verify the bearer token on every request.
- Enforce role checks server-side; the admin UI gating is convenience only.
- Never return credentials or secrets in any payload.
