// app/not-found.tsx
import Image from "next/image";
import Link from "next/link";

const FAVICON =
  "https://storage.googleapis.com/msgsndr/ROvsrlVUnHQifEIiaP7S/media/68b8a556bd7b76c153bb1800.png";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="text-center">
        {/* 3D-ish hero tile */}
        <div className="relative mx-auto h-36 w-36 [perspective:1000px]">
          <div
            className="absolute inset-0 rounded-3xl ring-1 ring-white/15 shadow-2xl
                       bg-gradient-to-b from-white/10 to-white/0
                       dark:from-white/5 dark:to-white/0
                       [transform:rotateX(12deg)_rotateY(-10deg)]"
          />
          {/* Soft glow */}
          <div className="absolute -inset-6 blur-2xl opacity-60
                          bg-[conic-gradient(at_50%_50%,#22c55e_0deg,#a78bfa_120deg,#f472b6_240deg,#22c55e_360deg)]" />
          {/* Spinning logo */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="animate-spin" style={{ animationDuration: "14s" }}>
              <Image
                src={FAVICON}
                alt="Better Bite Buddy"
                width={96}
                height={96}
                className="rounded-2xl shadow-xl"
                priority
              />
            </div>
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">404 — Page not found</h1>
        <p className="mt-2 opacity-70">
          No bites here. Try heading back and let your coach serve something better.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/upgrade" className="btn btn-ghost">See plans</Link>
        </div>
      </div>
    </main>
  );
}
