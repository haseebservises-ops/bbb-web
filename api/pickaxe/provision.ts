// /api/pickaxe/provision.ts  (Next.js App Router) — or a Cloudflare Worker with tiny tweaks
import type { NextRequest } from "next/server";

const BASE = "https://api.pickaxe.co/v1";

async function px(req: Request, path: string, init: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.PICKAXE_API_KEY!}`,
    ...init.headers,
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  // Treat 404 as null for GETs
  if (init.method === "GET" && res.status === 404) return null;
  if (!res.ok && res.status !== 204) {
    const msg = await res.text();
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email, firstName, lastName,
      productId,                   // e.g. "024635f3-50de-4585-a0c1-12bf70d3082d" (Core Monthly)
      archetype, goals, height_cm, weight_kg,
      sendInvite = true
    } = body;

    if (!email || !productId) {
      return new Response(JSON.stringify({ ok:false, error:"email & productId required" }), { status: 400 });
    }

    // 1) Get or create user
    const user = await px(req, `/studio/user/${encodeURIComponent(email)}`, { method: "GET" });
    if (!user) {
      await px(req, `/studio/user/create`, {
        method: "POST",
        body: JSON.stringify({
          email,
          name: [firstName, lastName].filter(Boolean).join(" "),
          products: [productId],          // attach the plan now
          isEmailVerified: false          // they'll verify / set password in native UI
        })
      });
      if (sendInvite) {
        await px(req, `/studio/user/invite`, {
          method: "POST",
          body: JSON.stringify({ emails: [email], productIds: [productId] })
        });
      }
    } else {
      // ensure product attached
      const products = Array.from(new Set([...(user.products || []), productId]));
      await px(req, `/studio/user/${encodeURIComponent(email)}`, {
        method: "PATCH",
        body: JSON.stringify({ data: { products } })
      });
    }

    // 2) Write user memories (create these memory definitions once in Studio and copy IDs)
    const MEMORY = {
      archetype:   "MEMORY_ID_ARCHETYPE",
      goals:       "MEMORY_ID_GOALS",
      height_cm:   "MEMORY_ID_HEIGHT_CM",
      weight_kg:   "MEMORY_ID_WEIGHT_KG",
    };

    const updates: Array<[string, string | number | null]> = [
      [MEMORY.archetype, archetype || null],
      [MEMORY.goals, Array.isArray(goals) ? goals.join(", ") : (goals || null)],
      [MEMORY.height_cm, height_cm ?? null],
      [MEMORY.weight_kg, weight_kg ?? null],
    ];

    await Promise.all(
      updates
        .filter(([_, v]) => v !== null && v !== undefined && `${v}`.trim() !== "")
        .map(([id, value]) =>
          px(req, `/studio/memory/user/${encodeURIComponent(email)}/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ data: { value: String(value) } })
          })
        )
    );

    return new Response(JSON.stringify({ ok:true }), { status: 200 });

  } catch (err:any) {
    return new Response(JSON.stringify({ ok:false, error: err.message }), { status: 500 });
  }
}
