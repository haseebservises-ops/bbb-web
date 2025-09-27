// lib/absolute-url.ts
// Builds an absolute URL safely in both client and server.
// Order of preference:
//  1) Browser origin (client)
//  2) Request headers (server / edge)
//  3) Environment fallbacks (NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL, VERCEL_URL)
//  4) localhost

export function absoluteUrl(path: string = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;

  // 1) Client (browser)
  if (typeof window !== "undefined") {
    return new URL(p, window.location.origin).toString();
  }

  // Precompute env fallbacks for server/background jobs
  const envBase =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  // 2) Server / Edge — try headers(), but don't import it into client bundles
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } = require("next/headers");
    const h: Headers = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
      return new URL(p, `${proto}://${host}`).toString();
    }
  } catch {
    // no-op: not in a request context or next/headers unavailable here
  }

  // 3) Env fallback
  if (envBase) return new URL(p, envBase).toString();

  // 4) Local dev fallback
  return new URL(p, "http://localhost:3000").toString();
}
