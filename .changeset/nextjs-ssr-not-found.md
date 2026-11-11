---
"directus-cms-starter": patch
"directus-cms-i18n-starter": patch
---

Next.js frontends now render page content on the server and return a real 404 for missing pages and posts. `ThemeProvider` rendered nothing until it mounted in the browser, so server HTML had no page content and `notFound()` never set the status. Missing blog posts rendered a "Post Not Found" message with a 200 instead of calling `notFound()`.
