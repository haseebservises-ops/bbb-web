// app/page.tsx
"use client";

import PickaxeEmbed from "@/components/PickaxeEmbed";

export default function Page() {
  // Full-height area so the iframe fills the main column next to the sidebar
  return (
    <div className="h-dvh w-full">
      <PickaxeEmbed />
    </div>
  );
}
