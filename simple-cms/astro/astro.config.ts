// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: process.env.CI
    ? "starters-simple-cms-nextjs.vercel.app"
    : "http://localhost:4321",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
