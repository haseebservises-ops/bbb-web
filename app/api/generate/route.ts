// app/api/generate/route.ts
export async function POST(req: Request) {
  const { messages = [], profile } = await req.json();

  // read the last message safely (supports .text or .content)
  const lastMsg = messages?.[messages.length - 1] ?? {};
  const last =
    typeof lastMsg === "string"
      ? lastMsg
      : (lastMsg.text ?? lastMsg.content ?? "");

  const score = typeof profile?.score === "number" ? profile.score : 72;

  const demo =
    `Quick take: fuel is about ${score}/100. ` +
    `Add ~25–30g lean protein and swap a refined carb for a veg/whole-grain to nudge it up. ` +
    `For “${String(last).slice(0, 80)}…”, try the “make this higher-fuel” tweak.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let i = 0;
      const id = setInterval(() => {
        const chunk = demo.slice(i, i + 2);
        controller.enqueue(encoder.encode(chunk));
        i += 2;
        if (i >= demo.length) {
          clearInterval(id);
          controller.close();
        }
      }, 16);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
