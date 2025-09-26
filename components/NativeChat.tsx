"use client";
import { useRef, useState } from "react";

export default function NativeChat() {
  const [log, setLog] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = inputRef.current?.value?.trim();
    if (!text || busy) return;
    inputRef.current!.value = "";
    setBusy(true);

    setLog((l) => [...l, `You: ${text}`, "Coach: "]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
    });

    const reader = res.body?.getReader();
    const dec = new TextDecoder();
    let bot = "";

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      bot += dec.decode(value, { stream: true });
      setLog((l) => {
        const copy = [...l];
        copy[copy.length - 1] = `Coach: ${bot}`;
        return copy;
      });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-24px)] max-w-5xl mx-auto p-4">
      <div className="flex-1 overflow-auto rounded-xl border p-4 space-y-2"
           style={{ borderColor: "var(--bbb-lines)" }}>
        {log.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap text-sm">{line}</div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 rounded-lg border px-3 py-2 bg-transparent"
          style={{ borderColor: "var(--bbb-lines)" }}
          placeholder="Ask your coach…"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn btn-primary px-4 py-2 rounded-lg" onClick={send} disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
