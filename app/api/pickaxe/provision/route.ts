// app/api/pickaxe/provision/route.ts
import type { NextRequest } from "next/server";

const BASE = "https://api.pickaxe.co/v1";

async function px(path: string, init: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.PICKAXE_API_KEY!}`,
    ...init.headers,
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (init.method === "GET" && res.status === 404) return null;
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// Cache memory IDs by title so you don't need to paste IDs
const memoryIdCache = new Map<string,string>();
async function getMemoryIdByTitle(title: string) {
  if (!title) return null;
  if (memoryIdCache.has(title)) return memoryIdCache.get(title)!;
  const list = await px(`/studio/memory/list?skip=0&take=100`, { method: "GET" }) as any;
  const all = Array.isArray(list?.memories) ? list.memories : (list?.data || list || []);
  const found = all.find((m: any) => (m.memory || m.title) === title);
  if (found?.id) { memoryIdCache.set(title, found.id); return found.id; }
  return null;
}

// Light normalization
function normArch(v?: string){
  const t=(v||"").toLowerCase();
  if (!t) return "";
  if (t.includes("exec") || t.includes("burn")) return "exec";
  if (t.includes("yo") || t.includes("ozemp")) return "yo_yo_ozempic";
  if (t.includes("long")) return "longevity_seeker";
  return t.replace(/\s+/g,"_");
}
function normGoals(v:any){
  const arr = Array.isArray(v) ? v : String(v||"").split(/[,\s]+/);
  return arr.map(String).map(s=>s.trim().toLowerCase()).filter(Boolean).map(g =>
    g.replace(/fat-?loss|lose[_\s]?weight/,"fat_loss")
     .replace(/metab.*/,"metabolic")
     .replace(/clar.*/,"clarity")
     .replace(/\s+/g,"_")
  );
}

export async function POST(req: NextRequest){
  try{
    const secret = req.headers.get("x-bbb-secret");
    if (secret !== process.env.PICKAXE_PROVISION_SECRET) {
      return new Response(JSON.stringify({ ok:false, error:"unauthorized" }), { status:401 });
    }

    const {
      email, firstName, lastName,
      archetype, goals, height_cm, weight_kg,
      productId, sendInvite = true
    } = await req.json();

    if(!email){
      return new Response(JSON.stringify({ ok:false, error:"email is required" }), { status:400 });
    }

    const chosenProduct = productId || process.env.PICKAXE_DEFAULT_PRODUCT_ID;
    if (!chosenProduct){
      return new Response(JSON.stringify({ ok:false, error:"productId missing (env or body)" }), { status:400 });
    }

    // 1) Create/update user + attach product
    const enc = encodeURIComponent(email);
    const existing = await px(`/studio/user/${enc}`, { method:"GET" }) as any;

    if(!existing){
      await px(`/studio/user/create`, {
        method:"POST",
        body: JSON.stringify({
          email,
          name: [firstName,lastName].filter(Boolean).join(" "),
          products: [chosenProduct],
          isEmailVerified:false
        })
      });
      if (sendInvite){
        await px(`/studio/user/invite`, {
          method:"POST",
          body: JSON.stringify({ emails:[email], productIds:[chosenProduct] })
        });
      }
    }else{
      const products = Array.from(new Set([...(existing.products||[]), chosenProduct]));
      await px(`/studio/user/${enc}`, {
        method:"PATCH",
        body: JSON.stringify({ data: { products } })
      });
    }

    // 2) Write memories by TITLE (no IDs needed)
    const TITLES = {
      profileJson: "BBB: primary_focus + archetype + goals (slugs only)",
      archetype:   "Store archetype for routing",
    };
    const profileId = await getMemoryIdByTitle(TITLES.profileJson);
    const archId    = await getMemoryIdByTitle(TITLES.archetype);

    const archSlug  = normArch(archetype);
    const goalSlugs = normGoals(goals);
    const profile   = {
      primary_focus: goalSlugs[0] || "",
      goals: goalSlugs,
      archetype: archSlug,
      height_cm: Number.isFinite(+height_cm) ? +height_cm : undefined,
      weight_kg: Number.isFinite(+weight_kg) ? +weight_kg : undefined,
    };

    const updates = [
      profileId && { id: profileId, value: JSON.stringify(profile) },
      archId    && { id: archId, value: archSlug }
    ].filter(Boolean) as Array<{id:string,value:string}>;

    await Promise.all(updates.map(u =>
      px(`/studio/memory/user/${enc}/${u.id}`, {
        method:"PATCH",
        body: JSON.stringify({ data:{ value: u.value } })
      })
    ));

    return new Response(JSON.stringify({ ok:true }), { status:200 });
  }catch(err:any){
    return new Response(JSON.stringify({ ok:false, error: err.message }), { status:500 });
  }
}
