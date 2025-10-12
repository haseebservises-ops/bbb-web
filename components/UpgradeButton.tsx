export default function UpgradeButton() {
  return (
    <button
      onClick={() => window.open("https://betterbitebuddy.com", "_blank", "noopener,noreferrer")}
      className="fixed bottom-5 right-5 z-40 rounded-full px-5 py-3 font-bold shadow-xl bg-violet-600 text-white hover:brightness-110"
    >
      Upgrade
    </button>
  );
}
