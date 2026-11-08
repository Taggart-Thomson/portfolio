// Astro config. Static site for now; the Cloudflare adapter is added with the chat endpoint.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://taggartthomson.ca",
  trailingSlash: "never",
  build: { format: "file" },
  // Renamed 2026-11-08. Keeps any shared links working.
  redirects: { "/projects/ai-career-assistant": "/projects/virtual-program-assistant" },
});
