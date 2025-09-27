// app/superadmin/page.tsx
import { IS_PROD } from "@/lib/env";

export default function SuperadminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Superadmin</h1>

      <p className="text-sm text-neutral-600">
        Welcome! This area is visible to superadmins only.
      </p>

      <p className="text-sm text-neutral-600">
        Environment: <b>{IS_PROD ? "Production" : "Preview/Dev"}</b>
      </p>

      <ul className="list-disc ml-5 space-y-1 text-sm">
        <li>Tenants (studios): list, create, suspend</li>
        <li>Feature flags &amp; experiments per tenant</li>
        <li>Usage &amp; spend: aggregate dashboards</li>
        <li>LLM providers &amp; budgets; key rotation</li>
        <li>Knowledge indices health; reindex queue</li>
        <li>Support: “login as user” with audit trail</li>
        <li>Billing plans, coupons, Stripe webhooks</li>
        <li>Security: data retention, PII redaction toggles</li>
        <li>System status &amp; logs</li>
      </ul>
    </div>
  );
}
