---
"directus-cms-starter": patch
"directus-cms-i18n-starter": patch
---

Get the CMS frontends passing typecheck and lint, and clear the high security alerts that have a fix.

- Nuxt (cms and cms-i18n): the header and footer are typed from what `/api/site-data` fetches, the post count uses `aggregate()`, and `no-console` allows `warn` and `error` (still blocks `log`).
- SvelteKit: the dropdown-menu components are ported to Svelte 5 and bits-ui 2, and the form components no longer warn in svelte-check.
- Next.js: removed the unused `shadcn` CLI from runtime dependencies, which drops the vulnerable Zod 3 copy. Run `npx shadcn@latest add` to add components.
- SvelteKit: `@sveltejs/adapter-vercel` 6.3.5, and the unused `experimental.remoteFunctions` flag is off.
