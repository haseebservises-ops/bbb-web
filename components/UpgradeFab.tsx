"use client";

export default function UpgradeFab() {
  const portal = process.env.NEXT_PUBLIC_PICKAXE_PORTAL_URL;
  return (
    <button
      onClick={() => {
        if (portal) {
          window.open(portal, "_blank", "noopener,noreferrer");
        } else {
          const el = Array.from(document.querySelectorAll("a,button")).find(n =>
            /log in|sign up|upgrade/i.test(n.textContent || "")
          ) as HTMLElement | undefined;
          el?.click();
        }
      }}
      className="fixed bottom-5 right-5 z-[60] rounded-full px-5 py-3 font-bold shadow-xl bg-violet-600 text-white hover:brightness-110"
    >
      Upgrade
    </button>
  );
}
