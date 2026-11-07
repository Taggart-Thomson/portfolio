// Cloudflare Worker entry. Static pages are served from ./dist by the assets binding;
// this script only handles /api/* (configured with run_worker_first in wrangler.jsonc).
import Anthropic from "@anthropic-ai/sdk";
import { Limiter } from "./limiter";
import { SYSTEM_PROMPT } from "./prompt";
import { retrieve, formatPassage, type Passage } from "./retrieve";

export { Limiter };

interface Env {
  ASSETS: Fetcher;
  LIMITER: DurableObjectNamespace<Limiter>;
  ANTHROPIC_API_KEY?: string;
  CHAT_MODEL: string;
  DAILY_MESSAGE_CAP: string;
  RATE_LIMIT_PER_HOUR: string;
}

// Conversation limits: keep each request small and cheap.
const MAX_QUESTION_CHARS = 500;
const MAX_ANSWER_CHARS = 4000;
const MAX_MESSAGES = 12; // 6 visitor turns, then the visitor starts a new chat
const MAX_OUTPUT_TOKENS = 1200;

const ALLOWED_ORIGINS = ["https://taggartthomson.ca", "https://www.taggartthomson.ca"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

type Turn = { role: "user" | "assistant"; content: string };

function validate(body: unknown): Turn[] | string {
  const msgs = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return "No question was sent.";
  if (msgs.length > MAX_MESSAGES) return "This chat has reached its length limit. Start a new chat to keep going.";
  const out: Turn[] = [];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i] as Partial<Turn>;
    const role = i % 2 === 0 ? "user" : "assistant";
    if (m?.role !== role || typeof m.content !== "string") return "The chat history was malformed.";
    const content = m.content.trim();
    const limit = role === "user" ? MAX_QUESTION_CHARS : MAX_ANSWER_CHARS;
    if (!content) return "The question was empty.";
    if (content.length > limit) return `Questions can be up to ${MAX_QUESTION_CHARS} characters.`;
    out.push({ role, content });
  }
  if (out[out.length - 1].role !== "user") return "The last message must be a question.";
  return out;
}

async function visitorId(ip: string): Promise<string> {
  // Salted with the date, so the hash can't be linked across days or reversed to an IP.
  const data = new TextEncoder().encode(`${ip}|${new Date().toISOString().slice(0, 10)}|ask-taggart`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sources(passages: Passage[]) {
  const seen = new Map<string, string>();
  for (const p of passages) if (p.url !== "/" && !seen.has(p.url)) seen.set(p.url, p.doc);
  return [...seen].slice(0, 3).map(([url, title]) => ({ url, title }));
}

async function chat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Use POST." }, 405);
  const origin = request.headers.get("origin") ?? "";
  const local = new URL(request.url).hostname === "localhost";
  if (!local && !ALLOWED_ORIGINS.includes(origin)) return json({ error: "Not allowed." }, 403);
  if (!env.ANTHROPIC_API_KEY) return json({ error: "The assistant is not set up yet." }, 503);

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "The request was not valid JSON." }, 400); }
  const turns = validate(body);
  if (typeof turns === "string") return json({ error: turns }, 400);

  const limiter = env.LIMITER.get(env.LIMITER.idFromName("global"));
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const limit = await limiter.check(await visitorId(ip), Number(env.RATE_LIMIT_PER_HOUR), Number(env.DAILY_MESSAGE_CAP));
  if (!limit.ok) {
    const error = limit.reason === "daily"
      ? "The assistant has reached its daily limit. The project pages cover the same ground, and email reaches Taggart directly."
      : "You've asked a lot of questions this hour. Try again a little later, or email Taggart directly.";
    return json({ error, limit: limit.reason }, 429);
  }

  // Retrieve on the latest question plus the one before it, so follow-ups ("what about the tests?") still find context.
  const userTurns = turns.filter((t) => t.role === "user").map((t) => t.content);
  const question = userTurns[userTurns.length - 1];
  const passages = retrieve(userTurns.slice(-2).join(" "));
  const context = passages.length
    ? passages.map(formatPassage).join("\n\n")
    : "(No extra passages matched. Use the core facts, or say you don't have that information.)";

  const messages: Anthropic.MessageParam[] = turns.slice(0, -1).map((t) => ({ role: t.role, content: t.content }));
  messages.push({
    role: "user",
    content: `<passages>\n${context}\n</passages>\n\n<question>\n${question}\n</question>`,
  });

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1 });
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const send = (event: string, data: unknown) =>
    writer.write(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

  const run = async () => {
    try {
      await send("sources", sources(passages));
      const stream = client.messages.stream({
        model: env.CHAT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        output_config: { effort: "low" },
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages,
      });
      stream.on("text", (text) => { void send("delta", { text }); });
      const final = await stream.finalMessage();
      // Token counts only (no conversation content), to check caching and cost.
      const u = final.usage;
      console.log(`usage in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0} out=${u.output_tokens}`);
      if (final.stop_reason === "refusal") {
        await send("delta", { text: "I can't help with that one. Ask me about Taggart's work instead." });
      }
      await send("done", {});
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      console.error("chat error", status ?? "", err instanceof Error ? err.message : "");
      await send("error", {
        message: "The assistant hit a problem answering that. Try again in a moment, or email Taggart directly.",
      });
    } finally {
      await writer.close();
    }
  };
  // Keep streaming after the Response is returned.
  ctx.waitUntil(run());

  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check. Reports whether the key is set, never its value.
    if (url.pathname === "/api/health") {
      return json({ ok: true, keyConfigured: Boolean(env.ANTHROPIC_API_KEY), model: env.CHAT_MODEL });
    }
    if (url.pathname === "/api/chat") return chat(request, env, ctx);
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
