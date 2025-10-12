import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Better Bite Buddy",
  description: "AI Coaching that fits your day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}




// // app/layout.tsx
// import type { Metadata } from "next";
// import "./globals.css";
// import { Providers } from "./providers";
// import Sidebar from "@/components/Sidebar";

// export const metadata: Metadata = {
//   title: "Better Bite Buddy",
//   description: "AI Coaching that fits your day.",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>
//           <div className="min-h-screen flex">
//             <Sidebar />
//             <main className="flex-1">{children}</main>
//           </div>
//         </Providers>
//       </body>
//     </html>
//   );
// }
// // components/UpgradeButton.tsx
// "use client";

// export default function UpgradeButton() {
//   const portal = process.env.NEXT_PUBLIC_PICKAXE_PORTAL_URL || "https://betterbitebuddy.com";
//   return (
//     <button
//       onClick={() => window.open(portal, "_blank", "noopener,noreferrer")}
//       className="fixed bottom-5 right-5 z-[9999] rounded-full px-5 py-3 font-bold shadow-xl bg-violet-600 text-white hover:brightness-110"
//     >
//       Upgrade
//     </button>
//   );
// }
