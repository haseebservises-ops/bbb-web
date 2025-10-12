// app/api/pickaxe/onboarding-complete/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.pickaxe.co/v1";

async function px(path: string, init: RequestInit = {}) {
  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${process.env.PICKAXE_API_KEY!}`,
    ...(init.headers || {}),
  } as Record<string, string>;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${path}`);
  return res.status === 204 ? null : res.json();
}

async function getMemoryIdByTitle(title: string) {
  const list = await px(`/studio/memory/list?skip=0&take=100`, { method: "GET" }) as any;
  const all = Array.isArray(list?.memories) ? list.memories : (list?.data || list || []);
  const found = all.find((m: any) => (m.memory || m.title) === title);
  if (!found?.id) throw new Error(`Memory not found by title: ${title}`);
  return found.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, goal, motivation, mealsPerDay, activity, answers, scores, dominant } = body || {};
    if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

    // 1) Ensure user exists (and attach default product)
    const defaultProduct = process.env.PICKAXE_DEFAULT_PRODUCT_ID;
    await px(`/studio/user/create`, {
      method: "POST",
      body: JSON.stringify({
        email,
        name: name || "",
        products: [defaultProduct].filter(Boolean),
        isEmailVerified: false,
      }),
    });

    // 2) Upsert memories by title
    const profileTitle = "BBB: primary_focus + archetype + goals (slugs only)";
    const routeTitle   = "Store archetype for routing";
    const profileId = await getMemoryIdByTitle(profileTitle);
    const routeId   = await getMemoryIdByTitle(routeTitle);

    const enc = encodeURIComponent(email);

    const profileJson = {
      primary_focus: goal ? (goal === "exec" ? "clarity" : goal === "yo_yo_ozempic" ? "metabolic" : "clarity") : null,
      archetype: dominant || goal || "",
      goals: [goal].filter(Boolean),
      onboarding: {
        motivation,
        meals_per_day: mealsPerDay,
        activity_level: activity,
        answers,
        scores,
        dominant,
        name: name || "",
      },
    };

    await px(`/studio/memory/user/${enc}/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { value: JSON.stringify(profileJson) } }),
    });

    await px(`/studio/memory/user/${enc}/${routeId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { value: (dominant || goal || "") } }),
    });

    // 3) Optional: grant onboarding bonus product
    if (process.env.PICKAXE_BONUS_PRODUCT_ID) {
      const user = await px(`/studio/user/${enc}`, { method: "GET" }) as any;
      const products = Array.from(new Set([...(user?.products || []), process.env.PICKAXE_BONUS_PRODUCT_ID]));
      await px(`/studio/user/${enc}`, { method: "PATCH", body: JSON.stringify({ data: { products } }) });
    }

    // 4) Optional: forward to GHL / Zapier webhook
    if (process.env.GHL_UPDATE_WEBHOOK) {
      await fetch(process.env.GHL_UPDATE_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name, goal, motivation, mealsPerDay, activity, answers, scores, dominant }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("onboarding-complete error", err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
