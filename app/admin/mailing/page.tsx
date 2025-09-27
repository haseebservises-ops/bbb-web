import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, upsertSettings } from "@/lib/settings";

export default async function Mailing() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;
  const s = (await getSettings(session.user.id)) ?? {};

  async function save(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;
    await upsertSettings(session.user.id, {
      mail_handler: formData.get("mail_handler")?.toString() ?? null,
    });
  }

  return (
    <form action={save} className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Mail Handler</h1>
      <input name="mail_handler" defaultValue={s.mail_handler ?? ""} placeholder="e.g., support@yourstudio.com" className="border rounded px-3 py-2 w-full"/>
      <button className="px-4 py-2 rounded-xl shadow border">Save</button>
    </form>
  );
}
