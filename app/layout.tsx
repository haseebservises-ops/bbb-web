// app/layout.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import UserMenu from "./components/UserMenu";

// Your favicon (remote is fine)
const FAVICON =
  "https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png";

export const metadata: Metadata = {
  // set this to your final domain later (ok to leave as vercel.app for now)
  metadataBase: new URL("https://bbb-web-five.vercel.app"),
  title: {
    default: "Better Bite Buddy",
    template: "%s · Better Bite Buddy",
  },
  description: "AI Coaching that fits your day.",
  icons: { icon: FAVICON, shortcut: FAVICON, apple: FAVICON },
  openGraph: {
    title: "Better Bite Buddy",
    description: "AI Coaching that fits your day.",
    type: "website",
    images: [{ url: FAVICON, width: 512, height: 512, alt: "Better Bite Buddy" }],
  },
  twitter: {
    card: "summary",
    title: "Better Bite Buddy",
    description: "AI Coaching that fits your day.",
    images: [FAVICON],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Mobile address bar color (updated by ThemeToggle too) */}
        <meta name="theme-color" content="#0b1422" />
        {/* Help the UA pick native control styling */}
        <meta name="color-scheme" content="light dark" />
        {/* Favicon fallback link (metadata handles it too) */}
        <link rel="icon" href={FAVICON} />
        {/* Set theme ASAP, before any UI paints (prevents flash) */}
        <Script id="bbb-theme-init" strategy="beforeInteractive">
          {`(function () {
            try {
              var KEY='bbb_theme';
              var t = localStorage.getItem(KEY);
              if(!t){ t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
              document.documentElement.setAttribute('data-theme', t);
            } catch (e) {}
          })();`}
        </Script>
      </head>
      <body className="min-h-dvh">
        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b"
          style={{
            borderColor: "var(--bbb-lines)",
            background: "linear-gradient(180deg, rgba(8,12,22,.08), rgba(8,12,22,.03))",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="Better Bite Buddy home">
              <Image
                src={FAVICON}
                alt="BBB"
                width={40}
                height={40}
                priority
                className="rounded-lg"
              />
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-tight">Better Bite Buddy</div>
                <div className="text-xs" style={{ color: "var(--bbb-ink-dim)" }}>
                  Mindset × Nutrition × Tiny wins
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/upgrade" className="btn btn-ghost">Upgrade: Starter</Link>
              <Link href="/upgrade" className="btn btn-primary">Upgrade: Pro</Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

        {/* Footer */}
        <footer className="mt-16 border-t" style={{ borderColor: "var(--bbb-lines)" }}>
          <div className="mx-auto max-w-7xl px-4 py-6 text-xs" style={{ color: "var(--bbb-ink-dim)" }}>
            © {new Date().getFullYear()} Better Bite Buddy. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
