// app/chat/[id]/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatThread({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<{ role: "user"|"assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/threads/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages.filter((m:any)=>m.role!=="system"));
      }
    })();
  }, [params.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);

    const res = await fetch(`/api/threads/${params.id}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, provider: "openai" }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className="inline-block px-3 py-2 rounded-2xl shadow border max-w-[80%] whitespace-pre-wrap">
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type and hit Enter…"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="px-4 py-2 rounded-xl shadow border">Send</button>
      </div>
    </div>
  );
}
