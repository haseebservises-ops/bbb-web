import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/absolute-url";

export default async function NewChat() {
  const res = await fetch(absoluteUrl("/api/threads"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "New chat" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to create thread");
  const data = await res.json();
  redirect(`/chat/${data.thread.id}`);
}
