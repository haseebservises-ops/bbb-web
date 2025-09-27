import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, upsertSettings, type StudioSettings } from "@/lib/settings";

export default async function StudioDetails() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;

  const s = ((await getSettings(session.user.id)) ?? {}) as Partial<StudioSettings>;

  async function save(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;
    await upsertSettings(session.user.id, {
      studio_name: formData.get("studio_name")?.toString() ?? null,
      profile_image_url: formData.get("profile_image_url")?.toString() ?? null,
      language: formData.get("language")?.toString() ?? "en",
    });
  }

  return (
    <form action={save} className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Studio Details</h1>
      <label className="block">
        <div className="text-sm">Name</div>
        <input name="studio_name" defaultValue={s.studio_name ?? ""} className="border rounded px-3 py-2 w-full"/>
      </label>
      <label className="block">
        <div className="text-sm">Profile Image URL</div>
        <input name="profile_image_url" defaultValue={s.profile_image_url ?? ""} className="border rounded px-3 py-2 w-full"/>
      </label>
      <label className="block">
        <div className="text-sm">Language (e.g., en, es, fr)</div>
        <input name="language" defaultValue={s.language ?? "en"} className="border rounded px-3 py-2 w-full"/>
      </label>
      <button className="px-4 py-2 rounded-xl shadow border">Save</button>
    </form>
  );
}
