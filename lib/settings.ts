// lib/settings.ts
import { pool } from "@/lib/db";

export type StudioSettings = {
  user_id: string;

  // existing fields
  studio_name: string | null;
  profile_image_url: string | null;
  language: string | null;
  mail_handler: string | null;
  collect_history: boolean;
  custom_domain: string | null;
  code_header: string | null;
  code_footer: string | null;
  code_confirm_header: string | null;
  code_confirm_footer: string | null;

  // ACCESS tab fields
  site_visibility: "public" | "private";
  stripe_account_id: string | null;
  collect_tax_id: boolean;
  collect_billing_address: boolean;
  currency: string | null;

  upgrade_target: "none" | "pricing" | "home" | "external";
  upgrade_link_text: string | null;
  upgrade_custom_message: string | null;
  upgrade_external_url: string | null;

  denied_title: string | null;
  denied_body: string | null;

  guests_free_credits: number | null;
  guests_tools_scope: "unlocked" | "all";

  login_email_password: boolean;
  login_google: boolean;

  updated_at?: Date;
};

export async function getSettings(userId: string) {
  const { rows } = await pool.query("SELECT * FROM studio_settings WHERE user_id=$1", [userId]);
  return (rows[0] ?? null) as StudioSettings | null;
}

export async function upsertSettings(userId: string, patch: Partial<StudioSettings>) {
  const cols = Object.keys(patch);
  const vals = Object.values(patch);
  if (!cols.length) return await getSettings(userId);

  const sets = cols.map((c, i) => `${c}=$${i + 2}`).join(", ");
  await pool.query(
    `
    INSERT INTO studio_settings (user_id, ${cols.join(", ")})
    VALUES ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")})
    ON CONFLICT (user_id) DO UPDATE SET ${sets}, updated_at=now()
    `,
    [userId, ...vals],
  );
  return await getSettings(userId);
}

// Optional helper for products list in Access tab
export type ProductRow = {
  id: string; user_id: string; name: string; price_cents: number; currency: string; active: boolean;
};
export async function getProducts(userId: string) {
  try {
    const { rows } = await pool.query<ProductRow>(
      "SELECT id, user_id, name, price_cents, currency, active FROM products WHERE user_id=$1 ORDER BY name",
      [userId],
    );
    return rows;
  } catch {
    return [];
  }
}
