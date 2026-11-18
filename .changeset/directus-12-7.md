---
"directus-blank-starter": patch
"directus-cms-starter": minor
"directus-cms-i18n-starter": minor
"directus-help-center-starter": patch
"directus-simple-crm-starter": patch
"directus-simple-ecommerce-starter": patch
---

Update Directus to v12.7.0 and move the CMS templates off the extensions that 12.7 replaces.

- Every starter runs `directus/directus:12.7.0`.
- The CMS frontends use `@directus/sdk` 27.
- Hero layout, form field type and redirect response code use the core Card Select interface. The `@directus-labs/card-select-interfaces` extension is no longer installed.
- The AI Ghostwriter and AI Image Generator flows are back on posts, built on the core AI Text and AI Image operations. They use the provider keys in Settings → AI. They ship inactive, so a new project stays within the core tier's 5 active flows and doesn't show a button that fails until a key is added.
