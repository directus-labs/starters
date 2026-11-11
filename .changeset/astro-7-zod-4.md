---
"directus-cms-starter": minor
"directus-cms-i18n-starter": minor
---

Upgrade the CMS frontends to Zod 4 and the Astro frontend to Astro 7, clearing the remaining high and critical advisories in those packages.

- Zod 4 in every frontend. Nuxt validates forms through a small local `toTypedSchema` adapter because `@vee-validate/zod` only supports Zod 3. SvelteKit uses Superforms' `zod4Client` adapter. Next.js uses `@hookform/resolvers` 5.9.
- Optional form fields use `.optional()`, so a submission that leaves them out (like an empty file input) is accepted. Zod 4 rejected a missing key on `.or(z.undefined())`, which also affected Astro.
- Astro 7 with `@astrojs/react` 7 and `@astrojs/vercel` 11. Route caching moved from `experimental.cache` to the top-level `cache` option. Astro 7.4 needs Node 22.23.4 or later.
