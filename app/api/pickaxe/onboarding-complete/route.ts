// app/api/pickaxe/onboarding-complete/route.ts
export async function POST(req: Request) {
  try {
    const { email, name, goal, motivation, mealsPerDay, activity, answers, scores, dominant } = await req.json();
    if (!email) return new Response(JSON.stringify({ ok: false, error: "email required" }), { status: 400 });

    const BASE = "https://api.pickaxe.co/v1";
    async function px(path: string, init: RequestInit = {}) {
      const headers = {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.PICKAXE_API_KEY!}`,
        ...init.headers,
      } as Record<string, string>;
      const res = await fetch(`${BASE}${path}`, { ...init, headers });
      if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${path}`);
      return res.status === 204 ? null : res.json();
    }

    // 1) Ensure user exists (and attach your default free plan if you want)
    const defaultProduct = process.env.PICKAXE_DEFAULT_PRODUCT_ID || ""; // Starter Free
    await px(`/studio/user/create`, {
      method: "POST",
      body: JSON.stringify({
        email,
        name: name || "",
        products: [defaultProduct].filter(Boolean),
        isEmailVerified: false,
      }),
    });

    // 2) (Optional) grant onboarding bonus
    if (process.env.PICKAXE_BONUS_PRODUCT_ID) {
      await px(`/studio/memberships/grant`, {
        method: "POST",
        body: JSON.stringify({
          studioId: process.env.PICKAXE_STUDIO_ID || "",
          userEmail: email,
          productId: process.env.PICKAXE_BONUS_PRODUCT_ID,
        }),
      });
    }

    // 3) Upsert memories by title
    const TITLES = {
      profileJson: "BBB: primary_focus + archetype + goals (slugs only)",
      archetype: "Store archetype for routing",
    } as const;

    const memCache = new Map<string, string>();
    async function getMemoryIdByTitle(title: string) {
      if (memCache.has(title)) return memCache.get(title)!;
      const list = (await px(`/studio/memory/list?skip=0&take=100`, { method: "GET" })) as any;
      const items = Array.isArray(list?.memories) ? list.memories : list?.data || list || [];
      const found = items.find((m: any) => (m.memory || m.title) === title);
      if (!found?.id) throw new Error(`Memory not found by title: ${title}`);
      memCache.set(title, found.id);
      return found.id;
    }

    const encEmail = encodeURIComponent(email);

    // Merge into the JSON memory
    const profileId = await getMemoryIdByTitle(TITLES.profileJson);
    const profilePayload = {
      primary_focus: goal || "",            // keep the contract simple
      archetype: dominant || "",            // or goal → your choice
      goals: [goal].filter(Boolean),
      onboarding: { motivation, mealsPerDay, activity, answers, scores, dominant },
    };
    await px(`/studio/memory/user/${encEmail}/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { value: JSON.stringify(profilePayload) } }),
    });

    // Keep the archetype slug synced in the second memory
    const archId = await getMemoryIdByTitle(TITLES.archetype);
    await px(`/studio/memory/user/${encEmail}/${archId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { value: (dominant || goal || "") } }),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: e.message || String(e) }), { status: 500 });
  }
}
