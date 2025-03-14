// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? "starters-simple-cms-nextjs.vercel.app"
    : "http://localhost:4321",
  integrations: [react()],
  vite: {
    envPrefix: ["PUBLIC_", "DIRECTUS_"],
  },
});
