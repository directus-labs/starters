---
"directus-cms-starter": patch
"directus-cms-i18n-starter": patch
---

Frontends return real 404s for missing pages and posts, and every CMS frontend serves `robots.txt` and `sitemap.xml`.

- Next.js renders page content on the server. `ThemeProvider` rendered nothing until it mounted in the browser, so server HTML was empty and `notFound()` never set the status. Missing blog posts call `notFound()` instead of rendering a "Post Not Found" message with a 200.
- SvelteKit answers unknown URLs with a 404 instead of a 500.
- Astro answers missing blog posts with a 404 at the same URL instead of redirecting to `/404`.
- Next.js, Astro and SvelteKit serve a `robots.txt` that allows all crawlers and points at the sitemap, matching Nuxt. SvelteKit gets a `sitemap.xml` of published pages and posts, like the other frontends.
