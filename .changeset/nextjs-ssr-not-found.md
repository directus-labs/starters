---
"directus-cms-starter": patch
"directus-cms-i18n-starter": patch
---

Frontends return real 404s for missing pages and posts, and every CMS frontend serves `robots.txt` and `sitemap.xml`.

- Next.js renders page content on the server. `ThemeProvider` rendered nothing until it mounted in the browser, so server HTML was empty and `notFound()` never set the status. Missing blog posts call `notFound()` instead of rendering a "Post Not Found" message with a 200.
- SvelteKit answers unknown URLs with a 404 instead of a 500.
- Astro answers missing blog posts with a 404 at the same URL instead of redirecting to `/404`.
- Next.js, Astro and SvelteKit serve a `robots.txt` that allows all crawlers and points at the sitemap, matching Nuxt. SvelteKit gets a `sitemap.xml` of published pages and posts, like the other frontends.
- The cms-i18n Next.js middleware no longer treats `/api` as a locale code, so form submissions, search and the other API routes reach their handlers. Search sends the current locale so result links stay localized.
- The cms-i18n frontends only treat a leading path segment as a locale when it's a language in Directus, so pages with short slugs like `/faq` render instead of being read as a locale.
- The cms-i18n Nuxt frontend sets `<html lang>`, the canonical URL and `og:locale` for the current locale instead of always "en".
- The SvelteKit frontend rejects paths starting with `//`, mitigating GHSA-pfhg-q3qv-9q6r until it moves to SvelteKit 3.
