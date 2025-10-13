import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";

export const metadata: Metadata = {
  title: "Better Bite Buddy",
  description: "AI Coaching that fits your day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen">
            {/* Desktop sidebar */}
            <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64">
              <Sidebar />
            </div>

            {/* Mobile drawer (wraps the same Sidebar) */}
            <MobileSidebar>
              <Sidebar />
            </MobileSidebar>

            {/* Main content */}
            <main className="md:ml-64">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
