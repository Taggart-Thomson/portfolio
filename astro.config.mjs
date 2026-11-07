// Astro config. Static site for now; the Cloudflare adapter is added with the chat endpoint.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://taggartthomson.ca",
  trailingSlash: "never",
  build: { format: "file" },
});
