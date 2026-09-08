/**
 * Data provider for everything that lives on your hosting panel (media,
 * database tools, file cleanup, cache, security settings).
 *
 * Two implementations behind one shape:
 *  - **mock** — deterministic sample data, used when no hosting API is set up.
 *  - **http** — live REST calls, used when CMS_API_BASE_URL + CMS_API_TOKEN are set.
 *
 * Every helper here is only ever called from inside a server-function handler,
 * so the credentials are read at call time and never reach the browser.
 * See docs/api-contract.md for the endpoints the hosting side must expose.
 */

export interface ProviderMeta {
  /** false when the hosting API is not configured — screens show sample data. */
  connected: boolean;
  source: "mock" | "http";
  message?: string;
}

export interface ProviderResult<T> extends ProviderMeta {
  data: T;
}

function credentials() {
  const baseUrl = process.env["CMS_API_BASE_URL"];
  const token = process.env["CMS_API_TOKEN"];
  return baseUrl && token ? { baseUrl: baseUrl.replace(/\/$/, ""), token } : null;
}

export function isHostingConfigured(): boolean {
  return credentials() !== null;
}

/**
 * Call the hosting API. Returns `null` when it is not configured so callers can
 * fall back to sample data instead of failing the screen.
 */
export async function hostingRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ProviderResult<T> | null> {
  const creds = credentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        authorization: `Bearer ${creds.token}`,
        "content-type": "application/json",
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
    if (!res.ok) {
      return {
        connected: false,
        source: "http",
        message: `Hosting API returned ${res.status}.`,
        data: undefined as T,
      };
    }
    return { connected: true, source: "http", data: (await res.json()) as T };
  } catch {
    return {
      connected: false,
      source: "http",
      message: "Could not reach the hosting API.",
      data: undefined as T,
    };
  }
}

export function mock<T>(
  data: T,
  message = "Sample data — hosting API not connected.",
): ProviderResult<T> {
  return { connected: false, source: "mock", message, data };
}
