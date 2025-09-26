// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { FEATURES } from "@/lib/env";


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
        {/* No header/footer. App chrome is: left sidebar (non-prod) + main content */}
        <div className="h-dvh w-dvw flex">
          {FEATURES.showSidebar && <Sidebar />}
          <main className={`flex-1 ${FEATURES.showSidebar ? "p-4 md:p-6" : ""}`}>{children}</main>
        </div>
      </body>

    </html>
  );
}
