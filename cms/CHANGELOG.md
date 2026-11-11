# Changelog

## 2.1.0

### Minor Changes

- 8cd455b: Upgrade the CMS frontends to Zod 4 and the Astro frontend to Astro 7, clearing the remaining high and critical advisories in those packages.
  
  - Zod 4 in every frontend. Nuxt validates forms through a small local `toTypedSchema` adapter because `@vee-validate/zod` only supports Zod 3. SvelteKit uses Superforms' `zod4Client` adapter. Next.js uses `@hookform/resolvers` 5.9.
  - Optional form fields use `.optional()`, so a submission that leaves them out (like an empty file input) is accepted. Zod 4 rejected a missing key on `.or(z.undefined())`, which also affected Astro.
  - Astro 7 with `@astrojs/react` 7 and `@astrojs/vercel` 11. Route caching moved from `experimental.cache` to the top-level `cache` option. Astro 7.4 needs Node 22.23.4 or later.

### Patch Changes

- 8cd455b: Frontends return real 404s for missing pages and posts, and every CMS frontend serves `robots.txt` and `sitemap.xml`.
  
  - Next.js renders page content on the server. `ThemeProvider` rendered nothing until it mounted in the browser, so server HTML was empty and `notFound()` never set the status. Missing blog posts call `notFound()` instead of rendering a "Post Not Found" message with a 200.
  - SvelteKit answers unknown URLs with a 404 instead of a 500.
  - Astro answers missing blog posts with a 404 at the same URL instead of redirecting to `/404`.
  - Next.js, Astro and SvelteKit serve a `robots.txt` that allows all crawlers and points at the sitemap, matching Nuxt. SvelteKit gets a `sitemap.xml` of published pages and posts, like the other frontends.
  - The cms-i18n Next.js middleware no longer treats `/api` as a locale code, so form submissions, search and the other API routes reach their handlers. Search sends the current locale so result links stay localized.
  - The cms-i18n frontends only treat a leading path segment as a locale when it's a language in Directus, so pages with short slugs like `/faq` render instead of being read as a locale.
  - The cms-i18n Nuxt frontend sets `<html lang>`, the canonical URL and `og:locale` for the current locale instead of always "en".
  - The SvelteKit frontend rejects paths starting with `//`, mitigating GHSA-pfhg-q3qv-9q6r until it moves to SvelteKit 3.
- 8cd455b: Update frontend dependencies to patch security advisories: Next.js 15.5, Nuxt 4.6, Astro 6.4, SvelteKit 2.70, Vite, sharp 0.35, and refreshed lockfiles. Replace stale pnpm overrides with a minimal scoped set, and move the Nuxt frontends to pnpm 10.28.

## 2.0.0

### Major Changes

- 0a06977: Post bylines now come from a new `authors` collection, not `directus_users`, and the Public policy no longer reads `directus_users`. On core, that rule exposed every user's profile and email (#145).
  
  - `posts.author` points at `authors` (`name`, `avatar`, `bio`). Authors don't need a Studio account.
  - Public and Live Preview read `authors`. Content - Manage has full access.
  - Licensed: writers own the posts they created (`user_created`) and can't hand them to someone else. Who's credited (`author`) is separate from who can edit.
  - Frontends fetch `author: ['id', 'name', 'avatar']` and render `author.name`.
  
  To upgrade an existing project:
  
  1. Security fix on its own: remove the Public policy's read access to Directus Users. Post bylines stop resolving until the steps below.
  2. Create an `authors` collection (`name`, `avatar`, `bio`). Give the Public and Content - Live Preview policies read access to it, and Content - Manage full access.
  3. Add an author for each user credited on posts. Reusing the user's id keeps existing `posts.author` values valid.
  4. Repoint `posts.author` through the API. The Studio can't change an existing relation's related collection, and deleting the field there deletes the author values.
     - `DELETE /relations/posts/author` (drops the relation, keeps the column)
     - `DELETE /fields/directus_users/posts`
     - `POST /relations` with collection `posts`, field `author`, related_collection `authors`, `schema.on_delete` `SET NULL` and `meta.one_field` `posts`
     - `POST /fields/authors` with an o2m alias field named `posts`
  5. Set the `posts.author` interface and display template to `{{avatar.$thumbnail}} {{name}}`. The old `{{first_name}} {{last_name}}` template shows no names once the field points at `authors`.
  6. Frontend: fetch `author: ['id', 'name', 'avatar']` and render `author.name`.
  7. Licensed: remove the Writer posts create preset (`author: $CURRENT_USER`), filter Writer read and update on `user_created` instead of `author`, and take `user_created` and `user_updated` out of the Writer update fields.

### Patch Changes

- 0a06977: Update Directus to 12.6.1 (#149).
- 0a06977: Licensed Team users read only profile fields on `directus_users` (no `auth_data`), and `EMAIL_TRANSPORT` defaults to `sendmail` so notifications no longer fail with a 500 when it's unset (#144).

## [1.1.0](https://github.com/directus-labs/starters/compare/cms-v1.0.1...cms-v1.1.0) (2026-08-12)


### Features

* **v12:** Directus foundation ([#121](https://github.com/directus-labs/starters/issues/121)) ([7cd8651](https://github.com/directus-labs/starters/commit/7cd86516248c3fffc33bd91427d871f8a7ce8058))


### Bug Fixes

* add frontend bot email ([#130](https://github.com/directus-labs/starters/issues/130)) ([6886590](https://github.com/directus-labs/starters/commit/688659039666515c2a477f1a96d8e4f648e18ce2))

## [1.0.1](https://github.com/directus-labs/starters/compare/cms-v1.0.0...cms-v1.0.1) (2026-05-13)


### Bug Fixes

* use refresh token cookie domain env var ([#118](https://github.com/directus-labs/starters/issues/118)) ([6a9d6fa](https://github.com/directus-labs/starters/commit/6a9d6fafcdf92a5e092a44ae83c75ae397bc75c0))
