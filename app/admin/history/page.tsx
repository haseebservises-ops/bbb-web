import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, upsertSettings } from "@/lib/settings";

export default async function HistorySettings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;
  const s = (await getSettings(session.user.id)) ?? { collect_history: true };

  async function save(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;
    await upsertSettings(session.user.id, {
      collect_history: formData.get("collect_history") === "on",
    });
  }

  return (
    <form action={save} className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="collect_history" defaultChecked={s.collect_history !== false}/>
        <span>Collect user history</span>
      </label>
      <div className="text-sm text-neutral-500">When off, messages aren’t stored to the DB.</div>
      <button className="px-4 py-2 rounded-xl shadow border">Save</button>
    </form>
  );
}
