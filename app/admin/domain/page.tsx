import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, upsertSettings } from "@/lib/settings";

export default async function DomainSettings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;
  const s = (await getSettings(session.user.id)) ?? {};

  async function save(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;
    await upsertSettings(session.user.id, {
      custom_domain: formData.get("custom_domain")?.toString() ?? null,
    });
  }

  return (
    <form action={save} className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Custom Domain</h1>
      <input name="custom_domain" defaultValue={s.custom_domain ?? ""} placeholder="yourstudio.com" className="border rounded px-3 py-2 w-full"/>
      <button className="px-4 py-2 rounded-xl shadow border">Save</button>
    </form>
  );
}
