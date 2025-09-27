  // components/PickaxeEmbed.tsx
  import { PICKAXE_URL } from "@/lib/env";

  export default function PickaxeEmbed() {
    if (!PICKAXE_URL) {
      return (
        <div className="fixed inset-0 flex items-center justify-center text-sm">
          <div className="max-w-md text-center">
            <div className="mb-2 font-semibold">Missing NEXT_PUBLIC_PICKAXE_URL</div>
            <div className="opacity-70">
              In Vercel, set the iframe <code>src</code> from Pickaxe (Share → Embed) as the value.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0">
        <iframe
          src={PICKAXE_URL}
          title="Better Bite Buddy"
          className="w-full h-full border-0"
          allow="clipboard-write; microphone; camera"
        />
      </div>
    );
  }
