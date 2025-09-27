import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProducts, getSettings, upsertSettings, type StudioSettings } from "@/lib/settings";

const CURRENCIES = [
  "USD","EUR","GBP","CAD","AUD","NZD","INR","JPY","SGD","CHF","SEK","NOK","DKK","AED","SAR","ZAR","HKD","MXN","BRL"
];

export default async function AccessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;
  const s = ((await getSettings(session.user.id)) ?? {}) as Partial<StudioSettings>;
  const products = await getProducts(session.user.id);

  async function save(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    const site_visibility = (formData.get("site_visibility") as string) === "private" ? "private" : "public";

    const upgrade_target = (formData.get("upgrade_target") as string) as
      | "none" | "pricing" | "home" | "external";

    const guests_tools_scope = (formData.get("guests_tools_scope") as string) === "all" ? "all" : "unlocked";

    const guests_free_credits_raw = formData.get("guests_free_credits")?.toString() ?? "0";
    const guests_free_credits = guests_free_credits_raw === "∞" ? -1 : parseInt(guests_free_credits_raw || "0", 10);

    await upsertSettings(session.user.id, {
      site_visibility,
      stripe_account_id: formData.get("stripe_account_id")?.toString() || null,
      collect_tax_id: formData.get("collect_tax_id") === "on",
      collect_billing_address: formData.get("collect_billing_address") === "on",
      currency: (formData.get("currency")?.toString() || "USD").toUpperCase(),

      upgrade_target,
      upgrade_link_text: formData.get("upgrade_link_text")?.toString() || null,
      upgrade_custom_message: formData.get("upgrade_custom_message")?.toString() || null,
      upgrade_external_url:
        upgrade_target === "external" ? formData.get("upgrade_external_url")?.toString() || null : null,

      denied_title: formData.get("denied_title")?.toString() || null,
      denied_body: formData.get("denied_body")?.toString() || null,

      guests_free_credits: Number.isFinite(guests_free_credits) ? guests_free_credits : -1,
      guests_tools_scope,

      login_email_password: formData.get("login_email_password") === "on",
      login_google: formData.get("login_google") === "on",
    });
  }

  return (
    <form action={save} className="p-6 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">Access</h1>

      {/* Website Visibility */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Website Visibility</h2>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="site_visibility" value="public" defaultChecked={(s.site_visibility ?? "public") === "public"} />
            Public
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="site_visibility" value="private" defaultChecked={s.site_visibility === "private"} />
            Private (invite only)
          </label>
        </div>
      </section>

      {/* Payments */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm">Stripe Account ID</div>
            <input name="stripe_account_id" defaultValue={s.stripe_account_id ?? ""} className="border rounded px-3 py-2 w-full" placeholder="acct_123..." />
            <div className="mt-2 flex gap-2">
              <a target="_blank" href="https://dashboard.stripe.com/" className="px-3 py-1.5 border rounded-lg shadow-sm inline-block">Stripe Dashboard</a>
              <a target="_blank" href="https://dashboard.stripe.com/connect/accounts/overview" className="px-3 py-1.5 border rounded-lg shadow-sm inline-block">
                Link Account
              </a>
            </div>
          </label>

          <label className="block">
            <div className="text-sm">Currency</div>
            <select name="currency" defaultValue={s.currency ?? "USD"} className="border rounded px-3 py-2 w-full">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="mt-3 space-y-2">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="collect_tax_id" defaultChecked={!!s.collect_tax_id} /> Collect Tax ID (optional)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="collect_billing_address" defaultChecked={!!s.collect_billing_address} /> Collect Billing Address
              </label>
            </div>
          </label>
        </div>
      </section>

      {/* Upgrade Message */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Upgrade Message</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm">Usage Limit Funnel</div>
            <select name="upgrade_target" defaultValue={s.upgrade_target ?? "none"} className="border rounded px-3 py-2 w-full">
              <option value="none">None</option>
              <option value="pricing">Pricing Page</option>
              <option value="home">Home</option>
              <option value="external">External Link</option>
            </select>
            <input
              name="upgrade_external_url"
              placeholder="https://example.com/pricing"
              defaultValue={s.upgrade_external_url ?? ""}
              className="mt-2 border rounded px-3 py-2 w-full"
            />
          </label>
          <label className="block">
            <div className="text-sm">Link Button Text</div>
            <input name="upgrade_link_text" defaultValue={s.upgrade_link_text ?? ""} className="border rounded px-3 py-2 w-full" />
            <div className="text-sm mt-3">Custom Message</div>
            <textarea name="upgrade_custom_message" defaultValue={s.upgrade_custom_message ?? ""} className="border rounded px-3 py-2 w-full h-24" />
          </label>
        </div>
      </section>

      {/* Denied Message */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Denied Message</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm">Title</div>
            <input name="denied_title" defaultValue={s.denied_title ?? ""} className="border rounded px-3 py-2 w-full" />
          </label>
          <label className="block">
            <div className="text-sm">Body</div>
            <textarea name="denied_body" defaultValue={s.denied_body ?? ""} className="border rounded px-3 py-2 w-full h-24" />
          </label>
        </div>
      </section>

      {/* Guest Settings */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Guest Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm">Credits</div>
            <div className="flex gap-2">
              <input name="guests_free_credits" type="number" min={0}
                     defaultValue={typeof s.guests_free_credits === "number" ? s.guests_free_credits : 0}
                     className="border rounded px-3 py-2 w-40" />
              <span className="self-center text-sm text-neutral-500">or</span>
              <button type="button" onClick={()=>{
                const el = document.querySelector<HTMLInputElement>('input[name="guests_free_credits"]');
                if (el) el.value = "∞";
              }} className="px-3 py-2 border rounded-lg shadow-sm">∞</button>
            </div>
            <div className="text-xs text-neutral-500 mt-1">∞ means unlimited (-1 stored)</div>
          </label>

          <label className="block">
            <div className="text-sm">Tools Scope</div>
            <select name="guests_tools_scope" defaultValue={s.guests_tools_scope ?? "unlocked"} className="border rounded px-3 py-2 w-full">
              <option value="unlocked">Unlocked Tools</option>
              <option value="all">All Tools</option>
            </select>
          </label>
        </div>
      </section>

      {/* Products & Paywalls */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Products &amp; Paywalls</h2>
        {products.length === 0 ? (
          <div className="text-sm text-neutral-500">No products yet.</div>
        ) : (
          <ul className="divide-y border rounded-lg">
            {products.map((p) => (
              <li key={p.id} className="p-3 flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-neutral-600">
                  {(p.price_cents / 100).toFixed(2)} {p.currency}
                </div>
              </li>
            ))}
          </ul>
        )}
        <a href="/admin/products" className="px-3 py-2 border rounded-xl shadow-sm inline-block">Add Product</a>
      </section>

      {/* Login Method */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Login Method</h2>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="login_email_password" defaultChecked={s.login_email_password !== false} />
          Email &amp; Password
        </label>
        <div />
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="login_google" defaultChecked={!!s.login_google} />
          Google
        </label>
      </section>

      <button className="px-4 py-2 rounded-xl shadow border">Save Changes</button>
    </form>
  );
}
