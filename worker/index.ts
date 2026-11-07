// Cloudflare Worker entry. Static pages are served from ./dist by the assets binding;
// this script only handles /api/* (configured with run_worker_first in wrangler.jsonc).

interface Env {
  ASSETS: Fetcher;
  ANTHROPIC_API_KEY?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check. Reports whether the key is set, never its value.
    if (url.pathname === "/api/health") {
      return json({ ok: true, keyConfigured: Boolean(env.ANTHROPIC_API_KEY) });
    }

    // The chat endpoint is built in the next step.
    if (url.pathname === "/api/chat") {
      return json({ error: "The assistant is not switched on yet." }, 503);
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
