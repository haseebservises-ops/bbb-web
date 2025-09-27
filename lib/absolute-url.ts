// lib/absolute-url.ts
// Build an absolute URL without touching `headers()`.
// Uses NEXTAUTH_URL first, then VERCEL_URL, then localhost.
export function absoluteUrl(path: string = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  const fromEnv =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return `${fromEnv}${p}`;
}
